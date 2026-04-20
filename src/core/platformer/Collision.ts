import type { AABB } from "./types";
import type { TileMap } from "./TileMap";

export interface Delta {
  dx: number;
  dy: number;
}

export interface CollisionResult {
  x: number;
  y: number;
  onGround: boolean;
  onCeiling: boolean;
  onLeftWall: boolean;
  onRightWall: boolean;
}

function rowRange(y: number, h: number, ts: number): [number, number] {
  return [Math.floor(y / ts), Math.floor((y + h - 0.001) / ts)];
}

function colRange(x: number, w: number, ts: number): [number, number] {
  return [Math.floor(x / ts), Math.floor((x + w - 0.001) / ts)];
}

export function resolveAABB(aabb: AABB, delta: Delta, map: TileMap): CollisionResult {
  let { x, y } = aabb;
  const { w, h } = aabb;
  const ts = map.tileSize;
  let onLeftWall = false, onRightWall = false, onGround = false, onCeiling = false;

  // --- Sweep X ---
  if (delta.dx > 0) {
    const targetX = x + delta.dx;
    const [r0, r1] = rowRange(y, h, ts);
    const startCol = Math.floor((x + w) / ts);
    const endCol = Math.floor((targetX + w - 0.001) / ts);
    let hitCol = -1;
    for (let c = startCol; c <= endCol; c++) {
      for (let r = r0; r <= r1; r++) {
        if (map.isSolid(c, r)) { hitCol = c; break; }
      }
      if (hitCol !== -1) break;
    }
    if (hitCol !== -1) {
      x = hitCol * ts - w;
      onRightWall = true;
    } else {
      x = targetX;
    }
  } else if (delta.dx < 0) {
    const targetX = x + delta.dx;
    const [r0, r1] = rowRange(y, h, ts);
    const startCol = Math.floor(x / ts);
    const endCol = Math.floor(targetX / ts);
    let hitCol = -1;
    for (let c = startCol; c >= endCol; c--) {
      for (let r = r0; r <= r1; r++) {
        if (map.isSolid(c, r)) { hitCol = c; break; }
      }
      if (hitCol !== -1) break;
    }
    if (hitCol !== -1) {
      x = (hitCol + 1) * ts;
      onLeftWall = true;
    } else {
      x = targetX;
    }
  }

  // --- Sweep Y at the resolved X ---
  if (delta.dy > 0) {
    const targetY = y + delta.dy;
    const [c0, c1] = colRange(x, w, ts);
    const startRow = Math.floor((y + h) / ts);
    const endRow = Math.floor((targetY + h - 0.001) / ts);
    let hitRow = -1;
    for (let r = startRow; r <= endRow; r++) {
      for (let c = c0; c <= c1; c++) {
        if (map.isSolid(c, r)) { hitRow = r; break; }
      }
      if (hitRow !== -1) break;
    }
    if (hitRow !== -1) {
      y = hitRow * ts - h;
      onGround = true;
    } else {
      y = targetY;
    }
  } else if (delta.dy < 0) {
    const targetY = y + delta.dy;
    const [c0, c1] = colRange(x, w, ts);
    const startRow = Math.floor(y / ts);
    const endRow = Math.floor(targetY / ts);
    let hitRow = -1;
    for (let r = startRow; r >= endRow; r--) {
      for (let c = c0; c <= c1; c++) {
        if (map.isSolid(c, r)) { hitRow = r; break; }
      }
      if (hitRow !== -1) break;
    }
    if (hitRow !== -1) {
      y = (hitRow + 1) * ts;
      onCeiling = true;
    } else {
      y = targetY;
    }
  }

  return { x, y, onGround, onCeiling, onLeftWall, onRightWall };
}
