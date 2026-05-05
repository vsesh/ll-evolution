import { Simulation } from './simulation.js';
import { Renderer } from './renderer.js';
import { Viewport } from './viewport.js';
import { Input } from './input.js';
import { Cover } from './cover.js';

const canvas = document.getElementById('canvas');

const simulation = new Simulation();
const cover = new Cover();
const viewport = new Viewport();
const renderer = new Renderer(canvas);
const input = new Input(canvas, viewport, cover);

let lastTick = performance.now();
const TICK_MS = 25;

function loop(now) {
  const dt = now - lastTick;
  if (dt >= TICK_MS) {
    lastTick = now - (dt % TICK_MS);
    simulation.step();
    cover.step();
  }

  renderer.render(simulation.grid, cover, viewport);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

window.addEventListener('resize', () => {
  renderer.onResize();
  viewport.onResize();
});

const btnFs = document.getElementById('btn-fullscreen');

function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

function onFullscreenChange() {
  if (isFullscreen()) {
    renderer.onResize();
    viewport.fitToScreen();
    btnFs.textContent = '\u2715';
  } else {
    btnFs.textContent = '\u26F6';
  }
}

document.addEventListener('fullscreenchange', onFullscreenChange);
document.addEventListener('webkitfullscreenchange', onFullscreenChange);

btnFs.addEventListener('click', e => {
  e.stopPropagation();
  if (isFullscreen()) {
    (document.exitFullscreen || document.webkitExitFullscreen || (() => {})).call(document).catch(() => {});
  } else {
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen;
    if (req) req.call(el).catch(() => {});
  }
});
