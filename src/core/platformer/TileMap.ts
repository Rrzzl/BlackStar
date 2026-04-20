import type { TileMapData, TileId } from "./types";

export class TileMap {
  readonly width: number;
  readonly height: number;
  readonly tileSize: number;
  private readonly tiles: readonly TileId[];

  constructor(data: TileMapData) {
    this.width = data.width;
    this.height = data.height;
    this.tileSize = data.tileSize;
    this.tiles = data.tiles;
  }

  tileAt(gx: number, gy: number): TileId {
    if (gx < 0 || gy < 0 || gx >= this.width || gy >= this.height) return 1;
    return this.tiles[gy * this.width + gx] ?? 1;
  }

  isSolid(gx: number, gy: number): boolean {
    return this.tileAt(gx, gy) === 1;
  }

  isSolidAtPixel(px: number, py: number): boolean {
    const gx = Math.floor(px / this.tileSize);
    const gy = Math.floor(py / this.tileSize);
    return this.isSolid(gx, gy);
  }

  tileIdAtPixel(px: number, py: number): TileId {
    const gx = Math.floor(px / this.tileSize);
    const gy = Math.floor(py / this.tileSize);
    return this.tileAt(gx, gy);
  }
}
