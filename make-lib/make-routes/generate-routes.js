import { sep } from "path";
import { globSync } from "glob";
import { readFileSync } from "fs";
import matter from "gray-matter";

const sliceIfEndsWith = (str, substr) => {
  if (str.endsWith(substr)) {
    return str.slice(0, str.length - substr.length);
  } else {
    return str;
  }
};

// // handle md file name
const getName = (path) => {
  let name = path.split(sep).pop() || path;
  name = sliceIfEndsWith(name, ".md");

  return name;
};

// handle dir name
const getDirName = (path, popDirs = []) => {
  let name = "";
  const pathSplitList = path.split(sep);
  do {
    name = pathSplitList.shift() || path;
  } while (popDirs.includes(name));

  return name;
};

// Load all MD files in a specified directory
const getMdFiles = (ignoreMDFiles = []) => {
  const solvePath = "./site/**/*.md";
  const files = globSync(solvePath, {
    ignore: [
      "**/node_modules/**",
      "**/.vitepress/**",
      "**/dist/**",
      ...ignoreMDFiles,
    ],
  }).map((pathData) => {
    const pathSplitList = pathData.split(sep);
    const path = pathSplitList.join("/");

    return {
      path: pathData,
      originalPath: `./${path}`,
    };
  });

  return files;
};

export const generateRoutes = (options = {}) => {
  const { ignoreDirs, ignoreMDFiles, popDirs } = options || {};
  console.log("创建路由中……");

  const mdFiles = getMdFiles(ignoreMDFiles);
  console.log(`已获取所有文章，共 ${mdFiles.length} 篇`);

  const routeList = [];
  for (let i = 0; i < mdFiles.length; i++) {
    const item = mdFiles[i];
    const { path, originalPath } = item;
    let dirNamePath = `/${getDirName(path, popDirs)}`;

    if (dirNamePath.indexOf(".md") === dirNamePath.length - ".md".length) {
      // 以 '.md' 结尾
      dirNamePath = "/";
    } else {
      dirNamePath = `/${getDirName(path, popDirs)}/`;
    }

    if (
      ignoreDirs &&
      ignoreDirs?.length &&
      ignoreDirs.findIndex(
        (item) => getDirName(item, popDirs) === dirNamePath
      ) !== -1
    ) {
      continue;
    }

    const mdFileName = getName(path);
    let frontmatter = {};
    try {
      const src = readFileSync(originalPath, "utf8");
      const { data } = matter(src, {
        excerpt: false,
      });
      frontmatter = data;

      const findRoute = routeList.find((item) => {
        let isThis = false;
        if (item.path === dirNamePath) {
          isThis = true;
        }

        return isThis;
      });

      let pagePath = "";
      if (dirNamePath === "/") {
        // 一级页面
        pagePath = `/${mdFileName}`;
      } else {
        // 二级页面
        pagePath = `${dirNamePath}${mdFileName}`;
      }

      if (findRoute) {
        findRoute.children?.push({
          frontmatter,
          // content,
          originalPath,
          path: pagePath,
        });
        // 按文件名排序
        findRoute.children?.sort((currentChild, nextChild) => {
          const currentDate = new Date(currentChild.frontmatter?.date);
          const nextDate = new Date(nextChild.frontmatter?.date);
          const currentDateNum = Number(currentDate);
          const nextDateNum = Number(nextDate);

          return nextDateNum - currentDateNum;
        });
      } else if (!findRoute) {
        routeList.push({
          path: dirNamePath,
          children: [
            {
              frontmatter,
              // content,
              originalPath,
              path: pagePath,
            },
          ],
          originalPath,
        });
      }

      // 修复 / 的源文件不是 index.md 的问题
      if (dirNamePath === "/" && originalPath.includes("index")) {
        const indexRoute = routeList.find((item) => item.path === dirNamePath);
        if (indexRoute) {
          indexRoute.originalPath = originalPath;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  return routeList;
};

export default {
  generateRoutes,
};
