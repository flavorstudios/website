const CACHE_NAME = "flavor-studios-v4"; // 🔄 Updated version
const OFFLINE_URL = "/offline.html";

const urlsToCache = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/screenshots/homepage.png",
  "/screenshots/blog.png",
  OFFLINE_URL
];

// 🔹 Install and precache essential files
self.addEventListener("install", event => {
  self.skipWaiting(); // ⚡ Immediately activate new SW
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// 🔹 Activate and clean old caches
self.addEventListener("activate", event => {
  self.clients.claim(); // 🚀 Take control right away
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
});

// 🔹 Smart fetch strategy
self.addEventListener("fetch", event => {
  const { request } = event;

  // 🔹 Images: cache-first
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then(res => res || fetch(request))
    );
    return;
  }

  // 🔹 Navigations: network-first + fallback to offline.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // 🔹 Other requests: try network, then fallback to cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
