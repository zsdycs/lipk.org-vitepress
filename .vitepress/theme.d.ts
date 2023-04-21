
import { type UserConfig } from "vitepress";
import { type Routes } from "./theme/utils/app-routes.js";

export interface CustomConfig extends UserConfig {
    routes: Routes[];
    vitepressVersion?: string;
  }
  