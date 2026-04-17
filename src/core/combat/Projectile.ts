export interface Projectile {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number;
  damage: number;
  ownerId: string;
}

export interface ProjectileSpawn {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number;
  damage: number;
  ownerId: string;
}
