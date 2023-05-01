import { sep, resolve } from "path";
import { globSync } from "glob";
import fs from "fs";
import matter from "gray-matter";
import type { Routes, Options, MdFile } from "../../theme";
// import { createMarkdownRenderer } from "vitepress";
// import pc from "picocolors";

const sliceIfEndsWith = (str: string, substr: string) => {
  if (str.endsWith(substr)) {
    return str.slice(0, str.length - substr.length);
  } else {
    return str;
  }
};

// // handle md file name
const getName = (path: string) => {
  let name = path.split(sep).pop() || path;
  name = sliceIfEndsWith(name, ".md");

  return name;
};

// handle dir name
const getDirName = (path: string, popDirs: string[] = []) => {
  let name = "";
  const pathSplitList = path.split(sep);
  do {
    name = pathSplitList.shift() || path;
  } while (popDirs.includes(name));

  return name;
};

// Load all MD files in a specified directory
const getMdFiles = (ignoreMDFiles: string[] = []): MdFile[] => {
  const solvePath = "./site/**/*.md";
  const files = globSync(solvePath, {
    ignore: ["**/node_modules/**", "**/.vitepress/**", "**/dist/**"],
  }).map((path) => {
    if (
      ignoreMDFiles?.length &&
      ignoreMDFiles.findIndex((item) => item === path) !== -1
    ) {
      return undefined;
    }
    return { path, originalPath: resolve(`./${path}`) };
  });

  return files as MdFile[];
};

export const appRoutes = (options?: Options): Routes[] => {
  const { ignoreDirs, ignoreMDFiles, popDirs } = options || {};
  // console.log("创建路由中……");

  const mdFiles = getMdFiles(ignoreMDFiles);
  // console.log(`已获取所有文章，共 ${pc.green(mdFiles.length)} 篇`);

  const routeList: Routes[] = [];
  for (let i = 0; i < mdFiles.length; i++) {
    const item: MdFile = mdFiles[i];
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
    // let content = null;
    try {
      const src = fs.readFileSync(originalPath, "utf8");
      const { data } = matter(src, {
        excerpt: false,
      });
      // const md = await createMarkdownRenderer(
      //   src,
      //   (global as any).VITEPRESS_CONFIG
      // );

      frontmatter = data;
      // content = md.render(src);

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
      // console.clear();
      // console.log(`生成路由: ${pc.green(mdFileName)}`);

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
    } catch (error) {
      console.error(error);
    }
  }

  return routeList;
};

// export const generateRoutes = () => {
//   const fileName = "routes.ts";
//   const filePath = ".vitepress";
//   const routes = appRoutes({ popDirs: ["site"] });

//   if (fs.existsSync(filePath)) {
//     fs.writeFileSync(
//       `${filePath}/${fileName}`,
//       `
//     import type { Routes } from "./theme";
//     export const routes: Routes[] = ${JSON.stringify(routes)};
//     `
//     );
//   }

//   return routes;
// };
