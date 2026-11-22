// VAULTBREAK — the three rooms, as data.
// One clear job: level layouts only. world.js reads these and never
// hard-codes a room; adding a fourth room means adding one object here.
// Coordinates are canvas pixels. The playfield runs from y = 56 (under the
// HUD strip) to y = 720; every level is ringed by outer walls.
function outerWalls() {
  return [
    { x: 0, y: 56, w: 1280, h: 14 }, // top, under the HUD
    { x: 0, y: 706, w: 1280, h: 14 }, // bottom
    { x: 0, y: 56, w: 14, h: 664 }, // left
    { x: 1266, y: 56, w: 14, h: 664 }, // right
  ];
}

export const LEVELS = [
  {
    name: '1 · THE LOBBY',
    hint: 'Grab the VAULT, then reach the green EXIT. Coins buy smoke and EMP.',
    entry: { x: 70, y: 640 },
    exit: { x: 1210, y: 120, w: 44, h: 60 },
    vault: { x: 1150, y: 620 },
    loot: [
      { x: 420, y: 180, kind: 'gem' },
      { x: 760, y: 420, kind: 'painting' },
      { x: 980, y: 200, kind: 'gold' },
    ],
    coins: [
      { x: 240, y: 300 }, { x: 300, y: 520 }, { x: 560, y: 300 },
      { x: 700, y: 620 }, { x: 900, y: 520 }, { x: 1080, y: 380 },
      { x: 480, y: 620 }, { x: 830, y: 140 },
    ],
    walls: [
      ...outerWalls(),
      // A long display case across the middle: two routes around it.
      { x: 300, y: 330, w: 420, h: 22 },
      { x: 820, y: 330, w: 300, h: 22 },
      // A pillar block top-left, cover near the gem.
      { x: 380, y: 130, w: 90, h: 90 },
      // A low wall bottom-right, cover near the vault.
      { x: 980, y: 540, w: 180, h: 22 },
    ],
    guards: [
      { waypoints: [[330, 250], [900, 250], [900, 470], [330, 470]], speed: 72 },
      { waypoints: [[1100, 480], [1100, 180]], speed: 78 },
    ],
    cameras: [
      { x: 640, y: 70, baseAngle: Math.PI / 2, sweep: 0.9, range: 235 },
    ],
  },
  {
    name: '2 · THE GALLERY',
    hint: 'Paintings pay. Cameras sweep the long hall — time your crossing.',
    entry: { x: 70, y: 120 },
    exit: { x: 70, y: 640, w: 44, h: 60 },
    vault: { x: 1200, y: 640 },
    loot: [
      { x: 300, y: 620, kind: 'painting' },
      { x: 640, y: 150, kind: 'gem' },
      { x: 640, y: 620, kind: 'gold' },
      { x: 1020, y: 150, kind: 'painting' },
    ],
    coins: [
      { x: 200, y: 300 }, { x: 420, y: 420 }, { x: 640, y: 300 },
      { x: 860, y: 420 }, { x: 1080, y: 300 }, { x: 1140, y: 520 },
      { x: 300, y: 520 }, { x: 860, y: 620 },
    ],
    walls: [
      ...outerWalls(),
      // Three gallery partitions, staggered so every room has 2+ routes.
      { x: 220, y: 220, w: 260, h: 22 },
      { x: 800, y: 220, w: 260, h: 22 },
      { x: 220, y: 470, w: 260, h: 22 },
      { x: 800, y: 470, w: 260, h: 22 },
      // Central sculpture plinth, the room's safe heart.
      { x: 590, y: 350, w: 100, h: 100 },
    ],
    guards: [
      { waypoints: [[150, 380], [1130, 380]], speed: 80 },
      { waypoints: [[560, 140], [560, 620]], speed: 74 },
      { waypoints: [[1080, 150], [1080, 620], [760, 620]], speed: 84 },
    ],
    cameras: [
      { x: 640, y: 70, baseAngle: Math.PI / 2, sweep: 1.1, range: 235 },
      { x: 1270, y: 380, baseAngle: Math.PI, sweep: 0.8, range: 235 },
    ],
  },
  {
    name: '3 · THE VAULT FLOOR',
    hint: 'Four guards, three cameras, one vault. Smoke the corners, EMP the lenses.',
    entry: { x: 640, y: 640 },
    exit: { x: 640, y: 100, w: 44, h: 60 },
    vault: { x: 640, y: 380 },
    loot: [
      { x: 180, y: 160, kind: 'gold' },
      { x: 1100, y: 160, kind: 'gem' },
      { x: 180, y: 620, kind: 'painting' },
      { x: 1100, y: 620, kind: 'gold' },
    ],
    coins: [
      { x: 320, y: 200 }, { x: 960, y: 200 }, { x: 320, y: 560 },
      { x: 960, y: 560 }, { x: 640, y: 240 }, { x: 640, y: 520 },
      { x: 160, y: 380 }, { x: 1120, y: 380 },
    ],
    walls: [
      ...outerWalls(),
      // The vault sits in a ring of strongboxes: approach from any side.
      { x: 560, y: 300, w: 160, h: 18 },
      { x: 560, y: 442, w: 160, h: 18 },
      { x: 560, y: 318, w: 18, h: 124 },
      { x: 702, y: 318, w: 18, h: 124 },
      // Side alcoves with cover.
      { x: 220, y: 280, w: 150, h: 22 },
      { x: 910, y: 280, w: 150, h: 22 },
      { x: 220, y: 470, w: 150, h: 22 },
      { x: 910, y: 470, w: 150, h: 22 },
    ],
    guards: [
      { waypoints: [[300, 160], [980, 160]], speed: 88 },
      { waypoints: [[300, 620], [980, 620]], speed: 88 },
      { waypoints: [[140, 200], [140, 580]], speed: 80 },
      { waypoints: [[1140, 200], [1140, 580]], speed: 80 },
    ],
    cameras: [
      { x: 640, y: 70, baseAngle: Math.PI / 2, sweep: 1.0, range: 240 },
      { x: 14, y: 380, baseAngle: 0, sweep: 0.9, range: 240 },
      { x: 1266, y: 380, baseAngle: Math.PI, sweep: 0.9, range: 240 },
    ],
  },
];

export function levelCount() {
  return LEVELS.length;
}
