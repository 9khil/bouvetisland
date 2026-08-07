import type { Socket } from "socket.io-client";
import { ClientEvents } from "../../../shared/protocol";

export function bindActionButtons(root: HTMLElement, socket: Socket): void {
  const hitButton = root.querySelector<HTMLButtonElement>(".btn-hit")!;
  const powerupButton = root.querySelector<HTMLButtonElement>(".btn-powerup")!;

  hitButton.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    socket.emit(ClientEvents.Hit);
    flash(hitButton);
  });

  powerupButton.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    socket.emit(ClientEvents.Powerup);
    flash(powerupButton);
  });
}

function flash(button: HTMLButtonElement): void {
  button.classList.add("pressed");
  setTimeout(() => button.classList.remove("pressed"), 120);
}
