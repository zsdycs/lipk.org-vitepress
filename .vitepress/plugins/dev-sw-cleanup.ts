import type { Plugin } from "vite";

/**
 * 开发环境清理脚本。
 *
 * 历史版本的 `register-sw.ts` 在开发环境也会注册 Service Worker，
 * 而 Service Worker 会把 Vite 的模块脚本（theme、vue、各 .md 页面…）
 * 以 cache-first 方式缓存。代码更新后浏览器仍命中旧模块，造成模块/
 * Vue 实例不一致（典型表现：`resolveComponent can only be used in
 * render() or setup()` 警告、组件渲染不出来）。
 *
 * 该插件在开发环境把 `/sw.js` 替换成一个「自注销」的 Worker：
 * 安装后立即激活，注销自身、清空所有缓存并刷新受控页面，
 * 从而自动修复已被旧 Service Worker 控制的浏览器。
 */
const SW_CLEANUP_SCRIPT = `// 开发环境：自动注销历史遗留的 Service Worker 并清理缓存。
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.registration.unregister();

      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));

      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
`;

export function devSwCleanupPlugin(): Plugin {
  return {
    name: "dev-sw-cleanup",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?")[0];
        if (pathname === "/sw.js") {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/javascript");
          res.setHeader("Cache-Control", "no-cache");
          res.end(SW_CLEANUP_SCRIPT);
          return;
        }
        next();
      });
    },
  };
}
