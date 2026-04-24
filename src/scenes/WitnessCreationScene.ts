import { Scene, type SceneContext } from "@engine/Scene";
import {
  COVER_BACKGROUNDS,
  type WitnessProfile,
} from "@core/player/WitnessProfile";
import { drawLabel } from "@ui/Label";
import { CabinScene } from "./CabinScene";
import { TitleScene } from "./TitleScene";

type CreatorRow = "name" | "background" | "appearance" | "confirm";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface AppearanceOption {
  id: string;
  label: string;
  color: string;
}

const ROWS: readonly CreatorRow[] = ["name", "background", "appearance", "confirm"];

const APPEARANCES: readonly AppearanceOption[] = [
  { id: "order-robes-ash", label: "Order Robes / Ash", color: "#8a7a5c" },
  { id: "order-robes-bone", label: "Order Robes / Bone", color: "#c9b896" },
  { id: "order-robes-rust", label: "Order Robes / Rust Thread", color: "#6b2818" },
];

const MAX_NAME_LENGTH = 18;

export class WitnessCreationScene extends Scene {
  private selectedIdx = 0;
  private backgroundIdx = 0;
  private appearanceIdx = 0;
  private chosenName = "Witness";
  private editingName = false;

  enter(_ctx: SceneContext): void {}

  update(ctx: SceneContext, _dt: number): void {
    if (ctx.input.wasKeyPressed("Escape")) {
      ctx.changeScene(new TitleScene());
      return;
    }
    if (this.editingName) {
      this.updateNameEdit(ctx);
      return;
    }
    this.updateMouseRows(ctx);

    if (ctx.input.wasKeyPressed("ArrowUp") || ctx.input.wasKeyPressed("KeyW")) {
      this.selectedIdx = (this.selectedIdx + ROWS.length - 1) % ROWS.length;
    }
    if (ctx.input.wasKeyPressed("ArrowDown") || ctx.input.wasKeyPressed("KeyS")) {
      this.selectedIdx = (this.selectedIdx + 1) % ROWS.length;
    }

    const row = ROWS[this.selectedIdx]!;
    if (ctx.input.wasKeyPressed("ArrowLeft") || ctx.input.wasKeyPressed("KeyA")) {
      this.adjust(row, -1);
    }
    if (ctx.input.wasKeyPressed("ArrowRight") || ctx.input.wasKeyPressed("KeyD")) {
      this.adjust(row, 1);
    }

    if (ctx.input.wasKeyPressed("Enter") || ctx.input.wasKeyPressed("Space")) {
      this.activateRow(ctx, row);
    }
  }

  render(ctx: SceneContext, _alpha: number): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "#0a0604");
    drawLabel(r, "WITNESS CREATION", r.internalWidth / 2, 46, "#c9a04b", 12, "center");
    drawLabel(r, "Minimal front-door slice", r.internalWidth / 2, 64, "#8a7a5c", 7, "center");

    const panelX = 150;
    const panelY = 108;
    r.drawRect(panelX - 12, panelY - 18, 340, 170, "#140d09");
    r.drawRect(panelX - 10, panelY - 16, 336, 166, "#211510");

    this.drawRow(ctx, 0, `Name: ${this.chosenName}`);
    this.drawRow(ctx, 1, `Background: ${COVER_BACKGROUNDS[this.backgroundIdx]!}`);
    this.drawRow(ctx, 2, `Appearance: ${APPEARANCES[this.appearanceIdx]!.label}`);
    this.drawRow(ctx, 3, "CONFIRM CHARACTER");

    const appearance = APPEARANCES[this.appearanceIdx]!;
    r.drawRect(444, 126, 20, 28, appearance.color);
    r.drawRect(448, 116, 12, 10, "#c9b896");
    const help = this.editingName
      ? "Type name - Backspace deletes - Enter accepts"
      : "WASD / arrows or mouse select";
    drawLabel(r, help, r.internalWidth / 2, 286, "#5f5042", 7, "center");
    drawLabel(r, "Click or Enter activates selected row", r.internalWidth / 2, 300, "#5f5042", 7, "center");
  }

  private updateMouseRows(ctx: SceneContext): void {
    const mouse = ctx.renderer.mouseToInternal(ctx.input.mouseX, ctx.input.mouseY);
    for (let i = 0; i < ROWS.length; i++) {
      if (!contains(rowHitbox(i), mouse.x, mouse.y)) continue;
      this.selectedIdx = i;
      if (ctx.input.wasMousePressed(0)) {
        this.activateRow(ctx, ROWS[i]!);
      }
      return;
    }
  }

  private activateRow(ctx: SceneContext, row: CreatorRow): void {
    if (row === "name") {
      this.editingName = true;
      return;
    }
    if (row === "background" || row === "appearance") {
      this.adjust(row, 1);
      return;
    }
    if (row === "confirm") {
      ctx.changeScene(new CabinScene(this.profile()));
    }
  }

  private adjust(row: CreatorRow, delta: number): void {
    if (row === "background") {
      this.backgroundIdx = wrap(this.backgroundIdx + delta, COVER_BACKGROUNDS.length);
    }
    if (row === "appearance") {
      this.appearanceIdx = wrap(this.appearanceIdx + delta, APPEARANCES.length);
    }
  }

  private profile(): WitnessProfile {
    return {
      chosenName: this.chosenName.trim() || "Witness",
      coverBackground: COVER_BACKGROUNDS[this.backgroundIdx]!,
      appearanceId: APPEARANCES[this.appearanceIdx]!.id,
    };
  }

  private drawRow(ctx: SceneContext, idx: number, text: string): void {
    const r = ctx.renderer;
    const selected = idx === this.selectedIdx;
    const editing = idx === 0 && this.editingName;
    const rect = rowHitbox(idx);
    const x = rect.x + 4;
    const y = rect.y + 5;
    r.drawRect(rect.x, rect.y, rect.w, rect.h, selected ? "#322017" : "#211510");
    drawLabel(r, rowPrefix(selected, editing) + text + (editing ? "_" : ""), x, y, selected ? "#f4c57a" : "#e8dcc4", 8);
  }

  private updateNameEdit(ctx: SceneContext): void {
    if (ctx.input.wasKeyPressed("Enter")) {
      this.editingName = false;
      if (this.chosenName.trim().length === 0) this.chosenName = "Witness";
      return;
    }

    for (const code of NAME_INPUT_CODES) {
      if (!ctx.input.wasKeyPressed(code)) continue;
      const next = applyWitnessNameInput(this.chosenName, code);
      if (next !== null) {
        this.chosenName = next;
      }
      return;
    }
  }
}

export function applyWitnessNameInput(current: string, code: string): string | null {
  if (code === "Backspace") return current.slice(0, -1);
  if (current.length >= MAX_NAME_LENGTH) return null;
  if (code === "Space") return current.endsWith(" ") || current.length === 0 ? current : `${current} `;
  if (code.startsWith("Key") && code.length === 4) return `${current}${code.slice(3)}`;
  if (code.startsWith("Digit") && code.length === 6) return `${current}${code.slice(5)}`;
  return null;
}

function wrap(value: number, size: number): number {
  return (value + size) % size;
}

function rowPrefix(selected: boolean, editing: boolean): string {
  if (editing) return "* ";
  return selected ? "> " : "  ";
}

function rowHitbox(idx: number): Rect {
  return { x: 158, y: 103 + idx * 34, w: 304, h: 22 };
}

function contains(rect: Rect, x: number, y: number): boolean {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

const NAME_INPUT_CODES = [
  "Backspace",
  "Space",
  "Digit0",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
  "Digit6",
  "Digit7",
  "Digit8",
  "Digit9",
  "KeyA",
  "KeyB",
  "KeyC",
  "KeyD",
  "KeyE",
  "KeyF",
  "KeyG",
  "KeyH",
  "KeyI",
  "KeyJ",
  "KeyK",
  "KeyL",
  "KeyM",
  "KeyN",
  "KeyO",
  "KeyP",
  "KeyQ",
  "KeyR",
  "KeyS",
  "KeyT",
  "KeyU",
  "KeyV",
  "KeyW",
  "KeyX",
  "KeyY",
  "KeyZ",
] as const;
