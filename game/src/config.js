// VAULTBREAK — tuning numbers and palette.
// One clear job: every magic number the game balances on lives here,
// so the feel can be tuned without touching the simulation or the drawing.
export const FIELD = { width: 1280, height: 720 };
export const HUD_HEIGHT = 56;

export const PLAYER = {
  radius: 13,
  walkSpeed: 155,
  sneakSpeed: 62,
  chaseEscape: 0, // guards chase slightly slower than walk speed (see GUARD)
};

export const GUARD = {
  radius: 14,
  patrolSpeed: 72,
  chaseSpeed: 142,
  visionRange: 225,
  visionHalfAngle: (35 * Math.PI) / 180,
  sneakVisionRange: 128,
  catchRadius: 26,
  loseSightSeconds: 2.0,
};

export const CAMERA = {
  radius: 10,
  visionRange: 235,
  visionHalfAngle: (30 * Math.PI) / 180,
  sweepSpeed: 0.55, // radians per second
};

export const ALARM = {
  risePerSecond: 25,
  fallPerSecond: 8,
  bustedAt: 100,
  respawnValue: 40,
};

export const TOOLS = {
  smokeCost: 20,
  smokeRadius: 95,
  smokeSeconds: 5,
  empCost: 40,
  empSeconds: 6,
};

export const ECONOMY = {
  startCoins: 30,
  coinValue: 5,
  lootScore: 100,
  vaultScore: 500,
  coinScore: 10,
};

export const LIVES = 3;

export const PALETTE = {
  floorA: '#171a26',
  floorB: '#1c2030',
  floorLine: '#232839',
  wall: '#3a415c',
  wallTop: '#4b5478',
  gold: '#f5c542',
  goldDim: '#a8871f',
  lootGem: '#4dd8ff',
  lootPainting: '#ff7ab8',
  alarmLow: '#39d98a',
  alarmMid: '#f5c542',
  alarmHigh: '#ff4d4d',
  guardCone: 'rgba(245, 197, 66, 0.20)',
  guardConeEdge: 'rgba(245, 197, 66, 0.55)',
  cameraCone: 'rgba(255, 77, 77, 0.18)',
  cameraConeEdge: 'rgba(255, 77, 77, 0.55)',
  guardBody: '#e8b64c',
  cameraBody: '#ff5a5a',
  thief: '#7dd7ff',
  thiefHood: '#274b63',
  exit: '#39d98a',
  exitGlow: 'rgba(57, 217, 138, 0.25)',
  vault: '#ffd94d',
  smoke: 'rgba(200, 205, 220, 0.55)',
  text: '#eef1f8',
  textDim: '#9aa3b8',
  panel: 'rgba(10, 12, 20, 0.82)',
};
