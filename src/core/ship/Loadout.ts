import type { HullDef, SlotType } from './HullDef';
import type { ModuleDef } from './ModuleDef';

export class LoadoutError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'LoadoutError';
  }
}

export class Loadout {
  private readonly modules: ModuleDef[] = [];

  constructor(readonly hull: HullDef) {}

  installed(): readonly ModuleDef[] {
    return this.modules;
  }

  slotsUsed(slot: SlotType): number {
    return this.modules.filter((m) => m.slot === slot).length;
  }

  slotsFree(slot: SlotType): number {
    return this.hull.slots[slot] - this.slotsUsed(slot);
  }

  install(mod: ModuleDef): void {
    if (this.slotsFree(mod.slot) <= 0) {
      throw new LoadoutError(`No free ${mod.slot} slot on ${this.hull.id}`);
    }
    this.modules.push(mod);
  }

  uninstall(mod: ModuleDef): void {
    const idx = this.modules.indexOf(mod);
    if (idx < 0) throw new LoadoutError(`Module ${mod.id} not installed`);
    this.modules.splice(idx, 1);
  }
}
