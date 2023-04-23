import { type Route } from "vitepress";
import { type Routes } from "../../theme";

export const routePathList = (routes: Routes[], route: Route) => {
  let pathList: Routes[] = [];
  const currentRoute = routes.find((itemRoute) => {
    let isThis = false;
    if (itemRoute.path === route.path) {
      isThis = true;
    }

    return isThis;
  });
  if (currentRoute?.children) {
    pathList = currentRoute.children.filter((itemChildren) => {
      let pass = true;
      if (itemChildren.path === `${route.path}index`) {
        pass = false;
      }

      return pass;
    });
  }
  return pathList;
};
