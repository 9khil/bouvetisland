import Phaser from "phaser";
import type { PublicActiveState } from "../../../shared/types";
import { generateIslandTexture, generatePenguinBodyTexture, generatePenguinFaceTexture, generatePenguinArmTexture } from "../pixelart";
import { PenguinSprite } from "../penguin/PenguinSprite";
import { store, onStoreUpdate, onHitEffect } from "../store";

const ISLAND_KEY = "island";
const BODY_KEY = "penguin-body";
const FACE_KEY = "penguin-face";
const ARM_KEY = "penguin-arm";

export class IslandScene extends Phaser.Scene {
  private sprites = new Map<string, PenguinSprite>();

  constructor() {
    super("island");
  }

  create(): void {
    const { arenaWidth, arenaHeight } = store.config!;

    generateIslandTexture(this, ISLAND_KEY, 120, 80);
    generatePenguinBodyTexture(this, BODY_KEY);
    generatePenguinFaceTexture(this, FACE_KEY);
    generatePenguinArmTexture(this, ARM_KEY);

    const bg = this.add.image(0, 0, ISLAND_KEY).setOrigin(0, 0);
    bg.setDisplaySize(arenaWidth, arenaHeight);

    onStoreUpdate(() => this.syncPenguins(store.snapshot?.players ?? []));
    onHitEffect((playerId) => this.sprites.get(playerId)?.swing());
  }

  update(): void {
    this.sprites.forEach((sprite) => sprite.tick());
  }

  private syncPenguins(players: PublicActiveState[]): void {
    const seenIds = new Set<string>();

    for (const state of players) {
      seenIds.add(state.id);
      const existing = this.sprites.get(state.id);
      if (existing) {
        existing.updateState(state);
      } else {
        this.sprites.set(state.id, new PenguinSprite(this, BODY_KEY, FACE_KEY, ARM_KEY, state));
      }
    }

    for (const [id, sprite] of this.sprites) {
      if (!seenIds.has(id)) {
        sprite.destroy();
        this.sprites.delete(id);
      }
    }
  }
}
