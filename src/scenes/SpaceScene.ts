import { Scene, type SceneContext } from "@engine/Scene";
import { DebugOverlay } from "@engine/DebugOverlay";
import { RNG } from "@core/RNG";
import { Camera } from "@engine/Camera";
import type { CaptainState } from "@core/player/Captain";
import type { SectorData, SectorBody } from "@core/world/Sector";
import { buildStations } from "@core/world/Sector";
import { GoodsRegistry, type GoodDef } from "@core/economy/Goods";
import { Economy } from "@core/economy/Economy";
import { Trader } from "@core/economy/Trader";
import { CURRENT_SAVE_VERSION, type SaveSnapshot } from "@core/world/SaveSnapshot";
import { drawLabel } from "@ui/Label";
import { drawPauseOverlay } from "./PauseOverlay";
import { drawSaveSlotPicker } from "./SaveSlotPickerOverlay";
import { SaveStore } from "@engine/Save";
import { migrations } from "@core/world/migrations";
import { TitleScene } from "./TitleScene";
import { StationScene } from "./StationScene";
import { PlanetLandingScene } from "./PlanetLandingScene";
import type { Loadout } from "@core/ship/Loadout";
import { ProjectilePool } from "@core/combat/ProjectilePool";
import { makeWeaponRuntime, canFire, fire, tickCooldown, type WeaponRuntime, type WeaponDef } from "@core/combat/Weapon";
import { makeHealth, applyDamage, isDead } from "@core/combat/Health";
import type { Health } from "@core/combat/Health";
import { circleHit } from "@core/combat/Hit";
import { steerRusher, steerShooter } from "@core/combat/EnemyAI";
import type { Enemy, EnemiesData } from "@core/combat/Enemy";
import { makePlayerHealth } from "@core/player/PlayerHealth";
import sectorData from "@content/sectors/grayline-reach.json";
import goodsData from "@content/goods.json";
import weaponsData from "@content/weapons.json";
import enemiesData from "@content/enemies.json";

const WEAPONS = weaponsData as WeaponDef[];
const ENEMIES = enemiesData as EnemiesData;

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
  private savingSlot = false;
  private debug = new DebugOverlay();
  private worldClockUnsubs: Array<() => void> = [];
  private rng: RNG;
  private camera = new Camera(0.15);
  private projectiles = new ProjectilePool(64);
  private playerWeapon: WeaponRuntime | null = null;
  private enemies: Enemy[] = [];
  private playerHealth: Health = makePlayerHealth(0, 0);
  private damageFlash = 0;

  private pendingSnapshot: SaveSnapshot | null = null;

  constructor(
    readonly captain: CaptainState,
    readonly seed: number,
    readonly loadout: Loadout,
    spawnBodyId?: string,
    snapshot?: SaveSnapshot,
  ) {
    super();
    this.rng = new RNG(seed);
    this.debug.enabled = false;
    if (snapshot) {
      this.pendingSnapshot = snapshot;
    } else if (spawnBodyId) {
      const body = (sectorData as unknown as SectorData).bodies.find((b) => b.id === spawnBodyId);
      if (body) {
        this.ship.x = body.x + body.r + 24;
        this.ship.y = body.y;
        this.ship.vx = 0;
        this.ship.vy = 0;
      }
    }
    this.camera.snap(this.ship.x, this.ship.y);
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
          x: fromBody.x + (this.rng.next() - 0.5) * 40,
          y: fromBody.y + (this.rng.next() - 0.5) * 40,
          speed: 40 + this.rng.next() * 30,
          target: toBody,
        });
      }
    }

    const firstWeaponModule = this.loadout.installed().find((m) => m.slot === "weapon");
    if (firstWeaponModule) {
      const def = WEAPONS.find((w) => w.id === firstWeaponModule.id);
      if (def) this.playerWeapon = makeWeaponRuntime(def);
    }

    let hpBonus = 0;
    let shieldBonus = 0;
    for (const m of this.loadout.installed()) {
      const s = m.stats as { hp?: number; shield?: number };
      if (s.hp) hpBonus += s.hp;
      if (s.shield) shieldBonus += s.shield;
    }
    this.playerHealth = makePlayerHealth(shieldBonus, hpBonus);

    for (const spawn of ENEMIES.spawns) {
      const arch = ENEMIES.archetypes.find((a) => a.id === spawn.archetype);
      if (!arch) continue;
      let weaponRuntime: WeaponRuntime | null = null;
      if (arch.weapon) {
        const def = WEAPONS.find((w) => w.id === arch.weapon);
        if (def) weaponRuntime = makeWeaponRuntime(def);
      }
      this.enemies.push({
        id: spawn.id,
        archetype: arch,
        x: spawn.x,
        y: spawn.y,
        vx: 0,
        vy: 0,
        angle: 0,
        health: makeHealth(arch.hp, arch.shield),
        weapon: weaponRuntime,
      });
    }
  }

  enter(ctx: SceneContext): void {
    ctx.audio.play("ambient_space", 0.2, true);
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

    if (this.pendingSnapshot) {
      this.applySnapshot(this.pendingSnapshot);
      this.pendingSnapshot = null;
    }
  }

  exit(_ctx: SceneContext): void {
    for (const unsub of this.worldClockUnsubs) unsub();
    this.worldClockUnsubs = [];
  }

  update(ctx: SceneContext, dt: number): void {
    this.debug.tick();
    if (ctx.input.wasKeyPressed("KeyP")) this.paused = !this.paused;
    if (ctx.input.wasKeyPressed("F3")) this.debug.enabled = !this.debug.enabled;
    if (this.paused) return;

    if (ctx.input.wasKeyPressed("KeyF")) {
      const target = this.nearestInteractable();
      if (target) {
        if (target.kind === "station") {
          ctx.changeScene(new StationScene(this.captain, this.seed, this.loadout, target.id));
          return;
        } else if (target.kind === "planet") {
          ctx.changeScene(new PlanetLandingScene(this.captain, this.seed, this.loadout, target.id));
          return;
        }
      }
    }

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
    this.camera.follow(this.ship.x, this.ship.y);
    this.camera.tick(dt);

    if (this.playerWeapon) tickCooldown(this.playerWeapon, dt);
    this.projectiles.tick(dt);

    if (this.playerWeapon && ctx.input.wasKeyPressed("Space")) {
      const availablePower = 100;
      if (canFire(this.playerWeapon, availablePower)) {
        const spawn = fire(this.playerWeapon, {
          x: this.ship.x,
          y: this.ship.y,
          angle: this.ship.angle,
          ownerId: "player",
        });
        this.projectiles.spawn(spawn);
      }
    }

    for (const tv of this.traderVisuals) {
      const dx = tv.target.x - tv.x;
      const dy = tv.target.y - tv.y;
      const d = Math.hypot(dx, dy);
      if (d < tv.target.r + 10) {
        const others = this.sector.bodies.filter(
          (b) => b !== tv.target && b.kind !== "belt",
        );
        if (others.length > 0) {
          tv.target = this.rng.pick(others);
        }
        continue;
      }
      tv.x += (dx / d) * tv.speed * dt;
      tv.y += (dy / d) * tv.speed * dt;
    }

    for (const e of this.enemies) {
      const v = e.archetype.id === "rusher"
        ? steerRusher(e, this.ship, e.archetype.speed)
        : steerShooter(e, this.ship, e.archetype.speed, e.archetype.preferredRangePx ?? 180);
      e.vx = v.vx;
      e.vy = v.vy;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.angle = Math.atan2(this.ship.y - e.y, this.ship.x - e.x);
      if (e.weapon) {
        tickCooldown(e.weapon, dt);
        const d = Math.hypot(this.ship.x - e.x, this.ship.y - e.y);
        if (d < 260 && canFire(e.weapon, 100)) {
          const spawn = fire(e.weapon, { x: e.x, y: e.y, angle: e.angle, ownerId: e.id });
          this.projectiles.spawn(spawn);
        }
      }
    }

    for (const p of this.projectiles.active()) {
      if (p.ownerId === "player") {
        for (const e of this.enemies) {
          if (circleHit({ x: p.x, y: p.y, r: 2 }, { x: e.x, y: e.y, r: e.archetype.radius })) {
            e.health = applyDamage(e.health, p.damage);
            this.projectiles.free(p);
            break;
          }
        }
      } else {
        if (circleHit({ x: p.x, y: p.y, r: 2 }, { x: this.ship.x, y: this.ship.y, r: 4 })) {
          this.playerHealth = applyDamage(this.playerHealth, p.damage);
          this.camera.shake(Math.min(3, p.damage * 0.2), 0.2);
          this.damageFlash = 1;
          this.projectiles.free(p);
        }
      }
    }

    for (const e of this.enemies) {
      if (e.archetype.contactDamage <= 0) continue;
      if (circleHit({ x: e.x, y: e.y, r: e.archetype.radius }, { x: this.ship.x, y: this.ship.y, r: 4 })) {
        this.playerHealth = applyDamage(this.playerHealth, e.archetype.contactDamage);
        this.camera.shake(4, 0.3);
        this.damageFlash = 1;
        e.health.hp = 0;
      }
    }

    this.enemies = this.enemies.filter((e) => !isDead(e.health));
    if (isDead(this.playerHealth)) {
      ctx.changeScene(new TitleScene());
      return;
    }

    this.damageFlash = Math.max(0, this.damageFlash - dt * 5);

    ctx.worldClock.advance(dt);
  }

  render(ctx: SceneContext): void {
    const r = ctx.renderer;
    r.drawRect(0, 0, r.internalWidth, r.internalHeight, "#020308");

    const camX = this.camera.offsetX(r.internalWidth);
    const camY = this.camera.offsetY(r.internalHeight);

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

    for (const e of this.enemies) {
      const sx = e.x - camX;
      const sy = e.y - camY;
      if (sx < -e.archetype.radius * 2 || sx > r.internalWidth + e.archetype.radius * 2) continue;
      if (sy < -e.archetype.radius * 2 || sy > r.internalHeight + e.archetype.radius * 2) continue;
      const rr = e.archetype.radius;
      r.drawRect(sx - rr, sy - rr, rr * 2, rr * 2, e.archetype.color);
    }

    for (const p of this.projectiles.active()) {
      const sx = p.x - camX;
      const sy = p.y - camY;
      if (sx < -2 || sx > r.internalWidth + 2) continue;
      if (sy < -2 || sy > r.internalHeight + 2) continue;
      r.drawRect(sx - 1, sy - 1, 2, 2, "#f0e070");
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
    const hpPct = this.playerHealth.hp / this.playerHealth.maxHp;
    const shPct = this.playerHealth.maxShield > 0 ? this.playerHealth.shield / this.playerHealth.maxShield : 0;
    r.drawRect(6, 28, 80, 4, "#2a2630");
    r.drawRect(6, 28, Math.round(80 * hpPct), 4, "#c04a4a");
    r.drawRect(6, 34, 80, 3, "#2a2a3a");
    r.drawRect(6, 34, Math.round(80 * shPct), 3, "#4a8cb9");
    drawLabel(r, "WASD fly | SPACE fire | P pause | F3 debug", 6, r.internalHeight - 10, "#506070", 6);

    const near = this.nearestInteractable();
    if (near) {
      const verb =
        near.kind === "station" ? "Dock" :
        near.id === "kepler-7b" ? "Explore Ruin" : "Land";
      drawLabel(r, `[F] ${verb} — ${near.name}`, r.internalWidth / 2, r.internalHeight - 24, "#e8b060", 7, "center");
    }

    const showPicker = this.paused && this.savingSlot;
    if (this.paused && !showPicker) {
      drawPauseOverlay(r, ctx.input, {
        onResume: () => {
          this.paused = false;
        },
        onSave: () => { this.savingSlot = true; },
        onQuit: () => ctx.changeScene(new TitleScene()),
      });
    }
    if (showPicker) {
      drawSaveSlotPicker(r, ctx.input, {
        slots: SaveStore.SLOT_IDS.map((id) => ({ id, snap: SaveStore.loadFromSlot(id, migrations) })),
        onPick: (id) => {
          SaveStore.saveToSlot(id, this.buildSnapshot(ctx));
          this.savingSlot = false;
        },
        onCancel: () => { this.savingSlot = false; },
        title: "SAVE TO SLOT",
      });
    }

    if (this.damageFlash > 0) {
      r.drawRect(0, 0, r.internalWidth, r.internalHeight, `rgba(192,32,32,${(this.damageFlash * 0.35).toFixed(3)})`);
    }

    this.debug.render(r);
  }

  private nearestInteractable(): SectorBody | null {
    let best: SectorBody | null = null;
    let bestD = Infinity;
    for (const b of this.sector.bodies) {
      if (b.kind === "belt") continue;
      const dx = b.x - this.ship.x;
      const dy = b.y - this.ship.y;
      const d = Math.hypot(dx, dy) - b.r;
      if (d < 40 && d < bestD) {
        bestD = d;
        best = b;
      }
    }
    return best;
  }

  private bodyColor(body: SectorBody): string {
    if (body.kind === "station") return "#b9a83a";
    if (body.kind === "belt") return "#3a2f26";
    return body.faction === "free_worlds" ? "#4a8cb9" : "#6a4a3a";
  }

  private buildSnapshot(ctx: SceneContext): SaveSnapshot {
    return {
      version: CURRENT_SAVE_VERSION,
      seed: this.seed,
      worldClock: ctx.worldClock.elapsed(),
      captain: this.captain,
      ship: {
        hullId: this.loadout.hull.id,
        moduleIds: this.loadout.installed().map((m) => m.id),
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
        playerBody: null,
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
    this.rng = new RNG(snap.seed);
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
    this.camera.snap(this.ship.x, this.ship.y);
  }
}
