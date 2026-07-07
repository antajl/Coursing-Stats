/**
 * Local dev API server — reads data/v1/ (no D1 required).
 * Production uses worker.ts + static snapshot on Pages (see wrangler.toml).
 */
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import app from './app';
import { createNodeDataStore, persistNodeDataStore } from '../lib/local-data/node-data-store';

const PORT = Number(process.env.PORT || 8787);

console.log('Loading data/v1 into memory...');
const t0 = Date.now();
const store = createNodeDataStore();
console.log(`Ready in ${Date.now() - t0}ms`, store.stats);

const env = {
  DB: store.db,
  ADMIN_API_TOKEN: process.env.ADMIN_API_TOKEN ?? '',
  DATA_STORE: store,
};

const wrapper = new Hono();
wrapper.use('*', async (c, next) => {
  await next();
  if (
    c.req.path.startsWith('/api/admin') &&
    c.req.method !== 'GET' &&
    c.res.status < 400 &&
    c.env.DATA_STORE?.nodeDb
  ) {
    persistNodeDataStore();
  }
});
wrapper.route('/', app);

serve(
  {
    fetch: (request) => wrapper.fetch(request, env),
    port: PORT,
  },
  (info) => {
    console.log(`Local API (file data) http://127.0.0.1:${info.port}`);
  },
);
