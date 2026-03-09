const DRAG_THRESHOLD = 5;

export class Input {
  constructor(canvas, viewport, simulation) {
    this.canvas = canvas;
    this.viewport = viewport;
    this.simulation = simulation;

    this._pointers = new Map();
    this._pinchDist = null;
    this._pinchMidX = 0;
    this._pinchMidY = 0;

    this._singleStartX = 0;
    this._singleStartY = 0;
    this._singleLastX = 0;
    this._singleLastY = 0;
    this._singleMoved = false;
    this._singleIsTouch = false;

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
    this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this._pointers.size === 1) {
      this._singleStartX = e.clientX;
      this._singleStartY = e.clientY;
      this._singleLastX = e.clientX;
      this._singleLastY = e.clientY;
      this._singleMoved = false;
      this._singleIsTouch = e.pointerType === 'touch';
    }

    if (this._pointers.size === 2) {
      this._pinchDist = this._getPinchDist();
      const mid = this._getPinchMid();
      this._pinchMidX = mid.x;
      this._pinchMidY = mid.y;
    }
  }

  _onPointerMove(e) {
    if (!this._pointers.has(e.pointerId)) return;
    this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this._pointers.size === 2) {
      const newDist = this._getPinchDist();
      if (this._pinchDist && newDist > 0) {
        const factor = newDist / this._pinchDist;
        const rect = this.canvas.getBoundingClientRect();
        const mid = this._getPinchMid();
        this.viewport.zoom(factor, mid.x - rect.left, mid.y - rect.top);
      }
      this._pinchDist = newDist;

      const mid = this._getPinchMid();
      const dx = mid.x - this._pinchMidX;
      const dy = mid.y - this._pinchMidY;
      if (dx !== 0 || dy !== 0) this.viewport.pan(dx, dy);
      this._pinchMidX = mid.x;
      this._pinchMidY = mid.y;
      return;
    }

    if (this._pointers.size === 1) {
      const dx = e.clientX - this._singleLastX;
      const dy = e.clientY - this._singleLastY;
      const totalDx = e.clientX - this._singleStartX;
      const totalDy = e.clientY - this._singleStartY;

      if (!this._singleMoved && Math.sqrt(totalDx * totalDx + totalDy * totalDy) > DRAG_THRESHOLD) {
        this._singleMoved = true;
      }

      if (this._singleMoved) {
        this.viewport.pan(dx, dy);
      }

      this._singleLastX = e.clientX;
      this._singleLastY = e.clientY;

      if (!this._singleIsTouch) {
        if (e.buttons & 1) {
          this._erase(e.clientX, e.clientY);
        }
      }
    }
  }

  _onPointerUp(e) {
    const wasSingle = this._pointers.size === 1;
    this._pointers.delete(e.pointerId);

    if (wasSingle && !this._singleMoved) {
      this._erase(e.clientX, e.clientY);
    }

    if (this._pointers.size < 2) {
      this._pinchDist = null;
    }

    if (this._pointers.size === 1) {
      const remaining = this._pointers.values().next().value;
      this._singleLastX = remaining.x;
      this._singleLastY = remaining.y;
      this._singleStartX = remaining.x;
      this._singleStartY = remaining.y;
      this._singleMoved = false;
    }
  }

  _getPinchDist() {
    const pts = [...this._pointers.values()];
    const dx = pts[0].x - pts[1].x;
    const dy = pts[0].y - pts[1].y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  _getPinchMid() {
    const pts = [...this._pointers.values()];
    return {
      x: (pts[0].x + pts[1].x) / 2,
      y: (pts[0].y + pts[1].y) / 2,
    };
  }

  _erase(cx, cy) {
    const rect = this.canvas.getBoundingClientRect();
    const { x, y } = this.viewport.canvasToGrid(cx - rect.left, cy - rect.top);
    const r = Math.max(1, Math.floor(3 / this.viewport.scale));
    this.simulation.clearRect(x - r, y - r, x + r, y + r);
  }
}
