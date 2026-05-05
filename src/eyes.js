import { GRID_W, GRID_H } from './simulation.js';

const COLS = 5;
const ROWS = 5;
const EYE_SIZE = 50;
const BG_COLOR = 0xFF140F0A;

export class Eyes {
  constructor() {
    this.bg = new Uint32Array(GRID_W * GRID_H).fill(BG_COLOR);
    this._load();
  }

  _load() {
    const img = new Image();
    img.src = 'images/eyes.png';
    img.onload = () => {
      const sprW = Math.floor(img.width / COLS);
      const sprH = Math.floor(img.height / ROWS);

      const sheet = document.createElement('canvas');
      sheet.width = img.width;
      sheet.height = img.height;
      sheet.getContext('2d').drawImage(img, 0, 0);

      const eyeCanvas = document.createElement('canvas');
      eyeCanvas.width = EYE_SIZE;
      eyeCanvas.height = EYE_SIZE;
      const eyeCtx = eyeCanvas.getContext('2d');

      const count = 3 + Math.floor(Math.random() * 4);

      for (let i = 0; i < count; i++) {
        const eyeIdx = Math.floor(Math.random() * (COLS * ROWS));
        const eyeCol = eyeIdx % COLS;
        const eyeRow = Math.floor(eyeIdx / COLS);

        eyeCtx.clearRect(0, 0, EYE_SIZE, EYE_SIZE);
        eyeCtx.drawImage(sheet, eyeCol * sprW, eyeRow * sprH, sprW, sprH, 0, 0, EYE_SIZE, EYE_SIZE);

        const raw = eyeCtx.getImageData(0, 0, EYE_SIZE, EYE_SIZE).data;
        const eyePx = new Uint32Array(raw.buffer);

        const gx = Math.floor(Math.random() * (GRID_W - EYE_SIZE));
        const gy = Math.floor(Math.random() * (GRID_H - EYE_SIZE));

        for (let py = 0; py < EYE_SIZE; py++) {
          for (let px = 0; px < EYE_SIZE; px++) {
            const p = eyePx[py * EYE_SIZE + px];
            if ((p >>> 24) > 20) {
              this.bg[(gy + py) * GRID_W + (gx + px)] = p;
            }
          }
        }
      }

      const loader = document.getElementById('loader');
      if (loader) {
        loader.classList.add('hidden');
        loader.addEventListener('transitionend', () => loader.remove(), { once: true });
      }
    };
  }
}
