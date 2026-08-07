import type { GameConfig } from "./constants";

export interface Vector2 {
  x: number;
  y: number;
}

/** Permanent for the whole session, independent of active/queued status. */
export interface PlayerIdentity {
  id: string;
  number: number;
  color: string;
  score: number;
  kills: number;
}

/** Broadcast to the display for every active player, every tick. */
export interface PublicActiveState {
  id: string;
  number: number;
  color: string;
  x: number;
  y: number;
  hitsTaken: number;
  facing: Vector2;
}

/** Sent only to the owning socket. */
export interface PersonalState {
  self: PublicActiveState & { score: number; kills: number };
}

export interface DisplaySnapshot {
  tick: number;
  players: PublicActiveState[];
  activeCount: number;
  queueLength: number;
}

export interface HighscoreEntry {
  number: number;
  color: string;
  score: number;
  kills: number;
}

export interface HighscorePayload {
  top: HighscoreEntry[];
}

export type ServerConfigPayload = Pick<
  GameConfig,
  | "maxPlayers"
  | "arenaWidth"
  | "arenaHeight"
  | "maxHits"
  | "killScore"
  | "joystickSendRateHz"
  | "hitCooldownMs"
> & { colorPalette: string[] };

export interface ActivePayload {
  token: string;
  identity: PlayerIdentity;
  x: number;
  y: number;
  hitsTaken: number;
}

export interface QueuedPayload {
  token: string;
  position: number;
}

export interface KickedPayload {
  reason: string;
}

/** Fired once per landed swing so the display can animate an arm swing. */
export interface HitEffectPayload {
  playerId: string;
  facing: Vector2;
}
