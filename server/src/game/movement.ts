import type { GameConfig } from "../../../shared/constants";
import type { ActivePlayer } from "../state/GameState";

const PENGUIN_RADIUS = 16;

/** Below this input magnitude, keep the last facing direction rather than snapping to noise. */
const FACING_DEADZONE = 0.15;

export function clampInputVector(x: number, y: number): { x: number; y: number } {
  const length = Math.hypot(x, y);
  if (length <= 1) return { x, y };
  return { x: x / length, y: y / length };
}

export function stepMovement(player: ActivePlayer, dtSeconds: number, config: GameConfig): void {
  const { x: vx, y: vy } = player.inputVector;
  const length = Math.hypot(vx, vy);
  if (length > FACING_DEADZONE) {
    player.facing = { x: vx / length, y: vy / length };
  }

  player.x += vx * config.moveSpeed * dtSeconds;
  player.y += vy * config.moveSpeed * dtSeconds;
  player.x = Math.min(Math.max(player.x, PENGUIN_RADIUS), config.arenaWidth - PENGUIN_RADIUS);
  player.y = Math.min(Math.max(player.y, PENGUIN_RADIUS), config.arenaHeight - PENGUIN_RADIUS);
}

export function randomSpawnPoint(config: GameConfig): { x: number; y: number } {
  return {
    x: PENGUIN_RADIUS + Math.random() * (config.arenaWidth - 2 * PENGUIN_RADIUS),
    y: PENGUIN_RADIUS + Math.random() * (config.arenaHeight - 2 * PENGUIN_RADIUS),
  };
}
