// Temporarily disabled service worker registration to troubleshoot errors
console.log("Service worker registration is currently disabled for troubleshooting")

// Original code commented out for debugging
/*
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("ServiceWorker registration successful with scope: ", registration.scope)
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed: ", err)
      })
  })
}
*/
