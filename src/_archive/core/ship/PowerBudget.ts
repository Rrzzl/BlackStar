// @ts-nocheck
/* eslint-disable */
import type { Loadout } from './Loadout';

export interface PowerBudget {
  available: number;
  used: number;
  remaining: number;
  overbudget: boolean;
}

export function calcPowerBudget(loadout: Loadout): PowerBudget {
  let available = loadout.hull.basePower;
  let used = 0;
  for (const mod of loadout.installed()) {
    if (mod.powerDraw < 0) available += -mod.powerDraw;
    else used += mod.powerDraw;
  }
  return {
    available,
    used,
    remaining: available - used,
    overbudget: used > available,
  };
}