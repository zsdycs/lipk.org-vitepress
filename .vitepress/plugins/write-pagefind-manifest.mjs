import fs from "node:fs";
import path from "node:path";

/**
 * 为 Pagefind 索引目录生成清单文件，列出 index 和 fragment 子目录下的所有文件。
 * 客户端可通过 /pagefind/pagefind-manifest.json 获知需要预加载的索引片段。
 */
export function writePagefindManifest(indexDir) {
  const manifest = { index: [], fragment: [] };

  for (const dir of ["index", "fragment"]) {
    const fullDir = path.join(indexDir, dir);
    if (fs.existsSync(fullDir)) {
      const files = fs
        .readdirSync(fullDir)
        .filter((file) => fs.statSync(path.join(fullDir, file)).isFile());
      manifest[dir] = files;
    }
  }

  fs.writeFileSync(
    path.join(indexDir, "pagefind-manifest.json"),
    JSON.stringify(manifest)
  );
}
