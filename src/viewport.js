import { GRID_W, GRID_H } from './simulation.js';

export class Viewport {
  constructor() {
    this.scale = 2;
    this.viewX = (GRID_W - window.innerWidth / this.scale) / 2;
    this.viewY = (GRID_H - window.innerHeight / this.scale) / 2;
    this._clamp();
  }

  _clamp() {
    const visW = window.innerWidth / this.scale;
    const visH = window.innerHeight / this.scale;
    if (visW >= GRID_W) {
      this.viewX = (GRID_W - visW) / 2;
    } else {
      this.viewX = Math.max(0, Math.min(GRID_W - visW, this.viewX));
    }
    if (visH >= GRID_H) {
      this.viewY = (GRID_H - visH) / 2;
    } else {
      this.viewY = Math.max(0, Math.min(GRID_H - visH, this.viewY));
    }
  }

  zoom(factor, cx, cy) {
    const gx = this.viewX + cx / this.scale;
    const gy = this.viewY + cy / this.scale;
    this.scale = Math.max(1, Math.min(20, this.scale * factor));
    this.viewX = gx - cx / this.scale;
    this.viewY = gy - cy / this.scale;
    this._clamp();
  }

  pan(dx, dy) {
    this.viewX -= dx / this.scale;
    this.viewY -= dy / this.scale;
    this._clamp();
  }

  canvasToGrid(cx, cy) {
    return {
      x: Math.floor(this.viewX + cx / this.scale),
      y: Math.floor(this.viewY + cy / this.scale),
    };
  }

  onResize() {
    this._clamp();
  }
}
