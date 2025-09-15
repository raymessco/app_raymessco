// Nombre de la caché
const CACHE_NAME = "raymessco-cache-v1";

// Archivos que se cachearán (ajusta las rutas según tu estructura)
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/tailwind.css"
];

// Instalar Service Worker y guardar en caché
self.addEventListener("install", event => {
  console.log("[ServiceWorker] Instalando...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[ServiceWorker] Cacheando archivos iniciales");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activar Service Worker y limpiar cachés antiguas
self.addEventListener("activate", event => {
  console.log("[ServiceWorker] Activado");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[ServiceWorker] Eliminando caché antigua:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Interceptar peticiones y responder desde la caché o red
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Si existe en caché, lo devuelve; si no, va a la red
      return response || fetch(event.request);
    })
  );
});
