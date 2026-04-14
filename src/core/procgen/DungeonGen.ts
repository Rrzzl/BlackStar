import { RNG } from "@core/RNG";
import type { RoomDef } from "./RoomDef";

export interface PlacedRoom {
  templateId: string;
  doors: number[];
}

export interface Dungeon {
  rooms: PlacedRoom[];
  start: number;
}

export function generateDungeon(seed: number, templates: readonly RoomDef[]): Dungeon {
  if (templates.length === 0) throw new Error("generateDungeon: empty template list");
  const rng = new RNG(seed);
  const count = rng.int(5, 8);
  const rooms: PlacedRoom[] = [];

  for (let i = 0; i < count; i++) {
    const template = rng.pick(templates);
    rooms.push({ templateId: template.id, doors: [] });
    if (i > 0) {
      const parentIdx = rng.int(0, i - 1);
      rooms[i]!.doors.push(parentIdx);
      rooms[parentIdx]!.doors.push(i);
    }
  }

  const start = rng.int(0, count - 1);
  return { rooms, start };
}
