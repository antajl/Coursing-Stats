import { reparseCoursingEvents } from './reparse-coursing-events.mjs';
import { createClient } from '@libsql/client';

// Create local D1 client
const db = createClient({
  url: 'file:../.wrangler/state/v3/d1/miniflare-D1DatabaseObject/4a5d6d4ad-7fc5-41b4-a33b-05f4daa382d4.sqlite'
});

console.log('Starting direct re-parsing...');

reparseCoursingEvents(db)
  .then((result) => {
    console.log('Re-parsing completed:', result);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Re-parsing failed:', err);
    process.exit(1);
  });
