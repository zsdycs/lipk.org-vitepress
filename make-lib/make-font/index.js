import {
  existsSync,
  writeFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fork } from "node:child_process";
import {
  scanFontGroups,
  buildFontSourceList,
  buildFontGroupsMeta,
} from "./scan-fonts.cjs";

// 根据路由中的 pageFilePath 读取 md 文件的内容
// 通过 md 内容抓取字体，字体的文件名使用 “fontName-base64(path).woff2” 的格式
// 通过路由 json 给每一个路由生成一个唯一标识，此标识用于匹配字体文件
// 将带有字体标识和 path 的 array 保存成为 json
// 每个页面请求这个 json，匹配页面的 path 得到页面字体的文件名，然后请求字体加载

const SiteStaticPath = "./site/public/"; // 网站的静态目录路径
const SiteStaticFontSourcePath = "./site/public/fontSource/"; // 网站的字体目录路径
const RoutesJsonFilePath = "./routes.json"; // 路由文件
const FontSourcePath = "./site/public/fullFontSource/"; // 字体文件的位置
const FontSourcesFileName = "fontSources.json"; // 字体列表 json 文件名
const GlobalFontSourcesFileName = "globalFontSources.json"; // 全站子集字体映射 json 文件名
const CommonContentFilePath = "./make-lib/make-font/common.txt"; // 网站通用内容文字
const PageFontSourcesFileName = "pageFontSources.json"; // 页面的路由、文件映射 json

// 动态扫描字体目录，按字体名称排序，生成带权重的字体源列表
const fontGroups = scanFontGroups(FontSourcePath);
const FontSourceList = buildFontSourceList(fontGroups);

// 将字体列表保存到网站的静态目录中 fontSources.json {
const saveFontSources = () => {
  const FontSourcesJson = JSON.stringify(FontSourceList, null, 2);
  if (!existsSync(SiteStaticPath)) {
    mkdirSync(SiteStaticPath);
  }
  writeFileSync(`${SiteStaticPath}/${FontSourcesFileName}`, FontSourcesJson);
};
saveFontSources();
// 将字体列表保存到网站的静态目录中 fontSources.json }

// 清理之前生成的子集字体（包括旧版 .ttf 格式），避免遗留到 dist
if (existsSync(SiteStaticFontSourcePath)) {
  for (const file of readdirSync(SiteStaticFontSourcePath)) {
    rmSync(path.join(SiteStaticFontSourcePath, file), { force: true });
  }
}

// 读取路由 json {
const routesJson = readFileSync(RoutesJsonFilePath, "utf-8");
const routes = JSON.parse(routesJson);
// 读取路由 json }

// 扁平化数组
const flattenArray = (arr, formatFn = null) => {
  const res = [];
  arr.forEach((itemRoute) => {
    const stack = [];
    stack.push(itemRoute);
    while (stack.length) {
      const stackTopItem = stack[0];
      if (typeof formatFn === "function") {
        res.push(formatFn(stackTopItem));
      } else {
        res.push(stackTopItem);
      }
      stack.shift();
      if (stackTopItem.children && stackTopItem.children.length) {
        stack.push(...stackTopItem.children);
      }
    }
  });
  return res;
};

// 格式化路由
const formatRoute = (route) => {
  return {
    path: route.path,
    pageFilePath: route.originalPath,
  };
};

// 将路由数据转为一级结构 用于循环
const routeList = flattenArray(routes, formatRoute);

// 对文本按字符去重，减少全站子集字体体积
const dedupeTextByChar = (text) => {
  return Array.from(new Set(text.split(""))).join("");
};

// 读取参与构建的所有 md 文件，叠加 common 内容，生成全站去重文本
const getGlobalSubsetText = () => {
  const commonContent = readFileSync(CommonContentFilePath, "utf-8");
  const mdPathSet = new Set(
    routeList
      .map((item) => item.pageFilePath)
      .filter(
        (filePath) => typeof filePath === "string" && filePath.endsWith(".md"),
      ),
  );

  let mergedText = commonContent;
  for (const mdPath of mdPathSet) {
    try {
      mergedText += readFileSync(mdPath, "utf-8");
    } catch (error) {
      console.warn(`读取全站字体文本失败: ${mdPath}`);
      console.warn(error);
    }
  }

  return dedupeTextByChar(mergedText);
};

const globalSubsetText = getGlobalSubsetText();

// 将路由路径映射到列表分组：
// /blog/* => /blog/
// /article/* => /article/
// 一级目录和根目录归为 /
const getSectionPrefix = (routePath) => {
  if (!routePath || routePath === "/") return "/";

  const pathParts = routePath.split("/").filter(Boolean);
  if (!pathParts.length) return "/";

  // /blog/ 这种目录根路径
  if (routePath.endsWith("/") && pathParts.length === 1) {
    return `/${pathParts[0]}/`;
  }

  // /about、/resume、/index 等一级页面
  if (pathParts.length === 1) {
    return "/";
  }

  return `/${pathParts[0]}/`;
};

// 收集每个分组下的标题文本，用于补充 post-nav 前后文章标题的字形
const routeMetaList = flattenArray(routes, (route) => {
  return {
    path: route.path,
    title: route?.frontmatter?.title || "",
  };
});

const sectionTitleSetMap = new Map();
for (let i = 0; i < routeMetaList.length; i++) {
  const item = routeMetaList[i];
  if (!item.title) continue;

  const sectionPrefix = getSectionPrefix(item.path);
  if (!sectionTitleSetMap.has(sectionPrefix)) {
    sectionTitleSetMap.set(sectionPrefix, new Set());
  }
  sectionTitleSetMap.get(sectionPrefix).add(item.title);
}

const sectionTitleTextMap = new Map();
for (const [sectionPrefix, titleSet] of sectionTitleSetMap.entries()) {
  sectionTitleTextMap.set(sectionPrefix, Array.from(titleSet).join("\n"));
}

const getSectionTitleText = (routePath) => {
  const sectionPrefix = getSectionPrefix(routePath);
  return sectionTitleTextMap.get(sectionPrefix) || "";
};

// Worker 脚本路径（子进程隔离 subset-font 的 WASM 状态）
// 使用项目根目录下的原始文件，避免 pnpm 副本中缺少 worker 脚本
const workerPath = path.resolve(
  process.cwd(),
  "make-lib/make-font/subset-worker.cjs",
);

// 准备字体列表 用于循环
const fontSourceFileList = FontSourceList.map((item) => {
  return {
    ...item,
    fontSourceFilePath: `${FontSourcePath}${item.fileName}`,
  };
});

// 默认字体组：优先使用 source-han-serif-sc（思源宋体 SC）
const DEFAULT_FONT_FAMILY = "source-han-serif-sc";

// 在子进程中执行字体子集化，避免 harfbuzz WASM 状态在多次调用间相互影响
const runSubsetWorker = (task) => {
  return new Promise((resolve, reject) => {
    const child = fork(workerPath, [], { silent: true });
    let message = null;

    child.on("message", (msg) => {
      message = msg;
    });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("exit", (code) => {
      if (code !== 0 || !message || !message.success) {
        reject(new Error(message?.error || `子进程退出码 ${code}`));
      } else {
        resolve(message.resultFileName);
      }
    });

    child.send(task);
  });
};

console.log(`subset-font 处理中……`);

// 准备所有待处理任务
const pageTasks = [];
const globalTasks = [];
const globalFontSourceMap = {};
for (let i = 0; i < routeList.length; i++) {
  const itemRoute = routeList[i];
  const { path: routePath, pageFilePath } = itemRoute;

  const mdFileContent = readFileSync(pageFilePath, "utf-8");
  const commonContent = readFileSync(CommonContentFilePath, "utf-8");
  const blogListContent = routesJson;
  const sectionTitleText = getSectionTitleText(routePath);
  let baseText = mdFileContent + commonContent + sectionTitleText;

  if (routePath === "/blog/") {
    baseText =
      mdFileContent + commonContent + blogListContent + sectionTitleText;
  }

  for (let j = 0; j < fontSourceFileList.length; j++) {
    const itemFontFile = fontSourceFileList[j];
    const { name: fontName, fontSourceFilePath, weight } = itemFontFile;

    const routePathKey = routePath.replace(/\//g, "-");
    const resultFileName = `${fontName}.${routePathKey}.woff2`;

    pageTasks.push({
      taskType: "page",
      itemRoute,
      fontName,
      fontSourceFilePath,
      resultFileName,
      text: baseText,
      weight,
      fontIndex: itemFontFile.fontIndex,
      isVariableFont: itemFontFile.isVariableFont,
    });
  }
}

// 生成全站子集字体：读取所有 md + common 内容去重后，每个字重输出一个全站文件
for (let i = 0; i < fontSourceFileList.length; i++) {
  const itemFontFile = fontSourceFileList[i];
  const { name: fontName, fontSourceFilePath, weight } = itemFontFile;
  const resultFileName = `${fontName}.global.woff2`;

  globalTasks.push({
    taskType: "global",
    fontName,
    fontSourceFilePath,
    resultFileName,
    text: globalSubsetText,
    weight,
    fontIndex: itemFontFile.fontIndex,
    isVariableFont: itemFontFile.isVariableFont,
  });
}

// 并发控制：按 CPU 核心数并行派生子进程
const concurrency = os.cpus().length;
const runTask = async (task) => {
  await runSubsetWorker({
    sourceFile: task.fontSourceFilePath,
    text: task.text,
    weight: task.weight,
    resultFileName: task.resultFileName,
    fontSourceSavePath: SiteStaticFontSourcePath,
    chunkSize: 50,
    fontIndex: task.fontIndex,
    isVariableFont: task.isVariableFont,
  });

  if (task.taskType === "page") {
    task.itemRoute[task.fontName] = task.resultFileName;
  } else if (task.taskType === "global") {
    globalFontSourceMap[task.fontName] = task.resultFileName;
  }

  console.log(`生成文件: ${task.resultFileName}`);
};

const processQueue = async (taskList) => {
  let index = 0;
  const workers = new Array(concurrency).fill(null).map(async () => {
    while (index < taskList.length) {
      const currentIndex = index++;
      await runTask(taskList[currentIndex]);
    }
  });
  await Promise.all(workers);
};

// 先生成全站子集字体，优先产出可全局静默加载的文件
await processQueue(globalTasks);

// 保存全站子集字体映射，供浏览器端后台静默加载
const globalFontSourcesJson = JSON.stringify(globalFontSourceMap, null, 2);
writeFileSync(
  `${SiteStaticPath}/${GlobalFontSourcesFileName}`,
  globalFontSourcesJson,
);

// 再生成页面级子集字体
await processQueue(pageTasks);

// 将带有路由和字体文件名列表 保存成为 json 用于页面和字体文件的映射
const routeListJson = JSON.stringify(
  routeList.map((item) => {
    delete item.pageFilePath;
    return { ...item };
  }),
  null,
  2,
);
if (!existsSync(SiteStaticPath)) {
  mkdirSync(SiteStaticPath);
}
writeFileSync(`${SiteStaticPath}/${PageFontSourcesFileName}`, routeListJson);

// 保存字体分组信息，供浏览器端切换字体时使用
const fontGroupsJson = JSON.stringify(buildFontGroupsMeta(fontGroups), null, 2);
writeFileSync(`${SiteStaticPath}/fontGroups.json`, fontGroupsJson);
