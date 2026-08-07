export const ClientEvents = {
  Hello: "hello",
  Move: "input:move",
  Hit: "input:hit",
  Powerup: "input:powerup",
} as const;

export const ServerEvents = {
  Config: "server:config",
  Active: "player:active",
  Queued: "player:queued",
  QueueUpdate: "player:queueUpdate",
  PersonalState: "player:state",
  DisplaySnapshot: "display:snapshot",
  HitEffect: "display:hitEffect",
  Highscore: "display:highscore",
  Kicked: "player:kicked",
} as const;

export interface HelloPayload {
  role: "display" | "controller";
  token?: string;
}

export interface MovePayload {
  x: number;
  y: number;
}
