import { Simulation } from './simulation.js';
import { Renderer } from './renderer.js';
import { Viewport } from './viewport.js';
import { Input } from './input.js';
import { Eyes } from './eyes.js';

const canvas = document.getElementById('canvas');

const simulation = new Simulation();
const eyes = new Eyes();
const viewport = new Viewport();
const renderer = new Renderer(canvas);
const input = new Input(canvas, viewport, simulation);

let lastTick = performance.now();
const TICK_MS = 25;

function loop(now) {
  const dt = now - lastTick;
  if (dt >= TICK_MS) {
    lastTick = now - (dt % TICK_MS);
    simulation.step();
  }

  renderer.render(simulation.grid, eyes.bg, viewport);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

window.addEventListener('resize', () => {
  renderer.onResize();
});
