import { World } from './world.js';
import { Renderer } from './renderer.js';
import { Viewport } from './viewport.js';
import { Input } from './input.js';
import { Eyes } from './eyes.js';
import { FallingItems } from './falling.js';

const canvas = document.getElementById('canvas');

const world = new World();
const eyes = new Eyes();
const viewport = new Viewport();
const renderer = new Renderer(canvas);
const input = new Input(canvas, viewport, world);
const fallingItems = new FallingItems();

let lastTick = performance.now();
const TICK_MS = 25;

function loop(now) {
  const dt = now - lastTick;
  if (dt >= TICK_MS) {
    lastTick = now - (dt % TICK_MS);
    world.step();
  }

  const found = eyes.checkFound(world.grid);
  for (const item of found) {
    const { viewX, viewY, scale } = viewport;
    const screenX = (item.gx + item.w / 2 - viewX) * scale;
    fallingItems.add(item.canvas, screenX);
  }

  renderer.render(world.grid, eyes.bg, viewport, fallingItems);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

window.addEventListener('resize', () => {
  renderer.onResize();
});
