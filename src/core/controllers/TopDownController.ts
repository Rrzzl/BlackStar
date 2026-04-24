export type TopDownFacing = "up" | "down" | "left" | "right";

export interface TopDownControllerState {
  x: number;
  y: number;
  facing: TopDownFacing;
}

export interface TopDownControllerInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export interface TopDownBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TopDownControllerConfig {
  speed: number;
  bounds: TopDownBounds;
}

export function updateTopDownController(
  prev: TopDownControllerState,
  input: TopDownControllerInput,
  dt: number,
  cfg: TopDownControllerConfig,
): TopDownControllerState {
  const dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const length = Math.hypot(dx, dy);

  if (length === 0) {
    return {
      ...prev,
      x: clamp(prev.x, cfg.bounds.x, cfg.bounds.x + cfg.bounds.w),
      y: clamp(prev.y, cfg.bounds.y, cfg.bounds.y + cfg.bounds.h),
    };
  }

  const step = cfg.speed * dt;
  const x = clamp(prev.x + (dx / length) * step, cfg.bounds.x, cfg.bounds.x + cfg.bounds.w);
  const y = clamp(prev.y + (dy / length) * step, cfg.bounds.y, cfg.bounds.y + cfg.bounds.h);

  return {
    x,
    y,
    facing: nextFacing(prev.facing, dx, dy),
  };
}

function nextFacing(prev: TopDownFacing, dx: number, dy: number): TopDownFacing {
  if (dy < 0) return "up";
  if (dy > 0) return "down";
  if (dx < 0) return "left";
  if (dx > 0) return "right";
  return prev;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
