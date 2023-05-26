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
    routesStr = JSON.stringify(routesData);
  } else if (typeof routesData !== "string") {
    routesStr = String(routesData);
  } else {
    routesStr = routesData;
  }

  if (fs.existsSync(filePath)) {
    fs.writeFileSync(`${filePath}/${fileName}`, routesStr);
  } else {
    throw Error(`文件保存的路径 filePath: ${filePath} 不存在`);
  }
};
