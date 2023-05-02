import { type Route } from "vitepress";
import { type Routes } from "../../theme";

// 从 routes 中寻找 route 的所有子路由
export const routePathList = (routes: Routes[], route: Route | string) => {
  let pathList: Routes[] = [];
  let routePath = route;
  if (typeof route === "object") {
    routePath = route.path;
  }

  const currentRoute = routes.find((itemRoute) => {
    let isThis = false;
    if (itemRoute.path === routePath) {
      isThis = true;
    }

    return isThis;
  });
  if (currentRoute?.children) {
    pathList = currentRoute.children.filter((itemChildren) => {
      let pass = true;
      if (itemChildren.path === `${routePath}index`) {
        pass = false;
      }

      return pass;
    });
  }
  return pathList;
};
