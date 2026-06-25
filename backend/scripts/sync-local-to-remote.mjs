/**
 * Экспорт локальной D1 (miniflare) в SQL и загрузка на remote.
 * Использует естественные ключи (results_url, name_lat+breed), безопасно
 * для повторного запуска (INSERT OR IGNORE / ON CONFLICT).
 *
 * Usage:
 *   node backend/scripts/sync-local-to-remote.mjs           # только SQL
 *   node backend/scripts/sync-local-to-remote.mjs --push    # SQL + wrangler --remote
 */

import Database from "better-sqlite3";
import fs from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const push = process.argv.includes("--push");

const LOCAL_DB = path.resolve(
  ROOT,
  ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/25a9fdfb5f2c0e75c4b581cbf0100f9e751bd9d7099c87a38bf84799002c7481.sqlite"
);

function esc(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

function exportEvents(db) {
  const events = db.prepare(`SELECT * FROM events ORDER BY year, date_start`).all();
  const lines = [`-- events: ${events.length}`];

  for (const e of events) {
    lines.push(`
INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, region, location, catalog_url, results_url, confirmed, last_modified
) VALUES (
  ${e.year},
  ${esc(e.date_start)},
  ${esc(e.date_end)},
  ${esc(e.rank_label)},
  ${esc(e.event_type)},
  ${esc(e.competition_kind)},
  ${esc(e.competition_type)},
  ${esc(e.title)},
  ${esc(e.host_club)},
  ${esc(e.region)},
  ${esc(e.location)},
  ${e.catalog_url ? esc(e.catalog_url) : "NULL"},
  ${e.results_url ? esc(e.results_url) : "NULL"},
  ${e.confirmed ?? 0},
  ${e.last_modified ? esc(e.last_modified) : "NULL"}
)
ON CONFLICT(results_url) DO UPDATE SET
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  rank_label = excluded.rank_label,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  confirmed = excluded.confirmed,
  last_modified = excluded.last_modified;`);
  }
  return lines.join("\n");
}

function exportDogs(db) {
  const dogs = db
    .prepare(
      `SELECT
         d.name_lat, d.breed, d.name_ru, d.sex, d.owner, d.pedigree_url,
         d.merged_into_dog_id,
         c.name_lat AS canon_name_lat,
         c.breed AS canon_breed
       FROM dogs d
       LEFT JOIN dogs c ON c.id = d.merged_into_dog_id
       ORDER BY CASE WHEN d.merged_into_dog_id IS NULL THEN 0 ELSE 1 END, d.id`
    )
    .all();
  const lines = [`-- dogs: ${dogs.length}`];

  for (const d of dogs) {
    const mergedInto = d.merged_into_dog_id
      ? `(SELECT id FROM dogs WHERE name_lat = ${esc(d.canon_name_lat)} AND breed = ${esc(d.canon_breed)} AND merged_into_dog_id IS NULL)`
      : "NULL";

    lines.push(`
INSERT OR IGNORE INTO dogs (
  name_lat, breed, name_ru, sex, owner, pedigree_url, merged_into_dog_id
) VALUES (
  ${esc(d.name_lat)},
  ${esc(d.breed)},
  ${esc(d.name_ru)},
  ${esc(d.sex)},
  ${esc(d.owner)},
  ${d.pedigree_url ? esc(d.pedigree_url) : "NULL"},
  ${mergedInto}
);`);
  }
  return lines.join("\n");
}

function exportResults(db) {
  const rows = db
    .prepare(
      `SELECT
         ev.results_url,
         d.name_lat,
         d.breed,
         r.breed_class,
         r.catalog_no,
         r.placement,
         r.total_score,
         r.judge_count,
         r.qualification,
         r.vc,
         r.status,
         r.raw_scores_json,
         r.raw_text
       FROM results r
       JOIN events ev ON ev.id = r.event_id
       JOIN dogs d ON d.id = r.dog_id
       ORDER BY ev.year, ev.date_start, d.name_lat`
    )
    .all();
  const lines = [`-- results: ${rows.length}`];

  for (const r of rows) {
    if (!r.results_url) continue;

    lines.push(`
INSERT OR IGNORE INTO results (
  event_id, dog_id, breed_class, catalog_no, placement, total_score, judge_count,
  qualification, vc, status, raw_scores_json, raw_text
) SELECT
  (SELECT id FROM events WHERE results_url = ${esc(r.results_url)}),
  (SELECT id FROM dogs WHERE name_lat = ${esc(r.name_lat)} AND breed = ${esc(r.breed)} AND merged_into_dog_id IS NULL),
  ${esc(r.breed_class)},
  ${r.catalog_no ?? "NULL"},
  ${r.placement ?? "NULL"},
  ${r.total_score ?? "NULL"},
  ${r.judge_count ?? 3},
  ${esc(r.qualification)},
  ${esc(r.vc)},
  ${esc(r.status ?? "finished")},
  ${esc(r.raw_scores_json)},
  ${esc(r.raw_text)}
WHERE EXISTS (SELECT 1 FROM events WHERE results_url = ${esc(r.results_url)})
  AND EXISTS (SELECT 1 FROM dogs WHERE name_lat = ${esc(r.name_lat)} AND breed = ${esc(r.breed)} AND merged_into_dog_id IS NULL);`);
  }
  return lines.join("\n");
}

async function main() {
  const db = new Database(LOCAL_DB, { readonly: true });

  const counts = {
    events: db.prepare("SELECT COUNT(*) AS c FROM events").get().c,
    dogs: db.prepare("SELECT COUNT(*) AS c FROM dogs").get().c,
    results: db.prepare("SELECT COUNT(*) AS c FROM results").get().c,
  };
  console.log("Local D1:", counts);

  const sqlParts = {
    events: ["-- sync-local-to-remote: events", exportEvents(db)],
    dogs: ["-- sync-local-to-remote: dogs", exportDogs(db)],
    results: ["-- sync-local-to-remote: results", exportResults(db)],
  };

  db.close();

  const paths = {};
  for (const [key, parts] of Object.entries(sqlParts)) {
    const outPath = path.join(ROOT, `data/sync-${key}.sql`);
    const content = parts.join("\n");
    await fs.writeFile(outPath, content);
    paths[key] = outPath;
    console.log(`  ${key}: ${(content.length / 1024 / 1024).toFixed(2)} MB → data/sync-${key}.sql`);
  }

  const combinedPath = path.join(ROOT, "data/sync-local-to-remote.sql");
  await fs.writeFile(
    combinedPath,
    Object.values(sqlParts).map((p) => p.join("\n")).join("\n")
  );
  console.log(`Combined: ${combinedPath}`);

  if (push) {
    if (!process.env.CLOUDFLARE_API_TOKEN) {
      console.warn("CLOUDFLARE_API_TOKEN not set — using wrangler login session");
    }
    console.log("\nApplying schema migrations on remote...");
    try {
      execSync(`npx wrangler d1 execute pc-db --remote --file=./data/migrate-remote-schema.sql -y`, {
        cwd: ROOT,
        stdio: "inherit",
      });
    } catch {
      console.warn("Schema migration skipped (columns may already exist)");
    }

    for (const key of ["events", "dogs", "results"]) {
      console.log(`\nPushing ${key} to remote D1...`);
      execSync(`npx wrangler d1 execute pc-db --remote --file=./data/sync-${key}.sql -y`, {
        cwd: ROOT,
        stdio: "inherit",
      });
    }
    console.log("\n✓ Remote D1 sync completed");
  } else {
    console.log("\nTo push: npm run sync-to-remote");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
