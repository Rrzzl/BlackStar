import type { Migration } from "./SaveSnapshot";

export const migrations: readonly Migration[] = [
  {
    from: 1,
    to: 2,
    apply(raw: Record<string, unknown>): Record<string, unknown> {
      const sector = raw.sector as Record<string, unknown>;
      return {
        ...raw,
        version: 2,
        sector: { ...sector, playerBody: null },
      };
    },
  },
];
