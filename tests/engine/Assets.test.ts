import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Assets } from '@engine/Assets';

describe('Assets', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => ({
        ok: true,
        status: 200,
        json: async () => ({ url, mock: true }),
        text: async () => `text:${url}`,
      })),
    );
  });

  it('loads JSON and caches by url', async () => {
    const assets = new Assets();
    const a = await assets.loadJSON<{ url: string }>('/a.json');
    const b = await assets.loadJSON<{ url: string }>('/a.json');
    expect(a).toBe(b);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('loads different JSON files independently', async () => {
    const assets = new Assets();
    const a = await assets.loadJSON<{ url: string }>('/a.json');
    const b = await assets.loadJSON<{ url: string }>('/b.json');
    expect(a.url).toBe('/a.json');
    expect(b.url).toBe('/b.json');
  });
});
