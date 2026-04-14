export interface RoomDef {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: string[];
}

export type Tile = "#" | "." | "+" | "S";

export function tileAt(room: RoomDef, x: number, y: number): Tile {
  if (x < 0 || y < 0 || x >= room.width || y >= room.height) return "#";
  const row = room.tiles[y];
  if (!row) return "#";
  const ch = row[x];
  return (ch === "#" || ch === "." || ch === "+" || ch === "S" ? ch : "#") as Tile;
}
