import { describe, it, expect, beforeAll } from 'vitest';
import { Miniflare } from 'miniflare';

describe('API Tests', () => {
  let mf;

  beforeAll(async () => {
    mf = new Miniflare({
      scriptPath: '../src/worker.ts',
      modules: true,
      d1Databases: {
        DB: ':memory:',
      },
    });

    // Initialize database with schema
    const schema = await (await import('../schema.sql')).default;
    await mf.getD1Database('DB').exec(schema);
  });

  it('should respond to /api/test', async () => {
    const res = await mf.dispatchFetch('http://localhost/api/test');
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.test).toBeDefined();
    expect(data.db).toBe(true);
  });

  it('should return breeds', async () => {
    const res = await mf.dispatchFetch('http://localhost/api/breeds');
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('should return years', async () => {
    const res = await mf.dispatchFetch('http://localhost/api/years');
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('should return competitions', async () => {
    const res = await mf.dispatchFetch('http://localhost/api/competitions');
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('should protect admin endpoints without token', async () => {
    const res = await mf.dispatchFetch('http://localhost/api/recreate-views', {
      method: 'POST',
    });
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});
