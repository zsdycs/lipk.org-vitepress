import { defineConfigWithTheme } from "vitepress";
import type { CustomConfig, Routes } from "./theme";
import { head } from "./theme/utils/head";
import pkg from "vitepress/package.json";
import { readFileSync } from "fs";
import { MENU } from "./theme/composables/constant";

const RoutesJsonFilePath = "./routes.json";
const routesJson = readFileSync(RoutesJsonFilePath, "utf-8");
const routes = JSON.parse(routesJson) as Routes[];

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
    menu: MENU,
  },
  lastUpdated: true,
  markdown: {
    lineNumbers: true,
  },
});
