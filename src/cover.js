import { GRID_W, GRID_H } from './simulation.js';

const REGROW_PER_TICK = 1;

export class Cover {
  constructor() {
    const len = GRID_W * GRID_H;
    this.opacity = new Uint8Array(len).fill(255);
    this.colors = new Uint32Array(len);
    for (let i = 0; i < len; i++) {
      const n = (Math.random() * 22) | 0;
      const r = 25 + n;
      const g = 18 + (n >> 1);
      const b = 14 + (n >> 2);
      this.colors[i] = (255 << 24) | (b << 16) | (g << 8) | r;
    }
  }

  scratch(gx, gy, radius) {
    const r2 = radius * radius;
    const x0 = Math.max(0, Math.floor(gx - radius));
    const x1 = Math.min(GRID_W - 1, Math.ceil(gx + radius));
    const y0 = Math.max(0, Math.floor(gy - radius));
    const y1 = Math.min(GRID_H - 1, Math.ceil(gy + radius));
    const op = this.opacity;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x - gx;
        const dy = y - gy;
        if (dx * dx + dy * dy <= r2) {
          op[y * GRID_W + x] = 0;
        }
      }
    }
  }

  step() {
    const op = this.opacity;
    const len = op.length;
    for (let i = 0; i < len; i++) {
      if (op[i] < 255) {
        op[i] = Math.min(255, op[i] + REGROW_PER_TICK);
      }
    }
  }
}
