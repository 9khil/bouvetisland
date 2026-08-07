import type { Server } from "socket.io";
import type { GameConfig } from "../../../shared/constants";
import { ServerEvents } from "../../../shared/protocol";
import type { DisplaySnapshot, PersonalState, PublicActiveState } from "../../../shared/types";
import { GameState } from "../state/GameState";
import { stepMovement } from "./movement";

export function startGameLoop(io: Server, state: GameState, config: GameConfig): NodeJS.Timeout {
  let lastTick = Date.now();
  let tick = 0;

  return setInterval(() => {
    const now = Date.now();
    const dtSeconds = (now - lastTick) / 1000;
    lastTick = now;
    tick += 1;

    const publicStates: PublicActiveState[] = [];
    for (const player of state.activePlayers.values()) {
      stepMovement(player, dtSeconds, config);

      const publicState: PublicActiveState = {
        id: player.identity.id,
        number: player.identity.number,
        color: player.identity.color,
        x: player.x,
        y: player.y,
        hitsTaken: player.hitsTaken,
        facing: player.facing,
      };
      publicStates.push(publicState);

      const personal: PersonalState = {
        self: { ...publicState, score: player.identity.score, kills: player.identity.kills },
      };
      io.to(player.socketId).emit(ServerEvents.PersonalState, personal);
    }

    const snapshot: DisplaySnapshot = {
      tick,
      players: publicStates,
      activeCount: state.activePlayers.size,
      queueLength: state.queue.length,
    };
    io.to("display").emit(ServerEvents.DisplaySnapshot, snapshot);
  }, 1000 / config.tickRateHz);
}
