const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_PX = 40;
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

    this._erasing = false;

    this._singleLastX = 0;
    this._singleLastY = 0;
    this._singleStartX = 0;
    this._singleStartY = 0;
    this._singleMoved = false;

    this._lastTapTime = 0;
    this._lastTapX = 0;
    this._lastTapY = 0;

    this._cursorEl = document.getElementById('erase-cursor');

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

    if (this._pointers.size >= 2) {
      this._erasing = false;
      this._hideCursor();
      this._lastTapTime = 0;
      this._pinchDist = this._getPinchDist();
      const mid = this._getPinchMid();
      this._pinchMidX = mid.x;
      this._pinchMidY = mid.y;
      return;
    }

    this._singleStartX = e.clientX;
    this._singleStartY = e.clientY;
    this._singleLastX = e.clientX;
    this._singleLastY = e.clientY;
    this._singleMoved = false;

    const now = performance.now();
    const dx = e.clientX - this._lastTapX;
    const dy = e.clientY - this._lastTapY;
    const isDoubleTap = (now - this._lastTapTime) < DOUBLE_TAP_MS
      && Math.sqrt(dx * dx + dy * dy) < DOUBLE_TAP_PX;

    if (isDoubleTap) {
      this._erasing = true;
      this._lastTapTime = 0;
      this._eraseAtClient(e.clientX, e.clientY);
      this._showCursor(e.clientX, e.clientY);
    }
  }

  _onPointerMove(e) {
    if (!this._pointers.has(e.pointerId)) return;
    this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this._pointers.size >= 2) {
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
        if (!this._erasing) {
          this._lastTapTime = 0;
        }
      }

      if (this._erasing) {
        this._eraseAtClient(e.clientX, e.clientY);
        this._updateCursor(e.clientX, e.clientY);
      } else if (this._singleMoved) {
        this.viewport.pan(dx, dy);
      }

      this._singleLastX = e.clientX;
      this._singleLastY = e.clientY;
    }
  }

  _onPointerUp(e) {
    this._pointers.delete(e.pointerId);

    if (this._pointers.size === 0) {
      if (!this._erasing && !this._singleMoved) {
        this._lastTapTime = performance.now();
        this._lastTapX = e.clientX;
        this._lastTapY = e.clientY;
      }
      this._erasing = false;
      this._hideCursor();
      return;
    }

    if (this._pointers.size < 2) {
      this._pinchDist = null;
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

  _getEraseRadius() {
    return Math.max(1, Math.round(15 / this.viewport.scale));
  }

  _eraseAtClient(cx, cy) {
    const rect = this.canvas.getBoundingClientRect();
    const { x, y } = this.viewport.canvasToGrid(cx - rect.left, cy - rect.top);
    this.simulation.clearCircle(x, y, this._getEraseRadius());
  }

  _showCursor(cx, cy) {
    this._cursorEl.style.display = 'block';
    this._updateCursor(cx, cy);
  }

  _hideCursor() {
    this._cursorEl.style.display = 'none';
  }

  _updateCursor(cx, cy) {
    const sizePx = this._getEraseRadius() * this.viewport.scale * 2;
    this._cursorEl.style.width = sizePx + 'px';
    this._cursorEl.style.height = sizePx + 'px';
    this._cursorEl.style.left = cx + 'px';
    this._cursorEl.style.top = cy + 'px';
  }
}
