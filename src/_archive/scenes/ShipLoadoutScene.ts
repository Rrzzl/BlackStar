// @ts-nocheck
/* eslint-disable */
import { Scene, type SceneContext } from "@engine/Scene";
import type { CaptainState } from "@core/player/Captain";
import { drawPanel } from "@ui/Panel";
import { drawLabel } from "@ui/Label";
import { drawButton } from "@ui/Button";
import { StationScene } from "./StationScene";
import type { Loadout } from "@core/ship/Loadout";
import type { ModuleDef } from "@core/ship/ModuleDef";
import { calcPowerBudget } from "@core/ship/PowerBudget";
import modulesData from "@content/modules.json";

const MODULES = modulesData as unknown as ModuleDef[];

export class ShipLoadoutScene extends Scene {
  constructor(
    readonly captain: CaptainState,
    readonly seed: number,
    readonly loadout: Loadout,
    readonly stationId: string,
  ) {
    super();
  }

  enter(_ctx: SceneContext): void {}

  update(ctx: SceneContext, _dt: number): void {
    if (ctx.input.wasKeyPressed("Escape")) {
      ctx.changeScene(new StationScene(this.captain, this.seed, this.loadout, this.stationId));
    }
  }

  render(ctx: SceneContext): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "#0a0d14");
    drawLabel(r, "SHIP LOADOUT", 10, 8, "#e6ecf5", 10);

    const hull = this.loadout.hull;
    const power = calcPowerBudget(this.loadout);
    const powerColor = power.overbudget ? "#d96a6a" : "#8fd97a";
    drawLabel(
      r,
      `Hull: ${hull.id}  |  Power: ${power.used}/${power.available}  (${power.overbudget ? "OVER" : "OK"})`,
      10, 24, powerColor, 7,
    );
    drawLabel(
      r,
      `Slots: W ${this.loadout.slotsUsed("weapon")}/${hull.slots.weapon}  I ${this.loadout.slotsUsed("internal")}/${hull.slots.internal}  U ${this.loadout.slotsUsed("utility")}/${hull.slots.utility}  C ${this.loadout.slotsUsed("core")}/${hull.slots.core}`,
      10, 36, "#cfd8e8", 7,
    );

    const leftPanel = { x: 10, y: 50, w: 290, h: r.internalHeight - 80 };
    const rightPanel = { x: 310, y: 50, w: 320, h: r.internalHeight - 80 };
    drawPanel(r, leftPanel);
    drawPanel(r, rightPanel);
    drawLabel(r, "INSTALLED", leftPanel.x + 8, leftPanel.y + 6, "#e6ecf5", 8);
    drawLabel(r, "AVAILABLE", rightPanel.x + 8, rightPanel.y + 6, "#e6ecf5", 8);

    const disabledStyle = { fill: "#1a1a22", fillHover: "#1a1a22", fillPressed: "#1a1a22", border: "#2a2a32", textColor: "#4a4a52" };

    const installed = this.loadout.installed();
    installed.forEach((mod, i) => {
      const row = { x: leftPanel.x + 8, y: leftPanel.y + 22 + i * 18, w: leftPanel.w - 16, h: 16 };
      drawButton(r, ctx.input, row, `[${mod.slot[0]!.toUpperCase()}] ${mod.name}`, () => {
        this.loadout.uninstall(mod);
      });
    });

    MODULES.forEach((mod, i) => {
      const row = { x: rightPanel.x + 8, y: rightPanel.y + 22 + i * 18, w: rightPanel.w - 16, h: 16 };
      const free = this.loadout.slotsFree(mod.slot) > 0;
      drawButton(r, ctx.input, row, `[${mod.slot[0]!.toUpperCase()}] ${mod.name}  (${mod.powerDraw}p)`, () => {
        if (free) this.loadout.install(mod);
      }, free ? undefined : disabledStyle);
    });

    drawLabel(r, "ESC back to station", r.internalWidth / 2, r.internalHeight - 10, "#506070", 6, "center");
  }
}