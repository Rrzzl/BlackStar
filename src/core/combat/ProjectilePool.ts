import type { Projectile, ProjectileSpawn } from "./Projectile";

export class ProjectilePool {
  private readonly pool: Projectile[];

  constructor(size: number) {
    this.pool = [];
    for (let i = 0; i < size; i++) {
      this.pool.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, ttl: 0, damage: 0, ownerId: "" });
    }
  }

  spawn(init: ProjectileSpawn): Projectile | null {
    for (const p of this.pool) {
      if (!p.active) {
        p.active = true;
        p.x = init.x;
        p.y = init.y;
        p.vx = init.vx;
        p.vy = init.vy;
        p.ttl = init.ttl;
        p.damage = init.damage;
        p.ownerId = init.ownerId;
        return p;
      }
    }
    return null;
  }

  free(p: Projectile): void {
    p.active = false;
  }

  tick(dt: number): void {
    for (const p of this.pool) {
      if (!p.active) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.ttl -= dt;
      if (p.ttl <= 0) p.active = false;
    }
  }

  active(): Projectile[] {
    return this.pool.filter((p) => p.active);
  }

  capacity(): number {
    return this.pool.length;
  }
}
