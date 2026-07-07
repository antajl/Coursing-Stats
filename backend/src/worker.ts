import app from './app';
import { getWorkerDataStore } from '../lib/local-data/worker-db';
import type { DataStoreEnv } from '../lib/local-data/types';

export default {
  async fetch(request: Request, env: DataStoreEnv, ctx: ExecutionContext) {
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
  },
};
