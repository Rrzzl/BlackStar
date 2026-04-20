import { describe, it, expect } from "vitest";
import { loadTiledMap, type TiledMap } from "@core/platformer/TiledLoader";

const FIXTURE: TiledMap = {
  width: 4,
  height: 3,
  tilewidth: 16,
  tileheight: 16,
  layers: [
    {
      name: "collision",
      type: "tilelayer",
      width: 4,
      height: 3,
      data: [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
    },
    {
      name: "objects",
      type: "objectgroup",
      objects: [
        { name: "spawn", type: "player_spawn", x: 16, y: 24, width: 0, height: 0 },
        { name: "out",   type: "exit",         x: 48, y: 24, width: 0, height: 0 },
      ],
    },
  ],
};

describe("TiledLoader", () => {
  it("returns a TileMap matching the fixture dimensions", () => {
    const { map } = loadTiledMap(FIXTURE);
    expect(map.width).toBe(4);
    expect(map.height).toBe(3);
    expect(map.tileSize).toBe(16);
  });

  it("maps any non-zero Tiled tile to internal tile id 1", () => {
    const { map } = loadTiledMap(FIXTURE);
    expect(map.isSolid(0, 0)).toBe(true);
    expect(map.isSolid(1, 1)).toBe(false);
  });

  it("extracts objects with type, x, y", () => {
    const { objects } = loadTiledMap(FIXTURE);
    expect(objects).toHaveLength(2);
    expect(objects[0]!.type).toBe("player_spawn");
    expect(objects[0]!.x).toBe(16);
    expect(objects[0]!.y).toBe(24);
    expect(objects[1]!.type).toBe("exit");
  });

  it("throws when the collision layer is missing", () => {
    const bad = { ...FIXTURE, layers: [FIXTURE.layers[1]!] };
    expect(() => loadTiledMap(bad as unknown as TiledMap)).toThrow();
  });
});
