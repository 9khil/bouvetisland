import { store, onStoreUpdate } from "../store";

export function mountStatusOverlay(container: HTMLElement): void {
  const render = () => {
    const snapshot = store.snapshot;
    const maxPlayers = store.config?.maxPlayers ?? "?";
    container.textContent = snapshot
      ? `${snapshot.activeCount}/${maxPlayers} aktive · ${snapshot.queueLength} i kø`
      : "";
  };
  onStoreUpdate(render);
  render();
}
