import { COLOR_RGBA } from './colors.js';
import { WORLD_W, WORLD_H } from './world.js';

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

  render(grid, eyesBg, viewport) {
    const { viewX, viewY, scale } = viewport;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const pixels = this._pixels;

    const drawPixel = (outIdx, gx, gy) => {
      if (gx < 0 || gx >= WORLD_W || gy < 0 || gy >= WORLD_H) {
        pixels[outIdx] = 0xFF000000;
      } else {
        const gi = gy * WORLD_W + gx;
        const c = grid[gi];
        pixels[outIdx] = c === 0 ? eyesBg[gi] : COLOR_RGBA[c];
      }
    };

    if (scale >= 1) {
      const cellSize = scale;
      for (let cy = 0; cy < ch; cy++) {
        const gy = Math.floor(viewY + cy / cellSize);
        const rowOut = cy * cw;
        for (let cx = 0; cx < cw; cx++) {
          drawPixel(rowOut + cx, Math.floor(viewX + cx / cellSize), gy);
        }
      }
    } else {
      const step = 1 / scale;
      for (let cy = 0; cy < ch; cy++) {
        const gy = Math.floor(viewY + cy * step);
        const rowOut = cy * cw;
        for (let cx = 0; cx < cw; cx++) {
          drawPixel(rowOut + cx, Math.floor(viewX + cx * step), gy);
        }
      }
    }

    this.ctx.putImageData(this._imageData, 0, 0);
  }
}
