import { io, Socket } from "socket.io-client";
import { ClientEvents } from "../../../shared/protocol";

export function connectDisplaySocket(): Socket {
  const socket = io();
  socket.on("connect", () => {
    socket.emit(ClientEvents.Hello, { role: "display" });
  });
  return socket;
}
