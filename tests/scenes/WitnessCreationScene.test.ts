import { describe, expect, it } from "vitest";
import { COVER_BACKGROUNDS, type WitnessProfile } from "@core/player/WitnessProfile";
import type { SceneContext } from "@engine/Scene";
import { CabinScene } from "@scenes/CabinScene";
import { applyWitnessNameInput, WitnessCreationScene } from "@scenes/WitnessCreationScene";

describe("applyWitnessNameInput", () => {
  it("appends supported key-code characters", () => {
    expect(applyWitnessNameInput("R", "KeyI")).toBe("RI");
    expect(applyWitnessNameInput("RICKY", "Digit7")).toBe("RICKY7");
  });

  it("removes the last character with Backspace", () => {
    expect(applyWitnessNameInput("RICKY", "Backspace")).toBe("RICK");
  });

  it("ignores unsupported edit keys", () => {
    expect(applyWitnessNameInput("RICKY", "ArrowDown")).toBeNull();
  });
});

describe("WitnessCreationScene flow", () => {
  it("passes the selected temporary Witness profile into CabinScene on confirm", () => {
    const scene = new WitnessCreationScene();
    const changes: unknown[] = [];
    let pressed = new Set<string>();
    const ctx = {
      input: {
        mouseX: -999,
        mouseY: -999,
        wasKeyPressed: (code: string) => pressed.has(code),
        isKeyDown: () => false,
        wasMousePressed: () => false,
      },
      renderer: {
        mouseToInternal: () => ({ x: -999, y: -999 }),
      },
      changeScene: (next: unknown) => changes.push(next),
    } as unknown as SceneContext;
    const press = (code: string): void => {
      pressed = new Set([code]);
      scene.update(ctx, 1 / 60);
      pressed = new Set();
    };

    press("ArrowDown");
    press("ArrowRight");
    press("ArrowDown");
    press("ArrowRight");
    press("ArrowDown");
    press("Enter");

    expect(changes[0]).toBeInstanceOf(CabinScene);
    expect((changes[0] as { profile?: WitnessProfile }).profile).toEqual({
      chosenName: "Witness",
      coverBackground: COVER_BACKGROUNDS[1],
      appearanceId: "order-robes-bone",
    });
  });
});
