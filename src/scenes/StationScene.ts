import { Scene, type SceneContext } from "@engine/Scene";
import type { CaptainState } from "@core/player/Captain";

export class StationScene extends Scene {
  constructor(readonly captain: CaptainState, readonly seed: number, readonly stationId: string) {
    super();
  }
  enter(_ctx: SceneContext): void {}
  update(_ctx: SceneContext, _dt: number): void {}
  render(_ctx: SceneContext): void {}
}
