import { NUM_COLORS, FIGHT_DISTANCE } from './colors.js';

export const WORLD_W = Math.min(window.innerWidth, 1280);
export const WORLD_H = Math.min(window.innerHeight, 720);

const SPREAD_BASE = 0.08;
const MUTATION_BASE = 0.001;
const SPREAD_VARIANCE = 0.04;
const MUTATION_VARIANCE = 0.0008;

let _rng = (Math.random() * 0xFFFFFFFF) >>> 0 || 1;
function rng() {
  _rng ^= _rng << 13;
  _rng ^= _rng >>> 17;
  _rng ^= _rng << 5;
  return (_rng >>> 0) / 0x100000000;
}

export class World {
  constructor() {
    this.grid = new Uint8Array(WORLD_W * WORLD_H);
    this.next = new Uint8Array(WORLD_W * WORLD_H);
    this.tick = 0;
    this.spreadChance = SPREAD_BASE;
    this.mutationChance = MUTATION_BASE;
    this._seed();
  }

  _seed() {
    for (let i = 0; i < WORLD_W * WORLD_H; i++) {
      this.grid[i] = (rng() * NUM_COLORS | 0) + 1;
    }
  }

  step() {
    this.tick++;
    this.spreadChance = Math.max(0.05, Math.min(0.6,
      SPREAD_BASE + (rng() - 0.5) * 2 * SPREAD_VARIANCE
    ));
    this.mutationChance = Math.max(0.0001, Math.min(0.005,
      MUTATION_BASE + (rng() - 0.5) * 2 * MUTATION_VARIANCE
    ));

    const grid = this.grid;
    const next = this.next;
    const spread = this.spreadChance;
    const mutate = this.mutationChance;
    const W = WORLD_W;
    const H = WORLD_H;
    const FD = FIGHT_DISTANCE;
    const NC = NUM_COLORS;
    const spreadInt = (spread * 0x100000000) >>> 0;
    const mutateInt = (mutate * 0x100000000) >>> 0;

    next.set(grid);

    for (let y = 0; y < H; y++) {
      const rowIdx = y * W;
      const hasUp   = y > 0;
      const hasDown = y < H - 1;
      for (let x = 0; x < W; x++) {
        const idx = rowIdx + x;
        const color = grid[idx];
        if (color === 0) continue;

        _rng ^= _rng << 13; _rng ^= _rng >>> 17; _rng ^= _rng << 5;
        if ((_rng >>> 0) < mutateInt) {
          _rng ^= _rng << 13; _rng ^= _rng >>> 17; _rng ^= _rng << 5;
          let nc = color + ((_rng & 1) ? 1 : -1);
          if (nc < 1) nc = NC;
          if (nc > NC) nc = 1;
          next[idx] = nc;
          continue;
        }

        const hasLeft  = x > 0;
        const hasRight = x < W - 1;
        let nidx, nc2, diff, absDiff, dist, ms, ts;

        if (hasLeft) {
          nidx = idx - 1; nc2 = grid[nidx];
          if (nc2 === 0) {
            _rng ^= _rng << 13; _rng ^= _rng >>> 17; _rng ^= _rng << 5;
            if ((_rng >>> 0) < spreadInt) next[nidx] = color;
          } else if (nc2 !== color) {
            diff = color - nc2; absDiff = diff < 0 ? -diff : diff;
            dist = absDiff < NC - absDiff ? absDiff : NC - absDiff;
            if (dist > FD) {
              ms = (hasLeft&&grid[idx-1]===color?1:0)+(hasRight&&grid[idx+1]===color?1:0)+(hasUp&&grid[idx-W]===color?1:0)+(hasDown&&grid[idx+W]===color?1:0);
              ts = (x>1&&grid[nidx-1]===nc2?1:0)+(grid[nidx+1]===nc2?1:0)+(hasUp&&grid[nidx-W]===nc2?1:0)+(hasDown&&grid[nidx+W]===nc2?1:0);
              if (ms > ts) next[nidx] = color; else if (ts > ms) next[idx] = nc2;
            }
          }
        }
        if (hasRight) {
          nidx = idx + 1; nc2 = grid[nidx];
          if (nc2 === 0) {
            _rng ^= _rng << 13; _rng ^= _rng >>> 17; _rng ^= _rng << 5;
            if ((_rng >>> 0) < spreadInt) next[nidx] = color;
          } else if (nc2 !== color) {
            diff = color - nc2; absDiff = diff < 0 ? -diff : diff;
            dist = absDiff < NC - absDiff ? absDiff : NC - absDiff;
            if (dist > FD) {
              ms = (hasLeft&&grid[idx-1]===color?1:0)+(hasRight&&grid[idx+1]===color?1:0)+(hasUp&&grid[idx-W]===color?1:0)+(hasDown&&grid[idx+W]===color?1:0);
              ts = (grid[nidx-1]===nc2?1:0)+(x<W-2&&grid[nidx+1]===nc2?1:0)+(hasUp&&grid[nidx-W]===nc2?1:0)+(hasDown&&grid[nidx+W]===nc2?1:0);
              if (ms > ts) next[nidx] = color; else if (ts > ms) next[idx] = nc2;
            }
          }
        }
        if (hasUp) {
          nidx = idx - W; nc2 = grid[nidx];
          if (nc2 === 0) {
            _rng ^= _rng << 13; _rng ^= _rng >>> 17; _rng ^= _rng << 5;
            if ((_rng >>> 0) < spreadInt) next[nidx] = color;
          } else if (nc2 !== color) {
            diff = color - nc2; absDiff = diff < 0 ? -diff : diff;
            dist = absDiff < NC - absDiff ? absDiff : NC - absDiff;
            if (dist > FD) {
              const nx2 = nidx % W;
              ms = (hasLeft&&grid[idx-1]===color?1:0)+(hasRight&&grid[idx+1]===color?1:0)+(hasUp&&grid[idx-W]===color?1:0)+(hasDown&&grid[idx+W]===color?1:0);
              ts = (nx2>0&&grid[nidx-1]===nc2?1:0)+(nx2<W-1&&grid[nidx+1]===nc2?1:0)+(y>1&&grid[nidx-W]===nc2?1:0)+(grid[nidx+W]===nc2?1:0);
              if (ms > ts) next[nidx] = color; else if (ts > ms) next[idx] = nc2;
            }
          }
        }
        if (hasDown) {
          nidx = idx + W; nc2 = grid[nidx];
          if (nc2 === 0) {
            _rng ^= _rng << 13; _rng ^= _rng >>> 17; _rng ^= _rng << 5;
            if ((_rng >>> 0) < spreadInt) next[nidx] = color;
          } else if (nc2 !== color) {
            diff = color - nc2; absDiff = diff < 0 ? -diff : diff;
            dist = absDiff < NC - absDiff ? absDiff : NC - absDiff;
            if (dist > FD) {
              const nx2 = nidx % W;
              ms = (hasLeft&&grid[idx-1]===color?1:0)+(hasRight&&grid[idx+1]===color?1:0)+(hasUp&&grid[idx-W]===color?1:0)+(hasDown&&grid[idx+W]===color?1:0);
              ts = (nx2>0&&grid[nidx-1]===nc2?1:0)+(nx2<W-1&&grid[nidx+1]===nc2?1:0)+(grid[nidx-W]===nc2?1:0)+(y<H-2&&grid[nidx+W]===nc2?1:0);
              if (ms > ts) next[nidx] = color; else if (ts > ms) next[idx] = nc2;
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
    if (x >= 0 && x < WORLD_W && y >= 0 && y < WORLD_H) {
      this.grid[y * WORLD_W + x] = 0;
    }
  }

  clearRect(x0, y0, x1, y1) {
    for (let y = Math.max(0, y0); y <= Math.min(WORLD_H - 1, y1); y++) {
      for (let x = Math.max(0, x0); x <= Math.min(WORLD_W - 1, x1); x++) {
        this.grid[y * WORLD_W + x] = 0;
      }
    }
  }

  clearCircle(cx, cy, r) {
    const r2 = r * r;
    for (let y = Math.max(0, cy - r); y <= Math.min(WORLD_H - 1, cy + r); y++) {
      for (let x = Math.max(0, cx - r); x <= Math.min(WORLD_W - 1, cx + r); x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2) {
          this.grid[y * WORLD_W + x] = 0;
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
