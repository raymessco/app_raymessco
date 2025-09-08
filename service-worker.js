const CACHE_NAME = 'raymessco-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  '/icon-192.png',
  '/icon-512.png',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'
];

// Instala el Service Worker y guarda los archivos estáticos en el caché.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercepta las peticiones de red.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el recurso está en el caché, lo devuelve.
        // Si no, intenta obtenerlo de la red.
        return response || fetch(event.request);
      })
  );
});
