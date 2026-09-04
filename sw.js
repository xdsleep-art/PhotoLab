// sw.js

// ⚠️ IMPORTANTE: Incrementa esta versión cada vez que subas cambios a GitHub
const CACHE_NAME = 'pixelart-app-v4';

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
      console.log('[Service Worker] Precachando versión:', CACHE_NAME);
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting()) // Salta la espera para activarse de inmediato
  );
});

// 2. Activa el SW y elimina cachés obsoletas (v1, v2, v3, etc.)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma control de la PWA inmediatamente
  );
});

// 3. Intercepta las peticiones (Estrategia: Cache First con fallback a Red)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      if (event.request.headers.get('accept')?.includes('text/html')) {
        return caches.match('./index.html');
      }
    })
  );
});