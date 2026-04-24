import type { Assets } from "@engine/Assets";

export const WITNESS_FRONT_IDLE_SPRITE_PATH = "assets/sprites/witness/witness_front_idle_32x48.png";
export const WITNESS_FRONT_IDLE_SPRITE_URL = `/${WITNESS_FRONT_IDLE_SPRITE_PATH}`;
export const WITNESS_FRONT_IDLE_SPRITE_SIZE = { w: 32, h: 48 } as const;

export type WitnessSpriteStatus = "idle" | "loading" | "ready" | "failed";

export class WitnessFrontIdleSprite {
  private image: HTMLImageElement | null = null;
  private statusValue: WitnessSpriteStatus = "idle";

  get current(): HTMLImageElement | null {
    return this.image;
  }

  get status(): WitnessSpriteStatus {
    return this.statusValue;
  }

  async load(assets: Pick<Assets, "loadImage">): Promise<void> {
    if (this.statusValue !== "idle") return;

    this.statusValue = "loading";
    try {
      this.image = await assets.loadImage(WITNESS_FRONT_IDLE_SPRITE_URL);
      this.statusValue = "ready";
    } catch {
      this.image = null;
      this.statusValue = "failed";
    }
  }
}
