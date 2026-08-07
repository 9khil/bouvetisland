import type { Socket } from "socket.io-client";
import { ServerEvents } from "../../../shared/protocol";
import type {
  ActivePayload,
  KickedPayload,
  PersonalState,
  QueuedPayload,
  ServerConfigPayload,
} from "../../../shared/types";
import { storeToken } from "../session";
import { Joystick } from "../ui/Joystick";
import { bindActionButtons } from "../ui/Buttons";
import { Minimap } from "../ui/Minimap";
import { Lives } from "../ui/Lives";
import { QueueScreen } from "../ui/QueueScreen";

type Screen = "connecting" | "queued" | "active";

export class ControllerApp {
  private config: ServerConfigPayload | null = null;
  private minimap: Minimap | null = null;
  private lives: Lives | null = null;
  private queueScreen: QueueScreen;

  constructor(private socket: Socket) {
    this.queueScreen = new QueueScreen(this.screenEl("queued"));
    this.bind();
  }

  private bind(): void {
    this.socket.on(ServerEvents.Config, (config: ServerConfigPayload) => {
      this.config = config;
    });

    this.socket.on(ServerEvents.Active, (payload: ActivePayload) => {
      storeToken(payload.token);
      this.showScreen("active");
      this.setupActiveScreen(payload);
    });

    this.socket.on(ServerEvents.Queued, (payload: QueuedPayload) => {
      storeToken(payload.token);
      this.showScreen("queued");
      this.queueScreen.update(payload.position);
    });

    this.socket.on(ServerEvents.QueueUpdate, (payload: QueuedPayload) => {
      this.queueScreen.update(payload.position);
    });

    this.socket.on(ServerEvents.PersonalState, (state: PersonalState) => {
      this.lives?.update(state.self.hitsTaken, state.self.score);
      this.minimap?.update(state.self.x, state.self.y);
    });

    this.socket.on(ServerEvents.Kicked, (payload: KickedPayload) => {
      console.warn("Kicked:", payload.reason);
      this.showScreen("connecting");
    });
  }

  private activeScreenReady = false;

  private setupActiveScreen(payload: ActivePayload): void {
    if (this.activeScreenReady || !this.config) return;
    const root = this.screenEl("active");

    const joystickEl = root.querySelector<HTMLElement>(".joystick")!;
    new Joystick(joystickEl, this.socket, this.config.joystickSendRateHz);
    bindActionButtons(root, this.socket);

    const minimapCanvas = root.querySelector<HTMLCanvasElement>(".minimap")!;
    this.minimap = new Minimap(
      minimapCanvas,
      this.config.arenaWidth,
      this.config.arenaHeight,
      payload.identity.color,
    );

    this.lives = new Lives(root, this.config.maxHits);

    const badge = root.querySelector<HTMLElement>(".player-badge")!;
    badge.style.background = payload.identity.color;
    badge.textContent = `#${payload.identity.number}`;

    this.activeScreenReady = true;
  }

  private showScreen(screen: Screen): void {
    (["connecting", "queued", "active"] as Screen[]).forEach((s) => {
      this.screenEl(s).classList.toggle("hidden", s !== screen);
    });
  }

  private screenEl(screen: Screen): HTMLElement {
    return document.getElementById(`screen-${screen}`)!;
  }
}
