const CACHE_NAME = "flavor-studios-v2";
const OFFLINE_URL = "/offline.html";

const urlsToCache = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/screenshots/homepage.png",
  "/screenshots/blog.png",
  OFFLINE_URL,
];

// Install and precache core assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate and clear old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for images, network-first with fallback for everything else
self.addEventListener("fetch", event => {
  const { request } = event;

  // Serve images cache-first
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then(res => res || fetch(request))
    );
    return;
  }

  // Serve everything else network-first with offline fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        return response;
      })
      .catch(() => {
        return caches.match(request).then(res => res || caches.match(OFFLINE_URL));
      })
  );
});
