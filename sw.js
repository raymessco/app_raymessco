// Definimos el nombre y la versión de nuestro caché
const CACHE_NAME = 'raymessco-v1';

// Listamos los archivos que queremos cachear (el "App Shell")
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://raymessco.github.io/app_raymessco/icon-192.png'
  // Puedes añadir más recursos estáticos aquí (CSS, imágenes, etc.)
];

// Evento 'install': se dispara cuando el service worker se instala.
// Aquí es donde guardamos nuestros archivos en el caché.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento 'activate': se dispara cuando el service worker se activa.
// Aquí limpiamos los cachés antiguos que ya no se usan.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento 'fetch': se dispara cada vez que la aplicación hace una petición de red.
// Interceptamos la petición y respondemos con el caché si es posible.
self.addEventListener('fetch', event => {
  // Excluimos las peticiones a Firebase para no interferir con su manejo de conexión.
  if (event.request.url.includes('firestore.googleapis.com')) {
    return;
  }

  event.respondWith(
    // 1. Buscamos en el caché si tenemos una respuesta para esta petición.
    caches.match(event.request)
      .then(response => {
        // Si hay una respuesta en el caché, la devolvemos.
        if (response) {
          return response;
        }
        // Si no, hacemos la petición a la red.
        return fetch(event.request);
      })
  );
});
