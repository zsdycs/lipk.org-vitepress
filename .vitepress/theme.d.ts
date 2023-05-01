import { type UserConfig } from "vitepress";
// import { type Routes } from "./theme/utils/app-routes.js";

export interface CustomConfig extends UserConfig {
  routes: Routes[];
  vitepressVersion?: string;
  since?: string;
  author?: string;
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
