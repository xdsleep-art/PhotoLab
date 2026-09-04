// Presets nativos
export const presets = window.presets || {
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

// Estado interno reactivo de la aplicación
export const state = {
  palette: [],
  loadedImage: null,
  bayerMatrix: [
    [ 0,  8,  2, 10],
    [12,  4, 14,  6],
    [ 3, 11,  1,  9],
    [15,  7, 13,  5]
  ]
};

export function cargarPresetsStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem('userPresets') || '{}');
    Object.assign(presets, saved);
  } catch (e) {
    console.error("Error al leer localStorage:", e);
  }
}