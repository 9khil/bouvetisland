import { randomUUID } from "node:crypto";
import { COLOR_PALETTE } from "../../../shared/constants";
import type { PlayerIdentity } from "../../../shared/types";

/**
 * Permanent (for the server's lifetime / one evening) identity per token.
 * Number/color are assigned once on first-ever connect and never change or
 * get freed, independent of whether the player is active, queued, or
 * disconnected — this is what lets a queued/eliminated player still
 * recognize themselves on the highscore board.
 */
export class PlayerRegistry {
  private byToken = new Map<string, PlayerIdentity>();
  private nextNumber = 1;

  getOrCreate(token: string | undefined): { token: string; identity: PlayerIdentity } {
    if (token) {
      const existing = this.byToken.get(token);
      if (existing) return { token, identity: existing };
    }
    const freshToken = randomUUID();
    const number = this.nextNumber++;
    const identity: PlayerIdentity = {
      id: randomUUID(),
      number,
      color: COLOR_PALETTE[number % COLOR_PALETTE.length],
      score: 0,
      kills: 0,
    };
    this.byToken.set(freshToken, identity);
    return { token: freshToken, identity };
  }

  get(token: string): PlayerIdentity | undefined {
    return this.byToken.get(token);
  }

  addKillScore(token: string, killScore: number): void {
    const identity = this.byToken.get(token);
    if (!identity) return;
    identity.score += killScore;
    identity.kills += 1;
  }

  topScores(n: number): PlayerIdentity[] {
    return [...this.byToken.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, n);
  }
}
