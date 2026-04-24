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
    this.drawBackground(ctx);
    this.drawDocument(ctx);

    drawLabel(r, "WITNESS INTAKE", r.internalWidth / 2, 34, "#e4c77e", 14, "center");
    drawLabel(r, "ORDER COVER RECORD", r.internalWidth / 2, 54, "#a99b7b", 8, "center");
    drawLabel(r, "FORM IX / TEMPORARY WITNESS REGISTER", r.internalWidth / 2, 72, "#6f675b", 6, "center");

    this.drawRow(ctx, 0, `Inscribed Name: ${this.chosenName}`);
    this.drawRow(ctx, 1, `Prepared Cover: ${COVER_BACKGROUNDS[this.backgroundIdx]!}`);
    this.drawRow(ctx, 2, `Registry Mark: ${APPEARANCES[this.appearanceIdx]!.label}`);
    this.drawRow(ctx, 3, "SEAL IDENTITY");

    this.drawRegistryPreview(ctx);

    const help = this.editingName
      ? "Type inscription - Backspace deletes - Enter accepts"
      : "WASD / arrows or mouse select";
    drawLabel(r, help, r.internalWidth / 2, 286, "#9c927d", 7, "center");
    drawLabel(r, "Click or Enter activates selected row", r.internalWidth / 2, 300, "#6f675b", 7, "center");
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
    r.drawRect(rect.x, rect.y, rect.w, rect.h, selected ? "#332217" : "#171b21");
    strokeRect(r.ctx, rect.x, rect.y, rect.w, rect.h, selected ? "#c0a05e" : "#443624");
    if (selected) {
      r.drawRect(rect.x - 7, rect.y + 4, 2, rect.h - 8, "#8f3a28");
      r.drawRect(rect.x + rect.w + 5, rect.y + 4, 2, rect.h - 8, "#8f3a28");
    }
    drawLabel(r, rowPrefix(selected, editing) + text + (editing ? "_" : ""), x, y, selected ? "#f4dfb3" : "#d8ceb8", 8);
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

  private drawBackground(ctx: SceneContext): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "#03060d");
    r.drawRect(0, 0, r.internalWidth, 92, "#050a13");
    r.drawRect(0, 256, r.internalWidth, 104, "#020306");

    for (let i = 0; i < 18; i++) {
      const x = (i * 41 + 19) % r.internalWidth;
      const y = (i * 67 + 31) % r.internalHeight;
      r.drawRect(x, y, 1, 1, i % 3 === 0 ? "#b9a15f" : "#263246");
    }

    r.drawRect(38, 80, 564, 1, "#141a24");
    r.drawRect(40, 318, 560, 1, "#17100d");
    r.drawRect(70, 86, 2, 216, "#401d18");
    r.drawRect(74, 86, 1, 216, "#7e3325");
  }

  private drawDocument(ctx: SceneContext): void {
    const r = ctx.renderer;
    r.drawRect(118, 88, 404, 182, "#11151b");
    r.drawRect(126, 96, 388, 166, "#17140f");
    strokeRect(r.ctx, 118, 88, 404, 182, "#332a22");
    strokeRect(r.ctx, 126, 96, 388, 166, "#a4844c");
    strokeRect(r.ctx, 134, 104, 372, 150, "#433323");

    r.drawRect(146, 114, 334, 1, "#5a4a32");
    r.drawRect(146, 242, 334, 1, "#5a4a32");
    r.drawRect(134, 104, 22, 1, "#c0a05e");
    r.drawRect(484, 104, 22, 1, "#c0a05e");
    r.drawRect(134, 254, 22, 1, "#c0a05e");
    r.drawRect(484, 254, 22, 1, "#c0a05e");

    this.drawSignet(ctx, 100, 112, 19);
    this.drawSignet(ctx, 540, 236, 23);
  }

  private drawRegistryPreview(ctx: SceneContext): void {
    const r = ctx.renderer;
    const appearance = APPEARANCES[this.appearanceIdx]!;
    const registryLabels = appearance.label.toUpperCase().split(" / ");
    const robeLabel = registryLabels[0] ?? "ORDER ROBES";
    const threadLabel = registryLabels[1] ?? "MARK";
    r.drawRect(424, 122, 58, 80, "#0d1117");
    strokeRect(r.ctx, 424, 122, 58, 80, "#8c7247");
    strokeRect(r.ctx, 430, 128, 46, 68, "#332b21");
    r.drawRect(437, 137, 32, 45, "#07090d");
    r.drawRect(449, 144, 10, 10, "#c9b896");
    r.drawRect(443, 156, 22, 20, appearance.color);
    r.drawRect(447, 176, 14, 4, "#1a0d0b");
    r.drawRect(437, 186, 32, 1, "#5c4a31");

    drawLabel(r, "REGISTRY", 453, 215, "#9f927a", 7, "center");
    drawLabel(r, robeLabel, 453, 228, "#6f675b", 5, "center");
    drawLabel(r, threadLabel, 453, 238, "#6f675b", 5, "center");
  }

  private drawSignet(ctx: SceneContext, x: number, y: number, radius: number): void {
    strokeCircle(ctx.renderer.ctx, x, y, radius, "#4b3925");
    strokeCircle(ctx.renderer.ctx, x, y, Math.max(4, radius - 6), "#7e3325");
    strokeCircle(ctx.renderer.ctx, x, y, Math.max(2, radius - 12), "#a4844c");
    ctx.renderer.drawRect(x - 1, y - radius + 5, 2, radius * 2 - 10, "#261714");
    ctx.renderer.drawRect(x - radius + 5, y - 1, radius * 2 - 10, 2, "#261714");
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

function strokeRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w, h);
}

function strokeCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
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
