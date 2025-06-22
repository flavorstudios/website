// public/sw-custom.js

// Workbox will inject the precache manifest here!
self.__WB_MANIFEST;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Listen for fetch events (custom offline logic)
self.addEventListener('fetch', (event) => {
  // Serve offline.html for navigation when offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html'))
    );
  }
});

// Custom: Cache an offline page and other assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('flavor-studios-v1').then((cache) => {
      return cache.addAll([
        '/offline.html', // Make sure this file exists in /public
        '/icons/android-chrome-192x192.png',
        '/icons/android-chrome-512x512.png',
      ]);
    })
  );
});