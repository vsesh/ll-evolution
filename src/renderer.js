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

  render(grid, viewport) {
    const { viewX, viewY, scale } = viewport;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const pixels = this._pixels;
    const len = pixels.length;

    if (scale >= 1) {
      const cellSize = scale;
      for (let cy = 0; cy < ch; cy++) {
        const gy = Math.floor(viewY + cy / cellSize);
        if (gy < 0 || gy >= GRID_H) {
          for (let cx = 0; cx < cw; cx++) {
            pixels[cy * cw + cx] = 0xFF000000;
          }
          continue;
        }
        const rowBase = gy * GRID_W;
        const rowOut = cy * cw;
        for (let cx = 0; cx < cw; cx++) {
          const gx = Math.floor(viewX + cx / cellSize);
          if (gx < 0 || gx >= GRID_W) {
            pixels[rowOut + cx] = 0xFF000000;
          } else {
            pixels[rowOut + cx] = COLOR_RGBA[grid[rowBase + gx]];
          }
        }
      }
    } else {
      const step = 1 / scale;
      for (let cy = 0; cy < ch; cy++) {
        const gy = Math.floor(viewY + cy * step);
        if (gy < 0 || gy >= GRID_H) {
          for (let cx = 0; cx < cw; cx++) {
            pixels[cy * cw + cx] = 0xFF000000;
          }
          continue;
        }
        const rowBase = gy * GRID_W;
        const rowOut = cy * cw;
        for (let cx = 0; cx < cw; cx++) {
          const gx = Math.floor(viewX + cx * step);
          if (gx < 0 || gx >= GRID_W) {
            pixels[rowOut + cx] = 0xFF000000;
          } else {
            pixels[rowOut + cx] = COLOR_RGBA[grid[rowBase + gx]];
          }
        }
      }
    }

    this.ctx.putImageData(this._imageData, 0, 0);
  }
}
