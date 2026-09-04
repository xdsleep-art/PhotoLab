import { state, presets } from './state.js';
import { applyPreset, renderPaletteCards, updateColorInputs, applyThreeColorGradient } from './palette.js';

export function setupImageLoaderAnimation() {
  const loadImgBtn = document.getElementById('loadImgBtn');
  const imageInput = document.getElementById('imageInput');

  if (!loadImgBtn || !imageInput) return;

  loadImgBtn.addEventListener('click', () => imageInput.click());

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => { state.loadedImage = img; };
    img.src = URL.createObjectURL(file);

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

export function setupCustomSelects() {
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

  const customPaletteSelect = document.getElementById('customPaletteSelect');
  const optionsGrid = document.getElementById('paletteOptionsGrid');
  const presetSelect = document.getElementById('palettePreset');

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
}

export function setupPaletteControls() {
  const paletteContainer = document.getElementById('paletteContainer');
  const presetSelect = document.getElementById('palettePreset');
  const invertBtn = document.getElementById('invertBtn');
  const resetBtn = document.getElementById('resetBtn');
  const savePresetBtn = document.getElementById('save');
  const deletePresetBtn = document.getElementById('delete');

  const gradientBar = document.createElement('div');
  gradientBar.id = 'gradientBar';
  if (paletteContainer && paletteContainer.parentNode) {
    paletteContainer.parentNode.insertBefore(gradientBar, paletteContainer);
  }

  const basePickerContainer = document.createElement('div');
  basePickerContainer.id = 'basePickerContainer';
  if (paletteContainer && paletteContainer.parentNode) {
    paletteContainer.parentNode.insertBefore(basePickerContainer, paletteContainer);
  }

  ['#0f380f', '#306230', '#8bac0f'].forEach((color, index) => {
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

  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => applyPreset(e.target.value));
  }

  if (invertBtn) {
    invertBtn.addEventListener('click', () => {
      state.palette.reverse();
      updateColorInputs();
      renderPaletteCards();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => applyPreset(presetSelect.value));
  }

  if (savePresetBtn) {
    savePresetBtn.addEventListener('click', () => {
      const name = prompt('Introduce el nombre para tu nueva paleta:');
      if (!name) return;
      const trimmedName = name.trim();
      if (!trimmedName) return;

      presets[trimmedName] = [...state.palette];
      const customPresets = JSON.parse(localStorage.getItem('userPresets') || '{}');
      customPresets[trimmedName] = [...state.palette];
      localStorage.setItem('userPresets', JSON.stringify(customPresets));

      if (presetSelect) presetSelect.value = trimmedName;
      renderPaletteCards();
    });
  }

  if (deletePresetBtn) {
    deletePresetBtn.addEventListener('click', () => {
      const selectedName = presetSelect ? presetSelect.value : 'grays';
      const customPresets = JSON.parse(localStorage.getItem('userPresets') || '{}');

      if (!customPresets[selectedName]) {
        alert('No puedes eliminar las paletas nativas del sistema.');
        return;
      }

      if (!confirm(`¿Seguro que deseas eliminar la paleta "${selectedName}"?`)) return;

      delete presets[selectedName];
      delete customPresets[selectedName];
      localStorage.setItem('userPresets', JSON.stringify(customPresets));

      if (presetSelect) presetSelect.value = 'grays';
      applyPreset('grays');
      renderPaletteCards();
    });
  }
}