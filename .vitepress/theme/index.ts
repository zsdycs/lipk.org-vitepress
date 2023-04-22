import Layout from "./Layout.vue";
import PageMode from "./components/PageMode.vue";
import type { Theme } from "vitepress";
import "./style/main.css";

export const theme: Theme = {
  Layout,
  enhanceApp({
    app,
    // app, router, siteData
  }) {
    document.body.innerHTML = "<main id='app'></main>";
    app.component("PageMode", PageMode);
  },
};

export default theme;
