import { describe, it, expect } from "vitest";
import { migrate, CURRENT_SAVE_VERSION } from "@core/world/SaveSnapshot";
import { migrations } from "@core/world/migrations";

describe("SaveSnapshot migrations", () => {
  it("CURRENT_SAVE_VERSION is 2", () => {
    expect(CURRENT_SAVE_VERSION).toBe(2);
  });

  it("migrates a v1 save to v2 by adding sector.playerBody = null", () => {
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
    expect(result.version).toBe(2);
    expect(result.sector.playerBody).toBeNull();
  });

  it("passes a v2 save through unchanged", () => {
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
    expect(result.sector.playerBody).toBe("the-crossing");
    expect(result.scene.params?.stationId).toBe("the-crossing");
  });
});
