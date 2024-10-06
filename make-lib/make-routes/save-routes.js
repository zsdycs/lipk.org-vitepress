import { existsSync, mkdirSync, writeFileSync } from "fs";

export const saveRoutes = (data) => {
  const { routesStr: routesData, filePath, fileName } = data;
  let routesStr = "";

  if (typeof routesData === "object") {
    routesStr = JSON.stringify(routesData, null, 2);
  } else if (typeof routesData !== "string") {
    routesStr = String(routesData);
  } else {
    routesStr = routesData;
  }

  if (!existsSync(filePath)) {
    mkdirSync(filePath);
  }
  writeFileSync(`${filePath}/${fileName}`, routesStr);
};

export default {
  saveRoutes,
};
