// VAULTBREAK — the hand-in program (Node 22, standard library only).
//
// It stages the entry for the grader: copy this repository's game/ and
// screenshots/ into the output directory, then write /output/dossier.json
// with buildDossier from the vendored make.fun library. The grader runs
// this twice and both runs must write identical bytes, so there is no
// timestamp, no randomness and no network here — just copies and the
// deterministic dossier builder.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from an empty output directory so a re-run can never leave
// stale files behind and break the byte-for-byte double run.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const gameOut = join(outDir, 'game');
cpSync(join(repoRoot, 'game'), gameOut, { recursive: true });

const shotsOut = join(outDir, 'screenshots');
mkdirSync(shotsOut, { recursive: true });
const shotsIn = join(repoRoot, 'screenshots');
if (existsSync(shotsIn)) cpSync(shotsIn, shotsOut, { recursive: true });

// The scorer's own caps, as the kit's reference/gate.json states them:
// text_max_bytes is the only one that shapes the dossier's bytes; the
// rest refuse an entry the scorer would refuse anyway (more than 4
// screenshots, one over 256 KiB, game/ over 993 entries or 48 MiB, or a
// game/ path over 1,000 bytes).
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
