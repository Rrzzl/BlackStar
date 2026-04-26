import {
  updateTopDownController,
  type TopDownControllerConfig,
  type TopDownControllerState,
} from "@core/controllers/TopDownController";
import type { WitnessProfile } from "@core/player/WitnessProfile";
import { Scene, type SceneContext } from "@engine/Scene";
import { drawLabel } from "@ui/Label";
import { TitleScene } from "./TitleScene";
import { WITNESS_FRONT_IDLE_SPRITE_SIZE, WitnessFrontIdleSprite } from "./WitnessSprite";

const PLAYER_W = 10;
const PLAYER_H = 14;

const ROOM = { x: 92, y: 58, w: 456, h: 246 };
const PLAYER_BOUNDS = {
  x: ROOM.x + PLAYER_W / 2 + 8,
  y: ROOM.y + PLAYER_H / 2 + 8,
  w: ROOM.w - PLAYER_W - 16,
  h: ROOM.h - PLAYER_H - 16,
};

const CONTROLLER_CFG: TopDownControllerConfig = {
  speed: 92,
  bounds: PLAYER_BOUNDS,
};

const PAUSE_OPTIONS = ["RESUME", "RETURN TO TITLE"] as const;
type PauseOption = (typeof PAUSE_OPTIONS)[number];

export const CABIN_ROOM_TITLE = "MOVEMENT TEST ROOM";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const CABIN_DESK: Rect = { x: 284, y: 80, w: 72, h: 34 };
const CABIN_LEFT_LOCKER: Rect = { x: 120, y: 82, w: 54, h: 26 };
const CABIN_RIGHT_LOCKER: Rect = { x: 466, y: 82, w: 54, h: 26 };
const CABIN_FOOT_RAIL: Rect = { x: 124, y: 258, w: 392, h: 10 };

export const CABIN_OBSTACLES: readonly Rect[] = [
  CABIN_DESK,
  CABIN_LEFT_LOCKER,
  CABIN_RIGHT_LOCKER,
  CABIN_FOOT_RAIL,
];

export class CabinScene extends Scene {
  private player: TopDownControllerState = {
    x: ROOM.x + ROOM.w / 2,
    y: ROOM.y + ROOM.h / 2 + 36,
    facing: "down",
  };
  private paused = false;
  private pauseSelectedIdx = 0;
  private readonly witnessSprite = new WitnessFrontIdleSprite();

  constructor(private readonly profile?: WitnessProfile) {
    super();
  }

  enter(ctx: SceneContext): void {
    void this.witnessSprite.load(ctx.assets);
  }

  update(ctx: SceneContext, dt: number): void {
    if (ctx.input.wasKeyPressed("Escape")) {
      this.paused = !this.paused;
      return;
    }

    if (this.paused) {
      this.updatePauseMenu(ctx);
      return;
    }

    const nextPlayer = updateTopDownController(
      this.player,
      {
        up: ctx.input.isKeyDown("KeyW") || ctx.input.isKeyDown("ArrowUp"),
        down: ctx.input.isKeyDown("KeyS") || ctx.input.isKeyDown("ArrowDown"),
        left: ctx.input.isKeyDown("KeyA") || ctx.input.isKeyDown("ArrowLeft"),
        right: ctx.input.isKeyDown("KeyD") || ctx.input.isKeyDown("ArrowRight"),
      },
      dt,
      CONTROLLER_CFG,
    );
    this.player = resolveCabinPlayerCollision(this.player, nextPlayer);
  }

  render(ctx: SceneContext, _alpha: number): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "#080604");

    r.drawRect(ROOM.x - 8, ROOM.y - 8, ROOM.w + 16, ROOM.h + 16, "#1a1410");
    r.drawRect(ROOM.x, ROOM.y, ROOM.w, ROOM.h, "#2a2420");
    r.drawRect(ROOM.x + 8, ROOM.y + 8, ROOM.w - 16, ROOM.h - 16, "#15100d");
    this.drawFloorGrid(ctx);

    this.drawCabinDetails(ctx);
    this.drawWitness(ctx);

    drawLabel(r, CABIN_ROOM_TITLE, 12, 10, "#c9a04b", 8);
    drawLabel(r, `${this.profile?.chosenName ?? "Witness"}`, 12, 25, "#e8dcc4", 8);
    drawLabel(r, `${this.profile?.coverBackground ?? "No Record"}`, 12, 38, "#8a7a5c", 7);
    drawLabel(r, "WASD / arrows move", r.internalWidth / 2, r.internalHeight - 16, "#5f5042", 7, "center");

    if (this.paused) {
      this.drawPauseOverlay(ctx);
    }
  }

  private drawCabinDetails(ctx: SceneContext): void {
    const r = ctx.renderer;
    const desk = CABIN_DESK;
    const leftLocker = CABIN_LEFT_LOCKER;
    const rightLocker = CABIN_RIGHT_LOCKER;
    const footRail = CABIN_FOOT_RAIL;

    r.drawRect(desk.x, desk.y, desk.w, desk.h, "#3a3430");
    r.drawRect(desk.x + 6, desk.y + 6, desk.w - 12, desk.h - 14, "#1a1410");
    drawLabel(r, "DESK", 320, 92, "#8a7a5c", 6, "center");

    r.drawRect(leftLocker.x, leftLocker.y, leftLocker.w, leftLocker.h, "#3a3430");
    r.drawRect(leftLocker.x + 4, leftLocker.y + 4, leftLocker.w - 8, 4, "#1a1410");
    r.drawRect(rightLocker.x, rightLocker.y, rightLocker.w, rightLocker.h, "#3a3430");
    r.drawRect(rightLocker.x + 4, rightLocker.y + 4, rightLocker.w - 8, 4, "#1a1410");
    r.drawRect(footRail.x, footRail.y, footRail.w, footRail.h, "#3a3430");
  }

  private drawFloorGrid(ctx: SceneContext): void {
    const r = ctx.renderer;
    for (let x = ROOM.x + 40; x < ROOM.x + ROOM.w - 24; x += 40) {
      r.drawRect(x, ROOM.y + 10, 1, ROOM.h - 20, "#1e1712");
    }
    for (let y = ROOM.y + 40; y < ROOM.y + ROOM.h - 16; y += 40) {
      r.drawRect(ROOM.x + 10, y, ROOM.w - 20, 1, "#1e1712");
    }
    r.drawRect(ROOM.x + 218, ROOM.y + 206, 20, 1, "#5a3827");
    r.drawRect(ROOM.x + 228, ROOM.y + 196, 1, 20, "#5a3827");
  }

  private drawWitness(ctx: SceneContext): void {
    const r = ctx.renderer;
    const sprite = this.witnessSprite.current;
    if (sprite) {
      const x = this.player.x - WITNESS_FRONT_IDLE_SPRITE_SIZE.w / 2;
      const y = this.player.y + PLAYER_H / 2 - WITNESS_FRONT_IDLE_SPRITE_SIZE.h;
      r.ctx.drawImage(sprite, x, y, WITNESS_FRONT_IDLE_SPRITE_SIZE.w, WITNESS_FRONT_IDLE_SPRITE_SIZE.h);
      return;
    }

    const x = this.player.x - PLAYER_W / 2;
    const y = this.player.y - PLAYER_H / 2;
    const body = this.appearanceColor();

    r.drawRect(x, y + 4, PLAYER_W, PLAYER_H - 4, body);
    r.drawRect(x + 2, y, PLAYER_W - 4, 5, "#c9b896");

    const markerX = this.player.facing === "left" ? x - 2 : this.player.facing === "right" ? x + PLAYER_W + 1 : x + 4;
    const markerY = this.player.facing === "up" ? y - 2 : this.player.facing === "down" ? y + PLAYER_H + 1 : y + 6;
    r.drawRect(markerX, markerY, 2, 2, "#f4c57a");
  }

  private appearanceColor(): string {
    switch (this.profile?.appearanceId) {
      case "order-robes-bone":
        return "#c9b896";
      case "order-robes-rust":
        return "#6b2818";
      case "order-robes-ash":
      default:
        return "#8a7a5c";
    }
  }

  private updatePauseMenu(ctx: SceneContext): void {
    if (ctx.input.wasKeyPressed("ArrowUp") || ctx.input.wasKeyPressed("KeyW")) {
      this.pauseSelectedIdx = nextPauseSelection(this.pauseSelectedIdx, -1);
    }
    if (ctx.input.wasKeyPressed("ArrowDown") || ctx.input.wasKeyPressed("KeyS")) {
      this.pauseSelectedIdx = nextPauseSelection(this.pauseSelectedIdx, 1);
    }

    const mouse = ctx.renderer.mouseToInternal(ctx.input.mouseX, ctx.input.mouseY);
    for (let i = 0; i < PAUSE_OPTIONS.length; i++) {
      if (!contains(pauseHitbox(ctx.renderer.internalWidth, ctx.renderer.internalHeight, i), mouse.x, mouse.y)) continue;
      this.pauseSelectedIdx = i;
      if (ctx.input.wasMousePressed(0)) {
        this.activatePauseOption(ctx, PAUSE_OPTIONS[i]!);
      }
      return;
    }

    if (ctx.input.wasKeyPressed("Enter") || ctx.input.wasKeyPressed("Space")) {
      this.activatePauseOption(ctx, PAUSE_OPTIONS[this.pauseSelectedIdx]!);
    }
  }

  private activatePauseOption(ctx: SceneContext, option: PauseOption): void {
    if (option === "RESUME") {
      this.paused = false;
      return;
    }
    ctx.changeScene(new TitleScene());
  }

  private drawPauseOverlay(ctx: SceneContext): void {
    const r = ctx.renderer;
    const panel = pausePanel(r.internalWidth, r.internalHeight);
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "rgba(0,0,0,0.64)");
    r.drawRect(panel.x, panel.y, panel.w, panel.h, "#140d09");
    r.drawRect(panel.x + 3, panel.y + 3, panel.w - 6, panel.h - 6, "#211510");
    drawLabel(r, "PAUSED", r.internalWidth / 2, panel.y + 18, "#c9a04b", 12, "center");

    for (let i = 0; i < PAUSE_OPTIONS.length; i++) {
      const rect = pauseHitbox(r.internalWidth, r.internalHeight, i);
      const selected = i === this.pauseSelectedIdx;
      r.drawRect(rect.x, rect.y, rect.w, rect.h, selected ? "#322017" : "#211510");
      drawLabel(r, selected ? `> ${PAUSE_OPTIONS[i]!}` : `  ${PAUSE_OPTIONS[i]!}`, rect.x + 8, rect.y + 6, selected ? "#f4c57a" : "#e8dcc4", 8);
    }
  }
}

export function nextPauseSelection(current: number, delta: number): number {
  return (current + delta + PAUSE_OPTIONS.length) % PAUSE_OPTIONS.length;
}

export function resolveCabinPlayerCollision(
  prev: TopDownControllerState,
  next: TopDownControllerState,
): TopDownControllerState {
  const x = resolveCabinAxis(prev.x, next.x, prev.y, "x");
  const y = resolveCabinAxis(prev.y, next.y, x, "y");
  return { x, y, facing: next.facing };
}

function resolveCabinAxis(
  from: number,
  to: number,
  otherAxisCenter: number,
  axis: "x" | "y",
): number {
  let resolved = to;
  for (const obstacle of CABIN_OBSTACLES) {
    const player =
      axis === "x"
        ? playerRect(resolved, otherAxisCenter)
        : playerRect(otherAxisCenter, resolved);
    if (!intersects(player, obstacle)) continue;

    if (axis === "x") {
      resolved = to > from
        ? obstacle.x - PLAYER_W / 2
        : obstacle.x + obstacle.w + PLAYER_W / 2;
    } else {
      resolved = to > from
        ? obstacle.y - PLAYER_H / 2
        : obstacle.y + obstacle.h + PLAYER_H / 2;
    }
  }
  return resolved;
}

function playerRect(centerX: number, centerY: number): Rect {
  return {
    x: centerX - PLAYER_W / 2,
    y: centerY - PLAYER_H / 2,
    w: PLAYER_W,
    h: PLAYER_H,
  };
}

function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w
    && a.x + a.w > b.x
    && a.y < b.y + b.h
    && a.y + a.h > b.y;
}

function pausePanel(width: number, height: number): Rect {
  return { x: width / 2 - 90, y: height / 2 - 58, w: 180, h: 116 };
}

function pauseHitbox(width: number, height: number, idx: number): Rect {
  const panel = pausePanel(width, height);
  return { x: panel.x + 24, y: panel.y + 46 + idx * 28, w: panel.w - 48, h: 22 };
}

function contains(rect: Rect, x: number, y: number): boolean {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}
