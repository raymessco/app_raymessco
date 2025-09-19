// Nombre de la caché principal
const CACHE_NAME = "raymessco-cache-v3";

// Archivos que se cachearán al instalar
const urlsToCache = [
  "/app_raymessco/",
  "/app_raymessco/index.html",
  "/app_raymessco/manifest.json",
  "/app_raymessco/icon-192.png",
  "/app_raymessco/icon-512.png",
  "/app_raymessco/tailwind.css"
];

// ====== EVENTO INSTALL ======
self.addEventListener("install", event => {
  console.log("[ServiceWorker] Instalando...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[ServiceWorker] Cacheando archivos iniciales");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ====== EVENTO ACTIVATE ======
self.addEventListener("activate", event => {
  console.log("[ServiceWorker] Activado");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[ServiceWorker] Eliminando caché antigua:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ====== EVENTO FETCH ======
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  // 🚫 NO cachear POST, PUT, DELETE, etc.
  if (req.method !== "GET") {
    return; // dejamos pasar directo a la red
  }

  // Estrategia 1: Cache First para archivos estáticos en /app_raymessco/
  if (
    url.origin === location.origin &&
    url.pathname.startsWith('/app_raymessco/') &&
    (
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".jpg") ||
      url.pathname.endsWith(".jpeg") ||
      url.pathname.endsWith(".svg") ||
      url.pathname.endsWith(".ico")
    )
  ) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Estrategia 2: Network First para Firebase y APIs
  if (
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("firestore.googleapis.com")
  ) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Estrategia 3: Stale-While-Revalidate para imágenes externas
  if (url.pathname.match(/\.(?:png|jpg|jpeg|gif|webp)$/)) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Default: intenta cache, luego red
  event.respondWith(networkFirst(req));
});

// ====== FUNCIONES DE ESTRATEGIAS ======

// Cache First: Primero cache, luego red
async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  return cached || fetch(req);
}

// Network First: Primero red, si falla usar cache
async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(req);
    cache.put(req, fresh.clone()); // <- Aquí ya no habrá POST porque lo filtramos arriba
    return fresh;
  } catch (e) {
    return await cache.match(req);
  }
}

// Stale While Revalidate: Primero cache, actualiza en segundo plano
async function staleWhileRevalidate(event) {
  // 🛑 Validar que el request exista y tenga URL
  if (!event.request || !event.request.url) {
    console.warn('[Service Worker] Request inválido detectado. Saltando...');
    return;
  }

  // Evitar cachear recursos externos de Google
  if (event.request.url.includes('google.com/images/cleardot.gif')) {
    console.log('[Service Worker] Ignorando:', event.request.url);
    return;
  }

  const cache = await caches.open(CACHE_NAME);
  try {
    const networkResponse = await fetch(event.request);
    cache.put(event.request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Error en staleWhileRevalidate:', error);
    return await cache.match(event.request); // fallback
  }
}


