self.__WB_MANIFEST;

const CACHE_NAME = "flavor-pwa-v1";
const OFFLINE_URL = "/offline.html";

// Allow manual update of the service worker (optional, best practice)
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch: Serve navigation requests network-first, fallback to offline.html
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  // For page navigations
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => response)
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // For all other requests: let Workbox (precache) or browser cache handle it
});
