import fs from "fs";

interface saveRoutesParams {
  routesStr: any;
  filePath: string;
  fileName: string;
}

export const saveRoutes = (data: saveRoutesParams) => {
  const { routesStr: routesData, filePath, fileName } = data;
  let routesStr = "";

  if (typeof routesData === "object") {
    routesStr = JSON.stringify(routesData, null, 2);
  } else if (typeof routesData !== "string") {
    routesStr = String(routesData);
  } else {
    routesStr = routesData;
  }

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  fs.writeFileSync(`${filePath}/${fileName}`, routesStr);
};
