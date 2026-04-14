import { Scene, type SceneContext } from "@engine/Scene";
import { DebugOverlay } from "@engine/DebugOverlay";
import type { CaptainState } from "@core/player/Captain";
import type { SectorData, SectorBody } from "@core/world/Sector";
import { buildStations } from "@core/world/Sector";
import { GoodsRegistry, type GoodDef } from "@core/economy/Goods";
import { Economy } from "@core/economy/Economy";
import { Trader } from "@core/economy/Trader";
import { CURRENT_SAVE_VERSION, type SaveSnapshot } from "@core/world/SaveSnapshot";
import { drawLabel } from "@ui/Label";
import { drawPauseOverlay } from "./PauseOverlay";
import { TitleScene } from "./TitleScene";
import sectorData from "@content/sectors/grayline-reach.json";
import goodsData from "@content/goods.json";

interface ShipKinematics {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
}

interface TraderVisual {
  traderId: string;
  x: number;
  y: number;
  speed: number;
  target: SectorBody;
}

export class SpaceScene extends Scene {
  private ship: ShipKinematics = { x: 1100, y: 600, vx: 0, vy: 0, angle: 0 };
  private sector: SectorData = sectorData as unknown as SectorData;
  private economy: Economy;
  private traderVisuals: TraderVisual[] = [];
  private paused = false;
  private debug = new DebugOverlay();
  private worldClockUnsubs: Array<() => void> = [];

  constructor(readonly captain: CaptainState) {
    super();
    this.debug.enabled = false;
    const goods = new GoodsRegistry(goodsData as unknown as GoodDef[]);
    const stations = buildStations(this.sector.stations);
    const traders: Trader[] = [];
    let tid = 0;
    for (const route of this.sector.traderRoutes) {
      for (let i = 0; i < route.count; i++) {
        traders.push(new Trader(`t${tid++}`, "hauler"));
      }
    }
    this.economy = new Economy(goods, stations, traders);

    let vi = 0;
    for (const route of this.sector.traderRoutes) {
      const fromBody = this.sector.bodies.find((b) => b.id === route.from);
      const toBody = this.sector.bodies.find((b) => b.id === route.to);
      if (!fromBody || !toBody) continue;
      for (let i = 0; i < route.count; i++) {
        this.traderVisuals.push({
          traderId: `t${vi++}`,
          x: fromBody.x + (Math.random() - 0.5) * 40,
          y: fromBody.y + (Math.random() - 0.5) * 40,
          speed: 40 + Math.random() * 30,
          target: toBody,
        });
      }
    }
  }

  enter(ctx: SceneContext): void {
    this.worldClockUnsubs.push(
      ctx.worldClock.subscribe(1, (dt) => {
        this.economy.tick(dt);
      }),
    );
    this.worldClockUnsubs.push(
      ctx.worldClock.subscribe(10, () => {
        this.economy.replanIdleTraders([
          "grain",
          "water",
          "iron_ore",
          "meds",
          "electronics",
          "alien_tech",
        ]);
      }),
    );

    const existing = ctx.saveStore.load();
    if (existing && existing.scene.type === "SpaceScene") {
      this.applySnapshot(existing);
    }
  }

  exit(_ctx: SceneContext): void {
    for (const unsub of this.worldClockUnsubs) unsub();
    this.worldClockUnsubs = [];
  }

  update(ctx: SceneContext, dt: number): void {
    this.debug.tick();
    if (ctx.input.wasKeyPressed("Escape")) this.paused = !this.paused;
    if (ctx.input.wasKeyPressed("F3")) this.debug.enabled = !this.debug.enabled;
    if (this.paused) return;

    const input = ctx.input;
    const turnRate = 3.0;
    const thrust = 160;
    const drag = 0.2;
    if (input.isKeyDown("KeyA")) this.ship.angle -= turnRate * dt;
    if (input.isKeyDown("KeyD")) this.ship.angle += turnRate * dt;
    if (input.isKeyDown("KeyW")) {
      this.ship.vx += Math.cos(this.ship.angle) * thrust * dt;
      this.ship.vy += Math.sin(this.ship.angle) * thrust * dt;
    }
    if (input.isKeyDown("KeyS")) {
      this.ship.vx *= 1 - 2 * dt;
      this.ship.vy *= 1 - 2 * dt;
    }
    this.ship.vx *= 1 - drag * dt;
    this.ship.vy *= 1 - drag * dt;
    this.ship.x += this.ship.vx * dt;
    this.ship.y += this.ship.vy * dt;
    this.ship.x = Math.max(0, Math.min(this.sector.bounds.w, this.ship.x));
    this.ship.y = Math.max(0, Math.min(this.sector.bounds.h, this.ship.y));

    for (const tv of this.traderVisuals) {
      const dx = tv.target.x - tv.x;
      const dy = tv.target.y - tv.y;
      const d = Math.hypot(dx, dy);
      if (d < tv.target.r + 10) {
        const others = this.sector.bodies.filter(
          (b) => b !== tv.target && b.kind !== "belt",
        );
        if (others.length > 0) {
          tv.target = others[Math.floor(Math.random() * others.length)]!;
        }
        continue;
      }
      tv.x += (dx / d) * tv.speed * dt;
      tv.y += (dy / d) * tv.speed * dt;
    }

    ctx.worldClock.advance(dt);
  }

  render(ctx: SceneContext): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "#020308");

    const camX = this.ship.x - r.internalWidth / 2;
    const camY = this.ship.y - r.internalHeight / 2;

    for (let i = 0; i < 60; i++) {
      const bx = ((i * 131 + Math.floor(camX * 0.3)) % r.internalWidth + r.internalWidth) % r.internalWidth;
      const by = ((i * 97 + Math.floor(camY * 0.3)) % r.internalHeight + r.internalHeight) % r.internalHeight;
      r.drawRect(bx, by, 1, 1, "#1a1a28");
    }

    for (const body of this.sector.bodies) {
      const sx = body.x - camX;
      const sy = body.y - camY;
      if (sx < -body.r * 2 || sx > r.internalWidth + body.r * 2) continue;
      if (sy < -body.r * 2 || sy > r.internalHeight + body.r * 2) continue;
      const color = this.bodyColor(body);
      r.drawRect(sx - body.r, sy - body.r, body.r * 2, body.r * 2, color);
      drawLabel(r, body.name, sx, sy - body.r - 8, "#cfd8e8", 6, "center");
    }

    for (const tv of this.traderVisuals) {
      const sx = tv.x - camX;
      const sy = tv.y - camY;
      if (sx < -4 || sx > r.internalWidth + 4) continue;
      if (sy < -4 || sy > r.internalHeight + 4) continue;
      r.drawRect(sx - 1, sy - 1, 3, 3, "#8fd97a");
    }

    const shipSx = this.ship.x - camX;
    const shipSy = this.ship.y - camY;
    r.drawRect(shipSx - 2, shipSy - 2, 4, 4, this.captain.paint);
    const nx = Math.cos(this.ship.angle) * 4;
    const ny = Math.sin(this.ship.angle) * 4;
    r.drawRect(shipSx + nx - 0.5, shipSy + ny - 0.5, 1, 1, "#ffffff");

    drawLabel(
      r,
      `${this.captain.name} — ${this.sector.name}`,
      6,
      6,
      "#cfd8e8",
      8,
    );
    drawLabel(
      r,
      `pos ${Math.round(this.ship.x)},${Math.round(this.ship.y)}  traders ${this.traderVisuals.length}`,
      6,
      18,
      "#8a98b0",
      6,
    );
    drawLabel(r, "WASD fly | ESC pause | F3 debug", 6, r.internalHeight - 10, "#506070", 6);

    if (this.paused) {
      drawPauseOverlay(r, ctx.input, {
        onResume: () => {
          this.paused = false;
        },
        onSave: () => {
          ctx.saveStore.save(this.buildSnapshot(ctx));
        },
        onQuit: () => ctx.changeScene(new TitleScene()),
      });
    }

    this.debug.render(r);
  }

  private bodyColor(body: SectorBody): string {
    if (body.kind === "station") return "#b9a83a";
    if (body.kind === "belt") return "#3a2f26";
    return body.faction === "free_worlds" ? "#4a8cb9" : "#6a4a3a";
  }

  private buildSnapshot(ctx: SceneContext): SaveSnapshot {
    return {
      version: CURRENT_SAVE_VERSION,
      seed: 0,
      worldClock: ctx.worldClock.elapsed(),
      captain: this.captain,
      ship: {
        hullId: "shrike",
        moduleIds: [],
        position: { x: this.ship.x, y: this.ship.y },
        velocity: { x: this.ship.vx, y: this.ship.vy },
        angle: this.ship.angle,
        hp: 100,
        shield: 50,
        credits: 500,
        cargo: [],
      },
      sector: {
        id: this.sector.id,
        traders: this.traderVisuals.map((tv) => ({
          id: tv.traderId,
          archetype: "hauler",
          position: { x: tv.x, y: tv.y },
          state: "idle",
          currentRoute: null,
          cargo: [],
        })),
        stockpiles: this.economy.stations.flatMap((st) =>
          [...st.stockpiles.values()].map((sp) => ({
            stationId: st.id,
            goodId: sp.goodId,
            quantity: sp.quantity,
            equilibrium: sp.equilibrium,
          })),
        ),
      },
      inventory: { items: [] },
      factions: { free_worlds: { rep: 0 }, scrapfather: { rep: 0 } },
      quests: { active: [], completed: [] },
      outposts: {},
      scene: { type: "SpaceScene" },
    };
  }

  private applySnapshot(snap: SaveSnapshot): void {
    this.ship.x = snap.ship.position.x;
    this.ship.y = snap.ship.position.y;
    this.ship.vx = snap.ship.velocity.x;
    this.ship.vy = snap.ship.velocity.y;
    this.ship.angle = snap.ship.angle;
    for (const sp of snap.sector.stockpiles) {
      const station = this.economy.stations.find((s) => s.id === sp.stationId);
      const stock = station?.stockpiles.get(sp.goodId);
      if (stock) stock.quantity = sp.quantity;
    }
    for (const t of snap.sector.traders) {
      const tv = this.traderVisuals.find((v) => v.traderId === t.id);
      if (tv) {
        tv.x = t.position.x;
        tv.y = t.position.y;
      }
    }
  }
}
