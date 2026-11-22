[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/crypdon-mf/best-heist-game/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/crypdon-mf/best-heist-game/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

# VAULTBREAK — The Midnight Gallery

A top-down stealth heist game for the [make.fun best heist game bounty](https://make.fun/bounty/best-heist-game-20261122-0559). One thief, one dark museum, three rooms — sneak past patrolling guards and sweeping cameras, crack the VAULT, and reach the green EXIT before the alarm hits 100.

## How to play

Open `game/index.html` in a desktop browser (or serve `game/` with any static server). No build step, no network requests.

- **WASD / arrow keys** — move
- **Shift** — sneak (slower, harder to spot)
- **Mouse click** — throw a smoke bomb at that spot (20 coins, blocks vision for 5s)
- **1** — smoke bomb at your feet (20 coins)
- **2** — EMP: disables all cameras for 6s (40 coins)
- **Enter / click** — start, next room, retry

Guards patrol waypoints with amber vision cones; get seen and they chase. Cameras sweep red cones. Touching a guard is an instant bust. The alarm rises ~25/s while you are seen and falls ~8/s while hidden — at 100 you lose a life and respawn at the entry with the alarm at 40. Three lives, three rooms. Grab the VAULT to unlock the EXIT, pocket gems, paintings and gold for score, and collect coins to fund your tools.

## Structure

- `game/index.html` — page + canvas
- `game/src/config.js` — tuning numbers and palette
- `game/src/levels.js` — the three room layouts (data-driven)
- `game/src/random.js` — seeded RNG for deterministic screenshots
- `game/src/world.js` — state + update: player, guards, cameras, loot, alarm, tools, line-of-sight
- `game/src/render.js` — canvas drawing: room, cones, entities, HUD, screens
- `game/src/input.js` — keyboard + mouse
- `game/src/audio.js` — WebAudio oscillator beeps only
- `game/src/shots.js` — deterministic `?shot=` scenes for screenshots
- `game/src/main.js` — boot, game loop, `?shot=` handling
- `main.ts` — the hand-in program: copies `game/` + `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## Screenshots

Taken from the game's own code with headless Chromium (`?shot=play&seed=1` etc.):

- `1-heist.jpg` — mid-heist cover: thief, guard cones, cameras, loot, alarm meter
- `2-title.jpg` — title over the staged lobby
- `3-spotted.jpg` — caught: alarm ~85, SPOTTED!
- `4-getaway.jpg` — HEIST COMPLETE at the exit

## License

MIT — see `LICENSE`.
