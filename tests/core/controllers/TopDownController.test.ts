import { describe, expect, it } from "vitest";
import {
  updateTopDownController,
  type TopDownControllerConfig,
  type TopDownControllerState,
} from "@core/controllers/TopDownController";

const CFG: TopDownControllerConfig = {
  speed: 120,
  bounds: { x: 10, y: 20, w: 200, h: 160 },
};

function fresh(): TopDownControllerState {
  return { x: 50, y: 60, facing: "down" };
}

describe("TopDownController", () => {
  it("stays still without movement input", () => {
    const next = updateTopDownController(
      fresh(),
      { up: false, down: false, left: false, right: false },
      1,
      CFG,
    );

    expect(next).toEqual(fresh());
  });

  it("moves in a cardinal direction at configured speed", () => {
    const next = updateTopDownController(
      fresh(),
      { up: false, down: false, left: false, right: true },
      0.5,
      CFG,
    );

    expect(next.x).toBe(110);
    expect(next.y).toBe(60);
    expect(next.facing).toBe("right");
  });

  it("normalizes diagonal movement", () => {
    const next = updateTopDownController(
      { x: 50, y: 120, facing: "down" },
      { up: true, down: false, left: false, right: true },
      1,
      CFG,
    );

    const expected = 120 / Math.SQRT2;
    expect(next.x).toBeCloseTo(50 + expected, 5);
    expect(next.y).toBeCloseTo(120 - expected, 5);
    expect(next.facing).toBe("up");
  });

  it("clamps movement to rectangular bounds", () => {
    const next = updateTopDownController(
      { x: 205, y: 175, facing: "down" },
      { up: false, down: true, left: false, right: true },
      1,
      CFG,
    );

    expect(next.x).toBe(210);
    expect(next.y).toBe(180);
    expect(next.facing).toBe("down");
  });
});
