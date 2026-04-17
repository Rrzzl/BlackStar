import { describe, it, expect } from "vitest";
import { circleHit } from "@core/combat/Hit";

describe("circleHit", () => {
  it("returns true when circles overlap", () => {
    expect(circleHit({ x: 0, y: 0, r: 5 }, { x: 8, y: 0, r: 5 })).toBe(true);
  });

  it("returns false when circles are apart", () => {
    expect(circleHit({ x: 0, y: 0, r: 5 }, { x: 20, y: 0, r: 5 })).toBe(false);
  });

  it("returns true when circles exactly touch", () => {
    expect(circleHit({ x: 0, y: 0, r: 5 }, { x: 10, y: 0, r: 5 })).toBe(true);
  });

  it("handles 2D offsets", () => {
    expect(circleHit({ x: 0, y: 0, r: 5 }, { x: 3, y: 4, r: 1 })).toBe(true);
    expect(circleHit({ x: 0, y: 0, r: 2 }, { x: 3, y: 4, r: 2 })).toBe(false);
  });
});
