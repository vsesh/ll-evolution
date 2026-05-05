import { COLOR_RGBA } from './colors.js';
import { GRID_W, GRID_H } from './simulation.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this._imageData = null;
    this._pixels = null;
    this._resize();
  }

  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this._imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    this._pixels = new Uint32Array(this._imageData.data.buffer);
  }

  onResize() {
    this._resize();
  }

  render(grid, cover, viewport) {
    const { viewX, viewY, scale } = viewport;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const pixels = this._pixels;
    const coverOp = cover.opacity;
    const coverColors = cover.colors;

    const blendPixel = (outIdx, gx, gy) => {
      if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) {
        pixels[outIdx] = 0xFF000000;
        return;
      }
      const gi = gy * GRID_W + gx;
      const op = coverOp[gi];
      if (op === 0) {
        pixels[outIdx] = COLOR_RGBA[grid[gi]];
      } else if (op >= 254) {
        pixels[outIdx] = coverColors[gi];
      } else {
        const bg = COLOR_RGBA[grid[gi]];
        const cv = coverColors[gi];
        const inv = 255 - op;
        const r = ((bg & 0xFF) * inv + (cv & 0xFF) * op) >> 8;
        const g = (((bg >> 8) & 0xFF) * inv + ((cv >> 8) & 0xFF) * op) >> 8;
        const b = (((bg >> 16) & 0xFF) * inv + ((cv >> 16) & 0xFF) * op) >> 8;
        pixels[outIdx] = (255 << 24) | (b << 16) | (g << 8) | r;
      }
    };

    if (scale >= 1) {
      const cellSize = scale;
      for (let cy = 0; cy < ch; cy++) {
        const gy = Math.floor(viewY + cy / cellSize);
        const rowOut = cy * cw;
        for (let cx = 0; cx < cw; cx++) {
          blendPixel(rowOut + cx, Math.floor(viewX + cx / cellSize), gy);
        }
      }
    } else {
      const step = 1 / scale;
      for (let cy = 0; cy < ch; cy++) {
        const gy = Math.floor(viewY + cy * step);
        const rowOut = cy * cw;
        for (let cx = 0; cx < cw; cx++) {
          blendPixel(rowOut + cx, Math.floor(viewX + cx * step), gy);
        }
      }
    }

    this.ctx.putImageData(this._imageData, 0, 0);
  }
}
