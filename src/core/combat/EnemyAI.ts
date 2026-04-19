export interface Vec2 {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export function steerRusher(self: Vec2, target: Vec2, speed: number): Velocity {
  const dx = target.x - self.x;
  const dy = target.y - self.y;
  const d = Math.hypot(dx, dy);
  if (d < 0.0001) return { vx: 0, vy: 0 };
  return { vx: (dx / d) * speed, vy: (dy / d) * speed };
}

export function steerShooter(self: Vec2, target: Vec2, speed: number, preferredRange: number): Velocity {
  const dx = target.x - self.x;
  const dy = target.y - self.y;
  const d = Math.hypot(dx, dy);
  if (d < 0.0001) return { vx: 0, vy: 0 };
  if (d > preferredRange + 20) {
    return { vx: (dx / d) * speed, vy: (dy / d) * speed };
  }
  const perpX = -dy / d;
  const perpY = dx / d;
  return { vx: perpX * speed, vy: perpY * speed };
}
