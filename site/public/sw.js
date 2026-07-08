// Custom service worker for lipk.org
// No external dependencies / no Google CDNs.

const SW_BUILD_ID = "__LIPK_SW_BUILD_ID__";
const CORE_CACHE_NAME = `lipk-core-${SW_BUILD_ID}`;
const PAGEFIND_CACHE_PREFIX = `lipk-pagefind-${SW_BUILD_ID}-`;

const PAGEFIND_CORE_ASSETS = [
  "/pagefind/pagefind.js",
  "/pagefind/pagefind-worker.js",
  "/pagefind/pagefind-entry.json",
  "/pagefind/wasm.unknown.pagefind",
  "/pagefind/pagefind-manifest.json",
  "/pagefind-zh.json",
];

let currentPagefindCacheName = "";

/**
 * Put a single request/response pair into the given cache.
 */
async function putInCache(cache, request, response) {
  if (response && response.ok) {
    await cache.put(request, response.clone());
  }
  return response;
}

/**
 * Fetch a URL and cache it. Failures are silently ignored.
 */
async function fetchAndCache(cache, url) {
  try {
    const response = await fetch(url);
    await putInCache(cache, url, response);
  } catch {
    // ignore individual failures so the rest can still be cached
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      // 1. Use the Pagefind language hash as the cache version so a new index
      //    automatically gets a fresh cache and old caches are cleaned up.
      try {
        const entryResponse = await fetch("/pagefind/pagefind-entry.json", {
          cache: "no-cache",
        });
        if (entryResponse.ok) {
          const entry = await entryResponse.json();
          const langHash = entry?.languages?.["zh-cn"]?.hash || "unknown";
          currentPagefindCacheName = `${PAGEFIND_CACHE_PREFIX}${langHash}`;
        }
      } catch {
        currentPagefindCacheName = `${PAGEFIND_CACHE_PREFIX}unknown`;
      }

      // 2. Discover all Pagefind index fragments from the manifest and cache them.
      try {
        const manifestResponse = await fetch(
          "/pagefind/pagefind-manifest.json",
          {
            cache: "no-cache",
          },
        );
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          const pfCache = await caches.open(currentPagefindCacheName);

          const indexFiles = Array.isArray(manifest.index)
            ? manifest.index.map((file) => `/pagefind/index/${file}`)
            : [];
          const fragmentFiles = Array.isArray(manifest.fragment)
            ? manifest.fragment.map((file) => `/pagefind/fragment/${file}`)
            : [];

          // Cache core assets and every index/fragment file individually so a
          // single 404 does not abort the whole batch.
          const pagefindUrls = [
            ...PAGEFIND_CORE_ASSETS,
            ...indexFiles,
            ...fragmentFiles,
          ];
          await Promise.all(
            pagefindUrls.map((url) => fetchAndCache(pfCache, url)),
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[SW] Failed to prefetch Pagefind index:", err);
      }

      // 2. Cache a minimal app shell.
      const coreCache = await caches.open(CORE_CACHE_NAME);
      await Promise.all(
        ["/", "/?standalone=true"].map((url) => fetchAndCache(coreCache, url)),
      );
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    void self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          // Keep the core cache.
          if (key === CORE_CACHE_NAME) return;
          // Keep the currently active Pagefind cache.
          if (
            key.startsWith(PAGEFIND_CACHE_PREFIX) &&
            key === currentPagefindCacheName
          ) {
            return;
          }
          // If we do not know the current Pagefind cache (e.g. the worker was
          // restarted without a new install), keep the existing ones to avoid
          // deleting live caches.
          if (
            key.startsWith(PAGEFIND_CACHE_PREFIX) &&
            !currentPagefindCacheName
          ) {
            return;
          }
          return caches.delete(key);
        }),
      );
      await self.clients.claim();
    })(),
  );
});

function isPagefindRequest(pathname) {
  return pathname.startsWith("/pagefind/") || pathname === "/pagefind-zh.json";
}

function isStaticAssetRequest(request) {
  if (["script", "style", "font", "image"].includes(request.destination)) {
    return true;
  }

  const url = new URL(request.url);
  return url.pathname.endsWith(".json");
}

async function resolvePagefindCacheName() {
  if (currentPagefindCacheName) return currentPagefindCacheName;
  const keys = await caches.keys();
  const pagefindKeys = keys.filter((key) =>
    key.startsWith(PAGEFIND_CACHE_PREFIX),
  );
  currentPagefindCacheName =
    pagefindKeys[pagefindKeys.length - 1] || `${PAGEFIND_CACHE_PREFIX}unknown`;
  return currentPagefindCacheName;
}

async function pagefindCacheFirst(request) {
  const cacheName = await resolvePagefindCacheName();
  const cache = await caches.open(cacheName);

  // Pagefind adds timestamps/query params to some requests; normalize the URL
  // so all variations share one cache entry.
  const cacheUrl = new URL(request.url);
  cacheUrl.search = "";
  const cacheRequest = new Request(cacheUrl.toString(), request);

  const cached = await cache.match(cacheRequest);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    await putInCache(cache, cacheRequest, response);
    return response;
  } catch {
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CORE_CACHE_NAME);
  try {
    const response = await fetch(request);
    await putInCache(cache, request, response);
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

async function staticAssetCacheFirst(request) {
  const cache = await caches.open(CORE_CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request, { cache: "no-cache" });
    await putInCache(cache, request, response);
    return response;
  } catch {
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Pagefind assets: always serve from cache first.
  if (isPagefindRequest(url.pathname)) {
    event.respondWith(pagefindCacheFirst(request));
    return;
  }

  // HTML navigation: try network first, fallback to cache.
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets (JS/CSS/fonts/images/json): cache within the current build.
  // A new build gets a new cache namespace, and old caches are removed after
  // the user accepts the update and the new worker activates.
  if (isStaticAssetRequest(request)) {
    event.respondWith(staticAssetCacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
