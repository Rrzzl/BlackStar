// @ts-nocheck
/* eslint-disable */
import { makeHealth, type Health } from "@core/combat/Health";

export function makePlayerHealth(loadoutShieldBonus: number, loadoutHpBonus: number): Health {
  return makeHealth(100 + loadoutHpBonus, 50 + loadoutShieldBonus);
}
