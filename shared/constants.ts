export interface GameConfig {
  maxPlayers: number;
  tickRateHz: number;
  maxHits: number;
  killScore: number;
  reconnectGraceMs: number;
  hitCooldownMs: number;
  hitRange: number;
  hitArcDegrees: number;
  moveSpeed: number;
  arenaWidth: number;
  arenaHeight: number;
  joystickSendRateHz: number;
  highscoreTopN: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  maxPlayers: 50,
  tickRateHz: 20,
  maxHits: 3,
  killScore: 100,
  reconnectGraceMs: 15_000,
  hitCooldownMs: 600,
  hitRange: 40,
  hitArcDegrees: 90,
  moveSpeed: 180,
  arenaWidth: 960,
  arenaHeight: 640,
  joystickSendRateHz: 15,
  highscoreTopN: 10,
};

/**
 * Distinct, legible colors spread evenly around the hue wheel so any
 * reasonable player count (including >palette-length via modulo) stays
 * visually distinguishable. Fixed at module load, not per-server-run random.
 */
function generateColorPalette(count: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.round((360 / count) * i);
    colors.push(hslToHex(hue, 75, 55));
  }
  return colors;
}

function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lN - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c; g = x; b = 0;
  } else if (h < 120) {
    r = x; g = c; b = 0;
  } else if (h < 180) {
    r = 0; g = c; b = x;
  } else if (h < 240) {
    r = 0; g = x; b = c;
  } else if (h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export const COLOR_PALETTE: string[] = generateColorPalette(24);
