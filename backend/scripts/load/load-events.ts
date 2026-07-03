import fs from "node:fs/promises";

/**
 * Загрузка событий в D1/SQLite.
 *
 * Использование:
 * npx tsx backend/scripts/load/load-events.ts [events-file]
 */

const EVENTS_FILE = process.argv[2] || "data/events/events.json";

const UPDATE_SET = `
  year = excluded.year,
  date_start = excluded.date_start,
  date_end = excluded.date_end,
  rank_label = excluded.rank_label,
  event_type = excluded.event_type,
  competition_kind = excluded.competition_kind,
  competition_type = excluded.competition_type,
  title = excluded.title,
  host_club = excluded.host_club,
  location = excluded.location,
  catalog_url = excluded.catalog_url,
  results_url = excluded.results_url,
  confirmed = excluded.confirmed,
  judges = excluded.judges`;

function buildInsertSql(event: Record<string, unknown>): string {
  const eventType = (event.event_type as string) || "unknown";
  const rankLabel = String(event.rank_label || "").replace(/'/g, "''");
  const title = String(event.title || "").replace(/'/g, "''");
  const hostClub = String(event.host_club || "").replace(/'/g, "''");
  const location = String(event.location || "").replace(/'/g, "''");
  const competitionKind = String(event.competition_kind || "").replace(/'/g, "''");
  const competitionType = String(event.competition_type || "").replace(/'/g, "''");
  const judges = event.judges
    ? `'${String(event.judges).replace(/'/g, "''")}'`
    : "NULL";

  const values = `(
  ${event.year},
  '${event.date_start}',
  ${event.date_end ? `'${event.date_end}'` : "NULL"},
  '${rankLabel}',
  '${eventType}',
  '${competitionKind}',
  '${competitionType}',
  '${title}',
  '${hostClub}',
  '${location}',
  ${event.catalog_url ? `'${event.catalog_url}'` : "NULL"},
  ${event.results_url ? `'${event.results_url}'` : "NULL"},
  ${event.confirmed},
  ${judges}
)`;

  if (event.results_url) {
    return `
INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES ${values}
ON CONFLICT(results_url) DO UPDATE SET${UPDATE_SET};`;
  }

  return `
INSERT INTO events (
  year, date_start, date_end, rank_label, event_type, competition_kind, competition_type,
  title, host_club, location, catalog_url, results_url, confirmed, judges
) VALUES ${values}
ON CONFLICT(date_start, title, location, event_type) DO UPDATE SET${UPDATE_SET};`;
}

async function loadEvents() {
  console.log(`Загрузка событий из ${EVENTS_FILE}...`);

  const eventsData = await fs.readFile(EVENTS_FILE, "utf8");
  const events = JSON.parse(eventsData);

  console.log(`Найдено ${events.length} событий`);

  const sqlStatements = events.map((event: Record<string, unknown>) => buildInsertSql(event));
  const sqlScript = sqlStatements.join("\n");

  await fs.writeFile("data/imports/load-events.sql", sqlScript);
  console.log("SQL-скрипт сохранён в data/imports/load-events.sql");

  console.log("\nДля выполнения:");
  console.log("Cloudflare D1 (local):");
  console.log("  npx wrangler d1 execute pc-db --local --file=./data/imports/load-events.sql");
  console.log("\nCloudflare D1 (production):");
  console.log("  npx wrangler d1 execute pc-db --remote --file=./data/imports/load-events.sql");
}

loadEvents().catch(console.error);
