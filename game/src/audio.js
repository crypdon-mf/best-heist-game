// VAULTBREAK — sound effects.
// One clear job: tiny WebAudio oscillator beeps only, no audio files.
// Everything is guarded so a missing or blocked AudioContext can never
// throw — headless screenshot runs included.
let audioCtx = null;

function context() {
  if (audioCtx) return audioCtx;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  } catch {
    return null;
  }
  return audioCtx;
}

function beep(freq, seconds, type, gainValue, when = 0) {
  try {
    const ctx = context();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = ctx.currentTime + when;
    gain.gain.setValueAtTime(gainValue, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + seconds);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + seconds + 0.02);
  } catch {
    // Sound is garnish; a failure must never break the game.
  }
}

export function createSfx() {
  return {
    coin() {
      beep(880, 0.09, 'sine', 0.12);
      beep(1320, 0.12, 'sine', 0.1, 0.06);
    },
    loot() {
      beep(660, 0.1, 'triangle', 0.14);
      beep(990, 0.14, 'triangle', 0.12, 0.08);
    },
    vault() {
      beep(392, 0.12, 'square', 0.1);
      beep(523, 0.12, 'square', 0.1, 0.1);
      beep(784, 0.2, 'square', 0.1, 0.2);
    },
    spotted() {
      beep(220, 0.16, 'sawtooth', 0.16);
      beep(220, 0.16, 'sawtooth', 0.16, 0.18);
    },
    busted() {
      beep(160, 0.3, 'sawtooth', 0.18);
      beep(110, 0.4, 'sawtooth', 0.18, 0.25);
    },
    levelClear() {
      beep(523, 0.12, 'triangle', 0.14);
      beep(659, 0.12, 'triangle', 0.14, 0.1);
      beep(784, 0.2, 'triangle', 0.14, 0.2);
    },
    win() {
      [523, 659, 784, 1047].forEach((freq, i) => beep(freq, 0.22, 'triangle', 0.14, i * 0.13));
    },
  };
}
