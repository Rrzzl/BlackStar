import { Scene, type SceneContext } from "@engine/Scene";
import type { CaptainState } from "@core/player/Captain";
import type { Loadout } from "@core/ship/Loadout";
import { generateDungeon, type Dungeon } from "@core/procgen/DungeonGen";
import { tileAt, type RoomDef } from "@core/procgen/RoomDef";
import { drawLabel } from "@ui/Label";
import { PlanetLandingScene } from "./PlanetLandingScene";
import roomsData from "@content/rooms.json";

const ROOMS = roomsData as RoomDef[];
const TILE = 16;

export class DungeonScene extends Scene {
  private dungeon: Dungeon;
  private currentRoom: number;
  private playerX: number;
  private playerY: number;

  constructor(
    readonly captain: CaptainState,
    readonly seed: number,
    readonly loadout: Loadout,
    readonly planetId: string,
  ) {
    super();
    this.dungeon = generateDungeon(seed, ROOMS);
    this.currentRoom = this.dungeon.start;
    const r = this.roomDef();
    const spawn = this.findSpawn(r);
    this.playerX = spawn.x * TILE + TILE / 2;
    this.playerY = spawn.y * TILE + TILE / 2;
  }

  private roomDef(): RoomDef {
    const placed = this.dungeon.rooms[this.currentRoom]!;
    return ROOMS.find((r) => r.id === placed.templateId)!;
  }

  private findSpawn(room: RoomDef): { x: number; y: number } {
    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        if (tileAt(room, x, y) === "S") return { x, y };
      }
    }
    return { x: 1, y: 1 };
  }

  private doorPositions(room: RoomDef): Array<{ x: number; y: number }> {
    const positions: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        if (tileAt(room, x, y) === "+") positions.push({ x, y });
      }
    }
    return positions;
  }

  private isWalkable(room: RoomDef, px: number, py: number): boolean {
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    const t = tileAt(room, tx, ty);
    return t !== "#";
  }

  enter(_ctx: SceneContext): void {}

  update(ctx: SceneContext, dt: number): void {
    if (ctx.input.wasKeyPressed("Escape")) {
      ctx.changeScene(new PlanetLandingScene(this.captain, this.seed, this.loadout, this.planetId));
      return;
    }
    const speed = 80;
    let dx = 0, dy = 0;
    if (ctx.input.isKeyDown("KeyW")) dy -= 1;
    if (ctx.input.isKeyDown("KeyS")) dy += 1;
    if (ctx.input.isKeyDown("KeyA")) dx -= 1;
    if (ctx.input.isKeyDown("KeyD")) dx += 1;
    if (dx !== 0 && dy !== 0) {
      const inv = 1 / Math.sqrt(2);
      dx *= inv; dy *= inv;
    }
    const room = this.roomDef();
    const nextX = this.playerX + dx * speed * dt;
    const nextY = this.playerY + dy * speed * dt;
    if (this.isWalkable(room, nextX, this.playerY)) this.playerX = nextX;
    if (this.isWalkable(room, this.playerX, nextY)) this.playerY = nextY;

    const tx = Math.floor(this.playerX / TILE);
    const ty = Math.floor(this.playerY / TILE);
    if (tileAt(room, tx, ty) === "+") {
      const doorIdx = this.doorPositions(room).findIndex((p) => p.x === tx && p.y === ty);
      const placedDoors = this.dungeon.rooms[this.currentRoom]!.doors;
      if (doorIdx >= 0 && placedDoors.length > 0) {
        const nextRoomIdx = placedDoors[doorIdx % placedDoors.length];
        if (nextRoomIdx !== undefined) {
          this.currentRoom = nextRoomIdx;
          const newRoom = this.roomDef();
          const newDoors = this.doorPositions(newRoom);
          const spawnAt = newDoors[0] ?? this.findSpawn(newRoom);
          const nudgeX = spawnAt.x === 0 ? 1 : spawnAt.x === newRoom.width - 1 ? -1 : 0;
          const nudgeY = spawnAt.y === 0 ? 1 : spawnAt.y === newRoom.height - 1 ? -1 : 0;
          this.playerX = (spawnAt.x + nudgeX) * TILE + TILE / 2;
          this.playerY = (spawnAt.y + nudgeY) * TILE + TILE / 2;
        }
      }
    }
  }

  render(ctx: SceneContext, _alpha: number): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "#05080c");
    const room = this.roomDef();

    const offX = Math.floor((r.internalWidth - room.width * TILE) / 2);
    const offY = Math.floor((r.internalHeight - room.height * TILE) / 2);

    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        const t = tileAt(room, x, y);
        const px = offX + x * TILE;
        const py = offY + y * TILE;
        if (t === "#") r.drawRect(px, py, TILE, TILE, "#2a2630");
        else if (t === "+") r.drawRect(px, py, TILE, TILE, "#3a4a6a");
        else r.drawRect(px + 1, py + 1, TILE - 2, TILE - 2, "#14181e");
      }
    }

    r.drawRect(offX + this.playerX - 5, offY + this.playerY - 5, 10, 10, this.captain.paint);

    drawLabel(r, `${room.name} — Room ${this.currentRoom + 1}/${this.dungeon.rooms.length}`, 10, 10, "#cfd8e8", 8);
    drawLabel(r, "WASD move | ESC leave", r.internalWidth / 2, r.internalHeight - 10, "#506070", 6, "center");
  }
}
