// Removes Pagefind UI bundles that are not needed when using a custom search UI.
// The core search files (pagefind.js, pagefind-worker.js, wasm, indexes and
// fragments) are left untouched.
//
// Usage:
//   node .vitepress/plugins/cleanup-pagefind-ui.mjs <pagefindDir>

import fs from "node:fs";
import path from "node:path";

const FILES_TO_REMOVE = [
  "pagefind-component-ui.css",
  "pagefind-component-ui.js",
  "pagefind-highlight.js",
  "pagefind-modular-ui.css",
  "pagefind-modular-ui.js",
  "pagefind-ui.css",
  "pagefind-ui.js",
];

export function cleanupPagefindUi(pagefindDir) {
  for (const file of FILES_TO_REMOVE) {
    const filePath = path.join(pagefindDir, file);
    try {
      fs.rmSync(filePath, { force: true });
    } catch {
      // ignore
    }
  }
}

function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error("Usage: node cleanup-pagefind-ui.mjs <pagefindDir>");
    process.exit(1);
  }
  cleanupPagefindUi(dir);
}

if (
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").endsWith("cleanup-pagefind-ui.mjs")
) {
  main();
}
