import { World } from './world.js';
import { Renderer } from './renderer.js';
import { Viewport } from './viewport.js';
import { Input } from './input.js';
import { Eyes } from './eyes.js';

const canvas = document.getElementById('canvas');

const world = new World();
const eyes = new Eyes();
const viewport = new Viewport();
const renderer = new Renderer(canvas);
const input = new Input(canvas, viewport, world);

let lastTick = performance.now();
const TICK_MS = 25;

function loop(now) {
  const dt = now - lastTick;
  if (dt >= TICK_MS) {
    lastTick = now - (dt % TICK_MS);
    world.step();
  }

  eyes.checkFound(world.grid);

  renderer.render(world.grid, eyes.bg, viewport);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

window.addEventListener('resize', () => {
  renderer.onResize();
});
