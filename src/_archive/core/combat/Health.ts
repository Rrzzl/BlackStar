// @ts-nocheck
/* eslint-disable */
export interface Health {
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
}

export function makeHealth(maxHp: number, maxShield: number): Health {
  return { hp: maxHp, maxHp, shield: maxShield, maxShield };
}

export function applyDamage(h: Health, damage: number): Health {
  const absorbed = Math.min(h.shield, damage);
  const overflow = damage - absorbed;
  return {
    ...h,
    shield: h.shield - absorbed,
    hp: Math.max(0, h.hp - overflow),
  };
}

export function heal(h: Health, amount: number): Health {
  return { ...h, hp: Math.min(h.maxHp, h.hp + amount) };
}

export function isDead(h: Health): boolean {
  return h.hp <= 0;
}