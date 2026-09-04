export function hexToRgb(hex) {
  const num = parseInt(hex.replace('#', ''), 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function rgbToHex(r, g, b) {
  const clamp = x => Math.max(0, Math.min(255, Math.round(x)));
  return '#' + [r, g, b].map(x => clamp(x).toString(16).padStart(2, '0')).join('');
}

export function lerp(start, end, t) {
  return start + (end - start) * t;
}

export function generatePaletteFromThree(color0, color1, color2) {
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