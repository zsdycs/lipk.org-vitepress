import { generateRoutes } from "./generate-routes.js";
import { saveRoutes } from "./save-routes.js";

let ignoreMDFiles = [];

// 环境 NODE_ENV = development || production
if (process.env.NODE_ENV === "development") {
  ignoreMDFiles = [];
} else if (process.env.NODE_ENV === "production") {
  ignoreMDFiles = ["**/2018-12-20-Test.md"];
}

const routes = generateRoutes({
  popDirs: ["site"],
  ignoreMDFiles,
});

// 将路由数据保存成为 js 文件，供字体模块使用
saveRoutes({ routesStr: routes, filePath: "./", fileName: "routes.json" });
