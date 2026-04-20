import { Scene, type SceneContext } from "@engine/Scene";
import type { CaptainState } from "@core/player/Captain";
import type { Loadout } from "@core/ship/Loadout";
import { PlanetLandingScene } from "./PlanetLandingScene";
import { loadTiledMap, type TiledMap } from "@core/platformer/TiledLoader";
import type { TileMap } from "@core/platformer/TileMap";
import type { ObjectMarker } from "@core/platformer/types";
import { stepPhysics, type PhysicsBody } from "@core/platformer/Physics2D";
import { resolveAABB } from "@core/platformer/Collision";
import {
  updateController,
  type ControllerState,
  type ControllerConfig,
} from "@core/platformer/Controller";
import entryRoom from "@content/planets/kepler-7b/entry.tmj.json";

const PLAYER_W = 10;
const PLAYER_H = 14;

const PHYSICS = { gravity: 900, terminalVelocity: 600 };
const CONTROLLER_CFG: ControllerConfig = {
  runSpeed: 120,
  jumpVelocity: -320,
  coyoteTimeSec: 0.1,
  jumpBufferSec: 0.12,
};

export class PlanetScene extends Scene {
  private map: TileMap;
  private objects: ObjectMarker[];
  private body: PhysicsBody;
  private controller: ControllerState = {
    vx: 0, vy: 0, coyoteTimer: 0, jumpBufferTimer: 0, facing: 1,
  };

  constructor(
    readonly captain: CaptainState,
    readonly seed: number,
    readonly loadout: Loadout,
    readonly planetId: string,
  ) {
    super();
    const { map, objects } = loadTiledMap(entryRoom as unknown as TiledMap);
    this.map = map;
    this.objects = objects;
    const spawn = objects.find((o) => o.type === "player_spawn");
    const sx = spawn?.x ?? 32;
    const sy = spawn?.y ?? 32;
    this.body = { x: sx - PLAYER_W / 2, y: sy - PLAYER_H, vx: 0, vy: 0 };
  }

  enter(_ctx: SceneContext): void {}

  update(ctx: SceneContext, dt: number): void {
    if (ctx.input.wasKeyPressed("Escape")) {
      ctx.changeScene(new PlanetLandingScene(this.captain, this.seed, this.loadout, this.planetId));
      return;
    }

    const input = {
      left: ctx.input.isKeyDown("KeyA"),
      right: ctx.input.isKeyDown("KeyD"),
      jumpPressed: ctx.input.wasKeyPressed("Space") || ctx.input.wasKeyPressed("KeyW"),
    };

    // Probe current ground contact with a tiny downward sweep.
    const probe = resolveAABB(
      { x: this.body.x, y: this.body.y, w: PLAYER_W, h: PLAYER_H },
      { dx: 0, dy: 1 },
      this.map,
    );

    // Sync controller vy from body so it sees the current fall state,
    // then let the controller own all velocity decisions (run, jump, coyote, buffer).
    this.controller.vy = this.body.vy;
    this.controller = updateController(
      this.controller,
      input,
      { onGround: probe.onGround, onCeiling: false, onLeftWall: false, onRightWall: false },
      dt,
      CONTROLLER_CFG,
    );

    this.body.vx = this.controller.vx;
    this.body.vy = this.controller.vy;

    // Physics integrates gravity into vy and advances position.
    const stepped = stepPhysics(this.body, dt, PHYSICS);

    // Resolve collision against the tilemap.
    const result = resolveAABB(
      { x: this.body.x, y: this.body.y, w: PLAYER_W, h: PLAYER_H },
      { dx: stepped.x - this.body.x, dy: stepped.y - this.body.y },
      this.map,
    );
    this.body.x = result.x;
    this.body.y = result.y;
    this.body.vx = stepped.vx;
    this.body.vy = result.onGround || result.onCeiling ? 0 : stepped.vy;

    const exit = this.objects.find((o) => o.type === "exit");
    if (exit) {
      const dx = (this.body.x + PLAYER_W / 2) - exit.x;
      const dy = (this.body.y + PLAYER_H / 2) - exit.y;
      if (dx * dx + dy * dy < 256) {
        ctx.changeScene(new PlanetLandingScene(this.captain, this.seed, this.loadout, this.planetId));
      }
    }
  }

  render(ctx: SceneContext, _alpha: number): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "#0a0608");

    const mapW = this.map.width * this.map.tileSize;
    const mapH = this.map.height * this.map.tileSize;
    const centerX = this.body.x + PLAYER_W / 2;
    const centerY = this.body.y + PLAYER_H / 2;
    const camX = Math.max(0, Math.min(mapW - r.internalWidth, centerX - r.internalWidth / 2));
    const camY = Math.max(0, Math.min(mapH - r.internalHeight, centerY - r.internalHeight / 2));

    for (let gy = 0; gy < this.map.height; gy++) {
      for (let gx = 0; gx < this.map.width; gx++) {
        if (!this.map.isSolid(gx, gy)) continue;
        const px = gx * this.map.tileSize - camX;
        const py = gy * this.map.tileSize - camY;
        r.drawRect(px, py, this.map.tileSize, this.map.tileSize, "#3a2636");
      }
    }

    const exit = this.objects.find((o) => o.type === "exit");
    if (exit) {
      r.drawRect(exit.x - camX - 4, exit.y - camY - 8, 8, 8, "#e8b060");
    }

    r.drawRect(this.body.x - camX, this.body.y - camY, PLAYER_W, PLAYER_H, this.captain.paint);
  }
}
