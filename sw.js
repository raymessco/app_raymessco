const CACHE_NAME = "raymessco-cache-v3";
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// Instalación: cachea los archivos principales
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: limpia caches viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch: primero red, luego cache (con fallback)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Evitar cachear llamadas a Firebase/Auth/Google
  if (
    req.url.includes("firestore.googleapis.com") ||
    req.url.includes("firebaseio.com") ||
    req.url.includes("gstatic.com/identity") ||
    req.url.includes("googleusercontent.com") ||
    req.url.includes("accounts.google.com")
  ) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req).then((res) => res || caches.match("/index.html")))
  );
});
