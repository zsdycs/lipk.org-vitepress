import { DARK_MODE } from "./constant";

// 设置 mode 初始值
export const setInitialMode = () => {
  const modeLS: string | null = localStorage.getItem("page-theme-mode");
  if (modeLS == null) {
    const hours = new Date();
    // 如果时间是晚上 18 点到早上 6 点，自动黑夜
    if (hours.getHours() >= 18 || hours.getHours() <= 6) {
      localStorage.setItem("page-theme-mode", "github-dark");
      addDarkmodeCSS("github-dark");
    } else {
      localStorage.setItem("page-theme-mode", "github-light");
      addDarkmodeCSS("github-light");
    }
  } else {
    addDarkmodeCSS(modeLS);
  }
};

// 判断加载相应模式 CSS
export const addDarkmodeCSS = (mode: string | null) => {
  if (mode) {
    document.documentElement.setAttribute("theme", mode);
    document.documentElement.setAttribute(
      "color-scheme",
      DARK_MODE.includes(mode) ? "dark" : "light"
    );
  }
};

// 画面加载时，加载相应模式 CSS
// addDarkmodeCSS(modeLS);
