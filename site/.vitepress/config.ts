import { createRequire } from "module";
import { defineConfigWithTheme } from "vitepress";
import { type CustomConfig } from "./theme";
import { appRoutes } from "./theme/utils/app-routes.js";
const routes = appRoutes({ popDirs: ["site"] });


const require = createRequire(import.meta.url);
const pkg = require("vitepress/package.json");

export default defineConfigWithTheme<CustomConfig>({
  title: "李鹏坤",
  description: "李鹏坤个人网站",
  outDir: "../dist",
  themeConfig: {
    routes,
    vitepressVersion: pkg.version,
  },
});
