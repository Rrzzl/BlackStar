import { Scene, type SceneContext } from "@engine/Scene";
import type { CaptainState } from "@core/player/Captain";
import { StationScene } from "./StationScene";

export class ShipLoadoutScene extends Scene {
  constructor(
    readonly captain: CaptainState,
    readonly seed: number,
    readonly stationId: string,
  ) {
    super();
  }
  enter(_ctx: SceneContext): void {}
  update(ctx: SceneContext, _dt: number): void {
    if (ctx.input.wasKeyPressed("Escape")) {
      ctx.changeScene(new StationScene(this.captain, this.seed, this.stationId));
    }
  }
  render(_ctx: SceneContext): void {}
}
