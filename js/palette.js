import { state, presets } from './state.js';
import { generatePaletteFromThree } from './utils.js';

export function updateGradientBar() {
  const bar = document.getElementById('gradientBar');
  if (!bar) return;
  const stepPercent = 100 / 16;
  const stops = state.palette.map((color, index) => {
    const start = (index * stepPercent).toFixed(2);
    const end = ((index + 1) * stepPercent).toFixed(2);
    return `${color} ${start}%, ${color} ${end}%`;
  }).join(', ');

  bar.style.background = `linear-gradient(to right, ${stops})`;
}

export function updateColorInputs() {
  const paletteContainer = document.getElementById('paletteContainer');
  if (!paletteContainer) return;
  const inputs = paletteContainer.querySelectorAll('input[type="color"]');
  state.palette.forEach((hex, index) => {
    if (inputs[index]) inputs[index].value = hex;
  });
  updateGradientBar();
}

export function applyThreeColorGradient(c0, c1, c2) {
  const newColors = generatePaletteFromThree(c0, c1, c2);
  newColors.forEach((hex, index) => {
    state.palette[index] = hex;
  });
  updateColorInputs();
}

export function applyPreset(presetKey) {
  const colors = presets[presetKey];
  if (!colors) return;

  const paletteContainer = document.getElementById('paletteContainer');
  const inputs = paletteContainer ? paletteContainer.querySelectorAll('input[type="color"]') : [];
  
  colors.forEach((hex, index) => {
    state.palette[index] = hex;
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

export function renderPaletteCards() {
  const optionsGrid = document.getElementById('paletteOptionsGrid');
  const palettePresetInput = document.getElementById('palettePreset');
  const customPaletteSelect = document.getElementById('customPaletteSelect');

  const currentVal = palettePresetInput ? palettePresetInput.value : 'grays';

  if (palettePresetInput && palettePresetInput.tagName === 'SELECT') {
    palettePresetInput.innerHTML = '';
    Object.keys(presets).forEach((key) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = key;
      if (key === currentVal) opt.selected = true;
      palettePresetInput.appendChild(opt);
    });
  }

  if (optionsGrid) {
    optionsGrid.innerHTML = '';
    Object.keys(presets).forEach((key) => {
      const colorArray = presets[key];
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

  const nameText = customPaletteSelect ? customPaletteSelect.querySelector('.palette-name-text') : null;
  const triggerPreview = document.getElementById('triggerGradientPreview');

  if (presets[currentVal] && nameText && triggerPreview) {
    nameText.textContent = currentVal;
    triggerPreview.style.background = `linear-gradient(to right, ${presets[currentVal].join(', ')})`;
  }
}