import Phaser from "phaser";
import { ServerEvents } from "../../shared/protocol";
import { connectDisplaySocket } from "./net/socket";
import { IslandScene } from "./scenes/IslandScene";
import { store, notifyStoreUpdate, emitHitEffect } from "./store";
import { mountQrOverlay } from "./ui/qrOverlay";
import { mountHighscoreOverlay } from "./ui/HighscoreOverlay";
import { mountStatusOverlay } from "./ui/StatusOverlay";

const socket = connectDisplaySocket();

socket.once(ServerEvents.Config, (config) => {
  store.config = config;
  bootGame();
});

socket.on(ServerEvents.DisplaySnapshot, (snapshot) => {
  store.snapshot = snapshot;
  notifyStoreUpdate();
});

socket.on(ServerEvents.Highscore, (highscore) => {
  store.highscore = highscore;
  notifyStoreUpdate();
});

socket.on(ServerEvents.HitEffect, (payload) => {
  emitHitEffect(payload.playerId);
});

function bootGame(): void {
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-root",
    width: store.config!.arenaWidth,
    height: store.config!.arenaHeight,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: "#1b3a63",
    scene: [IslandScene],
  });
}

mountQrOverlay(document.getElementById("qr-overlay")!);
mountHighscoreOverlay(document.getElementById("highscore-overlay")!);
mountStatusOverlay(document.getElementById("status-overlay")!);
