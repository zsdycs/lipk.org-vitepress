import { defineConfigWithTheme } from "vitepress";
import type { CustomConfig } from "./theme";
import { appRoutes } from "./theme/utils/app-routes";
import { saveRoutes } from "./theme/utils/save-routes";
import { head } from "./theme/utils/head";
import pkg from "vitepress/package.json";

let ignoreMDFiles: string[] = [];

// 环境 NODE_ENV = development || production
if (process.env.NODE_ENV === "development") {
  ignoreMDFiles = [];
} else if (process.env.NODE_ENV === "production") {
  ignoreMDFiles = ["**/2018-12-20-Test.md"];
}

const routes = appRoutes({
  popDirs: ["site"],
  ignoreMDFiles,
});

// 将路由数据保存成为 js 文件，供字体模块使用
saveRoutes({ routesStr: routes, filePath: "./", fileName: "routes.json" });

export default defineConfigWithTheme<CustomConfig>({
  title: "李鹏坤",
  titleTemplate: ":title - 李鹏坤",
  head,
  outDir: "./dist",
  srcDir: "./site",
  cacheDir: "./cache",
  lang: "zh-CN",
  cleanUrls: true,
  themeConfig: {
    routes,
    vitepressVersion: pkg.version,
    since: "2018",
    author: "李鹏坤",
    slogan: "执手相看，对影成双",
    editLink: {
      pattern: "https://github.com/zsdycs/lipk.org-test/blob/master/site/:path",
      text: "在 GitHub 编辑此页",
    },
    lastUpdatedText: "本页最后更新时间",
  },
  lastUpdated: true,
  markdown: {
    lineNumbers: true,
  },
});
