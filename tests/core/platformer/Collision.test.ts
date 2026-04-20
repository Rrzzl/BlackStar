import { describe, it, expect } from "vitest";
import { TileMap } from "@core/platformer/TileMap";
import { resolveAABB, type CollisionResult } from "@core/platformer/Collision";

//  tile 1 = solid. tile size 16.
//  12 tiles wide, 6 tall. Walls on all edges, open interior.
function makeRoom(): TileMap {
  const w = 12, h = 6;
  const tiles: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      tiles.push(x === 0 || y === 0 || x === w - 1 || y === h - 1 ? 1 : 0);
    }
  }
  return new TileMap({ width: w, height: h, tileSize: 16, tiles });
}

describe("Collision", () => {
  it("passes through empty space unchanged", () => {
    const map = makeRoom();
    const r: CollisionResult = resolveAABB(
      { x: 32, y: 32, w: 12, h: 14 },
      { dx: 4, dy: 0 },
      map,
    );
    expect(r.x).toBe(36);
    expect(r.y).toBe(32);
    expect(r.onGround).toBe(false);
    expect(r.onLeftWall).toBe(false);
    expect(r.onRightWall).toBe(false);
  });

  it("stops at right wall and flags onRightWall", () => {
    const map = makeRoom();
    const r = resolveAABB(
      { x: 32, y: 32, w: 12, h: 14 },
      { dx: 200, dy: 0 },
      map,
    );
    // Wall column 11 starts at pixel 176. Body (w=12) rests with right edge at 176 → x=164.
    expect(r.x).toBe(164);
    expect(r.onRightWall).toBe(true);
  });

  it("stops on floor and flags onGround", () => {
    const map = makeRoom();
    const r = resolveAABB(
      { x: 32, y: 32, w: 12, h: 14 },
      { dx: 0, dy: 200 },
      map,
    );
    // floor row is y=5 (pixels 80..96). AABB bottom should rest at 80.
    expect(r.y + 14).toBeCloseTo(80);
    expect(r.onGround).toBe(true);
  });

  it("resolves corner cases by sweeping X then Y independently", () => {
    const map = makeRoom();
    const r = resolveAABB(
      { x: 32, y: 32, w: 12, h: 14 },
      { dx: -200, dy: 200 },
      map,
    );
    expect(r.x).toBeGreaterThanOrEqual(16);
    expect(r.y + 14).toBeCloseTo(80);
    expect(r.onGround).toBe(true);
    expect(r.onLeftWall).toBe(true);
  });

  it("hits ceiling and flags onCeiling", () => {
    const map = makeRoom();
    const r = resolveAABB(
      { x: 32, y: 32, w: 12, h: 14 },
      { dx: 0, dy: -200 },
      map,
    );
    expect(r.y).toBeGreaterThanOrEqual(16);
    expect(r.onCeiling).toBe(true);
  });
});
