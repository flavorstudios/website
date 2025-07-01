// app/sw.js
// JARVIS EDITION: Next.js 15+ + next-pwa 5.x + Firebase Cloud Messaging + Custom Offline Route

// 1. Import Workbox (required for next-pwa features)
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// 2. Precache Next.js assets (next-pwa will inject manifest here)
if (self.workbox) {
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

  // 3. Offline fallback for navigations (uses Next.js /offline route!)
  const { registerRoute, NavigationRoute } = workbox.routing;
  const { NetworkFirst } = workbox.strategies;

  // Always use "/offline" for Next.js App Router offline fallback
  const OFFLINE_FALLBACK = '/offline';

  registerRoute(
    new NavigationRoute(
      new NetworkFirst({
        cacheName: 'navigations',
        plugins: [
          {
            handlerDidError: async () => {
              const cache = await caches.open('navigations');
              const response = await cache.match(OFFLINE_FALLBACK);
              return response || Response.error();
            },
          },
        ],
      })
    )
  );

  // Optional: Precache Google Fonts, etc. (add more runtime caching here if you need)
  // Example for Google Fonts styles:
  registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new workbox.strategies.StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
  );
  registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new workbox.cacheable_response.CacheableResponsePlugin({ statuses: [0, 200] }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        }),
      ],
    })
  );

  // Clean up outdated caches
  workbox.precaching.cleanupOutdatedCaches();
}

// 4. Firebase Cloud Messaging (push notifications)
// It's OK to use the latest compat version
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

try {
  // Only initialize if not already initialized
  if (typeof firebase !== 'undefined' && (!firebase.apps || firebase.apps.length === 0)) {
    firebase.initializeApp({
      apiKey: "AIzaSyDqHI05mdV1vS-d9XJzcrUBNM1GCDNbBRo",
      authDomain: "flavorstudios-a44b9.firebaseapp.com",
      projectId: "flavorstudios-a44b9",
      messagingSenderId: "1053560229683",
      appId: "1:1053560229683:web:f204b20430690eb2e0f846"
    });
  }

  if (typeof firebase !== 'undefined' && firebase.messaging) {
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage(function(payload) {
      self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/icons/android-chrome-512x512.png" // update this path if needed!
      });
    });
  }
} catch (e) {
  // No-op in production, but you can log if you want for debug
}

// 5. "skip waiting" support for instant SW updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
