import type { Server } from "socket.io";
import type { GameConfig } from "../../../shared/constants";
import { ServerEvents } from "../../../shared/protocol";
import type { HighscorePayload, HitEffectPayload } from "../../../shared/types";
import { GameState, ActivePlayer } from "../state/GameState";
import { PlayerRegistry } from "../state/PlayerRegistry";
import { requeueEliminated, promoteNext } from "./queue";

export function broadcastHighscore(io: Server, registry: PlayerRegistry, config: GameConfig): void {
  const top = registry.topScores(config.highscoreTopN).map((identity) => ({
    number: identity.number,
    color: identity.color,
    score: identity.score,
    kills: identity.kills,
  }));
  const payload: HighscorePayload = { top };
  io.emit(ServerEvents.Highscore, payload);
}

export function handleHit(
  io: Server,
  state: GameState,
  registry: PlayerRegistry,
  config: GameConfig,
  attacker: ActivePlayer,
): void {
  const now = Date.now();
  if (now - attacker.lastHitAt < config.hitCooldownMs) return;
  attacker.lastHitAt = now;

  const hitEffect: HitEffectPayload = { playerId: attacker.identity.id, facing: attacker.facing };
  io.to("display").emit(ServerEvents.HitEffect, hitEffect);

  const halfArcRad = ((config.hitArcDegrees / 2) * Math.PI) / 180;

  for (const target of state.activePlayers.values()) {
    if (target.identity.id === attacker.identity.id) continue;
    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const dist = Math.hypot(dx, dy);
    if (dist > config.hitRange) continue;

    if (dist > 0.0001) {
      const cosAngle = (dx * attacker.facing.x + dy * attacker.facing.y) / dist;
      const angle = Math.acos(Math.min(1, Math.max(-1, cosAngle)));
      if (angle > halfArcRad) continue;
    }

    target.hitsTaken += 1;
    if (target.hitsTaken >= config.maxHits) {
      requeueEliminated(io, state, target);
      registry.addKillScore(attacker.token, config.killScore);
      promoteNext(io, state, config);
      broadcastHighscore(io, registry, config);
    }
  }
}
