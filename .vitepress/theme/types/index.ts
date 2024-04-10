import { type UserConfig } from "vitepress";

export interface EditLink {
  /**
   * Pattern for edit link.
   *
   * @example 'https://github.com/zsdycs/lipk.org-test/blob/master/site/:path'
   * @example ({ filePath }) => { ... }
   */
  pattern: string | ((payload: any) => string);

  /**
   * Custom text for edit link.
   *
   * @default '编辑本页'
   */
  text?: string;
}

export interface CustomConfig extends UserConfig {
  routes: Routes[];
  vitepressVersion?: string;
  since?: string;
  author?: string;
  slogan?: string;
  editLink?: EditLink;
  /**
   * @default '最后更新时间'
   */
  lastUpdatedText?: string;
  menu: Record<string, Menu[]>;
}

export interface Menu {
  name: string;
  url: string;
}

export interface Options {
  ignoreDirs?: string[];
  ignoreMDFiles?: string[];
  popDirs?: string[];
}

export interface MdFile {
  path: string;
  originalPath: string;
}

export interface Routes {
  path: string;
  originalPath: string;
  frontmatter?: Record<string, any>;
  content?: string;
  children?: Routes[];
}

export interface PageFontSource extends Record<string, any> {
  path: string;
}

export interface FontSource {
  fileName: string;
  name: string;
}
