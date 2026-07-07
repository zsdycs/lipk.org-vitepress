// Production search index builder.
//
// Generates the Pagefind index and the Chinese substring fallback index from
// the already-built site, then cleans up unused Pagefind UI assets.
//
// Usage:
//   node .vitepress/plugins/build-search.mjs [buildDir] [outputDir] [zhOutput]
//
// Defaults:
//   buildDir  -> dist
//   outputDir -> dist/pagefind
//   zhOutput  -> dist/pagefind-zh.json

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { buildZhSearch } from "./build-zh-search.mjs";
import { cleanupPagefindUi } from "./cleanup-pagefind-ui.mjs";
import { writePagefindManifest } from "./write-pagefind-manifest.mjs";
import {
  PAGEFIND_ROOT_SELECTOR,
  PAGEFIND_EXCLUDE_SELECTORS,
} from "./pagefind-options.mjs";

async function runPagefind(siteDir, outputDir) {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      "npx",
      [
        "pagefind",
        "--site", siteDir,
        "--output-path", outputDir,
        "--root-selector", PAGEFIND_ROOT_SELECTOR,
        "--exclude-selectors", PAGEFIND_EXCLUDE_SELECTORS,
      ],
      {
        cwd: process.cwd(),
        shell: process.platform === "win32",
        stdio: "inherit",
      }
    );

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pagefind 退出码 ${code}`));
      }
    });
    proc.on("error", reject);
  });
}

async function main() {
  const root = process.cwd();
  const buildDir = path.resolve(root, process.argv[2] || "dist");
  const outputDir = path.resolve(root, process.argv[3] || "dist/pagefind");
  const zhOutput = path.resolve(
    root,
    process.argv[4] || "dist/pagefind-zh.json"
  );

  if (!fs.existsSync(buildDir)) {
    console.error(`[build-search] 构建目录不存在：${buildDir}`);
    process.exit(1);
  }

  // 1. Chinese substring fallback index.
  buildZhSearch(buildDir, zhOutput);

  // 2. Pagefind index.
  await runPagefind(buildDir, outputDir);

  // 3. Remove Pagefind UI bundles that are not used by the custom search modal.
  cleanupPagefindUi(outputDir);

  // 4. Write a manifest so the client can preload every index fragment.
  writePagefindManifest(outputDir);

  // 5. Bump the service worker build timestamp so browsers treat it as a new
  //    version and refresh the Pagefind cache on next visit.
  const distSwPath = path.join(buildDir, "sw.js");
  if (fs.existsSync(distSwPath)) {
    const swContent = fs.readFileSync(distSwPath, "utf-8");
    const buildTime = new Date().toISOString();
    fs.writeFileSync(
      distSwPath,
      `// Build time: ${buildTime}\n${swContent.replace(
        /^\/\/ Build time: .*\n/,
        ""
      )}`
    );
  }

  console.log("[build-search] 搜索索引生成完成");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
