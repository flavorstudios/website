// app/sw.js
// JARVIS EDITION: Next.js 15+ + next-pwa 5.x + Firebase Cloud Messaging + Custom Offline Route

// 1. Import Workbox (required for next-pwa features)
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// 2. Take immediate control after activation (fixes double-refresh bugs)
if (self.workbox) {
  workbox.core.clientsClaim();

  // 3. Precache Next.js assets (next-pwa injects manifest here)
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

  // 4. Offline fallback for navigations (Next.js /offline route)
  const { registerRoute, NavigationRoute } = workbox.routing;
  const { NetworkFirst, StaleWhileRevalidate, CacheFirst } = workbox.strategies;

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

  // 5. Cache Google Fonts (recommended)
  registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
  );
  registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new workbox.cacheable_response.CacheableResponsePlugin({ statuses: [0, 200] }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        }),
      ],
    })
  );

  // 6. Clean up outdated caches
  workbox.precaching.cleanupOutdatedCaches();
}

// 7. Firebase Cloud Messaging (push notifications)
// --- USE LOCAL FILES! ---
// Download firebase-app-compat.js and firebase-messaging-compat.js
// Place in: public/vendor/firebase-app-compat.js & public/vendor/firebase-messaging-compat.js
importScripts('/vendor/firebase-app-compat.js');
importScripts('/vendor/firebase-messaging-compat.js');

try {
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
    messaging.onBackgroundMessage((payload) => {
      const notificationTitle = payload?.notification?.title || "New Notification";
      const notificationOptions = {
        body: payload?.notification?.body || "",
        icon: "/icons/android-chrome-512x512.png", // Make sure this icon exists!
      };
      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
} catch (e) {
  // Optionally log errors for debugging
  // console.error('Firebase SW init error', e);
}

// 8. Enable "skip waiting" for instant updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
