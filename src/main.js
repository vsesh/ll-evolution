import { Simulation } from './simulation.js';
import { Renderer } from './renderer.js';
import { Storage } from './storage.js';
import { Viewport } from './viewport.js';
import { Input } from './input.js';

const canvas = document.getElementById('canvas');

const simulation = new Simulation();
const storage = new Storage();
const viewport = new Viewport();
const renderer = new Renderer(canvas);
const input = new Input(canvas, viewport, simulation);

const loaded = storage.load(simulation);
if (!loaded) {
  console.log('No saved state, starting fresh');
}

let lastTick = performance.now();
let lastSave = performance.now();
const TICK_MS = 500;
const SAVE_MS = 10000;
let rafId = null;
let simRunning = true;

function loop(now) {
  const dt = now - lastTick;
  if (simRunning && dt >= TICK_MS) {
    lastTick = now - (dt % TICK_MS);
    simulation.step();
  }

  if (now - lastSave >= SAVE_MS) {
    lastSave = now;
    storage.save(simulation);
  }

  renderer.render(simulation.grid, viewport);
  rafId = requestAnimationFrame(loop);
}

rafId = requestAnimationFrame(loop);

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
