import type { Renderer } from "./Renderer";

export class DebugOverlay {
  enabled = false;
  private samples: number[] = [];
  private readonly windowSize = 120;
  private lastTick = performance.now();

  tick(): void {
    const now = performance.now();
    const dtMs = now - this.lastTick;
    this.lastTick = now;
    this.samples.push(dtMs);
    if (this.samples.length > this.windowSize) this.samples.shift();
  }

  worst(): number {
    return this.samples.reduce((m, v) => (v > m ? v : m), 0);
  }

  avg(): number {
    if (this.samples.length === 0) return 0;
    return this.samples.reduce((s, v) => s + v, 0) / this.samples.length;
  }

  render(r: Renderer): void {
    if (!this.enabled) return;
    const worst = this.worst();
    const avg = this.avg();
    const worstColor = worst > 20 ? "#d96a6a" : "#8fd97a";
    r.drawRect(r.internalWidth - 100, 2, 98, 18, "#00000080");
    r.drawText(`worst ${worst.toFixed(1)}ms`, r.internalWidth - 96, 4, worstColor, 6);
    r.drawText(`avg   ${avg.toFixed(1)}ms`, r.internalWidth - 96, 12, "#cfd8e8", 6);
  }
}
