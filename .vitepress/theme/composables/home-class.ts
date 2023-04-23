export const setHomeClass = (path: string) => {
  const mainElement = document.querySelector("#app");
  if (path === "/") {
    // 首页时: <html> => <html class="home">
    document.documentElement.classList.add("home");
    if (mainElement) {
      mainElement.classList.add("index");
      mainElement.classList.remove("paramount");
    }
  } else {
    document.documentElement.classList.remove("home");
    if (mainElement) {
      mainElement.classList.remove("index");
      mainElement.classList.add("paramount");
    }
  }
};
