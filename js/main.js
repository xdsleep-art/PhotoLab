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