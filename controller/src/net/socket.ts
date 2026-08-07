import { io, Socket } from "socket.io-client";
import { ClientEvents } from "../../../shared/protocol";
import { getStoredToken } from "../session";

export function connectControllerSocket(): Socket {
  const socket = io();
  socket.on("connect", () => {
    socket.emit(ClientEvents.Hello, { role: "controller", token: getStoredToken() });
  });
  return socket;
}
