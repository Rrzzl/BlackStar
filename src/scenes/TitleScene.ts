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

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const MENU: readonly MenuItem[] = [
  { key: "new", label: "NEW WITNESS" },
  { key: "continue", label: "CONTINUE" },
  { key: "options", label: "OPTIONS" },
];

const SERIF = '"IM Fell English", "Book Antiqua", Georgia, serif';

const TITLE_COLOR = "#e8dcc4";
const TITLE_GOLD = "#c9a04b";
const SUBTITLE_COLOR = "#c9b896";
const MENU_SELECTED = "#c9a04b";
const MENU_IDLE = "#9b8562";
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
    if (ctx.input.wasKeyPressed("Escape") && this.pickingSlot) {
      this.pickingSlot = false;
      return;
    }

    if (this.pickingSlot) return;
    if (this.elapsed < this.acceptInputAfter) return;

    this.updateMouseMenu(ctx);

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

  private updateMouseMenu(ctx: SceneContext): void {
    if (this.elapsed <= this.titleFadeIn + 0.3) return;

    const mouse = ctx.renderer.mouseToInternal(ctx.input.mouseX, ctx.input.mouseY);
    const cx = ctx.renderer.internalWidth / 2;
    for (let i = 0; i < MENU.length; i++) {
      if (!contains(menuHitbox(cx, i), mouse.x, mouse.y)) continue;
      this.selectedIdx = i;
      if (ctx.input.wasMousePressed(0)) {
        this.activate(ctx);
      }
      return;
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
    drawBackground(r.ctx, r.internalWidth, r.internalHeight, this.elapsed);

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
    drawShipSilhouette(r.ctx, this.elapsed);
    drawImperialFrame(r.ctx, r.internalWidth, r.internalHeight);
    drawSignet(r.ctx, cx, 150, 22, fade(TITLE_GOLD, 0.2));

    const titleAlpha = Math.min(1, this.elapsed / this.titleFadeIn);
    const subAlpha = Math.min(1, Math.max(0, (this.elapsed - this.titleFadeIn * 0.6) / 0.8));

    drawGlowSerif(r.ctx, "BLACK STAR", cx, 74, 34, fade(TITLE_COLOR, titleAlpha), fade(TITLE_GOLD, titleAlpha * 0.2), "center");
    drawSerif(r.ctx, "THE NINTH HEIR", cx, 118, 12, SERIF, fade(SUBTITLE_COLOR, subAlpha), "center", 0);
    drawTitleRule(r.ctx, cx, 139, subAlpha);

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
        const hitbox = menuHitbox(cx, i);
        if (selected && !disabled) {
          r.drawRect(hitbox.x, hitbox.y, hitbox.w, hitbox.h, fade("#15100d", menuAlpha * 0.78));
          drawMenuLine(r.ctx, hitbox, fade(TITLE_GOLD, menuAlpha * 0.32));
        }
        const color = fade(baseColor, menuAlpha);
        drawSerif(r.ctx, item.label, cx, y, 14, SERIF, color, "center", 0);
        if (selected && !disabled) {
          const halfW = item.label.length * 4.5 + 14;
          drawSignet(r.ctx, cx - halfW, y + 6, 4, color);
          drawSignet(r.ctx, cx + halfW, y + 6, 4, color);
        }
      }
    }

    drawFooter(r.ctx, r.internalWidth, r.internalHeight);
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

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, elapsed: number): void {
  const sky = ctx.createLinearGradient(0, 0, w, h);
  sky.addColorStop(0, "#030408");
  sky.addColorStop(0.48, "#070910");
  sky.addColorStop(1, "#010103");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const band = ctx.createLinearGradient(70, 30, 560, 290);
  band.addColorStop(0, "rgba(20, 18, 32, 0)");
  band.addColorStop(0.35, "rgba(52, 45, 62, 0.12)");
  band.addColorStop(0.62, "rgba(42, 36, 32, 0.09)");
  band.addColorStop(1, "rgba(20, 18, 32, 0)");
  ctx.fillStyle = band;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-0.16 + Math.sin(elapsed * 0.05) * 0.01);
  ctx.fillRect(-360, -18, 720, 42);
  ctx.restore();

  const vignette = ctx.createRadialGradient(w / 2, h / 2, 70, w / 2, h / 2, 330);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(0.72, "rgba(0, 0, 0, 0.38)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.88)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

function drawShipSilhouette(ctx: CanvasRenderingContext2D, elapsed: number): void {
  const x = 76 + ((elapsed * 5) % 120);
  const y = 244 + Math.sin(elapsed * 0.4) * 1.5;
  ctx.save();
  ctx.fillStyle = "rgba(8, 7, 6, 0.92)";
  ctx.strokeStyle = "rgba(201, 184, 150, 0.16)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 34, y - 6);
  ctx.lineTo(x + 58, y + 1);
  ctx.lineTo(x + 35, y + 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(201, 160, 75, 0.18)";
  ctx.fillRect(x + 10, y - 1, 5, 1);
  ctx.restore();
}

function drawImperialFrame(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.save();
  ctx.strokeStyle = "rgba(201, 160, 75, 0.22)";
  ctx.lineWidth = 1;
  ctx.strokeRect(16.5, 14.5, w - 33, h - 29);
  ctx.strokeStyle = "rgba(201, 184, 150, 0.08)";
  ctx.strokeRect(24.5, 22.5, w - 49, h - 45);

  ctx.fillStyle = "rgba(201, 160, 75, 0.18)";
  const corners = [
    [16, 14], [w - 16, 14], [16, h - 15], [w - 16, h - 15],
  ] as const;
  for (const [x, y] of corners) {
    ctx.fillRect(x - 1, y - 1, 3, 3);
  }
  ctx.restore();
}

function drawGlowSerif(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  glow: string,
  align: CanvasTextAlign,
): void {
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = 10;
  drawSerif(ctx, text, x, y, size, SERIF, color, align, 0);
  ctx.restore();
}

function drawTitleRule(ctx: CanvasRenderingContext2D, cx: number, y: number, alpha: number): void {
  ctx.save();
  ctx.strokeStyle = fade(TITLE_GOLD, alpha * 0.32);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 86, y + 0.5);
  ctx.lineTo(cx - 20, y + 0.5);
  ctx.moveTo(cx + 20, y + 0.5);
  ctx.lineTo(cx + 86, y + 0.5);
  ctx.stroke();
  drawSignet(ctx, cx, y + 1, 6, fade(TITLE_GOLD, alpha * 0.46));
  ctx.restore();
}

function drawMenuLine(ctx: CanvasRenderingContext2D, rect: Rect, color: string): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rect.x + 18, rect.y + rect.h - 1.5);
  ctx.lineTo(rect.x + rect.w - 18, rect.y + rect.h - 1.5);
  ctx.stroke();
  ctx.restore();
}

function drawFooter(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  drawSerif(ctx, "VER. 0.1.0", 30, h - 28, 8, SERIF, "rgba(201, 184, 150, 0.42)", "left", 0);
  drawSerif(ctx, "IX", w / 2, h - 30, 9, SERIF, "rgba(201, 160, 75, 0.36)", "center", 0);
}

function drawSignet(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x, y, radius - i * (radius / 3), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
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

function menuHitbox(cx: number, idx: number): Rect {
  return { x: cx - 92, y: 190 + idx * 20, w: 184, h: 20 };
}

function contains(rect: Rect, x: number, y: number): boolean {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}
