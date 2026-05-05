export const NUM_COLORS = 16;
export const FIGHT_DISTANCE = 6;

const PALETTE = [
  [80,  30,  15],
  [120, 50,  20],
  [155, 68,  28],
  [140, 80,  25],
  [90,  70,  18],
  [118, 93,  28],
  [148, 118, 48],
  [50,  35,  20],
  [72,  52,  30],
  [100, 75,  45],
  [62,  56,  48],
  [82,  72,  60],
  [40,  50,  28],
  [55,  65,  33],
  [68,  24,  24],
  [102, 35,  22],
];

export const COLOR_RGBA = new Uint32Array(NUM_COLORS + 1);
export const COLOR_CSS = ['rgb(20,15,10)'];

for (let i = 1; i <= NUM_COLORS; i++) {
  const [r, g, b] = PALETTE[i - 1];
  COLOR_RGBA[i] = (255 << 24) | (b << 16) | (g << 8) | r;
  COLOR_CSS.push(`rgb(${r},${g},${b})`);
}
COLOR_RGBA[0] = (255 << 24) | (10 << 16) | (15 << 8) | 20;

export function colorDistance(a, b) {
  const diff = Math.abs(a - b);
  return Math.min(diff, NUM_COLORS - diff);
}
