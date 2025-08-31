// public/sw.js

// Load Workbox v7 from the official CDN.
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (self.workbox) {
  // Immediately take control of the page.
  workbox.core.clientsClaim();

  // Precache the offline page so it's always available.
  workbox.precaching.precacheAndRoute([
    { url: '/offline', revision: null },
  ]);

  const { registerRoute, NavigationRoute } = workbox.routing;
  const { NetworkFirst, StaleWhileRevalidate, CacheFirst } = workbox.strategies;

  const OFFLINE_FALLBACK = '/offline';

  // Fallback to the offline page when navigation requests fail.
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

  // Cache Google Fonts (stylesheets and webfonts).
  registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com',
    new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
  );
  registerRoute(
    ({ url }) => url.origin === 'https://fonts.gstatic.com',
    new CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        }),
      ],
    })
  );

  // Clean up outdated precaches.
  workbox.precaching.cleanupOutdatedCaches();
}

// Firebase Cloud Messaging (push notifications).
importScripts('/vendor/firebase-app-compat.js');
importScripts('/vendor/firebase-messaging-compat.js');

// Injected by build scripts or CI.
const FIREBASE_CONFIG = {
  apiKey: "%%NEXT_PUBLIC_FIREBASE_API_KEY%%",
  authDomain: "%%NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN%%",
  projectId: "%%NEXT_PUBLIC_FIREBASE_PROJECT_ID%%",
  messagingSenderId: "%%NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID%%",
  appId: "%%NEXT_PUBLIC_FIREBASE_APP_ID%%",
};

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
      const notificationTitle = payload?.notification?.title || 'New Notification';
      const notificationOptions = {
        body: payload?.notification?.body || '',
        icon: '/icons/android-chrome-512x512.png',
      };
      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
} catch {
  // Optional: log errors for debugging.
}

// Allow the page to trigger an update of the service worker.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});