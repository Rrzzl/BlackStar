import { describe, it, expect } from "vitest";
import { migrate, CURRENT_SAVE_VERSION } from "@core/world/SaveSnapshot";
import { migrations } from "@core/world/migrations";

describe("SaveSnapshot migrations", () => {
  it("CURRENT_SAVE_VERSION is 3", () => {
    expect(CURRENT_SAVE_VERSION).toBe(3);
  });

  it("migrates a v1 save to v3 adding playerBody and enemies", () => {
    const v1: Record<string, unknown> = {
      version: 1,
      seed: 42,
      worldClock: 100,
      captain: { name: "Rook", species: "human", klass: "gunslinger", paint: "#b94a3a", createdAt: 0, deaths: 0 },
      ship: { hullId: "shrike", moduleIds: [], position: { x: 1, y: 2 }, velocity: { x: 0, y: 0 }, angle: 0, hp: 100, shield: 50, credits: 500, cargo: [] },
      sector: { id: "grayline-reach", traders: [], stockpiles: [] },
      inventory: { items: [] },
      factions: { free_worlds: { rep: 0 }, scrapfather: { rep: 0 } },
      quests: { active: [], completed: [] },
      outposts: {},
      scene: { type: "SpaceScene" },
    };
    const result = migrate(v1, migrations);
    expect(result.version).toBe(3);
    expect(result.sector.playerBody).toBeNull();
    expect(result.sector.enemies).toEqual([]);
  });

  it("migrates a v2 save to v3 adding empty enemies array", () => {
    const v2: Record<string, unknown> = {
      version: 2,
      seed: 42,
      worldClock: 100,
      captain: { name: "Rook", species: "human", klass: "gunslinger", paint: "#b94a3a", createdAt: 0, deaths: 0 },
      ship: { hullId: "shrike", moduleIds: [], position: { x: 1, y: 2 }, velocity: { x: 0, y: 0 }, angle: 0, hp: 100, shield: 50, credits: 500, cargo: [] },
      sector: { id: "grayline-reach", traders: [], stockpiles: [], playerBody: "the-crossing" },
      inventory: { items: [] },
      factions: { free_worlds: { rep: 0 }, scrapfather: { rep: 0 } },
      quests: { active: [], completed: [] },
      outposts: {},
      scene: { type: "StationScene", params: { stationId: "the-crossing" } },
    };
    const result = migrate(v2, migrations);
    expect(result.version).toBe(3);
    expect(result.sector.playerBody).toBe("the-crossing");
    expect(result.sector.enemies).toEqual([]);
  });

  it("passes a v3 save through unchanged", () => {
    const v3: Record<string, unknown> = {
      version: 3,
      seed: 42,
      worldClock: 100,
      captain: { name: "Rook", species: "human", klass: "gunslinger", paint: "#b94a3a", createdAt: 0, deaths: 0 },
      ship: { hullId: "shrike", moduleIds: [], position: { x: 1, y: 2 }, velocity: { x: 0, y: 0 }, angle: 0, hp: 100, shield: 50, credits: 500, cargo: [] },
      sector: { id: "grayline-reach", traders: [], stockpiles: [], playerBody: null, enemies: [] },
      inventory: { items: [] },
      factions: { free_worlds: { rep: 0 }, scrapfather: { rep: 0 } },
      quests: { active: [], completed: [] },
      outposts: {},
      scene: { type: "SpaceScene" },
    };
    const result = migrate(v3, migrations);
    expect(result.version).toBe(3);
    expect(result.sector.enemies).toEqual([]);
  });
});
