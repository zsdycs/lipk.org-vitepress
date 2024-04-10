// 常量
import { type Menu } from "../types";

export const MODE_TEXT: Record<string, string> = {
  "github-light": "浅色",
  "github-dark": "深色",
  "github-dark-orange": "深橙",
  "dark-blue": "深蓝",
  "icy-dark": "冷黑",
  "photon-dark": "暗黑",
};

export const MODE_ORDER: Record<string, string> = {
  "github-light": "github-dark",
  "github-dark": "github-dark-orange",
  "github-dark-orange": "dark-blue",
  "dark-blue": "icy-dark",
  "icy-dark": "photon-dark",
  "photon-dark": "github-light",
};

export const DARK_MODE: string[] = [
  "github-dark",
  "github-dark-orange",
  "dark-blue",
  "icy-dark",
  "photon-dark",
];

export const MENU: Record<string, Menu[]> = {
  default: [
    {
      name: "返回",
      url: "/",
    },
    {
      name: "博客",
      url: "/blog/",
    },
    {
      name: "菜谱",
      url: "/food",
    },
    {
      name: "关于",
      url: "/about",
    },
  ],
  "/blog/": [
    {
      name: "返回",
      url: "/",
    },
    {
      name: "博客",
      url: "/blog/",
    },
    {
      name: "菜谱",
      url: "/food",
    },
    {
      name: "关于",
      url: "/about",
    },
  ],
  "/food": [
    {
      name: "返回",
      url: "/",
    },
    {
      name: "博客",
      url: "/blog/",
    },
    {
      name: "菜谱",
      url: "/food",
    },
    {
      name: "关于",
      url: "/about",
    },
  ],
  "/about": [
    {
      name: "返回",
      url: "/",
    },
    {
      name: "博客",
      url: "/blog/",
    },
    {
      name: "菜谱",
      url: "/food",
    },
    {
      name: "关于",
      url: "/about",
    },
  ],
  "/resume": [
    {
      name: "返回",
      url: "/",
    },
    {
      name: "博客",
      url: "/blog/",
    },
    {
      name: "菜谱",
      url: "/food",
    },
    {
      name: "关于",
      url: "/about",
    },
  ],
};
