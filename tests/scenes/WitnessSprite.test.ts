import { describe, expect, it, vi } from "vitest";
import {
  WITNESS_FRONT_IDLE_SPRITE_PATH,
  WITNESS_FRONT_IDLE_SPRITE_URL,
  WitnessFrontIdleSprite,
} from "@scenes/WitnessSprite";

describe("WitnessFrontIdleSprite", () => {
  it("requests the reserved Witness front-idle PNG path", async () => {
    const image = {} as HTMLImageElement;
    const loadImage = vi.fn(async () => image);
    const sprite = new WitnessFrontIdleSprite();

    await sprite.load({ loadImage });

    expect(WITNESS_FRONT_IDLE_SPRITE_PATH).toBe("assets/sprites/witness/witness_front_idle_32x48.png");
    expect(WITNESS_FRONT_IDLE_SPRITE_URL).toBe(`/${WITNESS_FRONT_IDLE_SPRITE_PATH}`);
    expect(loadImage).toHaveBeenCalledOnce();
    expect(loadImage).toHaveBeenCalledWith(WITNESS_FRONT_IDLE_SPRITE_URL);
    expect(sprite.status).toBe("ready");
    expect(sprite.current).toBe(image);
  });

  it("keeps fallback active when the PNG is missing", async () => {
    const loadImage = vi.fn(async () => {
      throw new Error("missing sprite");
    });
    const sprite = new WitnessFrontIdleSprite();

    await expect(sprite.load({ loadImage })).resolves.toBeUndefined();

    expect(sprite.status).toBe("failed");
    expect(sprite.current).toBeNull();
  });

  it("does not retry after the first load attempt", async () => {
    const image = {} as HTMLImageElement;
    const loadImage = vi.fn(async () => image);
    const sprite = new WitnessFrontIdleSprite();

    await sprite.load({ loadImage });
    await sprite.load({ loadImage });

    expect(loadImage).toHaveBeenCalledOnce();
  });
});
