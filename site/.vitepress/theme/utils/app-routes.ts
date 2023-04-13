import { sep, resolve } from "path";
import { globSync } from "glob";
import fs from 'fs';
import matter from 'gray-matter';

interface Options {
  ignoreDirs?: string[];
  ignoreMDFiles?: string[];
  popDirs?: string[];
}

interface MdFile {
  path: string;
  originalPath: string;
}

interface Routes {
  path: string;
  frontmatter?: Record<string, string | number | boolean>;
  children?: Routes[];
}

const sliceIfEndsWith = (str: string, substr: string) => {
  if (str.endsWith(substr)) {
    return str.slice(0, str.length - substr.length);
  } else {
    return str;
  }
}

// // handle md file name
const getName = (path: string) => {
  let name = path.split(sep).pop() || path;
  name = sliceIfEndsWith(name, '.md');

  return name;
};

// handle dir name
const getDirName = (path: string, popDirs: string[] = []) => {
  let name = '';
  const pathSplitList = path.split(sep)
  do {
    name = pathSplitList.shift() || path;
  } while (popDirs.includes(name))

  return name;
};

// Load all MD files in a specified directory
const getMdFiles = (
  parentPath: string,
  ignoreMDFiles: string[] = []
): MdFile[] => {
  const pattern = "/**/*.md";
  const solvePath = parentPath + pattern
  const files = globSync(solvePath, {
    ignore: ["**/node_modules/**", "**/.vitepress/**", "**/dist/**"],
  }).map((path) => {
    if (
      ignoreMDFiles?.length &&
      ignoreMDFiles.findIndex((item) => item === path) !== -1
    ) {
      return undefined;
    }
    return { path, originalPath: resolve(`${parentPath}../../${path}`) };
  });
  console.log("----------files: ", files);

  //   remove(files, (file) => file === undefined);
  //   // Return the ordered list of files, sort by 'path'
  //   return sortBy(files, ["path"]).map((file) => file?.path || "");

  return files as MdFile[];
};

/**
 * Returns `sidebar` configuration for VitePress calculated using structure of directory and files in given path.
 * @param   {String}    rootDir   - Directory to get configuration for.
 * @param   {Options}    options   - Option to create configuration.
 */
export const routes = (baseDir = "./", options?: Options) => {
  const { ignoreDirs, ignoreMDFiles, popDirs } = options || {};
  const mdFiles = getMdFiles(baseDir, ignoreMDFiles);

  const routeList: Routes[] = [];

  mdFiles.forEach((item: MdFile) => {
    const { path, originalPath } = item;
    let dirName = getDirName(path, popDirs);

    if (dirName.indexOf('.md') === dirName.length - '.md'.length) {
      // 以 '.md' 结尾
      dirName = '/';
    }

    console.log('-------dirName: ', dirName);
    if (
      ignoreDirs && 
      ignoreDirs?.length &&
      ignoreDirs.findIndex(
        (item) => getDirName(item, popDirs) === dirName
      ) !== -1
    ) {
      return;
    }
    const mdFileName = getName(path);
    console.log('-------mdFileName: ', mdFileName);
    // let page = await import(originalPath);
    // console.log('-------aaa: ', page);
    try {
      const str = fs.readFileSync(originalPath, 'utf8');
      console.log('-------aaa: ', matter(str, {
        excerpt: true
      }));
      // TODO
    } catch (error) {
      console.log('-------error: ', error);
    }
    
  });

  return routes;
};
