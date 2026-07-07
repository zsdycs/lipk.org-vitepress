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
        if (e.key === "f" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
          e.preventDefault();
          open();
        }
      });

      // 注册字体切换快捷键 Ctrl/Cmd + Shift + F
      registerFontSwitchShortcut();
      // 应用用户上次选择的字体
      applyFontFamilyToElements(getCurrentFontFamily());
    }
  },
};

export default theme;
