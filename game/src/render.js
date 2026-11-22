// VAULTBREAK — canvas drawing.
// One clear job: everything the eye sees. It reads world state and draws
// the room, the vision cones, the thief, the loot, the HUD and the screens.
// It never changes state.
import { CAMERA, FIELD, GUARD, HUD_HEIGHT, PALETTE, TOOLS } from './config.js';

export function drawWorld(ctx, world) {
  drawFloor(ctx);
  drawExit(ctx, world);
  drawVault(ctx, world);
  drawLoot(ctx, world);
  drawCoins(ctx, world);
  drawWalls(ctx, world);
  drawSmoke(ctx, world);
  drawCameras(ctx, world);
  drawGuards(ctx, world);
  drawPlayer(ctx, world);
  drawHud(ctx, world);
  drawBanners(ctx, world);
  drawScreens(ctx, world);
}

function drawFloor(ctx) {
  ctx.fillStyle = PALETTE.floorA;
  ctx.fillRect(0, HUD_HEIGHT, FIELD.width, FIELD.height - HUD_HEIGHT);
  // Checker tiles + faint grid, so the room reads as a museum floor.
  const tile = 64;
  for (let y = HUD_HEIGHT; y < FIELD.height; y += tile) {
    for (let x = 0; x < FIELD.width; x += tile) {
      if (((x / tile + y / tile) | 0) % 2 === 0) {
        ctx.fillStyle = PALETTE.floorB;
        ctx.fillRect(x, y, tile, tile);
      }
    }
  }
  ctx.strokeStyle = PALETTE.floorLine;
  ctx.lineWidth = 1;
  for (let x = 0; x <= FIELD.width; x += tile) {
    ctx.beginPath();
    ctx.moveTo(x, HUD_HEIGHT);
    ctx.lineTo(x, FIELD.height);
    ctx.stroke();
  }
  for (let y = HUD_HEIGHT; y <= FIELD.height; y += tile) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(FIELD.width, y);
    ctx.stroke();
  }
}

function drawWalls(ctx, world) {
  for (const wall of world.level.walls) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(wall.x, wall.y, wall.w, 4);
  }
}

function drawVisionCone(ctx, x, y, angle, range, halfAngle, fill, edge) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawGuards(ctx, world) {
  for (const guard of world.guards) {
    const chasing = guard.state === 'chase';
    drawVisionCone(
      ctx, guard.x, guard.y, guard.angle,
      GUARD.visionRange, GUARD.visionHalfAngle,
      chasing ? 'rgba(255, 77, 77, 0.30)' : PALETTE.guardCone,
      chasing ? 'rgba(255, 77, 77, 0.8)' : PALETTE.guardConeEdge,
    );
    // Patrol path dots.
    ctx.fillStyle = 'rgba(232, 182, 76, 0.35)';
    for (const wp of guard.waypoints) {
      ctx.beginPath();
      ctx.arc(wp[0], wp[1], 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Body: amber disc, cap brim, facing tick.
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, GUARD.radius, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.guardBody;
    ctx.fill();
    ctx.strokeStyle = '#7a5c14';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);
    ctx.lineTo(guard.x + Math.cos(guard.angle) * 20, guard.y + Math.sin(guard.angle) * 20);
    ctx.strokeStyle = '#fff3c4';
    ctx.lineWidth = 3;
    ctx.stroke();
    if (chasing) {
      ctx.fillStyle = '#ff4d4d';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', guard.x, guard.y - 20);
    }
  }
}

function drawCameras(ctx, world) {
  for (const cam of world.cameras) {
    const disabled = world.time < cam.disabledUntil;
    if (!disabled) {
      drawVisionCone(
        ctx, cam.x, cam.y, cam.angle,
        cam.range, CAMERA.visionHalfAngle,
        PALETTE.cameraCone, PALETTE.cameraConeEdge,
      );
    }
    ctx.beginPath();
    ctx.arc(cam.x, cam.y, CAMERA.radius, 0, Math.PI * 2);
    ctx.fillStyle = disabled ? '#5a6274' : PALETTE.cameraBody;
    ctx.fill();
    ctx.strokeStyle = '#2a0d0d';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Lens dot in the facing direction.
    ctx.beginPath();
    ctx.arc(cam.x + Math.cos(cam.angle) * 6, cam.y + Math.sin(cam.angle) * 6, 3, 0, Math.PI * 2);
    ctx.fillStyle = disabled ? '#8a93a8' : '#ffd2d2';
    ctx.fill();
    if (disabled) {
      ctx.fillStyle = '#c8cddc';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EMP', cam.x, cam.y - 16);
    }
  }
}

function drawPlayer(ctx, world) {
  const p = world.player;
  // Soft shadow.
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 10, 14, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fill();
  // Hooded thief: dark hood ring, pale face, cyan trim.
  ctx.beginPath();
  ctx.arc(p.x, p.y, 13, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.thiefHood;
  ctx.fill();
  ctx.strokeStyle = PALETTE.thief;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(p.x + Math.cos(p.angle) * 4, p.y + Math.sin(p.angle) * 4, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#f2e6c9';
  ctx.fill();
  // Sneak: crouched, smaller and dimmer.
  if (p.sneaking) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(125, 215, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function drawVault(ctx, world) {
  const v = world.level.vault;
  if (world.vaultTaken) {
    // Open vault: empty, door swung.
    ctx.fillStyle = 'rgba(245, 197, 66, 0.25)';
    ctx.beginPath();
    ctx.arc(v.x, v.y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a7a3a';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EMPTY', v.x, v.y + 4);
    return;
  }
  // Gold safe with a glowing dial.
  ctx.save();
  ctx.shadowColor = PALETTE.gold;
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#6b5a1e';
  ctx.fillRect(v.x - 26, v.y - 26, 52, 52);
  ctx.restore();
  ctx.strokeStyle = PALETTE.vault;
  ctx.lineWidth = 3;
  ctx.strokeRect(v.x - 26, v.y - 26, 52, 52);
  ctx.beginPath();
  ctx.arc(v.x, v.y, 12, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.vault;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(v.x, v.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#6b5a1e';
  ctx.fill();
  ctx.fillStyle = PALETTE.vault;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VAULT', v.x, v.y - 34);
}

function drawLoot(ctx, world) {
  for (const item of world.loot) {
    if (item.taken) continue;
    if (item.kind === 'gem') {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = PALETTE.lootGem;
      ctx.shadowColor = PALETTE.lootGem;
      ctx.shadowBlur = 12;
      ctx.fillRect(-9, -9, 18, 18);
      ctx.restore();
    } else if (item.kind === 'painting') {
      ctx.fillStyle = '#5a2e4a';
      ctx.fillRect(item.x - 16, item.y - 12, 32, 24);
      ctx.strokeStyle = PALETTE.lootPainting;
      ctx.lineWidth = 2;
      ctx.strokeRect(item.x - 16, item.y - 12, 32, 24);
      ctx.fillStyle = PALETTE.lootPainting;
      ctx.beginPath();
      ctx.arc(item.x, item.y, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // gold bars
      ctx.fillStyle = PALETTE.gold;
      ctx.shadowColor = PALETTE.gold;
      ctx.shadowBlur = 10;
      ctx.fillRect(item.x - 14, item.y - 7, 28, 14);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#8a6d1f';
      ctx.fillRect(item.x - 14, item.y - 7, 28, 4);
    }
    ctx.fillStyle = '#eef1f8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.kind.toUpperCase(), item.x, item.y + 26);
  }
}

function drawCoins(ctx, world) {
  for (const coin of world.coins) {
    if (coin.taken) continue;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.gold;
    ctx.fill();
    ctx.strokeStyle = '#8a6d1f';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#8a6d1f';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('¢', coin.x, coin.y + 3);
  }
}

function drawExit(ctx, world) {
  const e = world.level.exit;
  ctx.save();
  if (world.vaultTaken) {
    ctx.shadowColor = PALETTE.exit;
    ctx.shadowBlur = 16;
  }
  ctx.fillStyle = world.vaultTaken ? PALETTE.exit : '#2c4a3a';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.restore();
  ctx.strokeStyle = world.vaultTaken ? '#b8ffd9' : '#5a7a68';
  ctx.lineWidth = 2;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = world.vaultTaken ? '#062b18' : '#9ab8a6';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', e.x + e.w / 2, e.y + e.h / 2 + 4);
  if (!world.vaultTaken) {
    ctx.fillStyle = PALETTE.textDim;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('locked — needs the VAULT', FIELD.width - 16, e.y + e.h + 16);
  }
}

function drawSmoke(ctx, world) {
  for (const puff of world.smoke) {
    const left = Math.max(0, puff.until - world.time);
    const alpha = Math.min(0.55, 0.2 + (left / TOOLS.smokeSeconds) * 0.35);
    ctx.beginPath();
    ctx.arc(puff.x, puff.y, TOOLS.smokeRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 205, 220, ${alpha})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(puff.x - 30, puff.y + 18, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(puff.x + 34, puff.y - 14, 40, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHud(ctx, world) {
  ctx.fillStyle = '#0b0e18';
  ctx.fillRect(0, 0, FIELD.width, HUD_HEIGHT);
  ctx.fillStyle = '#232839';
  ctx.fillRect(0, HUD_HEIGHT - 2, FIELD.width, 2);

  // Title + level.
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('VAULTBREAK', 16, 26);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '13px sans-serif';
  ctx.fillText(world.level.name, 16, 46);

  // Alarm meter.
  const barX = 300;
  const barW = 420;
  const barY = 14;
  const barH = 20;
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('ALARM', barX, barY + 15);
  ctx.fillStyle = '#1c2030';
  ctx.fillRect(barX + 62, barY, barW, barH);
  const frac = world.alarm / 100;
  ctx.fillStyle = frac < 0.5 ? PALETTE.alarmLow : frac < 0.8 ? PALETTE.alarmMid : PALETTE.alarmHigh;
  ctx.fillRect(barX + 62, barY, barW * frac, barH);
  ctx.strokeStyle = '#3a415c';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(barX + 62, barY, barW, barH);
  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`${Math.round(world.alarm)}`, barX + 62 + barW + 10, barY + 15);

  // Lives, coins, score, tools.
  const right = FIELD.width - 16;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ff7a7a';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('♥'.repeat(Math.max(0, world.lives)), right, 24);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '13px sans-serif';
  ctx.fillText(`coins ${world.coinsHeld}   score ${world.score}`, right, 46);
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '12px sans-serif';
  ctx.fillText(`[1] smoke ${TOOLS.smokeCost}¢   [2] EMP ${TOOLS.empCost}¢   Shift = sneak`, 800, 46);

  // Transient message.
  if (world.time < world.messageUntil && world.message) {
    ctx.fillStyle = PALETTE.gold;
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(world.message, FIELD.width / 2, HUD_HEIGHT + 28);
  }
}

function drawBanners(ctx, world) {
  if (world.spottedFlash > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, world.spottedFlash);
    ctx.fillStyle = '#ff4d4d';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED!', FIELD.width / 2, 170);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#ffd2d2';
    ctx.fillText('Break line of sight — or run!', FIELD.width / 2, 198);
    ctx.restore();
  }
  if (world.bustedFlash > 0 && world.screen === 'busted') {
    ctx.fillStyle = 'rgba(20, 0, 0, 0.45)';
    ctx.fillRect(0, HUD_HEIGHT, FIELD.width, FIELD.height - HUD_HEIGHT);
    ctx.fillStyle = '#ff4d4d';
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BUSTED!', FIELD.width / 2, 340);
    ctx.fillStyle = PALETTE.text;
    ctx.font = '18px sans-serif';
    ctx.fillText(world.message || 'Caught red-handed.', FIELD.width / 2, 376);
  }
}

function overlay(ctx, title, lines, accent, dim = 0.82) {
  ctx.fillStyle = `rgba(10, 12, 20, ${dim})`;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = accent;
  ctx.font = 'bold 54px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, FIELD.width / 2, 250);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '18px sans-serif';
  let y = 300;
  for (const line of lines) {
    ctx.fillText(line, FIELD.width / 2, y);
    y += 30;
  }
}

function drawScreens(ctx, world) {
  if (world.screen === 'title') {
    overlay(ctx, 'VAULTBREAK', [
      '— The Midnight Gallery —',
      'Sneak past the guards. Crack the VAULT. Reach the EXIT.',
      '',
      'WASD / arrows — move    Shift — sneak    Click — throw smoke (20¢)',
      '1 — smoke bomb    2 — EMP the cameras (40¢)',
      '',
      'Click or press Enter to start the heist.',
    ], PALETTE.gold, 0.62);
  } else if (world.screen === 'levelclear') {
    overlay(ctx, 'ROOM CLEARED', [
      `Score ${world.score} · ${world.lives} ${world.lives === 1 ? 'life' : 'lives'} left`,
      '',
      'Click or press Enter for the next room.',
    ], PALETTE.exit);
  } else if (world.screen === 'gameover') {
    overlay(ctx, 'GAME OVER', [
      `The gallery keeps its gold. Score ${world.score}.`,
      '',
      'Click or press Enter to try again.',
    ], '#ff4d4d');
  } else if (world.screen === 'win') {
    overlay(ctx, 'HEIST COMPLETE', [
      `Every vault cracked. Final score ${world.score}.`,
      `Coins left: ${world.coinsHeld} — the crew eats tonight.`,
      '',
      'Click or press Enter to run it back.',
    ], PALETTE.gold);
  }
}
