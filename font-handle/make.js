const { existsSync, writeFileSync, mkdirSync, readFileSync } = require("fs");
const Fontmin = require("./fontmin/index");

const SiteStaticPath = "../site/public/"; // 网站的静态目录路径
const SiteStaticFontSourcePath = "../site/public/fontSource/"; // 网站的字体目录路径
const RoutesJsonFilePath = "../routes.json"; // 路由文件
const FontSourcePath = "./fontSource/"; // 字体文件的位置
const FontSourcesFileName = "fontSources.json"; // 字体列表 json 文件名
const CachePath = "./cache/"; // 字体处理过程的缓存路径
const PageFontSourcesFileName = "pageFontSources.json"; // 页面的路由、文件映射 json

// 字体列表
const FontSourceList = [
  // {
  //   name: "SourceHanSerifCN-Bold",
  //   fileName: "SourceHanSerifCN-Bold.ttf",
  // },
  // {
  //   name: "SourceHanSerifCN-ExtraLight",
  //   fileName: "SourceHanSerifCN-ExtraLight.ttf",
  // },
  // {
  //   name: "SourceHanSerifCN-Heavy",
  //   fileName: "SourceHanSerifCN-Heavy.ttf",
  // },
  {
    name: "SourceHanSerifCN-Light",
    fileName: "SourceHanSerifCN-Light.ttf",
  },
  {
    name: "SourceHanSerifCN-Medium",
    fileName: "SourceHanSerifCN-Medium.ttf",
  },
  // {
  //   name: "SourceHanSerifCN-Regular",
  //   fileName: "SourceHanSerifCN-Regular.ttf",
  // },
  {
    name: "SourceHanSerifCN-SemiBold",
    fileName: "SourceHanSerifCN-SemiBold.ttf",
  },
];

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

// 读取路由 json {
// const routesJsonFile = path.relative("./", RoutesJsonFilePath);
const routesJson = readFileSync(RoutesJsonFilePath);
const routes = JSON.parse(routesJson);
// 读取路由 json }

// 扁平化数组
const flattenArray = (arr, formatFn = null) => {
  const res = []; // 接收结果
  arr.forEach((itemRoute) => {
    const stack = []; // 声明栈，用来存储待处理元素
    stack.push(itemRoute); // 将初始元素压入栈
    while (stack.length) {
      // 栈不为空则循环执行
      const stackTopItem = stack[0]; // 取出栈顶元素
      if (typeof formatFn === "function") {
        res.push(formatFn(stackTopItem)); // 元素本身压入结果数组
      } else {
        res.push(stackTopItem); // 元素本身压入结果数组
      }
      stack.shift(); // 将当前元素弹出栈
      // 逻辑处理，如果当前元素包含子元素，则将子元素压入栈
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
    path: route.path, // 路由地址
    pageFilePath: route.originalPath, // 页面文件路径
  };
};

// 将路由数据转为一级结构 用于循环
const routeList = flattenArray(routes, formatRoute);

// 准备字体列表 用于循环
const fontSourceFileList = FontSourceList.map((item) => {
  return {
    ...item,
    fontSourceFilePath: `${FontSourcePath}${item.fileName}`,
  };
});

// 生成并保存字体到保存路径
const handleFontSource = async ({
  text, // 文字内容
  sourceFile, // 字体的源路径
  cachePath = CachePath, // 字体的缓存路径
  fontSourceSavePath = SiteStaticFontSourcePath, // 生成字体的保存路径
  resultFileName, // 目标字体文件名称
}) => {
  const cacheFile = `${cachePath}${resultFileName}`;
  if (!existsSync(cachePath)) {
    // 中间目录路径不存在，创建路径
    mkdirSync(cachePath);
  }
  writeFileSync(cacheFile, readFileSync(sourceFile)); // 将源文件放到缓存中进行处理
  const fontmin = new Fontmin().src(cacheFile);
  fontmin.use(
    Fontmin.glyph({
      trim: false,
      text,
    })
  );
  fontmin.dest(cachePath);

  const error = await new Promise((resolve, reject) => {
    fontmin.run((errors) => {
      if (errors) {
        reject(errors);
      } else {
        resolve();
      }
    });
  });
  if (error) {
    throw Error(error);
  }

  if (!existsSync(fontSourceSavePath)) {
    // 中间目录路径不存在，创建路径
    mkdirSync(fontSourceSavePath);
  }
  // 从缓存中将处理好的字体文件提取到保存的目录中
  writeFileSync(
    `${fontSourceSavePath}${resultFileName}`,
    readFileSync(cacheFile)
  );
};

// 循环 路由列表 和 字体列表 处理
for (let i = 0; i < routeList.length; i++) {
  const itemRoute = routeList[i];
  const { path: routePath, pageFilePath } = itemRoute;
  for (let j = 0; j < fontSourceFileList.length; j++) {
    const itemFontFile = fontSourceFileList[j];
    const { name: fontName, fontSourceFilePath } = itemFontFile;

    const resultFileName = `${fontName}-${Buffer.from(
      routePath,
      "utf8"
    ).toString("base64")}.ttf`;

    handleFontSource({
      text: readFileSync(pageFilePath, "utf-8"), // 文字内容
      sourceFile: fontSourceFilePath, // 字体的源路径
      cachePath: CachePath, // 字体的缓存路径
      resultFileName, // 目标字体文件名称
      fontSourceSavePath: SiteStaticFontSourcePath, // 生成字体的保存路径
    });

    itemRoute[fontName] = resultFileName; // 保存 字体文件名称
  }
}

// 将带有路由和字体文件名列表 保存成为 json 用于页面和字体文件的映射

const routeListJson = JSON.stringify(
  routeList.map((item) => {
    delete item.pageFilePath;
    return {
      ...item,
    };
  }),
  null,
  2
);
if (!existsSync(SiteStaticPath)) {
  mkdirSync(SiteStaticPath);
}
writeFileSync(`${SiteStaticPath}/${PageFontSourcesFileName}`, routeListJson);

// 根据路由中的 pageFilePath 读取 md 文件的内容
// 通过 md 内容抓取字体，字体的文件名使用 “fontName-base64(path).ttf” 的格式

// 通过路由 json 给每一个路由生成一个唯一标识，此标识用于匹配字体文件

// 将带有字体标识和 path 的 array 保存成为 json
// 每个页面请求这个 json，匹配页面的 path 得到页面字体的文件名，然后请求字体加载
