import { describe, it, expect } from 'vitest';

/**
 * In-process Worker tests require vitest@4 + @cloudflare/vitest-pool-workers.
 * Until upgraded, use: npx tsx backend/scripts/test/smoke-api.ts
 * (with `npm run dev` running).
 */
describe.skip('API Tests (Worker + D1)', () => {
  it('placeholder — see smoke-api.ts', () => {
    expect(true).toBe(true);
  });
});
