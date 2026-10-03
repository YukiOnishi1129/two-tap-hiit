import { describe, expect, it } from 'vitest';

import { app } from './app';

describe('server', () => {
  it('GET /health', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('GET /config', async () => {
    const res = await app.request('/config');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ads: { recordsTransitionProbability: 0.25, completionInterstitialDelaySeconds: 5 },
    });
  });
});
