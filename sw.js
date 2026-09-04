// sw.js

const CACHE_NAME = 'pixelart-app-v3';

// Archivos a precachar para soporte offline completo
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/global.css',
  './css/pixelart.css',
  './js/state.js',
  './js/utils.js',
  './js/palette.js',
  './js/imageProcessor.js',
  './js/ui.js',
  './js/main.js'
];

// 1. Instala el SW y almacena todos los módulos en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precachando archivos modulares');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activa el SW y elimina cachés antiguas (v1, etc.)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché obsoleta:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Intercepta las peticiones (Estrategia: Cache First, caída a Red)
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean GET (como APIs externas si las hubiera)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Opcional: Guardar dinámicamente nuevos recursos en la caché
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Fallback si no hay red ni caché (p. ej. para la página principal)
      if (event.request.headers.get('accept').includes('text/html')) {
        return caches.match('./index.html');
      }
    })
  );
});