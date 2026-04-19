import type { Health } from "./Health";
import type { WeaponRuntime } from "./Weapon";

export type EnemyArchetypeId = "rusher" | "shooter";

export interface EnemyArchetype {
  id: EnemyArchetypeId;
  name: string;
  hp: number;
  shield: number;
  radius: number;
  speed: number;
  color: string;
  weapon: string | null;
  contactDamage: number;
  preferredRangePx?: number;
}

export interface EnemySpawn {
  archetype: EnemyArchetypeId;
  x: number;
  y: number;
  id: string;
}

export interface EnemiesData {
  archetypes: EnemyArchetype[];
  spawns: EnemySpawn[];
}

export interface Enemy {
  id: string;
  archetype: EnemyArchetype;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  health: Health;
  weapon: WeaponRuntime | null;
}
