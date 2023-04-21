// 常量

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
