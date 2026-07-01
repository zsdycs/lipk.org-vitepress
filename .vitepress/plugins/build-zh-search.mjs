// Builds a lightweight Chinese substring fallback index for Pagefind.
//
// Pagefind's CJK segmentation relies on Intl.Segmenter, which splits some
// common Chinese words (e.g. 博客, 互联网) into single characters at search
// time while indexing them as multi-character words. That mismatch means
// multi-character queries can miss pages that contain the exact word. This
// fallback stores the raw CJK text of every indexed page so the search UI can
// append substring matches when Pagefind's results are incomplete.
//
// The indexed text is scoped to the page's `.archive` element (where VitePress
// renders the markdown body) and excludes `.line-numbers-wrapper` (code line
// numbers) and `.version` (the version SVG injected into every page).
//
// Usage:
//   node .vitepress/plugins/build-zh-search.mjs <buildDir> <outputFile>

import fs from "node:fs";
import path from "node:path";

const EXCLUDE_SELECTORS = [
  { tag: "div", className: "line-numbers-wrapper" },
  { tag: "svg", className: "version" },
];

/**
 * Extract the outer HTML of the first element matching `tag.className`,
 * accounting for nested tags of the same type.
 */
function getElementHtml(html, tag, className) {
  const startRe = new RegExp(
    `<${tag}[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>`,
    "i"
  );
  const startMatch = html.match(startRe);
  if (!startMatch) return null;

  let depth = 1;
  let i = startMatch.index + startMatch[0].length;
  const openRe = new RegExp(`<${tag}\\b`, "ig");
  const closeRe = new RegExp(`</${tag}>`, "ig");

  openRe.lastIndex = i;
  closeRe.lastIndex = i;

  let openMatch = openRe.exec(html);
  let closeMatch = closeRe.exec(html);

  while (depth > 0) {
    const nextOpen = openMatch ? openMatch.index : Infinity;
    const nextClose = closeMatch ? closeMatch.index : Infinity;

    if (nextClose === Infinity) {
      return null;
    }

    if (nextOpen < nextClose) {
      depth++;
      openRe.lastIndex = nextOpen + 1;
      openMatch = openRe.exec(html);
    } else {
      depth--;
      if (depth === 0) {
        return html.slice(
          startMatch.index,
          closeMatch.index + closeMatch[0].length
        );
      }
      closeRe.lastIndex = nextClose + 1;
      closeMatch = closeRe.exec(html);
    }
  }

  return null;
}

function removeElementByClass(html, tag, className) {
  let result = html;
  let el = getElementHtml(result, tag, className);
  while (el) {
    result = result.replace(el, "");
    el = getElementHtml(result, tag, className);
  }
  return result;
}

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
    if (!html.includes("data-pagefind-body")) continue;

    // Scope fallback text to the rendered markdown body.
    let archiveHtml = getElementHtml(html, "div", "archive");
    if (!archiveHtml || !archiveHtml.includes("data-pagefind-body")) continue;

    // Remove elements that should not be searchable.
    for (const { tag, className } of EXCLUDE_SELECTORS) {
      archiveHtml = removeElementByClass(archiveHtml, tag, className);
    }

    const rawText = archiveHtml
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
if (
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").endsWith("build-zh-search.mjs")
) {
  main();
}
