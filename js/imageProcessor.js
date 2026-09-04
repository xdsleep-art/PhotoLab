import { state } from './state.js';

// Matriz Bayer 8x8 estática
const bayerMatrix8x8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21]
];

// Matriz de luminancia a partir de los datos RGBA del canvas
function createLuminanceGrid(pixels, width = 160, height = 144) {
  const grid = [];
  for (let y = 0; y < height; y++) {
    grid[y] = new Float32Array(width);
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      grid[y][x] = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    }
  }
  return grid;
}

// 1. Floyd-Steinberg Dithering
export function applyFloydSteinberg(pixels, palette) {
  const width = 160, height = 144;
  const grayGrid = createLuminanceGrid(pixels, width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const oldVal = grayGrid[y][x];
      const colorIndex = Math.min(15, Math.max(0, Math.floor((Math.min(255, Math.max(0, oldVal)) / 256) * 16)));
      const newVal = (colorIndex / 15) * 255;
      const error = oldVal - newVal;

      const i = (y * width + x) * 4;
      const hexColor = palette[colorIndex];
      pixels[i]     = parseInt(hexColor.substr(1, 2), 16);
      pixels[i + 1] = parseInt(hexColor.substr(3, 2), 16);
      pixels[i + 2] = parseInt(hexColor.substr(5, 2), 16);

      if (x + 1 < width)                   grayGrid[y][x + 1]     += error * (7 / 16);
      if (y + 1 < height && x - 1 >= 0)    grayGrid[y + 1][x - 1] += error * (3 / 16);
      if (y + 1 < height)                  grayGrid[y + 1][x]     += error * (5 / 16);
      if (y + 1 < height && x + 1 < width)  grayGrid[y + 1][x + 1] += error * (1 / 16);
    }
  }
}

// 2. Atkinson Dithering (Apple Macintosh Classic)
export function applyAtkinson(pixels, palette) {
  const width = 160, height = 144;
  const grayGrid = createLuminanceGrid(pixels, width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const oldVal = grayGrid[y][x];
      const colorIndex = Math.min(15, Math.max(0, Math.floor((Math.min(255, Math.max(0, oldVal)) / 256) * 16)));
      const newVal = (colorIndex / 15) * 255;
      const error = (oldVal - newVal) / 8; // Difunde 1/8 de error en 6 vecinos

      const i = (y * width + x) * 4;
      const hexColor = palette[colorIndex];
      pixels[i]     = parseInt(hexColor.substr(1, 2), 16);
      pixels[i + 1] = parseInt(hexColor.substr(3, 2), 16);
      pixels[i + 2] = parseInt(hexColor.substr(5, 2), 16);

      if (x + 1 < width)                  grayGrid[y][x + 1] += error;
      if (x + 2 < width)                  grayGrid[y][x + 2] += error;
      if (y + 1 < height && x - 1 >= 0)   grayGrid[y + 1][x - 1] += error;
      if (y + 1 < height)                 grayGrid[y + 1][x] += error;
      if (y + 1 < height && x + 1 < width) grayGrid[y + 1][x + 1] += error;
      if (y + 2 < height)                 grayGrid[y + 2][x] += error;
    }
  }
}

// 3. Sierra-Lite Dithering
export function applySierraLite(pixels, palette) {
  const width = 160, height = 144;
  const grayGrid = createLuminanceGrid(pixels, width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const oldVal = grayGrid[y][x];
      const colorIndex = Math.min(15, Math.max(0, Math.floor((Math.min(255, Math.max(0, oldVal)) / 256) * 16)));
      const newVal = (colorIndex / 15) * 255;
      const error = oldVal - newVal;

      const i = (y * width + x) * 4;
      const hexColor = palette[colorIndex];
      pixels[i]     = parseInt(hexColor.substr(1, 2), 16);
      pixels[i + 1] = parseInt(hexColor.substr(3, 2), 16);
      pixels[i + 2] = parseInt(hexColor.substr(5, 2), 16);

      if (x + 1 < width)                grayGrid[y][x + 1] += error * (2 / 4);
      if (y + 1 < height && x - 1 >= 0) grayGrid[y + 1][x - 1] += error * (1 / 4);
      if (y + 1 < height)               grayGrid[y + 1][x] += error * (1 / 4);
    }
  }
}

// Procesador principal de imágenes
export function processImage() {
  if (!state.loadedImage) {
    alert("Por favor, selecciona una imagen primero.");
    return;
  }

  const canvas = document.getElementById('gameboyCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const ditherMethodSelect = document.getElementById('ditherMethod');

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 160;
  tempCanvas.height = 144;
  const tempCtx = tempCanvas.getContext('2d');

  tempCtx.drawImage(state.loadedImage, 0, 0, 160, 144);
  const imgData = tempCtx.getImageData(0, 0, 160, 144);
  const pixels = imgData.data;

  const selectedMethod = ditherMethodSelect ? ditherMethodSelect.value : 'none';

  // Selección de algoritmo de difusión o matriz ordenada
  switch (selectedMethod) {
    case 'floyd':
      applyFloydSteinberg(pixels, state.palette);
      break;

    case 'atkinson':
      applyAtkinson(pixels, state.palette);
      break;

    case 'sierra':
      applySierraLite(pixels, state.palette);
      break;

    default:
      // Dithering Ordenado (Bayer 4x4, Bayer 8x8) o Sin Dithering (Umbral)
      for (let y = 0; y < 144; y++) {
        for (let x = 0; x < 160; x++) {
          const i = (y * 160 + x) * 4;
          let brightness = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];

          if (selectedMethod === 'bayer4' || selectedMethod === 'bayer') {
            const bayerValue = state.bayerMatrix[y % 4][x % 4];
            const offset = (bayerValue / 16 - 0.5) * 32;
            brightness = Math.min(255, Math.max(0, brightness + offset));
          } else if (selectedMethod === 'bayer8') {
            const bayerValue = bayerMatrix8x8[y % 8][x % 8];
            const offset = (bayerValue / 64 - 0.5) * 32;
            brightness = Math.min(255, Math.max(0, brightness + offset));
          }

          const colorIndex = Math.min(15, Math.max(0, Math.floor((brightness / 256) * 16)));
          const hexColor = state.palette[colorIndex];
          pixels[i]     = parseInt(hexColor.substr(1, 2), 16);
          pixels[i + 1] = parseInt(hexColor.substr(3, 2), 16);
          pixels[i + 2] = parseInt(hexColor.substr(5, 2), 16);
        }
      }
      break;
  }

  tempCtx.putImageData(imgData, 0, 0);
  if (ctx && canvas) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
  }
}