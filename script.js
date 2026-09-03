// ==========================================
// 1. ESTADO GLOBAL (Fuente única de verdad)
// ==========================================
window.presets = window.presets || {
  grays: Array.from({ length: 16 }, (_, i) => {
    const v = Math.round((i / 15) * 255).toString(16).padStart(2, '0');
    return `#${v}${v}${v}`;
  }),
  dmg: [
    "#0f380f", "#143f0f", "#19460f", "#1e4d0f",
    "#23540f", "#285b0f", "#2d620f", "#32690f",
    "#37700f", "#3c770f", "#417e0f", "#46850f",
    "#4b8c0f", "#50930f", "#60a012", "#8bac0f"
  ]
};

// Cargar paletas guardadas en localStorage al iniciar
function cargarPresetsStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem('userPresets') || '{}');
    Object.assign(window.presets, saved);
  } catch (e) {
    console.error("Error al leer localStorage:", e);
  }
}

// ==========================================
// 2. FUNCIÓN DE RENDERIZADO VISUAL
// ==========================================
function renderPaletteCards() {
  const optionsGrid = document.getElementById('paletteOptionsGrid');
  const palettePresetInput = document.getElementById('palettePreset');
  const customPaletteSelect = document.getElementById('customPaletteSelect');

  const currentVal = palettePresetInput ? palettePresetInput.value : 'grays';

  // 1. Sincronizar el <select> nativo HTML si existe
  if (palettePresetInput && palettePresetInput.tagName === 'SELECT') {
    palettePresetInput.innerHTML = '';
    Object.keys(window.presets).forEach((key) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = key;
      if (key === currentVal) opt.selected = true;
      palettePresetInput.appendChild(opt);
    });
  }

  // 2. Limpiar y reconstruir el desplegable de TARJETAS VISUALES
  if (optionsGrid) {
    optionsGrid.innerHTML = '';

    Object.keys(window.presets).forEach((key) => {
      const colorArray = window.presets[key];
      if (!Array.isArray(colorArray)) return;

      const gradientString = `linear-gradient(to right, ${colorArray.join(', ')})`;

      const card = document.createElement('div');
      card.className = `palette-card-option ${key === currentVal ? 'selected' : ''}`;
      card.dataset.value = key;

      card.innerHTML = `
        <span class="palette-card-title">${key}</span>
        <div class="palette-gradient-preview" style="background: ${gradientString}"></div>
      `;

      optionsGrid.appendChild(card);
    });
  }

  // 3. Actualizar texto y degradado de la cabecera principal
  const nameText = customPaletteSelect ? customPaletteSelect.querySelector('.palette-name-text') : null;
  const triggerPreview = document.getElementById('triggerGradientPreview');

  if (window.presets[currentVal] && nameText && triggerPreview) {
    nameText.textContent = currentVal;
    triggerPreview.style.background = `linear-gradient(to right, ${window.presets[currentVal].join(', ')})`;
  }
}

// ==========================================
// 3. INICIALIZACIÓN Y EVENTOS DE INTERFAZ
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  // Cargar datos guardados y alias global para compatibilidad
  cargarPresetsStorage();
  const presets = window.presets;

  // Selección de elementos del DOM
  const imageInput = document.getElementById('imageInput');
  const canvas = document.getElementById('gameboyCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const processBtn = document.getElementById('processBtn');
  const ditherMethodSelect = document.getElementById('ditherMethod');
  const paletteContainer = document.getElementById('paletteContainer');
  const presetSelect = document.getElementById('palettePreset');
  const invertBtn = document.getElementById('invertBtn');
  const resetBtn = document.getElementById('resetBtn');
  const gradientBar = document.createElement('div');
  gradientBar.id = 'gradientBar';
  const savePresetBtn = document.getElementById('save');
  const deletePresetBtn = document.getElementById('delete');
  let loadedImage = null;
  const palette = [];

  // Renderizar desplegable por primera vez
  renderPaletteCards();

  // --- Animación botón Cargar Imagen ---
  const loadImgBtn = document.getElementById('loadImgBtn');
  if (loadImgBtn && imageInput) {
    loadImgBtn.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      loadImgBtn.classList.add('loading');
      loadImgBtn.disabled = true;

      const reader = new FileReader();
      reader.onload = () => {
        setTimeout(() => {
          loadImgBtn.classList.add('loaded');
          setTimeout(() => {
            loadImgBtn.classList.add('finished');
            setTimeout(() => {
              loadImgBtn.classList.remove('finished', 'loaded', 'loading');
              loadImgBtn.disabled = false;
              imageInput.value = '';
            }, 1200);
          }, 500);
        }, 800);
      };
      reader.readAsDataURL(file);
    });
  }

  // --- Custom Select Dithering ---
  const customDitherSelect = document.getElementById('customDitherSelect');
  const hiddenDitherInput = document.getElementById('ditherMethod');

  if (customDitherSelect && hiddenDitherInput) {
    const trigger = customDitherSelect.querySelector('.custom-select-trigger');
    const optionsContainer = customDitherSelect.querySelector('.custom-options');
    const textSpan = customDitherSelect.querySelector('.custom-select-text');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      customDitherSelect.classList.toggle('open');
    });

    document.addEventListener('click', () => customDitherSelect.classList.remove('open'));

    optionsContainer.addEventListener('click', (e) => {
      const option = e.target.closest('.custom-option');
      if (!option) return;

      optionsContainer.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');

      const newValue = option.dataset.value;
      textSpan.textContent = option.textContent;
      hiddenDitherInput.value = newValue;

      customDitherSelect.classList.remove('open');
      hiddenDitherInput.dispatchEvent(new Event('change'));
    });
  }

  // --- Custom Select Paletas (Menú desplegable de tarjetas) ---
  const customPaletteSelect = document.getElementById('customPaletteSelect');
  const optionsGrid = document.getElementById('paletteOptionsGrid');

  if (customPaletteSelect && optionsGrid) {
    const trigger = customPaletteSelect.querySelector('.palette-select-trigger');

    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        customPaletteSelect.classList.toggle('open');
      });
    }

    optionsGrid.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = e.target.closest('.palette-card-option');
      if (!card) return;

      const selectedKey = card.dataset.value;

      if (presetSelect) {
        presetSelect.value = selectedKey;
        presetSelect.dispatchEvent(new Event('change'));
      }

      applyPreset(selectedKey);
      renderPaletteCards();
      customPaletteSelect.classList.remove('open');
    });

    document.addEventListener('click', () => {
      customPaletteSelect.classList.remove('open');
    });
  }

  // --- Cargar Barra Degradado ---
  if (paletteContainer && paletteContainer.parentNode) {
    paletteContainer.parentNode.insertBefore(gradientBar, paletteContainer);
  }

  function updateGradientBar() {
    const bar = document.getElementById('gradientBar');
    if (!bar) return;
    const stepPercent = 100 / 16;
    const stops = palette.map((color, index) => {
      const start = (index * stepPercent).toFixed(2);
      const end = ((index + 1) * stepPercent).toFixed(2);
      return `${color} ${start}%, ${color} ${end}%`;
    }).join(', ');

    bar.style.background = `linear-gradient(to right, ${stops})`;
  }

  // --- Funciones auxiliares de color ---
  function hexToRgb(hex) {
    const num = parseInt(hex.replace('#', ''), 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  function rgbToHex(r, g, b) {
    const clamp = x => Math.max(0, Math.min(255, Math.round(x)));
    return '#' + [r, g, b].map(x => clamp(x).toString(16).padStart(2, '0')).join('');
  }

  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  function generatePaletteFromThree(color0, color1, color2) {
    const rgb0 = hexToRgb(color0);
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const newPalette = [];

    for (let i = 0; i < 16; i++) {
      let r, g, b;
      if (i < 8) {
        const t = i / 7;
        r = lerp(rgb0.r, rgb1.r, t);
        g = lerp(rgb0.g, rgb1.g, t);
        b = lerp(rgb0.b, rgb1.b, t);
      } else {
        const t = (i - 8) / 7;
        r = lerp(rgb1.r, rgb2.r, t);
        g = lerp(rgb1.g, rgb2.g, t);
        b = lerp(rgb1.b, rgb2.b, t);
      }
      newPalette.push(rgbToHex(r, g, b));
    }
    return newPalette;
  }

  function applyThreeColorGradient(c0, c1, c2) {
    const newColors = generatePaletteFromThree(c0, c1, c2);
    newColors.forEach((hex, index) => {
      palette[index] = hex;
    });
    updateColorInputs();
  }

  // --- Contenedor de 3 pickers base ---
  const basePickerContainer = document.createElement('div');
  basePickerContainer.id = 'basePickerContainer';
  if (paletteContainer && paletteContainer.parentNode) {
    paletteContainer.parentNode.insertBefore(basePickerContainer, paletteContainer);
  }

  const defaultBaseColors = ['#0f380f', '#306230', '#8bac0f'];
  defaultBaseColors.forEach((color, index) => {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = color;
    input.id = `baseColor${index}`;

    input.addEventListener('input', () => {
      const c0 = document.getElementById('baseColor0').value;
      const c1 = document.getElementById('baseColor1').value;
      const c2 = document.getElementById('baseColor2').value;
      applyThreeColorGradient(c0, c1, c2);
    });

    basePickerContainer.appendChild(input);
  });

  function updateColorInputs() {
    const inputs = paletteContainer.querySelectorAll('input[type="color"]');
    palette.forEach((hex, index) => {
      if (inputs[index]) inputs[index].value = hex;
    });
    updateGradientBar();
  }

  function applyPreset(presetKey) {
    const colors = window.presets[presetKey];
    if (!colors) return;

    const inputs = paletteContainer.querySelectorAll('input[type="color"]');
    colors.forEach((hex, index) => {
      palette[index] = hex;
      if (inputs[index]) inputs[index].value = hex;
    });

    const c0Input = document.getElementById('baseColor0');
    const c1Input = document.getElementById('baseColor1');
    const c2Input = document.getElementById('baseColor2');

    if (c0Input && c1Input && c2Input) {
      c0Input.value = colors[0];
      c1Input.value = colors[7];
      c2Input.value = colors[15];
    }
    updateGradientBar();
  }

  // Cargar paleta inicial grays
  applyPreset('grays');

  // --- Eventos de los controles de la paleta ---
  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => applyPreset(e.target.value));
  }

  if (invertBtn) {
    invertBtn.addEventListener('click', () => {
      palette.reverse();
      const inputs = paletteContainer.querySelectorAll('input[type="color"]');
      palette.forEach((hex, index) => {
        if (inputs[index]) inputs[index].value = hex;
      });
      updateGradientBar();
      renderPaletteCards();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => applyPreset(presetSelect.value));
  }

  // --- GUARDAR PALETA ---
  if (savePresetBtn) {
    savePresetBtn.addEventListener('click', () => {
      const name = prompt('Introduce el nombre para tu nueva paleta:');
      if (!name) return;
      const trimmedName = name.trim();
      if (!trimmedName) return;

      // 1. Guardar en el objeto global
      window.presets[trimmedName] = [...palette];

      // 2. Guardar en localStorage
      const customPresets = JSON.parse(localStorage.getItem('userPresets') || '{}');
      customPresets[trimmedName] = [...palette];
      localStorage.setItem('userPresets', JSON.stringify(customPresets));

      // 3. Seleccionar la nueva paleta
      if (presetSelect) presetSelect.value = trimmedName;

      // 4. Refrescar la interfaz (reconstruye tarjetas y select)
      renderPaletteCards();
    });
  }

  // --- BORRAR PALETA ---
  if (deletePresetBtn) {
    deletePresetBtn.addEventListener('click', () => {
      const selectedName = presetSelect ? presetSelect.value : 'grays';
      const customPresets = JSON.parse(localStorage.getItem('userPresets') || '{}');

      // 1. Validar que sea una paleta personalizada
      if (!customPresets[selectedName]) {
        alert('No puedes eliminar las paletas nativas del sistema.');
        return;
      }

      if (!confirm(`¿Seguro que deseas eliminar la paleta "${selectedName}"?`)) return;

      // 2. Eliminar de la memoria global y del localStorage
      delete window.presets[selectedName];
      delete customPresets[selectedName];
      localStorage.setItem('userPresets', JSON.stringify(customPresets));

      // 3. Volver a la paleta por defecto 'grays'
      if (presetSelect) presetSelect.value = 'grays';
      applyPreset('grays');

      // 4. Refrescar la interfaz (destruye las tarjetas antiguas)
      renderPaletteCards();
    });
  }

  // --- Carga de la foto seleccionada ---
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => { loadedImage = img; };
    img.src = URL.createObjectURL(file);
  });

  // --- Algoritmos de Dithering ---
  const bayerMatrix = [
    [ 0,  8,  2, 10],
    [12,  4, 14,  6],
    [ 3, 11,  1,  9],
    [15,  7, 13,  5]
  ];

  function applyFloydSteinberg(pixels, palette) {
    const width = 160, height = 144;
    const grayGrid = [];

    for (let y = 0; y < height; y++) {
      grayGrid[y] = [];
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        grayGrid[y][x] = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
      }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const oldVal = grayGrid[y][x];
        const colorIndex = Math.min(15, Math.max(0, Math.floor((oldVal / 256) * 16)));
        const newVal = (colorIndex / 15) * 255;
        const error = oldVal - newVal;

        const i = (y * width + x) * 4;
        const hexColor = palette[colorIndex];
        pixels[i]     = parseInt(hexColor.substr(1, 2), 16);
        pixels[i + 1] = parseInt(hexColor.substr(3, 2), 16);
        pixels[i + 2] = parseInt(hexColor.substr(5, 2), 16);

        if (x + 1 < width)                  grayGrid[y][x + 1]     += error * (7 / 16);
        if (y + 1 < height && x - 1 >= 0)   grayGrid[y + 1][x - 1] += error * (3 / 16);
        if (y + 1 < height)                 grayGrid[y + 1][x]     += error * (5 / 16);
        if (y + 1 < height && x + 1 < width) grayGrid[y + 1][x + 1] += error * (1 / 16);
      }
    }
  }

  // --- Procesado de Imagen ---
  if (processBtn) {
    processBtn.addEventListener('click', () => {
      if (!loadedImage) {
        alert("Por favor, selecciona una imagen primero.");
        return;
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 160;
      tempCanvas.height = 144;
      const tempCtx = tempCanvas.getContext('2d');

      tempCtx.drawImage(loadedImage, 0, 0, 160, 144);
      const imgData = tempCtx.getImageData(0, 0, 160, 144);
      const pixels = imgData.data;

      const selectedMethod = ditherMethodSelect.value;

      if (selectedMethod === 'floyd') {
        applyFloydSteinberg(pixels, palette);
      } else {
        for (let y = 0; y < 144; y++) {
          for (let x = 0; x < 160; x++) {
            const i = (y * 160 + x) * 4;
            let brightness = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];

            if (selectedMethod === 'bayer') {
              const bayerValue = bayerMatrix[y % 4][x % 4];
              const offset = (bayerValue / 16 - 0.5) * 32;
              brightness = Math.min(255, Math.max(0, brightness + offset));
            }

            const colorIndex = Math.min(15, Math.max(0, Math.floor((brightness / 256) * 16)));
            const hexColor = palette[colorIndex];
            pixels[i]     = parseInt(hexColor.substr(1, 2), 16);
            pixels[i + 1] = parseInt(hexColor.substr(3, 2), 16);
            pixels[i + 2] = parseInt(hexColor.substr(5, 2), 16);
          }
        }
      }

      tempCtx.putImageData(imgData, 0, 0);
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
      }
    });
  }

  // --- Descarga ---
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!loadedImage) {
        alert("Procesa una imagen antes de descargar.");
        return;
      }

      const imageUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `gameboy-photo-${Date.now()}.png`;
      downloadLink.href = imageUrl;
      downloadLink.click();
    });
  }

  // --- Service Worker ---
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }
});