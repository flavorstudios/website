const CACHE_NAME = "flavor-pwa-v1";
const OFFLINE_URL = "/offline.html";

// Install: cache offline page
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll([
      OFFLINE_URL
    ]))
  );
  self.skipWaiting();
});

// Allow manual update of the service worker
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch: network-first for navigations, offline fallback
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => response)
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // All other requests: let default caching handle them
});
