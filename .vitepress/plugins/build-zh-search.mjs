// Builds a lightweight Chinese substring fallback index for Pagefind.
//
// Pagefind's CJK segmentation relies on Intl.Segmenter, which splits some
// common Chinese words (e.g. 博客, 互联网) into single characters at search
// time while indexing them as multi-character words. That mismatch means
// multi-character queries can miss pages that contain the exact word. This
// fallback stores the raw CJK text of every indexed page so the search UI can
// append substring matches when Pagefind's results are incomplete.
//
// Usage:
//   node .vitepress/plugins/build-zh-search.mjs <buildDir> <outputFile>

import fs from "node:fs";
import path from "node:path";

/**
 * @param {string} buildDir - Directory containing built HTML (e.g. dist)
 * @param {string} outputFile - Destination JSON path
 */
export function buildZhSearch(buildDir, outputFile) {
  const root = path.resolve(buildDir);
  const files = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(p);
      } else if (entry.name.endsWith(".html")) {
        files.push(p);
      }
    }
  }

  if (fs.existsSync(root)) {
    walk(root);
  }

  const results = [];

  for (const file of files) {
    const html = fs.readFileSync(file, "utf-8");
    // Only index pages that are part of Pagefind's body.
    const bodyMatch = html.match(
      /<article[^>]*data-pagefind-body[^>]*>([\s\S]*?)<\/article>/i
    );
    if (!bodyMatch) continue;

    const rawText = bodyMatch[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    // Keep CJK characters only to keep the JSON small.
    const cjkText = rawText.replace(/[^\u4e00-\u9fff]/g, "");
    if (!cjkText) continue;

    const relative = path.relative(root, file).replace(/\\/g, "/");
    const url = "/" + relative.replace(/index\.html$/, "");

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch
      ? titleMatch[1].replace(/<[^>]+>/g, "").trim()
      : "";

    results.push({ url, title, text: cjkText });
  }

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(results));
}

function main() {
  const buildDir = process.argv[2];
  const outputFile = process.argv[3];
  if (!buildDir || !outputFile) {
    console.error("Usage: node build-zh-search.mjs <buildDir> <outputFile>");
    process.exit(1);
  }
  buildZhSearch(buildDir, outputFile);
  console.log(
    `[build-zh-search] 已生成中文回退索引：${path.resolve(outputFile)}（${
      JSON.parse(fs.readFileSync(outputFile, "utf-8")).length
    } 页）`
  );
}

// Only run when invoked directly from the CLI.
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("build-zh-search.mjs")) {
  main();
}
