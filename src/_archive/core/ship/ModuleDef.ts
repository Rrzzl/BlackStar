// @ts-nocheck
/* eslint-disable */
import type { SlotType } from './HullDef';

export interface ModuleDef {
  id: string;
  name: string;
  slot: SlotType;
  powerDraw: number;
  description: string;
  stats: {
    hp?: number;
    shield?: number;
    speed?: number;
    turn?: number;
    damage?: number;
    range?: number;
    cargo?: number;
  };
}