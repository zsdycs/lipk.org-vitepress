// 代码源自：https://blog.csdn.net/wang1006008051/article/details/103699669
const { execSync } = require("child_process");
const { existsSync, mkdirSync, writeFileSync } = require("fs");

const FileName = "version-svg.ts"; // 生成的文件名称
const FilePath = "./.vitepress/theme/composables/"; // 生成的目标位置

let versionStr = "";

const commit = execSync("git show -s --format=%H").toString().trim();
const name = execSync("git show -s --format=%cn").toString().trim();
const email = execSync("git show -s --format=%ce").toString().trim();
const message = execSync("git show -s --format=%s").toString().trim();

const monthList = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

const date = new Date(execSync("git show -s --format=%cd").toString());
const year = date.getUTCFullYear();
const month = monthList[new Date().getUTCMonth()];
const day =
  date.getUTCDate() >= 10
    ? date.getUTCDate()
    : `0${date.getUTCDate().toString()}`;
const hours =
  date.getUTCHours() >= 10
    ? date.getUTCHours()
    : `0${date.getUTCHours().toString()}`;
const minutes =
  date.getUTCMinutes() >= 10
    ? date.getUTCMinutes()
    : `0${date.getUTCMinutes().toString()}`;

versionStr = `
export const version_svg = \`
<svg class="version" width="150" height="22" viewBox="0 0 150 22" xmlns="http://www.w3.org/2000/svg">
  <title>本项目最后更新时间</title>
  <desc>
    Time: ${year}-${month}-${day} ${hours}:${minutes} GMT
    Email: ${email}
    Author: ${name}
    Message: ${message}
    Version: ${commit}
  </desc>
  <text x="0" y="16" textLength="150" font-size="16">${year}-${month}-${day} ${hours}:${minutes} GMT</text>
</svg>\`;
`;

if (!existsSync(FilePath)) {
  // 中间目录路径不存在，创建路径
  mkdirSync(FilePath);
}
writeFileSync(`${FilePath}/${FileName}`, versionStr);
