const DISPLAY_SIZE = 80;
const GRAVITY = 0.25;

export class FallingItems {
  constructor() {
    this._items = [];
  }

  add(canvas, screenX) {
    this._items.push({
      canvas,
      x: screenX - DISPLAY_SIZE / 2,
      y: -DISPLAY_SIZE,
      vy: 1.5 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 1.5,
      alpha: 1,
    });
  }

  update() {
    const ch = window.innerHeight;
    for (const it of this._items) {
      it.vy += GRAVITY;
      it.y += it.vy;
      it.x += it.vx;
      if (it.y > ch * 0.65) {
        it.alpha -= 0.02;
        if (it.alpha < 0) it.alpha = 0;
      }
    }
    this._items = this._items.filter(it => it.alpha > 0);
  }

  draw(ctx) {
    if (this._items.length === 0) return;
    for (const it of this._items) {
      ctx.save();
      ctx.globalAlpha = it.alpha;
      ctx.drawImage(it.canvas, it.x, it.y, DISPLAY_SIZE, DISPLAY_SIZE);
      ctx.restore();
    }
  }
}
