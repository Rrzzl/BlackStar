import type { Input } from "./Input";
import type { Renderer } from "./Renderer";
import type { Scene, SceneContext } from "./Scene";
import type { Assets } from "./Assets";
import type { Audio } from "./Audio";
import type { SaveStore } from "./Save";
import type { WorldClock } from "@core/world/WorldClock";

export interface GameServices {
  input: Input;
  renderer: Renderer;
  assets: Assets;
  audio: Audio;
  saveStore: SaveStore;
  worldClock: WorldClock;
}

export class GameLoop {
  private readonly fixedDt = 1 / 60;
  private readonly maxFrameTime = 0.25;
  private accumulator = 0;
  private lastTime = 0;
  private running = false;
  private rafHandle = 0;

  private scene: Scene;
  private readonly ctx: SceneContext;

  constructor(initialScene: Scene, services: GameServices) {
    this.scene = initialScene;
    this.ctx = {
      ...services,
      changeScene: (next: Scene) => {
        this.scene.exit(this.ctx);
        this.scene = next;
        void this.scene.enter(this.ctx);
      },
    };
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    void this.scene.enter(this.ctx);
    const tick = (now: number) => {
      if (!this.running) return;
      let frameTime = (now - this.lastTime) / 1000;
      this.lastTime = now;
      if (frameTime > this.maxFrameTime) frameTime = this.maxFrameTime;
      this.accumulator += frameTime;

      while (this.accumulator >= this.fixedDt) {
        this.scene.update(this.ctx, this.fixedDt);
        this.ctx.input.endFrame();
        this.accumulator -= this.fixedDt;
      }

      const alpha = this.accumulator / this.fixedDt;
      this.ctx.renderer.clear();
      this.ctx.renderer.beginFrame();
      this.scene.render(this.ctx, alpha);
      this.ctx.renderer.endFrame();

      this.rafHandle = requestAnimationFrame(tick);
    };
    this.rafHandle = requestAnimationFrame(tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafHandle);
  }
}
