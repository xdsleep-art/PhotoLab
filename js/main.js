import { cargarPresetsStorage, state } from './state.js';
import { applyPreset, renderPaletteCards } from './palette.js';
import { processImage } from './imageProcessor.js';
import { setupImageLoaderAnimation, setupCustomSelects, setupPaletteControls } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  cargarPresetsStorage();
  
  // Registrar controles y escuchadores de eventos
  setupPaletteControls();
  setupCustomSelects();
  setupImageLoaderAnimation();

  // Cargar estado inicial
  applyPreset('grays');
  renderPaletteCards();

  // Evento procesar
  const processBtn = document.getElementById('processBtn');
  if (processBtn) {
    processBtn.addEventListener('click', processImage);
  }

  // Evento descargar
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const canvas = document.getElementById('gameboyCanvas');
      if (!state.loadedImage || !canvas) {
        alert("Procesa una imagen antes de descargar.");
        return;
      }
      const imageUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `pixelart-photo-${Date.now()}.png`;
      downloadLink.href = imageUrl;
      downloadLink.click();
    });
  }

  // Registrar Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }
});
// js/main.js

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // updateViaCache: 'none' obliga a GitHub Pages a no guardar en caché el sw.js
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        // Fuerza la comprobación de actualización en GitHub al abrir la app
        registration.update();
      })
      .catch((error) => console.error('Error al registrar SW:', error));
  });

  // Cuando el nuevo SW sustituye al antiguo, recarga automáticamente la pantalla
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}