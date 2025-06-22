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
    icon: '/android-chrome-512x512.png', // <-- your new icon
  });
});