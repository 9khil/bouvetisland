import type { PlayerIdentity } from "../../../shared/types";

export interface ActivePlayer {
  token: string;
  identity: PlayerIdentity;
  x: number;
  y: number;
  hitsTaken: number;
  inputVector: { x: number; y: number };
  facing: { x: number; y: number };
  lastHitAt: number;
  socketId: string;
  disconnectedAt: number | null;
  graceTimer: NodeJS.Timeout | null;
}

export interface QueuedEntry {
  token: string;
  identity: PlayerIdentity;
  socketId: string;
  joinedAt: number;
}

export class GameState {
  readonly activePlayers = new Map<string, ActivePlayer>(); // keyed by identity.id
  readonly queue: QueuedEntry[] = [];
  readonly socketIdToPlayerId = new Map<string, string>();

  findActiveByToken(token: string): ActivePlayer | undefined {
    for (const player of this.activePlayers.values()) {
      if (player.token === token) return player;
    }
    return undefined;
  }

  findQueueIndexByToken(token: string): number {
    return this.queue.findIndex((entry) => entry.token === token);
  }

  addActive(player: ActivePlayer): void {
    this.activePlayers.set(player.identity.id, player);
    this.socketIdToPlayerId.set(player.socketId, player.identity.id);
  }

  removeActive(playerId: string): ActivePlayer | undefined {
    const player = this.activePlayers.get(playerId);
    if (!player) return undefined;
    this.activePlayers.delete(playerId);
    this.socketIdToPlayerId.delete(player.socketId);
    return player;
  }

  activeBySocketId(socketId: string): ActivePlayer | undefined {
    const playerId = this.socketIdToPlayerId.get(socketId);
    return playerId ? this.activePlayers.get(playerId) : undefined;
  }
}
