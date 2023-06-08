import { type HeadConfig } from "vitepress";
import pkg from "vitepress/package.json";

export const head: HeadConfig[] = [
  [
    "meta",
    { name: "generator", content: `vitepress ${pkg.version}` },
    // <meta name="generator" content="vitepress x.x.x">
  ],
  [
    "meta",
    {
      name: "theme-color",
      media: "(prefers-color-scheme: dark)",
      content: `#202020`,
    },
    // <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#202020" />
  ],
  [
    "meta",
    { name: "apple-mobile-web-app-capable", content: `yes` },
    // <meta name="apple-mobile-web-app-capable" content="yes">
  ],
  [
    "meta",
    { name: "apple-mobile-web-app-status-bar-style", content: `yes` },
    // <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  ],
  [
    "meta",
    { property: "og:type", content: `website` },
    // <meta property="og:type" content="website">
  ],
  // [
  //   "link",
  //   { rel: "manifest", href: `/manifest.webmanifest` },
  //   // <link rel="manifest" href="/manifest.webmanifest">
  // ],
  [
    "link",
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/siteImageResources/apple-touch-icon-180x180.png",
    },
    // <link rel="apple-touch-icon" sizes="180x180" href="/siteImageResources/apple-touch-icon-180x180.png">
  ],
  [
    "link",
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/siteImageResources/favicon-32x32.png",
    },
    // <link rel="icon" type="image/png" sizes="32x32" href="/siteImageResources/favicon-32x32.png">
  ],
  [
    "link",
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/siteImageResources/favicon-16x16.png",
    },
    // <link rel="icon" type="image/png" sizes="16x16" href="/siteImageResources/favicon-16x16.png">
  ],
  [
    "link",
    { rel: "mask-icon", href: "/siteImageResources/safari-pinned-tab.svg" },
    // <link rel="mask-icon" href="/siteImageResources/safari-pinned-tab.svg">
  ],
  [
    "link",
    { rel: "shortcut icon", type: "image/ico", href: "/favicon.ico" },
    // <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
  ],
  [
    "link",
    { rel: "shortcut icon", type: "image/x-icon", href: "/favicon.ico" },
    // <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">
  ],
  [
    "link",
    { rel: "dns-prefetch", href: "//lipk.oss-accelerate.aliyuncs.com" },
    // <link rel="dns-prefetch" href="//lipk.oss-accelerate.aliyuncs.com">
  ],
];
