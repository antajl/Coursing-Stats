import { createNodeDataStore } from '../../lib/local-data/node-data-store';
import { syncSqliteToV1 } from './sync-sqlite-to-v1';

const store = createNodeDataStore();
const result = syncSqliteToV1(store.nodeDb);
console.log('Synced sqlite → data/v1:', result);
