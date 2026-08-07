export class QueueScreen {
  private positionEl: HTMLElement;

  constructor(root: HTMLElement) {
    this.positionEl = root.querySelector(".queue-position")!;
  }

  update(position: number): void {
    this.positionEl.textContent = String(position);
  }
}
