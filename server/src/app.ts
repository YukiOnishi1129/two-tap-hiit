import { Hono } from 'hono';

import { APP_CONFIG } from './config';

export type Bindings = {
  // D1 を有効化したら追加する
  // DB: D1Database;
};

export const app = new Hono<{ Bindings: Bindings }>();

app.get('/health', (c) => c.json({ status: 'ok' }));

app.get('/config', (c) => {
  // 端末側でキャッシュしすぎないよう短めに
  c.header('Cache-Control', 'public, max-age=300');
  return c.json(APP_CONFIG);
});
