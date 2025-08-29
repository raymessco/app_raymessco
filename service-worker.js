self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("ray-mess-co-v1").then(cache => {
      return cache.addAll([
        "index.html",
        "manifest.json",
        "icons/icon-192.png",
        "icons/icon-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
