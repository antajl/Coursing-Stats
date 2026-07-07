import app from './app';
import { getWorkerDataStore } from '../lib/local-data/worker-db';
import type { DataStoreEnv } from '../lib/local-data/types';

export default {
  async fetch(request: Request, env: DataStoreEnv, ctx: ExecutionContext) {
    try {
      const store = await getWorkerDataStore(env);
      return app.fetch(
        request,
        {
          ...env,
          DB: store.db,
          DATA_STORE: store,
        },
        ctx,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Worker data load failed:', message);
      if (new URL(request.url).pathname.startsWith('/api/')) {
        return Response.json(
          { success: false, error: 'Data store unavailable', detail: message },
          { status: 503 },
        );
      }
      return new Response('Service unavailable', { status: 503 });
    }
  },
};
