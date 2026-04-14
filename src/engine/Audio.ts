export class Audio {
  private ctx: AudioContext | null = null;
  private readonly buffers = new Map<string, AudioBuffer>();
  private masterVol = 1;

  private ensure(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  async load(id: string, url: string): Promise<void> {
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    const ctx = this.ensure();
    const buf = await ctx.decodeAudioData(arr);
    this.buffers.set(id, buf);
  }

  play(id: string, volume = 1, loop = false): void {
    const buf = this.buffers.get(id);
    if (!buf) return;
    const ctx = this.ensure();
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = loop;
    const gain = ctx.createGain();
    gain.gain.value = volume * this.masterVol;
    src.connect(gain).connect(ctx.destination);
    src.start();
  }

  setMasterVolume(v: number): void {
    this.masterVol = Math.max(0, Math.min(1, v));
  }
}
