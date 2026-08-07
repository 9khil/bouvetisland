import { DEFAULT_CONFIG, GameConfig } from "../../shared/constants";

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config: GameConfig = {
  maxPlayers: envNumber("MAX_PLAYERS", DEFAULT_CONFIG.maxPlayers),
  tickRateHz: envNumber("TICK_RATE_HZ", DEFAULT_CONFIG.tickRateHz),
  maxHits: envNumber("MAX_HITS", DEFAULT_CONFIG.maxHits),
  killScore: envNumber("KILL_SCORE", DEFAULT_CONFIG.killScore),
  reconnectGraceMs: envNumber("RECONNECT_GRACE_MS", DEFAULT_CONFIG.reconnectGraceMs),
  hitCooldownMs: envNumber("HIT_COOLDOWN_MS", DEFAULT_CONFIG.hitCooldownMs),
  hitRange: envNumber("HIT_RANGE", DEFAULT_CONFIG.hitRange),
  hitArcDegrees: envNumber("HIT_ARC_DEGREES", DEFAULT_CONFIG.hitArcDegrees),
  moveSpeed: envNumber("MOVE_SPEED", DEFAULT_CONFIG.moveSpeed),
  arenaWidth: envNumber("ARENA_WIDTH", DEFAULT_CONFIG.arenaWidth),
  arenaHeight: envNumber("ARENA_HEIGHT", DEFAULT_CONFIG.arenaHeight),
  joystickSendRateHz: envNumber("JOYSTICK_SEND_RATE_HZ", DEFAULT_CONFIG.joystickSendRateHz),
  highscoreTopN: envNumber("HIGHSCORE_TOP_N", DEFAULT_CONFIG.highscoreTopN),
};

export const PORT = envNumber("PORT", 3000);
