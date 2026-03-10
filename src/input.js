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
    this._panAfterPinch = false;

    this._rightActive = false;
    this._rightLastX = 0;
    this._rightLastY = 0;

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
      this._panAfterPinch = true;
      this._hideCursor();
      this._pinchDist = this._getPinchDist();
      const mid = this._getPinchMid();
      this._pinchMidX = mid.x;
      this._pinchMidY = mid.y;
      return;
    }

    if (e.pointerType === 'mouse' && e.button === 2) {
      this._rightActive = true;
      this._rightLastX = e.clientX;
      this._rightLastY = e.clientY;
      return;
    }

    this._erasing = true;
    this._panAfterPinch = false;
    this._eraseAtClient(e.clientX, e.clientY);
    this._showCursor(e.clientX, e.clientY);
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
      if (this._rightActive && e.pointerType === 'mouse' && (e.buttons & 2)) {
        const dx = e.clientX - this._rightLastX;
        const dy = e.clientY - this._rightLastY;
        if (dx !== 0 || dy !== 0) this.viewport.pan(dx, dy);
        this._rightLastX = e.clientX;
        this._rightLastY = e.clientY;
        return;
      }

      if (this._erasing) {
        this._eraseAtClient(e.clientX, e.clientY);
        this._updateCursor(e.clientX, e.clientY);
      }
    }
  }

  _onPointerUp(e) {
    this._pointers.delete(e.pointerId);

    if (e.pointerType === 'mouse' && e.button === 2) {
      this._rightActive = false;
      return;
    }

    if (this._pointers.size === 0) {
      this._erasing = false;
      this._panAfterPinch = false;
      this._hideCursor();
      return;
    }

    if (this._pointers.size < 2) {
      this._pinchDist = null;
    }

    if (this._pointers.size === 1 && this._panAfterPinch) {
      this._erasing = false;
      this._hideCursor();
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
