import { Scene, type SceneContext } from "@engine/Scene";
import type { CaptainState } from "@core/player/Captain";
import type { Loadout } from "@core/ship/Loadout";

export class PlanetLandingScene extends Scene {
  constructor(
    readonly captain: CaptainState,
    readonly seed: number,
    readonly loadout: Loadout,
    readonly planetId: string,
  ) {
    super();
  }
  enter(_ctx: SceneContext): void {}
  update(_ctx: SceneContext, _dt: number): void {}
  render(_ctx: SceneContext): void {}
}
