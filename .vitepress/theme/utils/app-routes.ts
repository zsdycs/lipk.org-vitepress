import { sep, resolve } from "path";
import { globSync } from "glob";
import fs from "fs";
import matter from "gray-matter";
import type { Routes, Options, MdFile } from "../../theme";
import { createMarkdownRenderer } from "vitepress";

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

export const appRoutes = (options?: Options) => {
  const { ignoreDirs, ignoreMDFiles, popDirs } = options || {};
  const mdFiles = getMdFiles(ignoreMDFiles);

  const routeList: Routes[] = [];

  mdFiles.forEach(async (item: MdFile) => {
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
      return;
    }

    const mdFileName = getName(path);
    let frontmatter = {};
    let content = null;
    try {
      const src = fs.readFileSync(originalPath, "utf8");
      const { data } = matter(src, {
        excerpt: false,
      });
      const md = await createMarkdownRenderer(
        src,
        (global as any).VITEPRESS_CONFIG
      );

      frontmatter = data;
      content = md.render(src);
    } catch (error) {
      console.error(error);
    }

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
        content,
        originalPath,
        path: pagePath,
      });
    } else if (!findRoute) {
      routeList.push({
        path: dirNamePath,
        children: [
          {
            frontmatter,
            content,
            originalPath,
            path: pagePath,
          },
        ],
      });
    }
  });

  return routeList;
};
