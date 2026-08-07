import type { Server, Socket } from "socket.io";
import type { GameConfig } from "../../../shared/constants";
import { COLOR_PALETTE } from "../../../shared/constants";
import { ClientEvents, ServerEvents, HelloPayload, MovePayload } from "../../../shared/protocol";
import type { ServerConfigPayload } from "../../../shared/types";
import { GameState } from "../state/GameState";
import { PlayerRegistry } from "../state/PlayerRegistry";
import { handleHello, handleDisconnect } from "../game/queue";
import { handleHit } from "../game/combat";
import { clampInputVector } from "../game/movement";

function configPayload(config: GameConfig): ServerConfigPayload {
  return {
    maxPlayers: config.maxPlayers,
    arenaWidth: config.arenaWidth,
    arenaHeight: config.arenaHeight,
    maxHits: config.maxHits,
    killScore: config.killScore,
    joystickSendRateHz: config.joystickSendRateHz,
    hitCooldownMs: config.hitCooldownMs,
    colorPalette: COLOR_PALETTE,
  };
}

export function registerSocketHandlers(
  io: Server,
  state: GameState,
  registry: PlayerRegistry,
  config: GameConfig,
): void {
  io.on("connection", (socket: Socket) => {
    socket.emit(ServerEvents.Config, configPayload(config));

    socket.on(ClientEvents.Hello, (payload: HelloPayload) => {
      if (payload.role === "display") {
        socket.join("display");
        return;
      }
      handleHello(io, state, registry, config, socket.id, payload.token);
    });

    socket.on(ClientEvents.Move, (payload: MovePayload) => {
      const player = state.activeBySocketId(socket.id);
      if (!player) return;
      player.inputVector = clampInputVector(Number(payload.x) || 0, Number(payload.y) || 0);
    });

    socket.on(ClientEvents.Hit, () => {
      const player = state.activeBySocketId(socket.id);
      if (!player) return;
      handleHit(io, state, registry, config, player);
    });

    socket.on(ClientEvents.Powerup, () => {
      // Inert for now — future powerup effects will hook in here.
    });

    socket.on("disconnect", () => {
      handleDisconnect(io, state, config, socket.id);
    });
  });
}
