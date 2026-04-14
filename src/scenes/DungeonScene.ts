import { Scene, type SceneContext } from "@engine/Scene";
import type { CaptainState } from "@core/player/Captain";
import type { Loadout } from "@core/ship/Loadout";
import { PlanetLandingScene } from "./PlanetLandingScene";

export class DungeonScene extends Scene {
  constructor(
    readonly captain: CaptainState,
    readonly seed: number,
    readonly loadout: Loadout,
    readonly planetId: string,
  ) {
    super();
  }
  enter(_ctx: SceneContext): void {}
  update(ctx: SceneContext, _dt: number): void {
    if (ctx.input.wasKeyPressed("Escape")) {
      ctx.changeScene(new PlanetLandingScene(this.captain, this.seed, this.loadout, this.planetId));
    }
  }
  render(_ctx: SceneContext, _alpha: number): void {}
}
