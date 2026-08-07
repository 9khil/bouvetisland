export class Lives {
  private heartsEl: HTMLElement;
  private scoreEl: HTMLElement;

  constructor(
    root: HTMLElement,
    private maxHits: number,
  ) {
    this.heartsEl = root.querySelector(".lives-hearts")!;
    this.scoreEl = root.querySelector(".lives-score")!;
  }

  update(hitsTaken: number, score: number): void {
    const remaining = Math.max(this.maxHits - hitsTaken, 0);
    this.heartsEl.textContent = "❤".repeat(remaining) + "🖤".repeat(this.maxHits - remaining);
    this.scoreEl.textContent = `POENG: ${score}`;
  }
}
