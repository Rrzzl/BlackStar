import { Scene, type SceneContext } from "@engine/Scene";
import type { CaptainState } from "@core/player/Captain";
import { drawPanel } from "@ui/Panel";
import { drawLabel } from "@ui/Label";
import { drawButton } from "@ui/Button";
import { SpaceScene } from "./SpaceScene";
import { ShipLoadoutScene } from "./ShipLoadoutScene";
import { drawPauseOverlay } from "./PauseOverlay";
import { TitleScene } from "./TitleScene";
import { CURRENT_SAVE_VERSION, type SaveSnapshot } from "@core/world/SaveSnapshot";
import type { Loadout } from "@core/ship/Loadout";
import { drawSaveSlotPicker } from "./SaveSlotPickerOverlay";
import { SaveStore } from "@engine/Save";
import { migrations } from "@core/world/migrations";

export class StationScene extends Scene {
  private paused = false;
  private savingSlot = false;

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
    if (ctx.input.wasKeyPressed("KeyP")) {
      this.paused = !this.paused;
      return;
    }
    if (this.paused) return;
    if (ctx.input.wasKeyPressed("Escape")) {
      ctx.changeScene(new SpaceScene(this.captain, this.seed, this.loadout, this.stationId));
    }
  }

  render(ctx: SceneContext): void {
    const r = ctx.renderer;
    const showPicker = this.paused && this.savingSlot;
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "#0a0d14");
    const panel = { x: 40, y: 30, w: r.internalWidth - 80, h: r.internalHeight - 60 };
    drawPanel(r, panel);
    drawLabel(r, `STATION — ${this.stationId.toUpperCase()}`, panel.x + 10, panel.y + 10, "#e6ecf5", 10);
    drawLabel(r, `${this.captain.name}, Captain`, panel.x + 10, panel.y + 28, "#8a98b0", 7);

    const btnW = 120;
    const btnH = 18;
    const btnX = panel.x + 20;
    let by = panel.y + 60;

    drawButton(r, ctx.input, { x: btnX, y: by, w: btnW, h: btnH }, "Ship Loadout", () => {
      ctx.changeScene(new ShipLoadoutScene(this.captain, this.seed, this.loadout, this.stationId));
    });
    by += 24;

    const disabledStyle = { fill: "#1a1a22", fillHover: "#1a1a22", fillPressed: "#1a1a22", border: "#2a2a32", textColor: "#4a4a52" };

    drawButton(r, ctx.input, { x: btnX, y: by, w: btnW, h: btnH }, "Shop (M2c)", () => {}, disabledStyle);
    by += 24;

    drawButton(r, ctx.input, { x: btnX, y: by, w: btnW, h: btnH }, "Missions (M2c)", () => {}, disabledStyle);
    by += 24;

    drawButton(r, ctx.input, { x: btnX, y: by, w: btnW, h: btnH }, "Depart", () => {
      ctx.changeScene(new SpaceScene(this.captain, this.seed, this.loadout, this.stationId));
    });

    drawLabel(r, "ESC depart · P pause", r.internalWidth / 2, r.internalHeight - 10, "#506070", 6, "center");

    if (this.paused && !showPicker) {
      drawPauseOverlay(r, ctx.input, {
        onResume: () => { this.paused = false; },
        onSave: () => { this.savingSlot = true; },
        onQuit: () => ctx.changeScene(new TitleScene()),
      });
    }

    if (showPicker) {
      drawSaveSlotPicker(ctx.renderer, ctx.input, {
        slots: SaveStore.SLOT_IDS.map((id) => ({ id, snap: SaveStore.loadFromSlot(id, migrations) })),
        onPick: (id) => {
          SaveStore.saveToSlot(id, this.buildSnapshot(ctx));
          this.savingSlot = false;
        },
        onCancel: () => { this.savingSlot = false; },
        title: "SAVE TO SLOT",
      });
    }
  }

  private buildSnapshot(ctx: SceneContext): SaveSnapshot {
    return {
      version: CURRENT_SAVE_VERSION,
      seed: this.seed,
      worldClock: ctx.worldClock.elapsed(),
      captain: this.captain,
      ship: {
        hullId: "shrike",
        moduleIds: [],
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        angle: 0,
        hp: 100,
        shield: 50,
        credits: 500,
        cargo: [],
      },
      sector: {
        id: "grayline-reach",
        playerBody: this.stationId,
        traders: [],
        stockpiles: [],
      },
      inventory: { items: [] },
      factions: { free_worlds: { rep: 0 }, scrapfather: { rep: 0 } },
      quests: { active: [], completed: [] },
      outposts: {},
      scene: { type: "StationScene", params: { stationId: this.stationId } },
    };
  }
}
