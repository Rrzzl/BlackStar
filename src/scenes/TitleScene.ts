import { DebugOverlay } from "@engine/DebugOverlay";
import { RNG } from "@core/RNG";
import { Scene, type SceneContext } from "@engine/Scene";
import { WitnessCreationScene } from "./WitnessCreationScene";
import { CabinScene } from "./CabinScene";
import { drawSaveSlotPicker } from "./SaveSlotPickerOverlay";
import { SaveStore } from "@engine/Save";
import { migrations } from "@core/world/migrations";

interface Star {
  x: number;
  y: number;
  color: string;
  twinklePhase: number;
  twinkleSpeed: number;
}

type MenuKey = "new" | "continue" | "options";

interface MenuItem {
  key: MenuKey;
  label: string;
}

const MENU: readonly MenuItem[] = [
  { key: "new", label: "NEW WITNESS" },
  { key: "continue", label: "CONTINUE" },
  { key: "options", label: "OPTIONS" },
];

const SERIF = '"IM Fell English", "Book Antiqua", Georgia, serif';

const TITLE_COLOR = "#e8dcc4";
const SUBTITLE_COLOR = "#8b7355";
const MENU_SELECTED = "#c9a04b";
const MENU_IDLE = "#8b7355";
const MENU_DISABLED = "#3d2d21";

export class TitleScene extends Scene {
  private debug = new DebugOverlay();
  private stars: Star[] = [];
  private blackStarIdx = 0;
  private elapsed = 0;
  private readonly titleFadeIn = 1.2;
  private acceptInputAfter = 0.4;
  private selectedIdx = 0;
  private pickingSlot = false;

  constructor() {
    super();
    this.debug.enabled = false;
    const rng = new RNG(0xb1acc0de);
    const tiers = [
      { count: 140, color: "#1a1a28" },
      { count: 60, color: "#303048" },
      { count: 20, color: "#6a6a90" },
    ];
    for (const tier of tiers) {
      for (let i = 0; i < tier.count; i++) {
        this.stars.push({
          x: rng.int(0, 639),
          y: rng.int(0, 359),
          color: tier.color,
          twinklePhase: rng.range(0, Math.PI * 2),
          twinkleSpeed: rng.range(0.4, 1.6),
        });
      }
    }

    // Pick a star near the galactic core position (center-right) to render
    // subtly darker than its tier — the first unspoken hint of the Black Star.
    const anchorX = 640 * 0.66;
    const anchorY = 360 * 0.45;
    let bestDist = Infinity;
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i]!;
      const dx = s.x - anchorX;
      const dy = s.y - anchorY;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDist) {
        bestDist = d2;
        this.blackStarIdx = i;
      }
    }
  }

  enter(_ctx: SceneContext): void {}

  update(ctx: SceneContext, dt: number): void {
    this.debug.tick();
    this.elapsed += dt;
    if (ctx.input.wasKeyPressed("F3")) this.debug.enabled = !this.debug.enabled;

    if (this.pickingSlot) return;
    if (this.elapsed < this.acceptInputAfter) return;

    if (ctx.input.wasKeyPressed("ArrowUp") || ctx.input.wasKeyPressed("KeyW")) {
      this.selectedIdx = (this.selectedIdx + MENU.length - 1) % MENU.length;
    }
    if (ctx.input.wasKeyPressed("ArrowDown") || ctx.input.wasKeyPressed("KeyS")) {
      this.selectedIdx = (this.selectedIdx + 1) % MENU.length;
    }

    if (ctx.input.wasKeyPressed("Enter") || ctx.input.wasKeyPressed("Space")) {
      this.activate(ctx);
    }
  }

  private hasAnySave(): boolean {
    for (const id of SaveStore.SLOT_IDS) {
      if (SaveStore.loadFromSlot(id, migrations) !== null) return true;
    }
    return false;
  }

  private activate(ctx: SceneContext): void {
    const item = MENU[this.selectedIdx]!;
    switch (item.key) {
      case "new":
        ctx.changeScene(new WitnessCreationScene());
        return;
      case "continue":
        if (!this.hasAnySave()) return;
        this.pickingSlot = true;
        return;
      case "options":
        return;
    }
  }

  render(ctx: SceneContext, _alpha: number): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "#04040a");

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i]!;
      const osc = Math.sin(this.elapsed * s.twinkleSpeed + s.twinklePhase);
      if (i === this.blackStarIdx) {
        const pulse = 0.5 + 0.5 * osc;
        const factor = 0.12 + 0.18 * pulse;
        r.drawRect(s.x, s.y, 1, 1, dim(s.color, factor));
        continue;
      }
      const twinkle = 0.6 + 0.4 * osc;
      const color = twinkle > 0.85 ? s.color : twinkle > 0.5 ? dim(s.color, 0.7) : dim(s.color, 0.4);
      r.drawRect(s.x, s.y, 1, 1, color);
    }

    const cx = r.internalWidth / 2;

    const titleAlpha = Math.min(1, this.elapsed / this.titleFadeIn);
    const subAlpha = Math.min(1, Math.max(0, (this.elapsed - this.titleFadeIn * 0.6) / 0.8));

    drawSerif(r.ctx, "BLACK STAR", cx, 82, 30, SERIF, fade(TITLE_COLOR, titleAlpha), "center", 0.14);
    drawSerif(r.ctx, "The Ninth Heir", cx, 122, 13, SERIF, fade(SUBTITLE_COLOR, subAlpha), "center", 0.08, true);

    if (this.elapsed > this.titleFadeIn + 0.3 && !this.pickingSlot) {
      const canContinue = this.hasAnySave();
      const menuAlpha = Math.min(1, (this.elapsed - this.titleFadeIn - 0.3) / 0.6);
      for (let i = 0; i < MENU.length; i++) {
        const item = MENU[i]!;
        const disabled = item.key === "continue" && !canContinue;
        const selected = i === this.selectedIdx;
        const baseColor = disabled
          ? MENU_DISABLED
          : selected
            ? MENU_SELECTED
            : MENU_IDLE;
        const y = 196 + i * 20;
        const color = fade(baseColor, menuAlpha);
        drawSerif(r.ctx, item.label, cx, y, 14, SERIF, color, "center", 0.22);
        if (selected && !disabled) {
          // small bracketing marks flanking the selected line
          const halfW = item.label.length * 4.5 + 14;
          drawSerif(r.ctx, "\u2767", cx - halfW, y + 2, 10, SERIF, color, "center", 0);
          drawSerif(r.ctx, "\u2767", cx + halfW, y + 2, 10, SERIF, color, "center", 0);
        }
      }
    }

    this.debug.render(r);

    if (this.pickingSlot) {
      const slots = SaveStore.SLOT_IDS.map((id) => ({
        id,
        snap: SaveStore.loadFromSlot(id, migrations),
      }));
      drawSaveSlotPicker(ctx.renderer, ctx.input, {
        slots,
        onPick: (id) => {
          const snap = SaveStore.loadFromSlot(id, migrations);
          if (snap) {
            ctx.changeScene(new CabinScene());
          } else {
            this.pickingSlot = false;
          }
        },
        onCancel: () => { this.pickingSlot = false; },
      });
    }
  }
}

function drawSerif(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  family: string,
  color: string,
  align: CanvasTextAlign,
  letterSpacingEm: number,
  italic = false,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${italic ? "italic " : ""}${size}px ${family}`;
  ctx.textBaseline = "top";
  ctx.textAlign = align;
  if (letterSpacingEm > 0) {
    // manual letter-spacing: measure each char, advance by measured width + spacing.
    const spacing = size * letterSpacingEm;
    const chars = [...text];
    const widths = chars.map((c) => ctx.measureText(c).width);
    const total = widths.reduce((a, w) => a + w, 0) + spacing * Math.max(0, chars.length - 1);
    let cursorX = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
    ctx.textAlign = "left";
    for (let i = 0; i < chars.length; i++) {
      ctx.fillText(chars[i]!, cursorX, y);
      cursorX += widths[i]! + spacing;
    }
  } else {
    ctx.fillText(text, x, y);
  }
  ctx.restore();
}

function dim(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.floor(((n >> 16) & 0xff) * factor);
  const g = Math.floor(((n >> 8) & 0xff) * factor);
  const b = Math.floor((n & 0xff) * factor);
  return `rgb(${r},${g},${b})`;
}

function fade(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}
