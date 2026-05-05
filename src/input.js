export class Input {
  constructor(canvas, viewport, simulation) {
    this.canvas = canvas;
    this.viewport = viewport;
    this.simulation = simulation;

    this._pointers = new Map();

    this._cursorEl = document.getElementById('erase-cursor');

    this._bind();
  }

  _bind() {
    const cv = this.canvas;
    cv.addEventListener('pointerdown', this._onPointerDown.bind(this));
    cv.addEventListener('pointermove', this._onPointerMove.bind(this));
    cv.addEventListener('pointerup', this._onPointerUp.bind(this));
    cv.addEventListener('pointercancel', this._onPointerUp.bind(this));
    cv.addEventListener('contextmenu', e => e.preventDefault());
  }

  _onPointerDown(e) {
    e.preventDefault();
    this.canvas.setPointerCapture(e.pointerId);
    this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this._pointers.size >= 2) {
      this._hideCursor();
      return;
    }

    this._scratchAtClient(e.clientX, e.clientY);
    this._showCursor(e.clientX, e.clientY);
  }

  _onPointerMove(e) {
    if (!this._pointers.has(e.pointerId)) return;
    this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this._pointers.size >= 2) return;

    if (this._pointers.size === 1) {
      this._scratchAtClient(e.clientX, e.clientY);
      this._updateCursor(e.clientX, e.clientY);
    }
  }

  _onPointerUp(e) {
    this._pointers.delete(e.pointerId);
    if (this._pointers.size === 0) {
      this._hideCursor();
    }
  }

  _getScratchRadius() {
    return 8;
  }

  _scratchAtClient(cx, cy) {
    const rect = this.canvas.getBoundingClientRect();
    const { x, y } = this.viewport.canvasToGrid(cx - rect.left, cy - rect.top);
    this.simulation.clearCircle(x, y, this._getScratchRadius());
  }

  _showCursor(cx, cy) {
    this._cursorEl.style.display = 'block';
    this._updateCursor(cx, cy);
  }

  _hideCursor() {
    this._cursorEl.style.display = 'none';
  }

  _updateCursor(cx, cy) {
    const sizePx = this._getScratchRadius() * 2;
    this._cursorEl.style.width = sizePx + 'px';
    this._cursorEl.style.height = sizePx + 'px';
    this._cursorEl.style.left = cx + 'px';
    this._cursorEl.style.top = cy + 'px';
  }
}
