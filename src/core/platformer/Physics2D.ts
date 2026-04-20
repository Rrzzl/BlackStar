export interface PhysicsBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface PhysicsOpts {
  gravity: number;
  terminalVelocity: number;
}

export function stepPhysics(body: PhysicsBody, dt: number, opts: PhysicsOpts): PhysicsBody {
  const vy = Math.min(opts.terminalVelocity, body.vy + opts.gravity * dt);
  return {
    x: body.x + body.vx * dt,
    y: body.y + vy * dt,
    vx: body.vx,
    vy,
  };
}
