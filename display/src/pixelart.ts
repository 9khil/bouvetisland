import Phaser from "phaser";

/**
 * All art here is generated on a small low-res canvas and then stretched up
 * with Phaser's pixelArt/NEAREST filtering — this is the MVP placeholder art
 * pipeline (no external image assets, nothing to fetch), swappable later for
 * real hand-drawn sprites without touching any other code.
 */

export function generateIslandTexture(scene: Phaser.Scene, key: string, w: number, h: number): void {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#1b3a63";
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const baseRadius = Math.min(w, h) * 0.36;

  ctx.fillStyle = "#3a3f2f";
  drawBlob(ctx, cx, cy, baseRadius * 1.08, 14, 0.15, 7);

  ctx.fillStyle = "#5a6b3f";
  drawBlob(ctx, cx, cy, baseRadius * 0.9, 14, 0.15, 7);

  ctx.fillStyle = "#e8e3c8";
  drawBlob(ctx, cx, cy - baseRadius * 0.15, baseRadius * 0.32, 10, 0.2, 11);

  scene.textures.addCanvas(key, canvas);
}

function drawBlob(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  points: number,
  jitter: number,
  seed: number,
): void {
  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const n = pseudoRandom(seed + i);
    const r = radius * (1 - jitter / 2 + n * jitter);
    const x = Math.round(cx + Math.cos(angle) * r);
    const y = Math.round(cy + Math.sin(angle) * r);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// Oval body with two flipper nubs (row 4) sticking out — does not rotate with
// facing (the face + arm textures below do that instead).
const PENGUIN_BODY_GRID = [
  "....III....",
  "...IWWWI...",
  "..IWWWWWI..",
  ".IWWWWWWWI.",
  "FIWWWWWWWIF",
  ".IWWWWWWWI.",
  ".IWWWWWWWI.",
  ".IWWWWWWWI.",
  ".IWWWWWWWI.",
  ".IWWWWWWWI.",
  "..IWWWWWI..",
  "...IWWWI...",
  "....III....",
];

// Small, fixed (non-tinted) face — the beak's asymmetry is what visually
// reads as "facing right" once this texture is rotated to match `facing`.
const PENGUIN_FACE_GRID = ["........", "........", ".....E..", "......B.", ".....E..", "........", "........", "........"];

// Flipper/arm — tinted the same as the body, pivoted at the body's center and
// pointing right by default so rotating it to `facing` swings it outward.
const PENGUIN_ARM_GRID = ["IIIIIIII", "IWWWWWWI", "IIIIIIII"];

function paintGrid(
  ctx: CanvasRenderingContext2D,
  grid: string[],
  cell: number,
  colorFor: (char: string) => string | null,
): void {
  grid.forEach((row, ry) => {
    [...row].forEach((char, rx) => {
      const color = colorFor(char);
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(rx * cell, ry * cell, cell, cell);
    });
  });
}

function createGridTexture(
  scene: Phaser.Scene,
  key: string,
  grid: string[],
  cell: number,
  colorFor: (char: string) => string | null,
): void {
  const canvas = document.createElement("canvas");
  canvas.width = grid[0].length * cell;
  canvas.height = grid.length * cell;
  const ctx = canvas.getContext("2d")!;
  paintGrid(ctx, grid, cell, colorFor);
  scene.textures.addCanvas(key, canvas);
}

export function generatePenguinBodyTexture(scene: Phaser.Scene, key: string): void {
  createGridTexture(scene, key, PENGUIN_BODY_GRID, 4, (char) => {
    if (char === "I" || char === "F") return "#0a0a0a";
    if (char === "W") return "#ffffff";
    return null;
  });
}

export function generatePenguinFaceTexture(scene: Phaser.Scene, key: string): void {
  createGridTexture(scene, key, PENGUIN_FACE_GRID, 4, (char) => {
    if (char === "E") return "#0a0a0a";
    if (char === "B") return "#e8862d";
    return null;
  });
}

export function generatePenguinArmTexture(scene: Phaser.Scene, key: string): void {
  createGridTexture(scene, key, PENGUIN_ARM_GRID, 4, (char) => {
    if (char === "I") return "#0a0a0a";
    if (char === "W") return "#ffffff";
    return null;
  });
}
