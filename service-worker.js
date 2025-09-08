const CACHE_NAME = 'raymessco-cache-v2'; // cambiamos versión para limpiar el cache viejo
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

// Instala el Service Worker y guarda los archivos estáticos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache abierto');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activa y limpia cachés viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Eliminando caché viejo:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Intercepta peticiones de red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Si está en caché, responde desde ahí
      if (response) return response;

      // Si no está en caché, lo busca en la red y lo guarda
      return fetch(event.request).then(networkResponse => {
        // Evitar cachear llamadas a Firestore/Auth para no romper sesión
        if (
          event.request.url.includes('firestore.googleapis.com') ||
          event.request.url.includes('firebaseio.com') ||
          event.request.url.includes('googleapis.com')
        ) {
          return networkResponse;
        }

        // Clonar y guardar en caché
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Si falla la red y no está en caché, intenta devolver index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
