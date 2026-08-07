export class Minimap {
  private ctx: CanvasRenderingContext2D;

  constructor(
    private canvas: HTMLCanvasElement,
    private arenaWidth: number,
    private arenaHeight: number,
    private color: string,
  ) {
    this.ctx = canvas.getContext("2d")!;
  }

  update(x: number, y: number): void {
    const { ctx, canvas } = this;
    ctx.fillStyle = "#0a1a30";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ffffff";
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

    const px = (x / this.arenaWidth) * canvas.width;
    const py = (y / this.arenaHeight) * canvas.height;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
