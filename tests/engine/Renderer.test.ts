import { describe, expect, it } from "vitest";
import { internalPointFromCssPoint } from "@engine/Renderer";

describe("internalPointFromCssPoint", () => {
  it("maps CSS canvas center to internal center independently of backing resolution", () => {
    expect(internalPointFromCssPoint(640, 360, 1280, 720, 640, 360)).toEqual({
      x: 320,
      y: 180,
    });
  });

  it("accounts for letterboxed canvas space in CSS pixels", () => {
    const point = internalPointFromCssPoint(500, 360, 1000, 720, 640, 360);

    expect(point.x).toBeCloseTo(320, 5);
    expect(point.y).toBeCloseTo(180, 5);
  });
});
