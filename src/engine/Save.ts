import { migrate, type SaveSnapshot, type Migration } from '@core/world/SaveSnapshot';

export class SaveStore {
  constructor(
    readonly slot: string,
    private readonly migrations: readonly Migration[],
  ) {}

  private key(): string {
    return `black-star:save:${this.slot}`;
  }

  save(snap: SaveSnapshot): void {
    localStorage.setItem(this.key(), JSON.stringify(snap));
  }

  load(): SaveSnapshot | null {
    const raw = localStorage.getItem(this.key());
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return migrate(parsed, this.migrations);
  }

  clear(): void {
    localStorage.removeItem(this.key());
  }
}
