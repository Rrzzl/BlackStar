export type TickHandler = (dt: number, total: number) => void;

export class WorldClock {
  private total = 0;
  private readonly handlers: Array<{ intervalSec: number; acc: number; cb: TickHandler }> = [];

  constructor(readonly realToGameRate = 60) {}

  elapsed(): number {
    return this.total;
  }

  subscribe(intervalSec: number, cb: TickHandler): () => void {
    const entry = { intervalSec, acc: 0, cb };
    this.handlers.push(entry);
    return () => {
      const i = this.handlers.indexOf(entry);
      if (i >= 0) this.handlers.splice(i, 1);
    };
  }

  advance(realDt: number): void {
    const gameDt = realDt * this.realToGameRate;
    this.total += gameDt;
    for (const h of this.handlers) {
      h.acc += gameDt;
      while (h.acc >= h.intervalSec) {
        h.acc -= h.intervalSec;
        h.cb(h.intervalSec, this.total);
      }
    }
  }
}
