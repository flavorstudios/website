const CACHE_NAME = "flavor-pwa-v1";
const OFFLINE_URL = "/offline.html";
const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png",
  "/icons/apple-touch-icon.png"
];

// Install: Cache essential static assets and offline fallback
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: Remove outdated caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
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

  // For all other requests: cache-first, then network
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Allow manual update of the service worker (optional, best practice)
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
