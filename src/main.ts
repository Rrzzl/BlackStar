import { GameLoop } from "@engine/GameLoop";
import { Input } from "@engine/Input";
import { Renderer } from "@engine/Renderer";
import { Assets } from "@engine/Assets";
import { Audio } from "@engine/Audio";
import { SaveStore } from "@engine/Save";
import { migrations } from "@core/world/migrations";
import { WorldClock } from "@core/world/WorldClock";
import { TitleScene } from "./scenes/TitleScene";
import { setButtonAudioHook } from "@ui/Button";

const canvas = document.getElementById("game") as HTMLCanvasElement | null;
if (!canvas) throw new Error("canvas #game not found");

const resize = (): void => {
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
};
resize();
window.addEventListener("resize", resize);

const renderer = new Renderer(canvas);
const input = new Input(canvas);
const assets = new Assets();
const audio = new Audio();
void audio.load("ambient_space", "/audio/ambient_space.mp3").catch(() => {});
void audio.load("click", "/audio/click.mp3").catch(() => {});
setButtonAudioHook((id) => audio.play(id, 0.5));
const saveStore = new SaveStore("slot0", migrations);
const worldClock = new WorldClock();

const loop = new GameLoop(new TitleScene(), {
  input,
  renderer,
  assets,
  audio,
  saveStore,
  worldClock,
});
loop.start();
