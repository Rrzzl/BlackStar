import { DebugOverlay } from "@engine/DebugOverlay";
import { RNG } from "@core/RNG";
import { Scene, type SceneContext } from "@engine/Scene";
import { WitnessCreationScene } from "./WitnessCreationScene";
import { CabinScene } from "./CabinScene";
import { drawSaveSlotPicker } from "./SaveSlotPickerOverlay";
import { SaveStore } from "@engine/Save";
import { migrations } from "@core/world/migrations";
import { drawButton } from "@ui/Button";

interface Star {
  x: number;
  y: number;
  color: string;
  twinklePhase: number;
  twinkleSpeed: number;
}

export class TitleScene extends Scene {
  private debug = new DebugOverlay();
  private stars: Star[] = [];
  private elapsed = 0;
  private readonly titleFadeIn = 1.2;
  private acceptInputAfter = 0.4;
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
  }

  enter(_ctx: SceneContext): void {}

  update(ctx: SceneContext, dt: number): void {
    this.debug.tick();
    this.elapsed += dt;
    if (ctx.input.wasKeyPressed("F3")) this.debug.enabled = !this.debug.enabled;
    if (!this.pickingSlot && this.elapsed >= this.acceptInputAfter) {
      for (const code of ["Space", "Enter", "KeyZ", "KeyX", "KeyW", "KeyA", "KeyS", "KeyD"]) {
        if (ctx.input.wasKeyPressed(code)) {
          ctx.changeScene(new WitnessCreationScene());
          return;
        }
      }
    }
  }

  render(ctx: SceneContext, _alpha: number): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "#04040a");

    for (const s of this.stars) {
      const twinkle = 0.6 + 0.4 * Math.sin(this.elapsed * s.twinkleSpeed + s.twinklePhase);
      const color = twinkle > 0.85 ? s.color : twinkle > 0.5 ? dim(s.color, 0.7) : dim(s.color, 0.4);
      r.drawRect(s.x, s.y, 1, 1, color);
    }

    const cx = r.internalWidth / 2;
    const cy = r.internalHeight / 2;

    const titleAlpha = Math.min(1, this.elapsed / this.titleFadeIn);
    const titleColor = fade("#c9a04b", titleAlpha);
    r.drawText("THE NINTH HEIR", cx - 64, cy - 28, titleColor, 16);

    if (this.elapsed > this.titleFadeIn * 0.6) {
      const subAlpha = Math.min(1, (this.elapsed - this.titleFadeIn * 0.6) / 0.8);
      r.drawText("plainly, and without mercy", cx - 68, cy - 4, fade("#8b7355", subAlpha), 8);
    }

    if (this.elapsed > this.titleFadeIn + 0.3) {
      const pulse = 0.5 + 0.5 * Math.sin(this.elapsed * 2.4);
      r.drawText("press space to begin", cx - 60, cy + 36, fade("#a08060", 0.35 + 0.65 * pulse), 8);
    }

    this.debug.render(r);

    if (this.elapsed > this.titleFadeIn + 0.6 && !this.pickingSlot) {
      drawButton(
        ctx.renderer,
        ctx.input,
        { x: cx - 40, y: cy + 52, w: 80, h: 16 },
        "Continue",
        () => { this.pickingSlot = true; },
      );
    }

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
            ctx.changeScene(new WitnessCreationScene());
          }
        },
        onCancel: () => { this.pickingSlot = false; },
      });
    }
  }
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
