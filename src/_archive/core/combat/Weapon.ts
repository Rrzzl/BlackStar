// @ts-nocheck
/* eslint-disable */
import type { ProjectileSpawn } from "./Projectile";

export interface WeaponDef {
  id: string;
  damage: number;
  projectileSpeed: number;
  rangeSeconds: number;
  fireIntervalSeconds: number;
  powerCost: number;
}

export interface WeaponRuntime {
  def: WeaponDef;
  cooldown: number;
}

export interface FireContext {
  x: number;
  y: number;
  angle: number;
  ownerId: string;
}

export function makeWeaponRuntime(def: WeaponDef): WeaponRuntime {
  return { def, cooldown: 0 };
}

export function canFire(w: WeaponRuntime, availablePower: number): boolean {
  return w.cooldown <= 0 && availablePower >= w.def.powerCost;
}

export function fire(w: WeaponRuntime, ctx: FireContext): ProjectileSpawn {
  w.cooldown = w.def.fireIntervalSeconds;
  return {
    x: ctx.x,
    y: ctx.y,
    vx: Math.cos(ctx.angle) * w.def.projectileSpeed,
    vy: Math.sin(ctx.angle) * w.def.projectileSpeed,
    ttl: w.def.rangeSeconds,
    damage: w.def.damage,
    ownerId: ctx.ownerId,
  };
}

export function tickCooldown(w: WeaponRuntime, dt: number): void {
  w.cooldown = Math.max(0, w.cooldown - dt);
}