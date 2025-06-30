// Tell Workbox where to inject its precache manifest:
self.__WB_MANIFEST;

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
    icon: '/android-chrome-512x512.png',
  });
});

// --- Optional: PWA Offline Fallback ---
const CACHE_NAME = "flavor-pwa-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll([
      OFFLINE_URL
    ]))
  );
  self.skipWaiting();
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

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
  // All other requests let Workbox handle!
});
