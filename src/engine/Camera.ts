export class Camera {
  x = 0;
  y = 0;
  private shakeTime = 0;
  private shakeMag = 0;

  constructor(public readonly followLerp = 0.12) {}

  follow(targetX: number, targetY: number): void {
    this.x += (targetX - this.x) * this.followLerp;
    this.y += (targetY - this.y) * this.followLerp;
  }

  snap(targetX: number, targetY: number): void {
    this.x = targetX;
    this.y = targetY;
  }

  shake(mag: number, durationSec: number): void {
    this.shakeMag = Math.max(this.shakeMag, mag);
    this.shakeTime = Math.max(this.shakeTime, durationSec);
  }

  tick(dt: number): void {
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      if (this.shakeTime <= 0) {
        this.shakeTime = 0;
        this.shakeMag = 0;
      }
    }
  }

  offsetX(internalWidth: number): number {
    const jx = this.shakeMag > 0 ? (Math.random() * 2 - 1) * this.shakeMag : 0;
    return this.x - internalWidth / 2 + jx;
  }

  offsetY(internalHeight: number): number {
    const jy = this.shakeMag > 0 ? (Math.random() * 2 - 1) * this.shakeMag : 0;
    return this.y - internalHeight / 2 + jy;
  }
}
