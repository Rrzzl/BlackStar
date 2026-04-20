import { describe, it, expect } from "vitest";
import { loadTiledMap } from "@core/platformer/TiledLoader";
import entryRoom from "@content/planets/kepler-7b/entry.tmj.json";
import type { TiledMap } from "@core/platformer/TiledLoader";

describe("Kepler-7b entry room", () => {
  const { map, objects } = loadTiledMap(entryRoom as unknown as TiledMap);

  it("is 20 tiles wide by 12 tall at 16px", () => {
    expect(map.width).toBe(20);
    expect(map.height).toBe(12);
    expect(map.tileSize).toBe(16);
  });

  it("has solid walls on all four edges", () => {
    for (let x = 0; x < map.width; x++) {
      expect(map.isSolid(x, 0)).toBe(true);
      expect(map.isSolid(x, map.height - 1)).toBe(true);
    }
    for (let y = 0; y < map.height; y++) {
      expect(map.isSolid(0, y)).toBe(true);
      expect(map.isSolid(map.width - 1, y)).toBe(true);
    }
  });

  it("has a player spawn and an exit", () => {
    const spawn = objects.find((o) => o.type === "player_spawn");
    const exit = objects.find((o) => o.type === "exit");
    expect(spawn).toBeDefined();
    expect(exit).toBeDefined();
  });
});
