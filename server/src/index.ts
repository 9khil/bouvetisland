import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { Server } from "socket.io";
import { config, PORT } from "./config";
import { GameState } from "./state/GameState";
import { PlayerRegistry } from "./state/PlayerRegistry";
import { registerSocketHandlers } from "./net/socketHandlers";
import { startGameLoop } from "./game/loop";
import { buildJoinInfo } from "./qrcode";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../../dist");

const app = express();

app.get("/display", (_req, res) => {
  res.sendFile(path.join(distDir, "display", "index.html"));
});

app.get("/controller", (_req, res) => {
  res.sendFile(path.join(distDir, "controller", "index.html"));
});

app.get("/api/join-info", async (_req, res) => {
  const info = await buildJoinInfo(PORT);
  res.json(info);
});

app.get("/", (_req, res) => {
  res.redirect("/display");
});

app.use(express.static(distDir));

const httpServer = createServer(app);
const io = new Server(httpServer);

const state = new GameState();
const registry = new PlayerRegistry();

registerSocketHandlers(io, state, registry, config);
startGameLoop(io, state, config);

httpServer.listen(PORT, () => {
  console.log(`Bouvet Island server listening on http://localhost:${PORT}`);
  console.log(`Max players: ${config.maxPlayers}`);
});
