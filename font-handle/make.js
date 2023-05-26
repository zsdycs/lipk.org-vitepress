const fs = require("fs");
const path = require("path");

const RoutesJsonPath = "../routes.json";

const routesFilePath = path.relative("./", RoutesJsonPath);

// 读取路由 json
const routesFile = fs.readFileSync(routesFilePath);
const routes = JSON.parse(routesFile);

console.log("-----routes", routes);

// TODO
// 根据路由 json 中的 originalPath 读取 md 文件的内容

// 通过路由 json 给每一个路由生成一个唯一标识，此标识用于匹配字体文件

// 将带有字体标识和 path 的 array 保存成为 json
// 每个页面请求这个 json，匹配页面的 path 得到页面字体的文件名，然后请求字体加载

// 通过 md 内容抓取字体，字体的文件名使用 “font-btoa(path).ttf” 的格式

const aaa = fs.readFileSync("D:\\Code\\lipk.org-test\\site\\resume.md");

console.log("-----2routes", aaa);
