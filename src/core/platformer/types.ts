export interface Vec2 {
  x: number;
  y: number;
}

export interface AABB {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type TileId = number;

export interface TileMapData {
  width: number;
  height: number;
  tileSize: number;
  tiles: readonly TileId[];
}

export interface ObjectMarker {
  type: string;
  x: number;
  y: number;
  name?: string;
}
