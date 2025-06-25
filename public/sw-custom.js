// public/sw-custom.js

// Workbox will inject the precache manifest here!
self.__WB_MANIFEST;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Network-first strategy for all navigation (homepage and all pages)
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Optionally, cache a copy of the response here if you want
          return response;
        })
        .catch(() => caches.match('/offline-404.html'))
    );
  }
});

// Custom: Cache an offline page and other assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('flavor-studios-v2').then((cache) => { // <-- cache version bump!
      return cache.addAll([
        '/offline-404.html', // Make sure this file exists in /public
        '/icons/android-chrome-192x192.png',
        '/icons/android-chrome-512x512.png',
      ]);
    })
  );
});
