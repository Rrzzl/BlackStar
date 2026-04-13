export class Assets {
  private readonly jsonCache = new Map<string, unknown>();
  private readonly imageCache = new Map<string, HTMLImageElement>();

  async loadJSON<T>(url: string): Promise<T> {
    const cached = this.jsonCache.get(url);
    if (cached !== undefined) return cached as T;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    const data = (await res.json()) as T;
    this.jsonCache.set(url, data);
    return data;
  }

  loadImage(url: string): Promise<HTMLImageElement> {
    const cached = this.imageCache.get(url);
    if (cached) return Promise.resolve(cached);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = (): void => {
        this.imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = (): void => reject(new Error(`Failed to load image ${url}`));
      img.src = url;
    });
  }
}
