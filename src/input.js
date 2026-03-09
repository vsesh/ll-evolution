export class Input {
  constructor(canvas, viewport, simulation) {
    this.canvas = canvas;
    this.viewport = viewport;
    this.simulation = simulation;
    this._dragging = false;
    this._erasing = false;
    this._pendingErase = false;
    this._lastX = 0;
    this._lastY = 0;
    this._moveStart = { x: 0, y: 0 };
    this._movedPx = 0;
    this._bind();
  }

  _bind() {
    const cv = this.canvas;
    cv.addEventListener('wheel', this._onWheel.bind(this), { passive: false });
    cv.addEventListener('pointerdown', this._onPointerDown.bind(this));
    cv.addEventListener('pointermove', this._onPointerMove.bind(this));
    cv.addEventListener('pointerup', this._onPointerUp.bind(this));
    cv.addEventListener('pointercancel', this._onPointerUp.bind(this));
    cv.addEventListener('contextmenu', e => e.preventDefault());
  }

  _onWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.05 : 1 / 1.05;
    const rect = this.canvas.getBoundingClientRect();
    this.viewport.zoom(factor, e.clientX - rect.left, e.clientY - rect.top);
  }

  _onPointerDown(e) {
    e.preventDefault();
    this.canvas.setPointerCapture(e.pointerId);
    this._lastX = e.clientX;
    this._lastY = e.clientY;

    const moved = { x: e.clientX, y: e.clientY };
    this._moveStart = moved;
    this._movedPx = 0;

    if (e.button === 0) {
      this._pendingErase = true;
      this._dragging = false;
      this._erasing = false;
    } else {
      this._dragging = true;
      this._erasing = false;
      this._pendingErase = false;
    }
  }

  _onPointerMove(e) {
    if (this._pendingErase) {
      const dx = e.clientX - this._moveStart.x;
      const dy = e.clientY - this._moveStart.y;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        this._pendingErase = false;
        this._dragging = true;
      }
    }

    if (this._dragging) {
      const dx = e.clientX - this._lastX;
      const dy = e.clientY - this._lastY;
      this.viewport.pan(dx, dy);
    } else if (this._erasing) {
      this._erase(e.clientX, e.clientY);
    }

    this._lastX = e.clientX;
    this._lastY = e.clientY;
  }

  _onPointerUp(e) {
    if (this._pendingErase) {
      this._erase(e.clientX, e.clientY);
    }
    this._dragging = false;
    this._erasing = false;
    this._pendingErase = false;
  }

  _erase(cx, cy) {
    const rect = this.canvas.getBoundingClientRect();
    const { x, y } = this.viewport.canvasToGrid(cx - rect.left, cy - rect.top);
    const r = Math.max(1, Math.floor(3 / this.viewport.scale));
    this.simulation.clearRect(x - r, y - r, x + r, y + r);
  }
}
