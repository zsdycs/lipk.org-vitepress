import { inBrowser } from "vitepress";

export interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

interface ZhFallbackPage {
  url: string;
  title: string;
  text: string;
}

interface PrefetchAsset {
  href: string;
  as: string;
}

interface PagefindManifest {
  index?: string[];
  fragment?: string[];
}

let pagefindInstance: any = null;
let loadPromise: Promise<any> | null = null;
let zhFallbackPromise: Promise<ZhFallbackPage[]> | null = null;

let preloadStarted = false;
let preloadTimer: number | null = null;
let indexManifestPreloaded = false;

const CORE_PREFETCH_ASSETS: PrefetchAsset[] = [
  { href: "/pagefind/pagefind.js", as: "script" },
  { href: "/pagefind/pagefind-worker.js", as: "script" },
  { href: "/pagefind/pagefind-entry.json", as: "fetch" },
  { href: "/pagefind/wasm.unknown.pagefind", as: "fetch" },
  { href: "/pagefind-zh.json", as: "fetch" },
];

export async function loadPagefind(): Promise<any | null> {
  if (!inBrowser) {
    return null;
  }
  if (pagefindInstance) {
    return pagefindInstance;
  }
  if (loadPromise) {
    return loadPromise;
  }
  // 使用动态模板字符串避免 Vite 在开发模式下解析不存在的绝对路径
  const pagefindModule = "pagefind";
  // @ts-ignore
  loadPromise = import(/* @vite-ignore */ `/${pagefindModule}/pagefind.js`)
    .then(async (mod) => {
      const pf = mod.default || mod;
      await pf.init();
      // 降低页面长度惩罚、降低词频饱和度，让短页面也能出现在结果中
      await pf.options({
        ranking: {
          pageLength: 0.1,
          termSaturation: 0.5,
        },
      });
      pagefindInstance = pf;
      return pf;
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn(
        "[Pagefind] 加载搜索索引失败，请确认已执行构建命令生成索引。",
        err,
      );
      return null;
    });
  return loadPromise;
}

function loadZhFallback(): Promise<ZhFallbackPage[]> {
  if (zhFallbackPromise) {
    return zhFallbackPromise;
  }
  zhFallbackPromise = fetch("/pagefind-zh.json")
    .then(async (res) => {
      if (!res.ok) return [];
      return (await res.json()) as ZhFallbackPage[];
    })
    .catch(() => []);
  return zhFallbackPromise;
}

function containsCjk(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

function makeExcerpt(text: string, query: string, length = 60): string {
  const idx = text.indexOf(query);
  if (idx === -1) return text.slice(0, length);
  const start = Math.max(0, idx - length / 2);
  const end = Math.min(text.length, idx + query.length + length / 2);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  const snippet = text.slice(start, end);
  return (
    prefix +
    snippet.replace(
      new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      "<mark>$&</mark>",
    ) +
    suffix
  );
}

export async function searchPagefind(query: string): Promise<{
  results: SearchResult[];
  timings: any;
}> {
  const trimmedQuery = query.trim();
  const pf = await loadPagefind();
  const pfResults: SearchResult[] = [];
  let timings: any;

  if (pf) {
    const response = await pf.search(trimmedQuery);
    timings = response.timings;
    const mapped = await Promise.all(
      response.results.map(async (item: any) => {
        const data = await item.data();
        return {
          url: data.url,
          title: data.meta?.title || data.title || "无标题",
          excerpt: data.excerpt,
        };
      }),
    );
    pfResults.push(...mapped);
  }

  // For CJK queries, also perform a simple substring fallback because
  // Pagefind's Intl.Segmenter can split common words into single characters
  // at query time while indexing them as whole words, causing exact-word
  // matches to be missed.
  if (containsCjk(trimmedQuery)) {
    const pages = await loadZhFallback();
    const seen = new Set(pfResults.map((r) => r.url));
    for (const page of pages) {
      if (seen.has(page.url)) continue;
      if (!page.text.includes(trimmedQuery)) continue;
      seen.add(page.url);
      pfResults.push({
        url: page.url,
        title: page.title || "无标题",
        excerpt: makeExcerpt(page.text, trimmedQuery),
      });
    }
  }

  return { results: pfResults, timings };
}

function addPrefetchLinks(assets: PrefetchAsset[]) {
  if (!inBrowser || typeof document === "undefined") return;

  for (const { href, as } of assets) {
    if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
      continue;
    }
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
}

async function preloadAllIndexFiles(): Promise<void> {
  if (!inBrowser || indexManifestPreloaded) return;

  try {
    const res = await fetch("/pagefind/pagefind-manifest.json");
    if (!res.ok) return;
    const manifest = (await res.json()) as PagefindManifest;

    const assets: PrefetchAsset[] = [];
    if (Array.isArray(manifest.index)) {
      for (const file of manifest.index) {
        assets.push({ href: `/pagefind/index/${file}`, as: "fetch" });
      }
    }
    if (Array.isArray(manifest.fragment)) {
      for (const file of manifest.fragment) {
        assets.push({ href: `/pagefind/fragment/${file}`, as: "fetch" });
      }
    }

    addPrefetchLinks(assets);
    indexManifestPreloaded = true;
  } catch {
    // 开发模式或清单缺失时静默跳过
  }
}

/**
 * 在页面加载完成后后台静默预加载所有搜索资源。
 * 核心运行时资源立即提示浏览器预取；完整的索引片段清单在空闲时读取并预取。
 */
export function preloadSearch(): void {
  if (!inBrowser || preloadStarted) return;
  preloadStarted = true;

  // 立即提示浏览器预取核心运行时资源
  addPrefetchLinks(CORE_PREFETCH_ASSETS);

  // 尽快获取索引片段清单并注入 prefetch 链接
  preloadAllIndexFiles().catch(() => {});

  // 在空闲时再初始化 Pagefind 运行时和中文回退索引
  const run = () => {
    loadPagefind().catch(() => {});
    loadZhFallback().catch(() => {});
  };

  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(run, { timeout: 3000 });
  } else {
    preloadTimer = window.setTimeout(run, 1200);
  }
}

/**
 * 取消尚未执行的预加载任务（例如页面即将销毁时）。
 */
export function cancelPreloadSearch(): void {
  if (preloadTimer !== null) {
    clearTimeout(preloadTimer);
    preloadTimer = null;
  }
  preloadStarted = false;
}
