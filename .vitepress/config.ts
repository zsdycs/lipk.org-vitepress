import { defineConfigWithTheme } from "vitepress";
import type { CustomConfig, Routes } from "./theme/types";
import { head } from "./theme/utils/head";
import { createRequire } from "node:module";
import { readFileSync } from "fs";
import { MENU } from "./theme/composables/constant";
import footnotePlugin from "markdown-it-footnote";
import imagePlugin from "markdown-it-image-figures";
import taskListPlugin from "markdown-it-task-lists";

const dynamicImport = createRequire(import.meta.url);
const pkg = dynamicImport("vitepress/package.json");
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
  description: "李鹏坤的个人网站-lipk.org",
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
    config: (md) => {
      // 引用参考资料
      md.use(footnotePlugin);
      // 图片
      md.use(imagePlugin, {
        dataType: true,
        figcaption: "alt",
        lazy: true,
      });
      //  任务列表
      md.use(taskListPlugin);
    },
  },
});
