// app/sw.js
// JARVIS EDITION: Next.js 15+ + next-pwa 5.x + Firebase Cloud Messaging + Custom Offline Route

// 1. Import Workbox (LOCAL for offline support!)
// Download workbox-sw.js from https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js
// Place it in: public/vendor/workbox-sw.js
importScripts('/vendor/workbox-sw.js');

// 2. Take immediate control after activation (avoids double-refresh bugs)
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

  // 5. Cache Google Fonts (optional: comment out if not using CDN fonts)
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
// Download BOTH files and place them in public/vendor/
importScripts('/vendor/firebase-app-compat.js');
importScripts('/vendor/firebase-messaging-compat.js');

// --- Injected by build script or Vercel/GitHub Action ---
const FIREBASE_CONFIG = {
  apiKey: "%%NEXT_PUBLIC_FIREBASE_API_KEY%%",
  authDomain: "%%NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN%%",
  projectId: "%%NEXT_PUBLIC_FIREBASE_PROJECT_ID%%",
  messagingSenderId: "%%NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID%%",
  appId: "%%NEXT_PUBLIC_FIREBASE_APP_ID%%"
};
// -------------------------------------------------------

try {
  if (
    typeof firebase !== 'undefined' &&
    (!firebase.apps || firebase.apps.length === 0)
  ) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }

  if (typeof firebase !== 'undefined' && firebase.messaging) {
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      const notificationTitle = payload?.notification?.title || "New Notification";
      const notificationOptions = {
        body: payload?.notification?.body || "",
        icon: "/icons/android-chrome-512x512.png",
      };
      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
} catch {
  // Optionally log errors for debugging
  // console.error('Firebase SW init error', e);
}

// 8. Enable "skip waiting" for instant updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
