// @ts-nocheck
/* eslint-disable */
export type SlotType = 'weapon' | 'internal' | 'utility' | 'core';

export interface HullDef {
  id: string;
  name: string;
  tier: number;
  baseHp: number;
  baseShield: number;
  baseSpeed: number;
  baseTurn: number;
  basePower: number;
  slots: Record<SlotType, number>;
}