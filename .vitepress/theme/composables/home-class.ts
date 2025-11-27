import { inBrowser } from "vitepress";
import {
  HOME_APP_DEFAULT_CLASS,
  HOME_APP_HOME_CLASS,
  HOME_HTML_CLASS,
  isHomeRoutePath,
} from "../utils/home-class";

export const setHomeClass = (path: string) => {
  if (!inBrowser) {
    return;
  }
  const isHome = isHomeRoutePath(path);
  const mainElement = document.querySelector("#app");
  document.documentElement.classList.toggle(HOME_HTML_CLASS, isHome);
  if (mainElement) {
    mainElement.classList.toggle(HOME_APP_HOME_CLASS, isHome);
    mainElement.classList.toggle(HOME_APP_DEFAULT_CLASS, !isHome);
  }
};
