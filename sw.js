const CACHE_NAME = "raymessco-cache-v1";

const urlsToCache = [
  "/app_raymessco/",
  "/app_raymessco/index.html",
  "/app_raymessco/tailwind.css",
  "/app_raymessco/icon-192.png",
  "/app_raymessco/icon-512.png",
  "/app_raymessco/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Archivos cacheados correctamente");
      return cache.addAll(urlsToCache);
    }).catch(err => {
      console.error("Error al cachear archivos:", err);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
