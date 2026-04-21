// @ts-nocheck
/* eslint-disable */
// Price formula per living-economy.md §3.1:
//   scarcity_mult = clamp(2.0 - 1.6 * stockpileRatio, 0.4, 2.0)
// stockpileRatio = current / equilibrium, 1.0 = target stockpile.
export function calcPrice(baseValue: number, stockpileRatio: number): number {
  const mult = Math.min(2.0, Math.max(0.4, 2.0 - 1.6 * stockpileRatio));
  return Math.round(baseValue * mult);
}