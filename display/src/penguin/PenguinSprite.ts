import Phaser from "phaser";
import type { PublicActiveState, Vector2 } from "../../../shared/types";

const SWING_DURATION_MS = 180;

export class PenguinSprite {
  readonly container: Phaser.GameObjects.Container;
  private body: Phaser.GameObjects.Image;
  private face: Phaser.GameObjects.Image;
  private arm: Phaser.GameObjects.Image;
  private label: Phaser.GameObjects.Text;
  private targetX: number;
  private targetY: number;
  private swingTimer: Phaser.Time.TimerEvent | null = null;

  constructor(
    private scene: Phaser.Scene,
    bodyKey: string,
    faceKey: string,
    armKey: string,
    state: PublicActiveState,
  ) {
    this.targetX = state.x;
    this.targetY = state.y;

    this.body = scene.add.image(0, 0, bodyKey);
    this.body.setDisplaySize(34, 40);
    this.body.setTint(Phaser.Display.Color.HexStringToColor(state.color).color);

    this.face = scene.add.image(0, 0, faceKey);
    this.face.setDisplaySize(26, 26);

    this.arm = scene.add.image(0, 0, armKey);
    this.arm.setDisplaySize(28, 10);
    this.arm.setOrigin(0, 0.5);
    this.arm.setTint(Phaser.Display.Color.HexStringToColor(state.color).color);
    this.arm.setVisible(false);

    this.label = scene.add.text(0, -28, String(state.number), {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    });
    this.label.setOrigin(0.5);

    this.applyFacing(state.facing);

    this.container = scene.add.container(state.x, state.y, [this.body, this.arm, this.face, this.label]);
  }

  updateState(state: PublicActiveState): void {
    this.targetX = state.x;
    this.targetY = state.y;
    this.body.setTint(Phaser.Display.Color.HexStringToColor(state.color).color);
    this.arm.setTint(Phaser.Display.Color.HexStringToColor(state.color).color);
    this.label.setText(String(state.number));
    this.applyFacing(state.facing);
  }

  private applyFacing(facing: Vector2): void {
    const angle = Math.atan2(facing.y, facing.x);
    this.face.rotation = angle;
    this.arm.rotation = angle;
  }

  swing(): void {
    this.swingTimer?.remove();
    this.arm.setVisible(true);
    this.swingTimer = this.scene.time.delayedCall(SWING_DURATION_MS, () => {
      this.arm.setVisible(false);
    });
  }

  tick(): void {
    this.container.x = Phaser.Math.Linear(this.container.x, this.targetX, 0.35);
    this.container.y = Phaser.Math.Linear(this.container.y, this.targetY, 0.35);
  }

  destroy(): void {
    this.swingTimer?.remove();
    this.container.destroy();
  }
}
