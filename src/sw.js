const KEY = "FlamedDogo99Mathquill";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("message", (event) => {
  if (event.data.type === "CACHE_URLS") {
    event.waitUntil(
      caches.open(KEY).then((cache) => {
        return cache.addAll(event.data.payload);
      }),
    );
  }
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      try {
        console.log(`[Service Worker] Attempting live fetch: ${e.request.url}`);
        const response = await fetch(e.request);
        e.request.url.search = "";
        const cache = await caches.open(KEY);
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
        return response;
      } catch (err) {
        console.log(
          `[Service Worker] Attempting to serve resource from cache: ${e.request.url}`,
        );
        const r = await caches.match(e.request, { ignoreSearch: true });
        if (r) {
          return r;
        }
      }
    })(),
  );
});
