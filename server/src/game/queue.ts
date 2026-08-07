import type { Server } from "socket.io";
import { ServerEvents } from "../../../shared/protocol";
import type { ActivePayload, QueuedPayload } from "../../../shared/types";
import type { GameConfig } from "../../../shared/constants";
import { GameState, ActivePlayer, QueuedEntry } from "../state/GameState";
import { PlayerRegistry } from "../state/PlayerRegistry";
import { randomSpawnPoint } from "./movement";

function activePayloadFor(player: ActivePlayer): ActivePayload {
  return {
    token: player.token,
    identity: player.identity,
    x: player.x,
    y: player.y,
    hitsTaken: player.hitsTaken,
  };
}

/** Reassigns queue positions (1-based) to everyone still waiting. */
export function broadcastQueuePositions(io: Server, state: GameState): void {
  state.queue.forEach((entry, index) => {
    const payload: QueuedPayload = { token: entry.token, position: index + 1 };
    io.to(entry.socketId).emit(ServerEvents.QueueUpdate, payload);
  });
}

export function enqueue(io: Server, state: GameState, entry: QueuedEntry): void {
  state.queue.push(entry);
  const payload: QueuedPayload = { token: entry.token, position: state.queue.length };
  io.to(entry.socketId).emit(ServerEvents.Queued, payload);
}

function spawnActive(
  state: GameState,
  config: GameConfig,
  token: string,
  identity: ActivePlayer["identity"],
  socketId: string,
): ActivePlayer {
  const spawn = randomSpawnPoint(config);
  const player: ActivePlayer = {
    token,
    identity,
    x: spawn.x,
    y: spawn.y,
    hitsTaken: 0,
    inputVector: { x: 0, y: 0 },
    facing: { x: 0, y: 1 },
    lastHitAt: 0,
    socketId,
    disconnectedAt: null,
    graceTimer: null,
  };
  state.addActive(player);
  return player;
}

/** Promotes the next queued entry into a free active slot, if any. */
export function promoteNext(io: Server, state: GameState, config: GameConfig): void {
  if (state.activePlayers.size >= config.maxPlayers) return;
  const next = state.queue.shift();
  if (!next) return;
  const player = spawnActive(state, config, next.token, next.identity, next.socketId);
  io.to(player.socketId).emit(ServerEvents.Active, activePayloadFor(player));
  broadcastQueuePositions(io, state);
}

/**
 * Handles a `hello` from a controller: reconnect into an existing active
 * slot, reclaim a queue spot, or join fresh (active if there's room, queued
 * otherwise).
 */
export function handleHello(
  io: Server,
  state: GameState,
  registry: PlayerRegistry,
  config: GameConfig,
  socketId: string,
  token: string | undefined,
): void {
  const { token: resolvedToken, identity } = registry.getOrCreate(token);

  const existingActive = state.findActiveByToken(resolvedToken);
  if (existingActive) {
    if (existingActive.graceTimer) {
      clearTimeout(existingActive.graceTimer);
      existingActive.graceTimer = null;
    }
    existingActive.disconnectedAt = null;
    state.socketIdToPlayerId.delete(existingActive.socketId);
    existingActive.socketId = socketId;
    state.socketIdToPlayerId.set(socketId, existingActive.identity.id);
    io.to(socketId).emit(ServerEvents.Active, activePayloadFor(existingActive));
    return;
  }

  const queueIndex = state.findQueueIndexByToken(resolvedToken);
  if (queueIndex !== -1) {
    state.queue[queueIndex].socketId = socketId;
    const payload: QueuedPayload = { token: resolvedToken, position: queueIndex + 1 };
    io.to(socketId).emit(ServerEvents.Queued, payload);
    return;
  }

  if (state.activePlayers.size < config.maxPlayers) {
    const player = spawnActive(state, config, resolvedToken, identity, socketId);
    io.to(socketId).emit(ServerEvents.Active, activePayloadFor(player));
  } else {
    enqueue(io, state, { token: resolvedToken, identity, socketId, joinedAt: Date.now() });
  }
}

/** Sends an eliminated active player back to the end of the queue. */
export function requeueEliminated(io: Server, state: GameState, player: ActivePlayer): void {
  state.removeActive(player.identity.id);
  enqueue(io, state, {
    token: player.token,
    identity: player.identity,
    socketId: player.socketId,
    joinedAt: Date.now(),
  });
}

export function handleDisconnect(
  io: Server,
  state: GameState,
  config: GameConfig,
  socketId: string,
): void {
  const active = state.activeBySocketId(socketId);
  if (active) {
    active.disconnectedAt = Date.now();
    active.graceTimer = setTimeout(() => {
      state.removeActive(active.identity.id);
      promoteNext(io, state, config);
    }, config.reconnectGraceMs);
    return;
  }
  const queueIndex = state.queue.findIndex((entry) => entry.socketId === socketId);
  if (queueIndex !== -1) {
    state.queue.splice(queueIndex, 1);
    broadcastQueuePositions(io, state);
  }
}
