import { Scene, type SceneContext } from "@engine/Scene";
import type { Species, Class, CaptainState } from "@core/player/Captain";
import { drawPanel } from "@ui/Panel";
import { drawLabel } from "@ui/Label";
import { drawButton } from "@ui/Button";
import { SpaceScene } from "./SpaceScene";
import { TitleScene } from "./TitleScene";

const PAINTS = ["#b94a3a", "#3a87b9", "#6cb94a", "#b9a83a"];
const SPECIES: Species[] = ["human"];
const CLASSES: Class[] = ["gunslinger"];

export class CharacterCreationScene extends Scene {
  private name = "Rook";
  private speciesIdx = 0;
  private classIdx = 0;
  private paintIdx = 0;

  enter(_ctx: SceneContext): void {}
  update(ctx: SceneContext, _dt: number): void {
    if (ctx.input.wasKeyPressed("Escape")) ctx.changeScene(new TitleScene());
  }

  render(ctx: SceneContext): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "#050709");
    const panel = { x: 40, y: 30, w: r.internalWidth - 80, h: r.internalHeight - 60 };
    drawPanel(r, panel);
    drawLabel(r, "CAPTAIN", panel.x + 10, panel.y + 10, "#e6ecf5", 10);

    drawLabel(r, `Name:    ${this.name}`, panel.x + 10, panel.y + 32);
    drawLabel(r, `Species: ${SPECIES[this.speciesIdx]}`, panel.x + 10, panel.y + 48);
    drawLabel(r, `Class:   ${CLASSES[this.classIdx]}`, panel.x + 10, panel.y + 64);
    drawLabel(r, "Paint:", panel.x + 10, panel.y + 80);
    PAINTS.forEach((p, i) => {
      r.drawRect(panel.x + 58 + i * 14, panel.y + 78, 10, 10, p);
      if (i === this.paintIdx) {
        r.drawRect(panel.x + 57 + i * 14, panel.y + 76, 12, 1, "#e6ecf5");
      }
    });

    drawButton(
      r,
      ctx.input,
      { x: panel.x + 10, y: panel.y + panel.h - 26, w: 80, h: 16 },
      "Cycle Paint",
      () => {
        this.paintIdx = (this.paintIdx + 1) % PAINTS.length;
      },
    );

    drawButton(
      r,
      ctx.input,
      {
        x: panel.x + panel.w - 90,
        y: panel.y + panel.h - 26,
        w: 80,
        h: 16,
      },
      "Launch",
      () => {
        const captain: CaptainState = {
          name: this.name,
          species: SPECIES[this.speciesIdx]!,
          klass: CLASSES[this.classIdx]!,
          paint: PAINTS[this.paintIdx]!,
          createdAt: Date.now(),
          deaths: 0,
        };
        ctx.changeScene(new SpaceScene(captain));
      },
    );

    drawLabel(
      r,
      "ESC to return to title",
      r.internalWidth / 2,
      r.internalHeight - 10,
      "#506070",
      6,
      "center",
    );
  }
}
