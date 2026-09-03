// ==========================================
// 1. ESTADO GLOBAL (Fuente única de verdad)
// ==========================================
window.presets = window.presets || {
  grays: ['#000000', '#555555', '#aaaaaa', '#ffffff'],
  dmg: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f']
};

// Cargar del localStorage
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
  // Buscamos los elementos AQUÍ DENTRO para evitar referencias 'null'
  const optionsGrid = document.getElementById('paletteOptionsGrid');
  const palettePresetInput = document.getElementById('palettePreset');
  const customPaletteSelect = document.getElementById('customPaletteSelect');

  if (!optionsGrid) return;

  const nameText = customPaletteSelect ? customPaletteSelect.querySelector('.palette-name-text') : null;
  const triggerPreview = document.getElementById('triggerGradientPreview');

  // 1. Limpieza absoluta del contenedor
  optionsGrid.innerHTML = '';

  const currentVal = palettePresetInput ? palettePresetInput.value : 'grays';

  // 2. Reconstrucción completa desde window.presets
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

  // 3. Actualizar texto y degradado del botón cabecera
  if (window.presets[currentVal] && nameText && triggerPreview) {
    nameText.textContent = currentVal;
    triggerPreview.style.background = `linear-gradient(to right, ${window.presets[currentVal].join(', ')})`;
  }
}

// ==========================================
// 4. LISTENERS DE INTERFAZ (DOM LOADED)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar datos y renderizar
  cargarPresetsStorage();
  renderPaletteCards();

  const customPaletteSelect = document.getElementById('customPaletteSelect');
  const optionsGrid = document.getElementById('paletteOptionsGrid');
  const palettePresetInput = document.getElementById('palettePreset');

  if (!customPaletteSelect || !optionsGrid) return;

  const trigger = customPaletteSelect.querySelector('.palette-select-trigger');

  // Abrir / Cerrar desplegable
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    customPaletteSelect.classList.toggle('open');
  });

  // Selección al hacer clic en una tarjeta (Delegación de eventos)
  optionsGrid.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = e.target.closest('.palette-card-option');
    if (!card) return;

    const selectedKey = card.dataset.value;

    if (palettePresetInput) {
      palettePresetInput.value = selectedKey;
      palettePresetInput.dispatchEvent(new Event('change'));
    }

    if (typeof applyPreset === 'function') {
      applyPreset(selectedKey);
    }

    renderPaletteCards();
    customPaletteSelect.classList.remove('open');
  });

  // Cerrar si se hace clic fuera
  document.addEventListener('click', () => {
    customPaletteSelect.classList.remove('open');
  });
});

// Funcionamiento interno

document.addEventListener('DOMContentLoaded', function() {
 // 1. Selección de elementos del DOM
const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('gameboyCanvas');
const ctx = canvas.getContext('2d');
const processBtn = document.getElementById('processBtn');
const ditherMethodSelect = document.getElementById('ditherMethod');
const paletteContainer = document.getElementById('paletteContainer');
const presetSelect = document.getElementById('palettePreset');
const invertBtn = document.getElementById('invertBtn');
const resetBtn = document.getElementById('resetBtn');
const gradientBar = document.createElement('div');
gradientBar.id = 'gradientBar';
const savePresetBtn = document.getElementById('save');
let loadedImage = null;
const palette = [];

//=====================Animación botones
// 1. Mapeo de IDs coincidentes
const loadImgBtn = document.getElementById('loadImgBtn');

if (loadImgBtn && imageInput) {
  // 2. Redirigir el clic del botón al input de archivo oculto
  loadImgBtn.addEventListener('click', () => {
    imageInput.click();
  });

  // 3. Escuchar la selección de archivo y disparar la animación
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Iniciar estado "loading"
    loadImgBtn.classList.add('loading');
    loadImgBtn.disabled = true;

    const reader = new FileReader();

    reader.onload = (event) => {
      // AQUÍ va el procesamiento de tu imagen/paleta
      // p. ej. processImage(event.target.result);

      // Transición visual de éxito
      setTimeout(() => {
        loadImgBtn.classList.add('loaded');

        setTimeout(() => {
          loadImgBtn.classList.add('finished');

          // Resetear estados del botón
          setTimeout(() => {
            loadImgBtn.classList.remove('finished', 'loaded', 'loading');
            loadImgBtn.disabled = false;
            imageInput.value = ''; // Permite volver a seleccionar el mismo archivo
          }, 1200);
        }, 500);
      }, 800);
    };

    reader.readAsDataURL(file);
  });
}
const customDitherSelect = document.getElementById('customDitherSelect');
const hiddenDitherInput = document.getElementById('ditherMethod');

if (customDitherSelect && hiddenDitherInput) {
  const trigger = customDitherSelect.querySelector('.custom-select-trigger');
  const optionsContainer = customDitherSelect.querySelector('.custom-options');
  const textSpan = customDitherSelect.querySelector('.custom-select-text');

  // 1. Abrir/Cerrar menú
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    customDitherSelect.classList.toggle('open');
  });

  // 2. Cerrar al hacer clic fuera
  document.addEventListener('click', () => {
    customDitherSelect.classList.remove('open');
  });

  // 3. Seleccionar método de Dithering
  optionsContainer.addEventListener('click', (e) => {
    const option = e.target.closest('.custom-option');
    if (!option) return;

    // Marcado visual de la opción seleccionada
    optionsContainer.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');

    // Actualizar texto en pantalla y valor oculto
    const newValue = option.dataset.value;
    textSpan.textContent = option.textContent;
    hiddenDitherInput.value = newValue;

    // Cerrar menú
    customDitherSelect.classList.remove('open');

    // Disparar evento de cambio para que la imagen se vuelva a procesar automáticamente
    hiddenDitherInput.dispatchEvent(new Event('change'));
    
    // Si tienes una función directa para procesar la imagen, la puedes invocar aquí:
    // if (typeof processImage === 'function') processImage();
  });
}



//=====PRESETS CARGADOS=======================================================
const presets = {
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
function loadSavedPresets() {
  const saved = localStorage.getItem('userPresets');
  if (!saved) return;

  const customPresets = JSON.parse(saved);

  // Combinar los presets guardados con los originales
  Object.assign(presets, customPresets);

  // Agregar las opciones guardadas al select
  Object.keys(customPresets).forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    presetSelect.appendChild(option);
  });
}

// Ejecutar al cargar la página
loadSavedPresets();


//======CARGAR BARRA DEGRADADO====================================================================
paletteContainer.parentNode.insertBefore(gradientBar, paletteContainer);

function updateGradientBar() {
  const bar = document.getElementById('gradientBar');
  if (!bar) return;
  const stepPercent = 100 / 16;
  // Construir las paradas del degradado con bordes definidos (estilo retro pixelado)
  const stops = palette.map((color, index) => {
    const start = (index * stepPercent).toFixed(2);
    const end = ((index + 1) * stepPercent).toFixed(2);
    return `${color} ${start}%, ${color} ${end}%`;
  }).join(', ');

  bar.style.background = `linear-gradient(to right, ${stops})`;
}

paletteContainer.parentNode.insertBefore(gradientBar, paletteContainer);

//=======PALETA DE COLORES Y SELECTOR ========================================================

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

// Contenedor para los 3 controles principales
const basePickerContainer = document.createElement('div');
basePickerContainer.id = 'basePickerContainer';
paletteContainer.parentNode.insertBefore(basePickerContainer, paletteContainer);

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

//==================================================================================
// Cargar la paleta inicial en escala de grises al inicio
applyPreset('grays');

function updateColorInputs() {
  const inputs = paletteContainer.querySelectorAll('input[type="color"]');
  palette.forEach((hex, index) => {
    if (inputs[index]) inputs[index].value = hex;
  });
  updateGradientBar();
}
// 4. Función para aplicar un preset a la interfaz
function applyPreset(presetKey) {
  const colors = presets[presetKey];
  if (!colors) return;

// 1. Actualizar los 16 tonos de la paleta
  const inputs = paletteContainer.querySelectorAll('input[type="color"]');
  colors.forEach((hex, index) => {
    palette[index] = hex;
    if (inputs[index]) inputs[index].value = hex;
  });

  // 2. Sincronizar los 3 selectores base principales 🎛️
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

// ========================================================================================8. Eventos de los controles de la paleta 🎛️

presetSelect.addEventListener('change', (e) => applyPreset(e.target.value));


invertBtn.addEventListener('click', () => {
  palette.reverse();
  const inputs = paletteContainer.querySelectorAll('input[type="color"]');
  palette.forEach((hex, index) => {
    if (inputs[index]) inputs[index].value = hex;
  });
  updateGradientBar()
  renderPaletteCards(); 
});
resetBtn.addEventListener('click', () => applyPreset(presetSelect.value));

//guardado de paletas
savePresetBtn.addEventListener('click', () => {
  const name = prompt('Introduce el nombre para tu nueva paleta:');
  if (!name) return;

  // 1. Guardar la paleta en el objeto global
  presets[name] = [...palette];
  renderPaletteCards();
  // 2. Actualizar el menú select
  const option = document.createElement('option');
  option.value = name;
  option.textContent = name;
  presetSelect.appendChild(option);
  presetSelect.value = name;

  // 3. 📦 Guardar las paletas personalizadas en localStorage
  const customPresets = JSON.parse(localStorage.getItem('userPresets') || '{}');
  customPresets[name] = [...palette];
  localStorage.setItem('userPresets', JSON.stringify(customPresets));
  renderPaletteCards();
});

// Borrado de paletas
const deletePresetBtn = document.getElementById('delete'); // ID de tu botón para borrar

deletePresetBtn.addEventListener('click', () => {
  const selectedName = presetSelect.value;
  const customPresets = JSON.parse(localStorage.getItem('userPresets') || '{}');

  // 1. Validar que sea una paleta personalizada y no nativa 🛑
  if (!customPresets[selectedName]) {
    alert('No puedes eliminar las paletas nativas del sistema.');
    return;
  }

  // Confirmación de seguridad opcional
  if (!confirm(`¿Seguro que deseas eliminar la paleta "${selectedName}"?`)) return;

  // 2. Eliminar de la memoria y del localStorage 🗑️
  delete presets[selectedName];
  delete customPresets[selectedName];
  localStorage.setItem('userPresets', JSON.stringify(customPresets));

  // 3. Eliminar la opción <option> del menú desplegable 📑
  const optionToRemove = presetSelect.querySelector(`option[value="${selectedName}"]`);
  if (optionToRemove) {
    optionToRemove.remove();
  }

  // 4. Seleccionar la paleta por defecto y refrescar la interfaz 🔄
  presetSelect.value = 'grays';
  applyPreset('grays');
  renderPaletteCards();
});






//=================================================================================================PROCESADO===============
// 5. Carga de la foto seleccionada 🖼️
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => { loadedImage = img; };
  img.src = URL.createObjectURL(file);
});

//===========================================MÉTODOS

// 6. Matriz de Bayer 4x4 🏁
const bayerMatrix = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5]
];

// 7. Algoritmo de Floyd-Steinberg 🌊
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

//==================================================================================== 9. Ejecución principal del filtro 🚀
processBtn.addEventListener('click', () => {
  if (!loadedImage) {
    alert("Por favor, selecciona una imagen primero.");
    return;
  }

  // Crear canvas auxiliar de 160x144
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

  // Guardar datos procesados y escalar al canvas de 1080x972 sin suavizado
  tempCtx.putImageData(imgData, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
});
const downloadBtn = document.getElementById('downloadBtn');

downloadBtn.addEventListener('click', () => {
  // Comprobar si ya se ha procesado alguna imagen
  if (!loadedImage) {
    alert("Procesa una imagen antes de descargar.");
    return;
  }

  // 1. Convertir el contenido del canvas principal (1080x972) a PNG
  const imageUrl = canvas.toDataURL('image/png');

  // 2. Crear un elemento <a> invisible para forzar la descarga
  const downloadLink = document.createElement('a');
  downloadLink.download = `gameboy-photo-${Date.now()}.png`;
  downloadLink.href = imageUrl;

  // 3. Simular el clic y limpiar el enlace
  downloadLink.click();
});
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
});