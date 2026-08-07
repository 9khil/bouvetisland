import { connectControllerSocket } from "./net/socket";
import { ControllerApp } from "./app/ControllerApp";

const socket = connectControllerSocket();
new ControllerApp(socket);

// Best-effort — only works in fullscreen/installed contexts on most browsers.
// The #rotate-hint CSS overlay is the real fallback for everyone else.
type OrientationLock = ScreenOrientation & { lock?: (orientation: string) => Promise<void> };
(screen.orientation as OrientationLock)?.lock?.("landscape")?.catch(() => {});
