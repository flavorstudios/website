self.__WB_MANIFEST; // Required for next-pwa/Workbox to inject the precache list

const CACHE_NAME = "flavor-pwa-v1";
const OFFLINE_URL = "/offline.html";

// Install: cache the offline fallback page
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll([
      OFFLINE_URL
    ]))
  );
  self.skipWaiting();
});

// Allow manual update of the service worker (for update flow)
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Network-first for navigation requests, offline fallback
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

  // Let default or precache caching handle other requests (static assets, APIs, etc.)
});
