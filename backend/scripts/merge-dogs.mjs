import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sourceDogId = parseInt(process.argv[2], 10);
const targetDogId = parseInt(process.argv[3], 10);

if (!sourceDogId || !targetDogId || sourceDogId === targetDogId) {
  console.error(
    "Usage: node scripts/merge-dogs.mjs <sourceDogId> <targetDogId>\n" +
      "  sourceDogId — дубликат (будет помечен merged_into)\n" +
      "  targetDogId — каноническая запись"
  );
  process.exit(1);
}

const dbPath = path.resolve(
  __dirname,
  "../../.wrangler/state/v3/d1/miniflare-D1DatabaseObject/25a9fdfb5f2c0e75c4b581cbf0100f9e751bd9d7099c87a38bf84799002c7481.sqlite"
);

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const source = db
  .prepare("SELECT id, name_lat, breed, merged_into_dog_id FROM dogs WHERE id = ?")
  .get(sourceDogId);
const target = db
  .prepare("SELECT id, name_lat, breed, merged_into_dog_id FROM dogs WHERE id = ?")
  .get(targetDogId);

if (!source) {
  console.error(`Source dog #${sourceDogId} not found`);
  process.exit(1);
}
if (!target) {
  console.error(`Target dog #${targetDogId} not found`);
  process.exit(1);
}
if (source.merged_into_dog_id) {
  console.error(`Source dog #${sourceDogId} already merged into #${source.merged_into_dog_id}`);
  process.exit(1);
}
if (target.merged_into_dog_id) {
  console.error(`Target dog #${targetDogId} is itself a duplicate of #${target.merged_into_dog_id}`);
  process.exit(1);
}

const resultsCount = db
  .prepare("SELECT COUNT(*) AS n FROM results WHERE dog_id = ?")
  .get(sourceDogId).n;

const merge = db.transaction(() => {
  db.prepare(
    `UPDATE results SET dog_id = ? WHERE dog_id = ?`
  ).run(targetDogId, sourceDogId);

  db.prepare(
    `UPDATE dogs SET merged_into_dog_id = ? WHERE id = ?`
  ).run(targetDogId, sourceDogId);
});

merge();

console.log(`Merged dog #${sourceDogId} (${source.name_lat}, ${source.breed})`);
console.log(`  → #${targetDogId} (${target.name_lat}, ${target.breed})`);
console.log(`  Results moved: ${resultsCount}`);

db.close();
