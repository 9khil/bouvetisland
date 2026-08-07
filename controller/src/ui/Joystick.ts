import type { Socket } from "socket.io-client";
import { ClientEvents } from "../../../shared/protocol";

export class Joystick {
  private ring: HTMLElement;
  private thumb: HTMLElement;
  private vector = { x: 0, y: 0 };
  private engaged = false;
  private sendInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    root: HTMLElement,
    private socket: Socket,
    private sendRateHz: number,
  ) {
    this.ring = root.querySelector(".joystick-ring")!;
    this.thumb = root.querySelector(".joystick-thumb")!;
    this.bind();
  }

  private bind(): void {
    this.ring.addEventListener("pointerdown", (e) => this.onDown(e));
    window.addEventListener("pointermove", (e) => this.onMove(e));
    window.addEventListener("pointerup", (e) => this.onUp(e));
  }

  private activePointerId: number | null = null;

  private onDown(e: PointerEvent): void {
    e.preventDefault();
    this.activePointerId = e.pointerId;
    this.engaged = true;
    this.startSending();
    this.onMove(e);
  }

  private onMove(e: PointerEvent): void {
    if (!this.engaged || e.pointerId !== this.activePointerId) return;
    const rect = this.ring.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const radius = rect.width / 2;
    const length = Math.hypot(dx, dy);
    const clamped = length > radius ? radius / length : 1;
    const x = dx * clamped;
    const y = dy * clamped;

    this.thumb.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    this.vector = { x: x / radius, y: y / radius };
  }

  private onUp(e: PointerEvent): void {
    if (e.pointerId !== this.activePointerId) return;
    this.engaged = false;
    this.activePointerId = null;
    this.thumb.style.transform = "translate(-50%, -50%)";
    this.vector = { x: 0, y: 0 };
    this.stopSending();
    // Send the zero vector immediately — waiting for the throttled interval
    // would leave the penguin "ghost walking" until the next tick.
    this.send();
  }

  private startSending(): void {
    if (this.sendInterval) return;
    this.sendInterval = setInterval(() => this.send(), 1000 / this.sendRateHz);
  }

  private stopSending(): void {
    if (!this.sendInterval) return;
    clearInterval(this.sendInterval);
    this.sendInterval = null;
  }

  private send(): void {
    this.socket.emit(ClientEvents.Move, this.vector);
  }
}
