import { WORLD_W, WORLD_H } from './world.js';

const COLS = 5;
const ROWS = 5;
const EYE_SIZE = 50;
const TOOTH_SIZE = 50;
const BG_COLOR = 0xFF000000;

export class Eyes {
  constructor() {
    this.bg = new Uint32Array(WORLD_W * WORLD_H).fill(BG_COLOR);
    this.items = [];
    this._load();
  }

  _placeSprite(ctx, size, gx, gy) {
    const imgData = ctx.getImageData(0, 0, size, size);
    const px = new Uint32Array(imgData.data.buffer);
    const opaqueIndices = [];
    for (let py = 0; py < size; py++) {
      for (let sx = 0; sx < size; sx++) {
        const p = px[py * size + sx];
        if ((p >>> 24) > 20) {
          const bgIdx = (gy + py) * WORLD_W + (gx + sx);
          this.bg[bgIdx] = p;
          opaqueIndices.push(bgIdx);
        }
      }
    }
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.getContext('2d').putImageData(imgData, 0, 0);
    return { gx, gy, w: size, h: size, canvas, opaqueIndices, found: false };
  }

  _loadSheet(src, size, count, onLoad) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const sprW = Math.floor(img.width / COLS);
      const sprH = Math.floor(img.height / ROWS);
      const sheet = document.createElement('canvas');
      sheet.width = img.width;
      sheet.height = img.height;
      sheet.getContext('2d').drawImage(img, 0, 0);

      const tmp = document.createElement('canvas');
      tmp.width = size;
      tmp.height = size;
      const tmpCtx = tmp.getContext('2d');

      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * (COLS * ROWS));
        const col = idx % COLS;
        const row = Math.floor(idx / COLS);
        tmpCtx.clearRect(0, 0, size, size);
        tmpCtx.drawImage(sheet, col * sprW, row * sprH, sprW, sprH, 0, 0, size, size);

        const gx = Math.floor(Math.random() * (WORLD_W - size));
        const gy = Math.floor(Math.random() * (WORLD_H - size));
        const item = this._placeSprite(tmpCtx, size, gx, gy);
        if (item.opaqueIndices.length > 0) this.items.push(item);
      }
      onLoad();
    };
  }

  _load() {
    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded < 2) return;
      const loader = document.getElementById('loader');
      if (loader) {
        loader.classList.add('hidden');
        loader.addEventListener('transitionend', () => loader.remove(), { once: true });
      }
    };

    const eyeCount = 9 + Math.floor(Math.random() * 12);
    const toothCount = 6 + Math.floor(Math.random() * 8);
    this._loadSheet('images/eyes.png', EYE_SIZE, eyeCount, onLoad);
    this._loadSheet('images/tooths.png', TOOTH_SIZE, toothCount, onLoad);
  }

  checkFound(grid) {
    const found = [];
    for (const item of this.items) {
      if (item.found) continue;
      let cleared = 0;
      for (const idx of item.opaqueIndices) {
        if (grid[idx] === 0) cleared++;
      }
      if (cleared >= item.opaqueIndices.length * 0.5) {
        item.found = true;
        for (const idx of item.opaqueIndices) {
          this.bg[idx] = BG_COLOR;
        }
        found.push(item);
      }
    }
    return found;
  }
}
