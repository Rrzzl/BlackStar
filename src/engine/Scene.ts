import type { Input } from "./Input";
import type { Renderer } from "./Renderer";
import type { Assets } from "./Assets";
import type { Audio } from "./Audio";
import type { SaveStore } from "./Save";
import type { WorldClock } from "@core/world/WorldClock";

export interface SceneContext {
  input: Input;
  renderer: Renderer;
  assets: Assets;
  audio: Audio;
  saveStore: SaveStore;
  worldClock: WorldClock;
  changeScene: (next: Scene) => void;
}

export abstract class Scene {
  abstract enter(ctx: SceneContext): void | Promise<void>;
  abstract update(ctx: SceneContext, dt: number): void;
  abstract render(ctx: SceneContext, alpha: number): void;
  exit(_ctx: SceneContext): void {}
}
