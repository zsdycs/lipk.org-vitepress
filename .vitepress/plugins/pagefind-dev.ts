import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";

const PUBLIC_INDEX_DIR = "site/public/pagefind";
const DIST_INDEX_DIR = "dist/pagefind";

interface BuildState {
  status: "idle" | "building" | "ready" | "error";
  promise: Promise<void> | null;
  error: Error | null;
}

export function pagefindDevPlugin(): Plugin {
  const state: BuildState = {
    status: "idle",
    promise: null,
    error: null,
  };

  async function buildIndex(server: ViteDevServer) {
    if (state.status === "building") {
      return state.promise;
    }

    state.status = "building";
    state.error = null;

    const run = async () => {
      const root = process.cwd();
      const indexDir = path.resolve(root, PUBLIC_INDEX_DIR);
      // Use a unique build directory in the system temp folder for each run.
      // A short path helps avoid Windows MAX_PATH issues with deeply nested
      // public assets (e.g. the fontSource directory).
      const buildDir = path.join(
        os.tmpdir(),
        `pf-${Date.now()}`
      );
      const helper = path.resolve(
        root,
        ".vitepress/plugins/build-pagefind-index.mjs"
      );

      try {
        // eslint-disable-next-line no-console
        console.log("[pagefind-dev] 正在为开发模式生成搜索索引…");

        await new Promise<void>((resolve, reject) => {
          const proc = spawn(
            "node",
            [helper, buildDir, indexDir],
            {
              cwd: root,
              shell: process.platform === "win32",
              stdio: "pipe",
            }
          );

          let stderr = "";
          proc.stderr?.on("data", (data: Buffer) => {
            stderr += data.toString();
          });
          proc.on("close", (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(stderr || `子进程退出码 ${code}`));
            }
          });
          proc.on("error", reject);
        });

        state.status = "ready";
        // eslint-disable-next-line no-console
        console.log("[pagefind-dev] 搜索索引已生成");
      } catch (err) {
        state.status = "error";
        state.error = err instanceof Error ? err : new Error(String(err));
        // eslint-disable-next-line no-console
        console.error("[pagefind-dev] 生成搜索索引失败：", err);
      } finally {
        // Best-effort cleanup of the temporary build directory.
        try {
          await fs.rm(buildDir, { recursive: true, force: true });
        } catch {
          // ignore cleanup errors
        }
      }
    };

    state.promise = run();
    return state.promise;
  }

  let rebuildTimer: NodeJS.Timeout | null = null;
  function scheduleRebuild(server: ViteDevServer) {
    if (rebuildTimer) {
      clearTimeout(rebuildTimer);
    }
    rebuildTimer = setTimeout(() => {
      rebuildTimer = null;
      buildIndex(server).catch(() => {});
    }, 1500);
  }

  return {
    name: "pagefind-dev",
    apply: "serve",
    async configureServer(server) {
      const root = process.cwd();
      const siteDir = path.resolve(root, "site");
      const indexOutputDir = path.resolve(root, PUBLIC_INDEX_DIR);

      function shouldRebuild(file: unknown): file is string {
        if (typeof file !== "string") return false;
        if (!file.startsWith(siteDir)) return false;
        // Ignore generated search assets to avoid rebuild loops.
        if (file.startsWith(indexOutputDir)) return false;
        if (file === path.join(siteDir, "public", "pagefind-zh.json")) {
          return false;
        }
        return true;
      }

      // Watch site content for changes.
      server.watcher.add(siteDir);
      server.watcher.on("change", (file) => {
        if (shouldRebuild(file)) {
          scheduleRebuild(server);
        }
      });
      server.watcher.on("add", (file) => {
        if (shouldRebuild(file)) {
          scheduleRebuild(server);
        }
      });
      server.watcher.on("unlink", (file) => {
        if (shouldRebuild(file)) {
          scheduleRebuild(server);
        }
      });

      // Serve /pagefind/* from the generated dev index or from a previous dist build.
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/pagefind/")) {
          return next();
        }

        const relativePath = req.url.slice("/pagefind/".length).split("?")[0];
        const publicIndexDir = path.resolve(root, PUBLIC_INDEX_DIR);
        const distIndexDir = path.resolve(root, DIST_INDEX_DIR);

        const candidates =
          state.status === "ready"
            ? [publicIndexDir, distIndexDir]
            : [distIndexDir, publicIndexDir];

        for (const dir of candidates) {
          const filePath = path.join(dir, relativePath);
          try {
            const stat = await fs.stat(filePath);
            if (stat.isFile()) {
              const content = await fs.readFile(filePath);
              const ext = path.extname(filePath);
              const mimeType =
                ext === ".js"
                  ? "application/javascript"
                  : ext === ".css"
                  ? "text/css"
                  : ext === ".json"
                  ? "application/json"
                  : ext === ".wasm"
                  ? "application/wasm"
                  : "application/octet-stream";
              res.setHeader("Content-Type", mimeType);
              res.end(content);
              return;
            }
          } catch {
            // try next candidate
          }
        }

        // Index not ready; trigger a background build.
        if (state.status !== "building") {
          buildIndex(server).catch(() => {});
        }

        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end("Pagefind index is not ready yet.");
      });

      // Build index on first dev startup only if the committed index is missing.
      const publicIndexDir = path.resolve(root, PUBLIC_INDEX_DIR);
      fs.access(path.join(publicIndexDir, "pagefind.js"))
        .then(() => {
          state.status = "ready";
          console.log("[pagefind-dev] 使用已提交的搜索索引");
        })
        .catch(() => {
          buildIndex(server).catch(() => {});
        });
    },
  };
}
