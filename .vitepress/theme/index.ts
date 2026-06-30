import Layout from "./Layout.vue";
import PageMode from "./components/PageMode.vue";
import { type Theme } from "vitepress";
import { useSearchModal } from "./composables/search-modal";
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
        if (e.key === "f" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          open();
        }
      });
    }
  },
};

export default theme;
