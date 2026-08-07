import type { DisplaySnapshot, HighscorePayload, ServerConfigPayload } from "../../shared/types";

/** Single-page app, single mutable store — no need for anything heavier. */
export const store: {
  config: ServerConfigPayload | null;
  snapshot: DisplaySnapshot | null;
  highscore: HighscorePayload | null;
} = {
  config: null,
  snapshot: null,
  highscore: null,
};

type Listener = () => void;
const listeners = new Set<Listener>();

export function onStoreUpdate(listener: Listener): void {
  listeners.add(listener);
}

export function notifyStoreUpdate(): void {
  listeners.forEach((listener) => listener());
}

type HitEffectListener = (playerId: string) => void;
const hitEffectListeners = new Set<HitEffectListener>();

export function onHitEffect(listener: HitEffectListener): void {
  hitEffectListeners.add(listener);
}

export function emitHitEffect(playerId: string): void {
  hitEffectListeners.forEach((listener) => listener(playerId));
}
