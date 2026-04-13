import type { Renderer } from "./Renderer";

export class DebugOverlay {
  enabled = true;
  private frameTimes: number[] = [];
  private readonly sampleSize = 60;
  private lastSample = performance.now();

  tick(): void {
    const now = performance.now();
    const dt = now - this.lastSample;
    this.lastSample = now;
    this.frameTimes.push(dt);
    if (this.frameTimes.length > this.sampleSize) this.frameTimes.shift();
  }

  get fps(): number {
    if (this.frameTimes.length === 0) return 0;
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return avg > 0 ? 1000 / avg : 0;
  }

  get frameMs(): number {
    if (this.frameTimes.length === 0) return 0;
    return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
  }

  render(renderer: Renderer): void {
    if (!this.enabled) return;
    const fps = this.fps.toFixed(0);
    const ms = this.frameMs.toFixed(1);
    renderer.drawText(`FPS ${fps}  ${ms}ms`, 4, 4, "#8fe08f");
  }
}
