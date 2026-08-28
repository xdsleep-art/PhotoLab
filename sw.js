const CACHE_NAME = 'gb-cam-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalación: Guardar archivos en la caché 💾
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Interceptar peticiones: Servir desde caché si no hay red 🔌
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
const switchCamBtn = document.getElementById('switchCamBtn');
let currentFacingMode = 'environment'; // 'environment' (trasera) o 'user' (frontal)

