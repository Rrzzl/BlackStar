import { Scene, type SceneContext } from "@engine/Scene";
import type { CaptainState } from "@core/player/Captain";
import type { Loadout } from "@core/ship/Loadout";
import { drawPanel } from "@ui/Panel";
import { drawLabel } from "@ui/Label";
import { drawButton } from "@ui/Button";
import { SpaceScene } from "./SpaceScene";
import { DungeonScene } from "./DungeonScene";

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

  update(ctx: SceneContext, _dt: number): void {
    if (ctx.input.wasKeyPressed("Escape")) {
      ctx.changeScene(new SpaceScene(this.captain, this.seed, this.loadout, this.planetId));
    }
  }

  render(ctx: SceneContext, _alpha: number): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "#0b0606");
    const panel = { x: 40, y: 30, w: r.internalWidth - 80, h: r.internalHeight - 60 };
    drawPanel(r, panel);
    drawLabel(r, `PLANET — ${this.planetId.toUpperCase()}`, panel.x + 10, panel.y + 10, "#e6ecf5", 10);

    const btnW = 160;
    const btnH = 18;
    const btnX = panel.x + 20;
    let by = panel.y + 60;

    if (this.planetId === "kepler-7b") {
      drawButton(r, ctx.input, { x: btnX, y: by, w: btnW, h: btnH }, "Enter Alien Ruin", () => {
        ctx.changeScene(new DungeonScene(this.captain, this.seed, this.loadout, this.planetId));
      });
      by += 24;
    } else {
      drawButton(
        r, ctx.input, { x: btnX, y: by, w: btnW, h: btnH }, "Landing Zone Alpha (M2c)", () => {},
        { fill: "#1a1a22", fillHover: "#1a1a22", fillPressed: "#1a1a22", border: "#2a2a32", textColor: "#4a4a52" },
      );
      by += 24;
    }

    drawButton(r, ctx.input, { x: btnX, y: by, w: btnW, h: btnH }, "Return to Orbit", () => {
      ctx.changeScene(new SpaceScene(this.captain, this.seed, this.loadout, this.planetId));
    });

    drawLabel(r, "ESC to return to orbit", r.internalWidth / 2, r.internalHeight - 10, "#506070", 6, "center");
  }
}
