// VAULTBREAK — deterministic screenshot scenes.
// One clear job: build the exact world state each ?shot= scene needs, so a
// screenshot taken with the same seed renders the same frame every time.
// No randomness here beyond the seed the caller passes in; guard patrol
// positions are advanced along their waypoints for a fixed number of seconds.
import { createWorld } from './world.js';
import { makeRng } from './random.js';

// Walk a guard along its patrol route for `seconds`, the same way world.js
// does, so the shot catches it mid-patrol with a believable facing.
function advancePatrol(guard, seconds) {
  const dt = 0.05;
  let left = seconds;
  while (left > 0) {
    const step = Math.min(dt, left);
    left -= step;
    const wp = guard.waypoints[guard.target];
    const dx = wp[0] - guard.x;
    const dy = wp[1] - guard.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 6) {
      guard.target = (guard.target + 1) % guard.waypoints.length;
    } else {
      guard.angle = Math.atan2(dy, dx);
      guard.x += (dx / dist) * guard.speed * step;
      guard.y += (dy / dist) * guard.speed * step;
    }
  }
}

export function stageShot(scene, seed) {
  const rng = makeRng(seed);
  void rng;

  if (scene === 'start') {
    // Title over a staged room: level 1, thief at the door, guards mid-patrol.
    const world = createWorld(0);
    world.screen = 'title';
    for (const guard of world.guards) advancePatrol(guard, 8);
    return world;
  }

  if (scene === 'play') {
    // Mid-heist, ~20s in, level 2: thief sneaking by the central plinth,
    // a smoke puff out, cones sweeping, alarm part-way up, one loot pocketed.
    const world = createWorld(1);
    world.screen = 'playing';
    world.time = 20;
    world.player.x = 560;
    world.player.y = 300;
    world.player.angle = Math.PI / 4;
    world.player.sneaking = true;
    world.alarm = 35;
    world.coinsHeld = 45;
    world.score = 110;
    world.loot[1].taken = true; // the gem is already pocketed
    world.coins[0].taken = true;
    world.coins[2].taken = true;
    world.smoke.push({ x: 490, y: 340, until: world.time + 4 });
    for (const guard of world.guards) advancePatrol(guard, 20);
    // Turn the nearest guard toward the thief so its cone reads on camera.
    world.guards[0].angle = Math.atan2(
      world.player.y - world.guards[0].y,
      world.player.x - world.guards[0].x,
    );
    return world;
  }

  if (scene === 'caught') {
    // Caught red-handed, level 1: alarm ~85, SPOTTED! banner up, a guard
    // in full chase with its cone on the thief near the vault.
    const world = createWorld(0);
    world.screen = 'playing';
    world.time = 34;
    world.player.x = 1000;
    world.player.y = 560;
    world.player.angle = Math.PI;
    world.alarm = 85;
    world.spottedFlash = 1.4;
    world.coinsHeld = 55;
    world.score = 210;
    world.loot[0].taken = true;
    const guard = world.guards[1];
    guard.x = 950;
    guard.y = 480;
    guard.state = 'chase';
    guard.angle = Math.atan2(world.player.y - guard.y, world.player.x - guard.x);
    guard.lastSeenX = world.player.x;
    guard.lastSeenY = world.player.y;
    advancePatrol(world.guards[0], 12);
    return world;
  }

  if (scene === 'win') {
    // The getaway, level 3: vault cracked, thief at the exit, HEIST COMPLETE.
    const world = createWorld(2);
    world.screen = 'win';
    world.time = 96;
    world.vaultTaken = true;
    world.player.x = 640;
    world.player.y = 130;
    world.player.angle = -Math.PI / 2;
    world.alarm = 12;
    world.coinsHeld = 70;
    world.score = 940;
    world.lives = 2;
    for (const item of world.loot) item.taken = true;
    for (const guard of world.guards) advancePatrol(guard, 40);
    return world;
  }

  // Unknown scene: fall back to the title.
  return createWorld(0);
}
