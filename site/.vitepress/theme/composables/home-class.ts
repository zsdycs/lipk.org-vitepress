export function setHomeClass(path: string) {
  if (path === "/") {
    // 首页时: <html> => <html class="home">
    document.documentElement.classList.add("home");
  } else {
    document.documentElement.classList.remove("home");
  }
}
