import { describe, it, expect } from "vitest";
import { TileMap } from "@core/platformer/TileMap";

describe("TileMap", () => {
  const map = new TileMap({
    width: 4,
    height: 3,
    tileSize: 16,
    tiles: [
      1, 1, 1, 1,
      1, 0, 0, 1,
      1, 1, 1, 1,
    ],
  });

  it("returns the tile id at a given grid cell", () => {
    expect(map.tileAt(1, 1)).toBe(0);
    expect(map.tileAt(0, 0)).toBe(1);
  });

  it("returns 1 (solid) for out-of-bounds queries", () => {
    expect(map.tileAt(-1, 0)).toBe(1);
    expect(map.tileAt(0, -1)).toBe(1);
    expect(map.tileAt(4, 0)).toBe(1);
    expect(map.tileAt(0, 3)).toBe(1);
  });

  it("isSolid true for wall, false for empty", () => {
    expect(map.isSolid(0, 0)).toBe(true);
    expect(map.isSolid(1, 1)).toBe(false);
  });

  it("isSolidAtPixel converts pixel coords to tile coords", () => {
    expect(map.isSolidAtPixel(8, 8)).toBe(true);
    expect(map.isSolidAtPixel(24, 24)).toBe(false);
  });

  it("exposes width, height, tileSize as readonly", () => {
    expect(map.width).toBe(4);
    expect(map.height).toBe(3);
    expect(map.tileSize).toBe(16);
  });
});
