self.addEventListener("fetch", event => {
  const { request } = event;

  // 🔹 Serve images: cache-first
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then(res => res || fetch(request))
    );
    return;
  }

  // 🔹 Serve page navigation: network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // 🔹 Other assets (CSS, fonts, scripts): try network, then cache
  event.respondWith(
    fetch(request)
      .then(res => res)
      .catch(() => caches.match(request))
  );
});
