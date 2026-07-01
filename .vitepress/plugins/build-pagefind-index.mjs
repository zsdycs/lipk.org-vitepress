// Helper script run in a separate Node process by the pagefind-dev Vite plugin.
// It builds the VitePress site to a temporary directory and then runs Pagefind
// against that output. Running in a child process with an isolated project root
// avoids file-lock and global-state issues when invoked from the long-running
// dev server.
import { build } from "vitepress";
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fsSync from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildZhSearch } from "./build-zh-search.mjs";
import { cleanupPagefindUi } from "./cleanup-pagefind-ui.mjs";
import { writePagefindManifest } from "./write-pagefind-manifest.mjs";
import {
  PAGEFIND_ROOT_SELECTOR,
  PAGEFIND_EXCLUDE_SELECTORS,
} from "./pagefind-options.mjs";

function log(...args) {
  // Log to stderr so the parent plugin captures it in the error message.
  // eslint-disable-next-line no-console
  console.error("[pagefind-dev:helper]", ...args);
}

function copyDir(src, dest) {
  fsSync.mkdirSync(dest, { recursive: true });
  for (const entry of fsSync.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fsSync.copyFileSync(srcPath, destPath);
    }
  }
}

function createJunction(target, link) {
  // Windows directory junctions do not require special privileges.
  fsSync.symlinkSync(target, link, "junction");
}

async function main() {
  const root = process.cwd();
  const buildDir = process.argv[2];
  const indexDir = process.argv[3];

  if (!buildDir || !indexDir) {
    log("Usage: node build-pagefind-index.mjs <buildDir> <indexDir>");
    process.exit(1);
  }

  // Build from an isolated project root so that .vitepress/.temp does not
  // conflict with the running dev server. .vitepress is copied, content
  // directories and node_modules are linked, and public/ is reconstructed
  // without fontSource/fullFontSource to avoid Windows file-lock issues.
  const tempRoot = path.join(
    os.tmpdir(),
    `lipk-pf-root-${Date.now()}-${crypto.randomUUID()}`
  );

  try {
    fsSync.rmSync(tempRoot, { recursive: true, force: true });
    fsSync.mkdirSync(tempRoot, { recursive: true });
    copyDir(path.join(root, ".vitepress"), path.join(tempRoot, ".vitepress"));
    createJunction(
      path.join(root, "node_modules"),
      path.join(tempRoot, "node_modules")
    );
    for (const file of ["package.json", "routes.json"]) {
      const src = path.join(root, file);
      if (fsSync.existsSync(src)) {
        fsSync.copyFileSync(src, path.join(tempRoot, file));
      }
    }

    // Reconstruct site/ with linked content dirs and a filtered public/.
    const originalSite = path.join(root, "site");
    const tempSite = path.join(tempRoot, "site");
    fsSync.mkdirSync(tempSite, { recursive: true });
    for (const entry of fsSync.readdirSync(originalSite, {
      withFileTypes: true,
    })) {
      if (entry.name === "public") {
        continue;
      }
      createJunction(
        path.join(originalSite, entry.name),
        path.join(tempSite, entry.name)
      );
    }
    const originalPublic = path.join(originalSite, "public");
    const tempPublic = path.join(tempSite, "public");
    fsSync.mkdirSync(tempPublic, { recursive: true });
    const excludedPublicDirs = new Set(["fontSource", "fullFontSource"]);
    for (const entry of fsSync.readdirSync(originalPublic, {
      withFileTypes: true,
    })) {
      const src = path.join(originalPublic, entry.name);
      const dest = path.join(tempPublic, entry.name);
      if (excludedPublicDirs.has(entry.name)) {
        // Keep an empty directory so public-dir references do not break.
        fsSync.mkdirSync(dest, { recursive: true });
      } else if (entry.isDirectory()) {
        createJunction(src, dest);
      } else {
        fsSync.copyFileSync(src, dest);
      }
    }

    if (fsSync.existsSync(buildDir)) {
      fsSync.rmSync(buildDir, { recursive: true, force: true });
    }

    log("building from temp root:", tempRoot);
    await build(tempRoot, {
      outDir: buildDir,
      cacheDir: path.join(os.tmpdir(), "pagefind-dev-cache"),
    });

    // Build a CJK substring fallback index from the generated HTML.
    buildZhSearch(buildDir, path.join(root, "site/public/pagefind-zh.json"));

    // Build into a temporary index directory and atomically swap it into place
    // so the dev server never serves a partially-written index. The temp
    // directory lives next to the final index to avoid cross-device renames.
    const tmpIndexDir = path.join(
      root,
      `.pagefind-dev-index.tmp-${crypto.randomUUID()}`
    );
    try {
      await new Promise((resolve, reject) => {
        const proc = spawn(
          "npx",
          [
            "pagefind",
            "--site", buildDir,
            "--output-path", tmpIndexDir,
            "--root-selector", PAGEFIND_ROOT_SELECTOR,
            "--exclude-selectors", PAGEFIND_EXCLUDE_SELECTORS,
          ],
          {
            cwd: tempRoot,
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

      fsSync.rmSync(indexDir, { recursive: true, force: true });
      fsSync.renameSync(tmpIndexDir, indexDir);
      cleanupPagefindUi(indexDir);
      writePagefindManifest(indexDir);
    } catch (err) {
      fsSync.rmSync(tmpIndexDir, { recursive: true, force: true });
      throw err;
    }
  } finally {
    try {
      fsSync.rmSync(tempRoot, { recursive: true, force: true });
    } catch (err) {
      log("failed to clean temp root:", err.message);
    }
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
