import { Scene, type SceneContext } from "@engine/Scene";
import { drawLabel } from "@ui/Label";

export class CabinScene extends Scene {
  enter(_ctx: SceneContext): void {}
  update(_ctx: SceneContext, _dt: number): void {}
  render(ctx: SceneContext, _alpha: number): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "#0a0604");
    drawLabel(
      r,
      "CABIN",
      r.internalWidth / 2,
      r.internalHeight / 2,
      "#c9a04b",
      10,
      "center",
    );
  }
}
