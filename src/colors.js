export const NUM_COLORS = 16;
export const FIGHT_DISTANCE = 3;

const HUE_STEP = 360 / NUM_COLORS;

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

export const COLOR_RGBA = new Uint32Array(NUM_COLORS + 1);
export const COLOR_CSS = ['#000000'];

for (let i = 1; i <= NUM_COLORS; i++) {
  const hue = ((i - 1) * HUE_STEP) % 360;
  const [r, g, b] = hslToRgb(hue, 90, 55);
  COLOR_RGBA[i] = (255 << 24) | (b << 16) | (g << 8) | r;
  COLOR_CSS.push(`rgb(${r},${g},${b})`);
}
COLOR_RGBA[0] = (255 << 24) | 0;

export function colorDistance(a, b) {
  const diff = Math.abs(a - b);
  return Math.min(diff, NUM_COLORS - diff);
}
