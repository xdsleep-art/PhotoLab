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

async function startCamera() {
  // 1. Liberar la cámara anterior si ya estaba abierta 🛑
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }

  try {
    // 2. Solicitar el nuevo flujo con el modo actual 🎥
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentFacingMode }
    });
    
    video.srcObject = stream;
    video.style.display = 'block';
    snapBtn.style.display = 'inline-block';
    switchCamBtn.style.display = 'inline-block';
  } catch (err) {
    alert("Error al acceder a la cámara: " + err);
  }
}

// Botón para iniciar
startCamBtn.addEventListener('click', startCamera);

// Botón para alternar cámara 🔄
switchCamBtn.addEventListener('click', () => {
  currentFacingMode = (currentFacingMode === 'environment') ? 'user' : 'environment';
  startCamera();
});