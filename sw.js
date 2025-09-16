const CACHE_NAME = 'raymessco-cache-v1';
const OFFLINE_URL = '/index.html';

// Archivos esenciales para cachear en la instalación
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/tailwind.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://raymessco.github.io/app_raymessco/icon-192.png',
  'https://raymessco.github.io/app_raymessco/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Cacheando recursos iniciales...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Activar inmediatamente la nueva versión
});

// Activación y limpieza de cachés viejos
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activado');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Borrando caché viejo:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // Control inmediato de todas las pestañas
});

// Interceptar solicitudes y responder
self.addEventListener('fetch', event => {
  const request = event.request;

  // Solo manejar GET requests
  if (request.method !== 'GET') return;

  // Estrategia para index.html -> Network First
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Estrategia para otros archivos -> Cache First
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      return (
        cachedResponse ||
        fetch(request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
      );
    })
  );
});

// Sincronización en segundo plano (opcional, se puede usar con Firebase)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-pending-requests') {
    console.log('[Service Worker] Sincronizando datos pendientes...');
    // Aquí puedes implementar lógica para sincronizar datos con Firebase
  }
});
