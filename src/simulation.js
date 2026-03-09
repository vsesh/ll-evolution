import { NUM_COLORS, FIGHT_DISTANCE, colorDistance } from './colors.js';

export const GRID_W = 500;
export const GRID_H = 500;

const SPREAD_BASE = 0.25;
const MUTATION_BASE = 0.001;
const SPREAD_VARIANCE = 0.15;
const MUTATION_VARIANCE = 0.0008;

export class Simulation {
  constructor() {
    this.grid = new Uint8Array(GRID_W * GRID_H);
    this.next = new Uint8Array(GRID_W * GRID_H);
    this.tick = 0;
    this.spreadChance = SPREAD_BASE;
    this.mutationChance = MUTATION_BASE;
    this._seed();
  }

  _seed() {
    const count = 40;
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * GRID_W);
      const y = Math.floor(Math.random() * GRID_H);
      const color = Math.floor(Math.random() * NUM_COLORS) + 1;
      this.grid[y * GRID_W + x] = color;
    }
  }

  _idx(x, y) {
    return y * GRID_W + x;
  }

  _countNeighbors(grid, x, y, color) {
    let count = 0;
    if (x > 0 && grid[this._idx(x - 1, y)] === color) count++;
    if (x < GRID_W - 1 && grid[this._idx(x + 1, y)] === color) count++;
    if (y > 0 && grid[this._idx(x, y - 1)] === color) count++;
    if (y < GRID_H - 1 && grid[this._idx(x, y + 1)] === color) count++;
    return count;
  }

  step() {
    this.tick++;
    this.spreadChance = Math.max(0.05, Math.min(0.6,
      SPREAD_BASE + (Math.random() - 0.5) * 2 * SPREAD_VARIANCE
    ));
    this.mutationChance = Math.max(0.0001, Math.min(0.005,
      MUTATION_BASE + (Math.random() - 0.5) * 2 * MUTATION_VARIANCE
    ));

    const grid = this.grid;
    const next = this.next;
    const spread = this.spreadChance;
    const mutate = this.mutationChance;
    const W = GRID_W;
    const H = GRID_H;

    next.set(grid);

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = y * W + x;
        const color = grid[idx];
        if (color === 0) continue;

        if (Math.random() < mutate) {
          const delta = Math.random() < 0.5 ? -1 : 1;
          let newColor = color + delta;
          if (newColor < 1) newColor = NUM_COLORS;
          if (newColor > NUM_COLORS) newColor = 1;
          next[idx] = newColor;
          continue;
        }

        for (let d = 0; d < 4; d++) {
          const nx = x + dirs[d][0];
          const ny = y + dirs[d][1];
          if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
          const nidx = ny * W + nx;
          const neighborColor = grid[nidx];

          if (neighborColor === 0) {
            if (Math.random() < spread) {
              next[nidx] = color;
            }
          } else if (neighborColor !== color) {
            const dist = colorDistance(color, neighborColor);
            if (dist > FIGHT_DISTANCE) {
              const myScore = this._countNeighbors(grid, x, y, color);
              const theirScore = this._countNeighbors(grid, nx, ny, neighborColor);
              if (myScore > theirScore) {
                next[nidx] = color;
              } else if (theirScore > myScore) {
                next[idx] = neighborColor;
              }
            }
          }
        }
      }
    }

    const tmp = this.grid;
    this.grid = this.next;
    this.next = tmp;
  }

  clearCell(x, y) {
    if (x >= 0 && x < GRID_W && y >= 0 && y < GRID_H) {
      this.grid[y * GRID_W + x] = 0;
    }
  }

  clearRect(x0, y0, x1, y1) {
    for (let y = Math.max(0, y0); y <= Math.min(GRID_H - 1, y1); y++) {
      for (let x = Math.max(0, x0); x <= Math.min(GRID_W - 1, x1); x++) {
        this.grid[y * GRID_W + x] = 0;
      }
    }
  }

  clearCircle(cx, cy, r) {
    const r2 = r * r;
    for (let y = Math.max(0, cy - r); y <= Math.min(GRID_H - 1, cy + r); y++) {
      for (let x = Math.max(0, cx - r); x <= Math.min(GRID_W - 1, cx + r); x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2) {
          this.grid[y * GRID_W + x] = 0;
        }
      }
    }
  }

  serialize() {
    return {
      tick: this.tick,
      grid: this.grid,
    };
  }

  deserialize(data) {
    this.tick = data.tick || 0;
    const src = data.grid;
    const len = Math.min(src.length, this.grid.length);
    this.grid.set(src instanceof Uint8Array ? src.subarray(0, len) : new Uint8Array(src).subarray(0, len));
  }
}
