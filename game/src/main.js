// VAULTBREAK — boot and game loop.
// One clear job: start the game, run the frame loop, route clicks and keys
// to the right screen, and stage ?shot= scenes for screenshots.
import { createWorld, nextLevel, startGame, update } from './world.js';
import { drawWorld } from './render.js';
import { createInput } from './input.js';
import { createSfx } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const sfx = createSfx();

const params = new URLSearchParams(window.location.search);
const shotScene = params.get('shot');
const shotSeed = Number(params.get('seed') || '1') || 1;

let world;
let shotMode = false;

if (shotScene) {
  // Screenshot mode: stage the scene once and render it still.
  const { stageShot } = await import('./shots.js');
  world = stageShot(shotScene, shotSeed);
  shotMode = true;
  drawWorld(ctx, world);
  document.title = `VAULTBREAK — shot ${shotScene}`;
  window.__shotReady = true;
} else {
  world = createWorld(0);
}

let last = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (world.screen === 'busted') {
    // Short beat on the BUSTED card, then back into the room.
    world.bustedFlash -= dt;
    if (world.bustedFlash <= 0) world.screen = 'playing';
  } else if (world.screen === 'playing') {
    update(world, input, dt, sfx);
  } else if (input.confirmPressed || input.clicked) {
    // Title / level-clear / game-over / win: click or Enter advances.
    input.confirmPressed = false;
    input.clicked = false;
    if (world.screen === 'title') {
      startGame(world);
    } else if (world.screen === 'levelclear') {
      world = nextLevel(world);
    } else if (world.screen === 'gameover' || world.screen === 'win') {
      world = createWorld(0);
      startGame(world);
    }
  } else {
    input.confirmPressed = false;
    input.clicked = false;
  }

  drawWorld(ctx, world);
  if (!shotMode) requestAnimationFrame(frame);
}

if (!shotMode) requestAnimationFrame(frame);
