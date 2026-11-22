// VAULTBREAK — game state and the update step.
// One clear job: the simulation. It owns the player, guards, cameras, loot,
// alarm, tools and line-of-sight, and nothing about drawing or sound.
// render.js reads this state; input.js writes into it through the actions
// exposed here (useSmokeBomb, useEmp, startGame, nextLevel).
import { ALARM, CAMERA, ECONOMY, FIELD, GUARD, LIVES, PLAYER, TOOLS } from './config.js';
import { LEVELS } from './levels.js';

export function createWorld(levelIndex, carry) {
  const level = LEVELS[levelIndex];
  return {
    levelIndex,
    level,
    screen: 'title', // title | playing | spotted | busted | levelclear | gameover | win
    time: 0,
    player: { x: level.entry.x, y: level.entry.y, angle: 0, sneaking: false },
    guards: level.guards.map((g) => ({
      waypoints: g.waypoints,
      speed: g.speed,
      x: g.waypoints[0][0],
      y: g.waypoints[0][1],
      target: 1,
      angle: 0,
      state: 'patrol', // patrol | chase
      lastSeenX: 0,
      lastSeenY: 0,
      blindSeconds: 0,
    })),
    cameras: level.cameras.map((c) => ({
      x: c.x,
      y: c.y,
      baseAngle: c.baseAngle,
      sweep: c.sweep,
      range: c.range,
      angle: c.baseAngle,
      disabledUntil: 0,
    })),
    loot: level.loot.map((l) => ({ ...l, taken: false })),
    coins: level.coins.map((c) => ({ ...c, taken: false })),
    smoke: [], // { x, y, until }
    alarm: 0,
    lives: carry ? carry.lives : LIVES,
    coinsHeld: carry ? carry.coinsHeld : ECONOMY.startCoins,
    score: carry ? carry.score : 0,
    vaultTaken: false,
    spottedFlash: 0, // seconds left of the SPOTTED! banner
    bustedFlash: 0,
    message: '',
    messageUntil: 0,
  };
}

export function startGame(world) {
  world.screen = 'playing';
  world.time = 0;
}

export function nextLevel(world) {
  const carry = { lives: world.lives, coinsHeld: world.coinsHeld, score: world.score };
  const next = createWorld(world.levelIndex + 1, carry);
  next.screen = 'playing';
  return next;
}

// --- geometry helpers -------------------------------------------------------

function segmentHitsRect(x1, y1, x2, y2, rect) {
  // Slab test: does the segment cross the rectangle?
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tMin = 0;
  let tMax = 1;
  for (const [p, d, lo, hi] of [
    [x1, dx, rect.x, rect.x + rect.w],
    [y1, dy, rect.y, rect.y + rect.h],
  ]) {
    if (Math.abs(d) < 1e-9) {
      if (p < lo || p > hi) return false;
    } else {
      let t1 = (lo - p) / d;
      let t2 = (hi - p) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tMin = Math.max(tMin, t1);
      tMax = Math.min(tMax, t2);
      if (tMin > tMax) return false;
    }
  }
  return true;
}

export function hasLineOfSight(world, x1, y1, x2, y2) {
  for (const wall of world.level.walls) {
    if (segmentHitsRect(x1, y1, x2, y2, wall)) return false;
  }
  return true;
}

function pointInSmoke(world, x, y) {
  for (const puff of world.smoke) {
    const dx = x - puff.x;
    const dy = y - puff.y;
    if (dx * dx + dy * dy < TOOLS.smokeRadius * TOOLS.smokeRadius) return true;
  }
  return false;
}

function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function canSee(world, eyeX, eyeY, eyeAngle, range, halfAngle) {
  const p = world.player;
  const dx = p.x - eyeX;
  const dy = p.y - eyeY;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (dist > 4) {
    const toPlayer = Math.atan2(dy, dx);
    if (Math.abs(angleDifference(toPlayer, eyeAngle)) > halfAngle) return false;
  }
  if (!hasLineOfSight(world, eyeX, eyeY, p.x, p.y)) return false;
  if (pointInSmoke(world, p.x, p.y)) return false;
  // Smoke between eye and player also blocks the view.
  for (const puff of world.smoke) {
    if (segmentHitsRect(eyeX, eyeY, p.x, p.y, {
      x: puff.x - TOOLS.smokeRadius,
      y: puff.y - TOOLS.smokeRadius,
      w: TOOLS.smokeRadius * 2,
      h: TOOLS.smokeRadius * 2,
    })) return false;
  }
  return true;
}

// --- movement ---------------------------------------------------------------

function collideCircle(world, x, y, radius) {
  for (const wall of world.level.walls) {
    const cx = Math.max(wall.x, Math.min(x, wall.x + wall.w));
    const cy = Math.max(wall.y, Math.min(y, wall.y + wall.h));
    const dx = x - cx;
    const dy = y - cy;
    if (dx * dx + dy * dy < radius * radius) return true;
  }
  return false;
}

function slideMove(world, entity, dx, dy, radius) {
  const nx = entity.x + dx;
  if (!collideCircle(world, nx, entity.y, radius)) entity.x = nx;
  const ny = entity.y + dy;
  if (!collideCircle(world, entity.x, ny, radius)) entity.y = ny;
  entity.x = Math.max(radius + 2, Math.min(FIELD.width - radius - 2, entity.x));
  entity.y = Math.max(56 + radius + 2, Math.min(FIELD.height - radius - 2, entity.y));
}

// --- tools ------------------------------------------------------------------

export function useSmokeBomb(world, x, y) {
  if (world.screen !== 'playing') return false;
  if (world.coinsHeld < TOOLS.smokeCost) {
    flashMessage(world, 'Not enough coins for smoke (20)');
    return false;
  }
  world.coinsHeld -= TOOLS.smokeCost;
  world.smoke.push({ x, y, until: world.time + TOOLS.smokeSeconds });
  return true;
}

export function useEmp(world) {
  if (world.screen !== 'playing') return false;
  if (world.coinsHeld < TOOLS.empCost) {
    flashMessage(world, 'Not enough coins for EMP (40)');
    return false;
  }
  world.coinsHeld -= TOOLS.empCost;
  for (const cam of world.cameras) cam.disabledUntil = world.time + TOOLS.empSeconds;
  flashMessage(world, 'EMP! Cameras down 6s');
  return true;
}

function flashMessage(world, text) {
  world.message = text;
  world.messageUntil = world.time + 2;
}

// --- the update step --------------------------------------------------------

export function update(world, input, dt, sfx) {
  if (world.screen !== 'playing') return;
  world.time += dt;
  const p = world.player;

  // Player movement.
  let mx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let my = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const moving = mx !== 0 || my !== 0;
  if (moving) {
    const len = Math.hypot(mx, my);
    mx /= len;
    my /= len;
    p.angle = Math.atan2(my, mx);
    const speed = input.sneak ? PLAYER.sneakSpeed : PLAYER.walkSpeed;
    slideMove(world, p, mx * speed * dt, my * speed * dt, PLAYER.radius);
  }
  p.sneaking = !!input.sneak;

  // Mouse click throws a smoke bomb at that spot.
  if (input.clicked) {
    useSmokeBomb(world, input.clickX, input.clickY);
    input.clicked = false;
  }
  if (input.empPressed) {
    useEmp(world);
    input.empPressed = false;
  }
  if (input.smokePressed) {
    useSmokeBomb(world, p.x, p.y);
    input.smokePressed = false;
  }

  // Smoke expires.
  world.smoke = world.smoke.filter((puff) => puff.until > world.time);

  // Cameras sweep.
  for (const cam of world.cameras) {
    cam.angle = cam.baseAngle + Math.sin(world.time * CAMERA.sweepSpeed) * cam.sweep;
  }

  // Guards patrol, chase, and catch.
  let seen = false;
  for (const guard of world.guards) {
    const range = p.sneaking ? GUARD.sneakVisionRange : GUARD.visionRange;
    const spotted = canSee(world, guard.x, guard.y, guard.angle, range, GUARD.visionHalfAngle);
    if (spotted) {
      seen = true;
      guard.state = 'chase';
      guard.lastSeenX = p.x;
      guard.lastSeenY = p.y;
      guard.blindSeconds = 0;
    } else if (guard.state === 'chase') {
      guard.blindSeconds += dt;
      if (guard.blindSeconds > GUARD.loseSightSeconds) guard.state = 'patrol';
    }

    if (guard.state === 'chase') {
      const dx = guard.lastSeenX - guard.x;
      const dy = guard.lastSeenY - guard.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 4) {
        guard.angle = Math.atan2(dy, dx);
        slideMove(world, guard, (dx / dist) * GUARD.chaseSpeed * dt, (dy / dist) * GUARD.chaseSpeed * dt, GUARD.radius);
      }
      // Give up at the last seen spot and look around.
      if (dist < 8 && !spotted) guard.state = 'patrol';
    } else {
      const wp = guard.waypoints[guard.target];
      const dx = wp[0] - guard.x;
      const dy = wp[1] - guard.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 6) {
        guard.target = (guard.target + 1) % guard.waypoints.length;
      } else {
        guard.angle = Math.atan2(dy, dx);
        slideMove(world, guard, (dx / dist) * guard.speed * dt, (dy / dist) * guard.speed * dt, GUARD.radius);
      }
    }

    // Touching the player is an instant bust.
    const touch = Math.hypot(p.x - guard.x, p.y - guard.y);
    if (touch < GUARD.catchRadius) {
      bust(world, sfx, 'A guard grabbed you!');
      return;
    }
  }

  // Cameras watch too.
  for (const cam of world.cameras) {
    if (world.time < cam.disabledUntil) continue;
    if (canSee(world, cam.x, cam.y, cam.angle, cam.range, CAMERA.visionHalfAngle)) seen = true;
  }

  // Alarm rises when seen, falls when hidden.
  if (seen) {
    const wasCalm = world.alarm < 50;
    world.alarm = Math.min(ALARM.bustedAt, world.alarm + ALARM.risePerSecond * (p.sneaking ? 0.5 : 1) * dt);
    if (wasCalm && world.alarm >= 50 && world.spottedFlash <= 0) {
      world.spottedFlash = 1.4;
      if (sfx) sfx.spotted();
    }
    if (world.alarm >= ALARM.bustedAt) {
      bust(world, sfx, 'The alarm hit 100!');
      return;
    }
  } else {
    world.alarm = Math.max(0, world.alarm - ALARM.fallPerSecond * dt);
  }
  if (world.spottedFlash > 0) world.spottedFlash -= dt;
  if (world.bustedFlash > 0) world.bustedFlash -= dt;

  // Pickups.
  for (const coin of world.coins) {
    if (!coin.taken && Math.hypot(p.x - coin.x, p.y - coin.y) < 24) {
      coin.taken = true;
      world.coinsHeld += ECONOMY.coinValue;
      world.score += ECONOMY.coinScore;
      if (sfx) sfx.coin();
    }
  }
  for (const item of world.loot) {
    if (!item.taken && Math.hypot(p.x - item.x, p.y - item.y) < 30) {
      item.taken = true;
      world.score += ECONOMY.lootScore;
      if (sfx) sfx.loot();
      flashMessage(world, `+${ECONOMY.lootScore} — ${item.kind} pocketed`);
    }
  }
  const vault = world.level.vault;
  if (!world.vaultTaken && Math.hypot(p.x - vault.x, p.y - vault.y) < 36) {
    world.vaultTaken = true;
    world.score += ECONOMY.vaultScore;
    if (sfx) sfx.vault();
    flashMessage(world, 'VAULT CRACKED — get to the EXIT!');
  }

  // Exit opens once the vault is taken.
  if (world.vaultTaken) {
    const exit = world.level.exit;
    const cx = exit.x + exit.w / 2;
    const cy = exit.y + exit.h / 2;
    if (p.x > exit.x - 6 && p.x < exit.x + exit.w + 6 && p.y > exit.y - 6 && p.y < exit.y + exit.h + 6) {
      if (world.levelIndex + 1 >= LEVELS.length) {
        world.screen = 'win';
        if (sfx) sfx.win();
      } else {
        world.screen = 'levelclear';
        if (sfx) sfx.levelClear();
      }
    }
  }
}

function bust(world, sfx, why) {
  world.lives -= 1;
  world.bustedFlash = 1.6;
  if (sfx) sfx.busted();
  if (world.lives <= 0) {
    world.screen = 'gameover';
    return;
  }
  // Respawn at the entry, guards back on patrol, alarm half-set.
  world.player.x = world.level.entry.x;
  world.player.y = world.level.entry.y;
  world.alarm = ALARM.respawnValue;
  world.smoke = [];
  for (const guard of world.guards) {
    guard.x = guard.waypoints[0][0];
    guard.y = guard.waypoints[0][1];
    guard.target = 1;
    guard.state = 'patrol';
  }
  world.screen = 'busted';
  world.message = why;
  world.messageUntil = world.time + 2;
}
