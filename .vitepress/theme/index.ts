import Layout from "./Layout.vue";
import PageMode from "./components/PageMode.vue";
import { type Theme } from "vitepress";
import { useSearchModal } from "./composables/search-modal";
import {
  registerFontSwitchShortcut,
  applyFontFamilyToElements,
  getCurrentFontFamily,
} from "./composables/font-face";
import "./style/main.css";

export const theme: Theme = {
  Layout,
  enhanceApp({
    app,
    // app, router, siteData
  }) {
    app.component("PageMode", PageMode);

    // 全局搜索快捷键，确保首页等所有页面都能触发
    if (typeof window !== "undefined") {
      const { open } = useSearchModal();
      document.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === "f") {
          e.preventDefault();
          open();
        }
      });

      // 注册字体切换快捷键 A
      registerFontSwitchShortcut();
      // 应用用户上次选择的字体
      applyFontFamilyToElements(getCurrentFontFamily());

      // 全局注册返回顶部快捷键 ↑
      document.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }
  },
};

export default theme;
