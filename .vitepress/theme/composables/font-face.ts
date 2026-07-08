import type { FontGroup, FontSource, PageFontSource } from "../types";
import { addFontFaceByUrl, ajaxGetJson } from "../utils";
import { inBrowser } from "vitepress";

// 页面和字体的映射列表
let pageFontSources: PageFontSource[] = [];
// 字体列表
let fontSources: FontSource[] = [];
// 字体分组信息
let fontGroups: FontGroup[] = [];
// 全站子集字体映射（fontName -> global 文件名）
let globalFontSources: Record<string, string> = {};
// 全站子集字体映射是否已加载
let hasLoadedGlobalFontSources = false;
// 当前激活的字体组 familyName
let currentFontFamily = "source-han-serif-sc";
// 全局字体加载计数，用于避免并发切换
let fontLoadingCounter = 0;
// 字体元数据加载 Promise，避免并发重复请求
let fontDataLoadingPromise: Promise<void> | null = null;
// 防止重复注册快捷键
let hasRegisteredShortcut = false;
// 已注册 FontFace 的缓存键，避免重复加载同一字体文件
const loadedFontFaceKeys = new Set<string>();
// 正在加载中的 FontFace Promise，避免并发重复加载同一字体文件
const loadingFontFacePromiseMap = new Map<string, Promise<void>>();
// 已完成全站静默预加载的字体组
const preloadedFamilies = new Set<string>();
// 正在进行全站静默预加载的字体组
const preloadingFamilies = new Set<string>();

const DEFAULT_FONT_FAMILY = "source-han-serif-sc";
const FONT_SWITCH_STORAGE_KEY = "lipk-active-font-family";

export const getCurrentFontFamily = () => currentFontFamily;

export const getIsSwitchingFont = () => fontLoadingCounter > 0;

const beginFontLoading = () => {
  fontLoadingCounter += 1;
};

const endFontLoading = () => {
  fontLoadingCounter = Math.max(0, fontLoadingCounter - 1);
};

const scheduleBackgroundTask = (task: () => Promise<void>) => {
  if (!inBrowser) return;

  const run = () => {
    void task();
  };
  const requestIdleCallback = (
    window as Window & {
      requestIdleCallback?: (callback: () => void) => number;
    }
  ).requestIdleCallback;

  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(() => {
      run();
    });
  } else {
    window.setTimeout(() => {
      run();
    }, 0);
  }
};

const ensureFontDataLoaded = async () => {
  if (
    pageFontSources.length &&
    fontSources.length &&
    fontGroups.length &&
    hasLoadedGlobalFontSources
  ) {
    return;
  }

  if (!fontDataLoadingPromise) {
    fontDataLoadingPromise = (async () => {
      const [pageSources, sources, groups, globalSources] = await Promise.all([
        ajaxGetJson<PageFontSource[]>("/pageFontSources.json"),
        ajaxGetJson<FontSource[]>("/fontSources.json"),
        ajaxGetJson<FontGroup[]>("/fontGroups.json"),
        ajaxGetJson<Record<string, string>>("/globalFontSources.json"),
      ]);

      pageFontSources = pageSources || [];
      fontSources = sources || [];
      fontGroups = groups || [];
      globalFontSources = globalSources || {};
      hasLoadedGlobalFontSources = true;

      // 恢复用户上次选择的字体
      if (typeof localStorage !== "undefined") {
        const saved = localStorage.getItem(FONT_SWITCH_STORAGE_KEY);
        if (saved && fontGroups.some((g) => g.familyName === saved)) {
          currentFontFamily = saved;
        }
      }
    })().finally(() => {
      fontDataLoadingPromise = null;
    });
  }

  await fontDataLoadingPromise;
};

const loadFontFamilyForRoute = async (
  routePath: string,
  familyName: string,
) => {
  const currentPageFontSource = pageFontSources.find(
    (item) => item.path === routePath,
  );
  if (!currentPageFontSource) return;

  const groupSources = fontSources.filter((s) => s.familyName === familyName);
  if (!groupSources.length) return;

  await Promise.all(
    groupSources.map(async (fontSource) => {
      const { name: fontName, weight } = fontSource;
      const fontFileName = currentPageFontSource[fontName] as
        | string
        | undefined;
      if (!fontFileName) return;

      const fontUrl = `/fontSource/${fontFileName}`;
      await loadFontFaceOnce(fontUrl, weight, familyName);
    }),
  );
};

const loadFontFaceOnce = async (
  fontUrl: string,
  weight: string,
  familyName: string,
) => {
  const cacheKey = `${familyName}|${weight}|${fontUrl}`;
  if (loadedFontFaceKeys.has(cacheKey)) {
    return;
  }

  const loadingPromise = loadingFontFacePromiseMap.get(cacheKey);
  if (loadingPromise) {
    await loadingPromise;
    return;
  }

  const promise = addFontFaceByUrl(fontUrl, weight, familyName).finally(() => {
    loadingFontFacePromiseMap.delete(cacheKey);
  });

  loadingFontFacePromiseMap.set(cacheKey, promise);
  await promise;
  loadedFontFaceKeys.add(cacheKey);
};

const preloadGlobalSubsetFontFamily = async (familyName: string) => {
  const groupSources = fontSources.filter((s) => s.familyName === familyName);
  if (!groupSources.length) return false;

  let hasAnyGlobalSubset = false;
  let hasMissingGlobalSubset = false;

  await Promise.all(
    groupSources.map(async (fontSource) => {
      const { name: fontName, weight } = fontSource;
      const globalFileName = globalFontSources[fontName];
      if (!globalFileName) {
        hasMissingGlobalSubset = true;
        return;
      }

      hasAnyGlobalSubset = true;
      const fontUrl = `/fontSource/${globalFileName}`;
      await loadFontFaceOnce(fontUrl, weight, familyName);
    }),
  );

  return hasAnyGlobalSubset && !hasMissingGlobalSubset;
};

const preloadGlobalSubsetFontsInBackground = (familyName: string) => {
  if (!inBrowser) return;
  if (preloadedFamilies.has(familyName) || preloadingFamilies.has(familyName)) {
    return;
  }

  preloadingFamilies.add(familyName);
  scheduleBackgroundTask(async () => {
    try {
      await ensureFontDataLoaded();
      const isFamilyFullyPreloaded =
        await preloadGlobalSubsetFontFamily(familyName);
      if (isFamilyFullyPreloaded) {
        preloadedFamilies.add(familyName);
      }
    } finally {
      preloadingFamilies.delete(familyName);
    }
  });
};

export const setCurrentFontFamily = (familyName: string) => {
  currentFontFamily = familyName;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(FONT_SWITCH_STORAGE_KEY, familyName);
  }
};

export const loadFont = async (routePath: string) => {
  await ensureFontDataLoaded();

  // 若当前字体族已完成全站子集预热，则无需再按页面单独加载
  if (!preloadedFamilies.has(currentFontFamily)) {
    beginFontLoading();
    try {
      await loadFontFamilyForRoute(routePath, currentFontFamily);
    } finally {
      endFontLoading();
    }
  }

  // 先保证当前页可用，再在后台静默预热全站子集字体
  preloadGlobalSubsetFontsInBackground(currentFontFamily);
};

export const switchToNextFontFamily = async () => {
  await ensureFontDataLoaded();
  if (getIsSwitchingFont()) return;

  const nextFamily = getNextFontFamily();
  await switchFontFamily(nextFamily);
};

// 切换字体：注册新字体并更新 CSS 变量
export const switchFontFamily = async (familyName: string) => {
  if (!inBrowser) return;
  if (getIsSwitchingFont()) return;
  if (familyName === currentFontFamily) return;

  beginFontLoading();

  try {
    await ensureFontDataLoaded();
    const routePath = window.location.pathname;
    await loadFontFamilyForRoute(routePath, familyName);

    setCurrentFontFamily(familyName);
    applyFontFamilyToElements(familyName);

    // 切换新字体后，静默预热该字体在全站的子集文件
    preloadGlobalSubsetFontsInBackground(familyName);
  } finally {
    endFontLoading();
  }
};

// 将字体应用到原本使用 source-han-serif-sc 的元素
export const applyFontFamilyToElements = (familyName: string) => {
  if (!inBrowser) return;
  document.documentElement.style.setProperty(
    "--font-family-source-han-serif-sc",
    `"${familyName}", Palatino, "Palatino Linotype", "Palatino LT STD", "Latin Modern Roman", serif`,
  );
};

// 获取下一个字体组（按字体名称排序）
export const getNextFontFamily = (): string => {
  if (!fontGroups.length) return DEFAULT_FONT_FAMILY;
  const sorted = [...fontGroups].sort((a, b) =>
    (a.displayName || a.familyName).localeCompare(
      b.displayName || b.familyName,
      "zh-CN",
    ),
  );
  const currentIndex = sorted.findIndex(
    (g) => g.familyName === currentFontFamily,
  );
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % sorted.length : 0;
  return sorted[nextIndex].familyName;
};

// 注册键盘快捷键切换字体
export const registerFontSwitchShortcut = () => {
  if (!inBrowser || hasRegisteredShortcut) return;
  hasRegisteredShortcut = true;

  document.addEventListener("keydown", (event) => {
    // 点击 A 键 切换字体
    if (event.key.toLowerCase() === "a") {
      event.preventDefault();
      if (event.repeat || getIsSwitchingFont()) return;
      void switchToNextFontFamily();
    }
  });
};
