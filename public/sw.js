// --- Firebase Cloud Messaging for Push Notifications ---
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDqHI05mdV1vS-d9XJzcrUBNM1GCDNbBRo",
  authDomain: "flavorstudios-a44b9.firebaseapp.com",
  projectId: "flavorstudios-a44b9",
  messagingSenderId: "1053560229683",
  appId: "1:1053560229683:web:f204b20430690eb2e0f846",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/android-chrome-512x512.png', // Notification icon
  });
});

// --- next-pwa/Workbox Precaching and PWA Offline Support ---
// THIS LINE IS REQUIRED FOR next-pwa TO WORK!
self.__WB_MANIFEST; 

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
  // Let Workbox/next-pwa handle other requests (static assets, APIs, etc.)
});
