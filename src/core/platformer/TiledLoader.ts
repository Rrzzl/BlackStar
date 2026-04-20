import { TileMap } from "./TileMap";
import type { ObjectMarker } from "./types";

export interface TiledTileLayer {
  name: string;
  type: "tilelayer";
  width: number;
  height: number;
  data: number[];
}

export interface TiledObject {
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TiledObjectLayer {
  name: string;
  type: "objectgroup";
  objects: TiledObject[];
}

export type TiledLayer = TiledTileLayer | TiledObjectLayer;

export interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
}

export interface LoadedTiledMap {
  map: TileMap;
  objects: ObjectMarker[];
}

export function loadTiledMap(raw: TiledMap): LoadedTiledMap {
  const collisionLayer = raw.layers.find(
    (l): l is TiledTileLayer => l.type === "tilelayer" && l.name === "collision",
  );
  if (!collisionLayer) throw new Error("Tiled map missing 'collision' tile layer");

  const tiles = collisionLayer.data.map((id) => (id === 0 ? 0 : 1));
  const map = new TileMap({
    width: raw.width,
    height: raw.height,
    tileSize: raw.tilewidth,
    tiles,
  });

  const objectLayer = raw.layers.find(
    (l): l is TiledObjectLayer => l.type === "objectgroup" && l.name === "objects",
  );
  const objects: ObjectMarker[] = (objectLayer?.objects ?? []).map((o) => ({
    type: o.type,
    x: o.x,
    y: o.y,
    name: o.name,
  }));

  return { map, objects };
}
