export {};

const Database = (await import('better-sqlite3')).default;
const db = new Database('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/25a9fdfb5f2c0e75c4b581cbf0100f9e751bd9d7099c87a38bf84799002c7481.sqlite');

const events = db.prepare('SELECT id, date_start, event_type, results_url FROM events LIMIT 10').all();
console.log('Events:', events);

const coursingEvents = db.prepare("SELECT id, date_start, event_type, results_url FROM events WHERE event_type = 'coursing' LIMIT 10").all();
console.log('Coursing events:', coursingEvents);

const events2023 = db.prepare("SELECT id, date_start, event_type, results_url FROM events WHERE date_start LIKE '2023%' LIMIT 10").all();
console.log('Events 2023:', events2023);

const coursing2023 = db.prepare("SELECT id, date_start, event_type, results_url FROM events WHERE date_start LIKE '2023%' AND event_type = 'coursing' LIMIT 10").all();
console.log('Coursing 2023:', coursing2023);

db.close();
