import { inBrowser } from "vitepress";

export const registerSW = () => {
  if (inBrowser && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
};
