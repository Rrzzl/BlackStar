import { describe, it, expect } from "vitest";
import { generateDungeon, type Dungeon } from "@core/procgen/DungeonGen";
import type { RoomDef } from "@core/procgen/RoomDef";
import roomsData from "@content/rooms.json";

const ROOMS = roomsData as RoomDef[];

describe("DungeonGen", () => {
  it("produces 5 to 8 rooms", () => {
    const d = generateDungeon(1234, ROOMS);
    expect(d.rooms.length).toBeGreaterThanOrEqual(5);
    expect(d.rooms.length).toBeLessThanOrEqual(8);
  });

  it("is deterministic on seed", () => {
    const a = generateDungeon(1234, ROOMS);
    const b = generateDungeon(1234, ROOMS);
    expect(a.rooms.map((r) => r.templateId)).toEqual(b.rooms.map((r) => r.templateId));
    expect(a.start).toBe(b.start);
  });

  it("differs across seeds", () => {
    const a = generateDungeon(1, ROOMS);
    const b = generateDungeon(99999, ROOMS);
    const ids = (d: Dungeon): string => d.rooms.map((r) => r.templateId).join("|");
    expect(ids(a)).not.toBe(ids(b));
  });

  it("every room is reachable from start", () => {
    const d = generateDungeon(1234, ROOMS);
    const visited = new Set<number>();
    const queue: number[] = [d.start];
    while (queue.length > 0) {
      const idx = queue.shift()!;
      if (visited.has(idx)) continue;
      visited.add(idx);
      for (const neighbor of d.rooms[idx]!.doors) queue.push(neighbor);
    }
    expect(visited.size).toBe(d.rooms.length);
  });

  it("start room index is within bounds", () => {
    const d = generateDungeon(1234, ROOMS);
    expect(d.start).toBeGreaterThanOrEqual(0);
    expect(d.start).toBeLessThan(d.rooms.length);
  });
});
