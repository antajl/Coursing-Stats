/**
 * Полный пайплайн инкрементального обновления для CI (GitHub Actions).
 *
 * 1. Скрапинг индекса текущего года
 * 2. Генерация SQL для событий и результатов
 * 3. Применение к remote D1 через wrangler
 *
 * Требует env: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
 *
 * Usage: node backend/scripts/ci-update-db.mjs
 */

import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, ...opts.env },
  });
}

async function fileSize(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.size;
  } catch {
    return 0;
  }
}

async function main() {
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    console.error("CLOUDFLARE_API_TOKEN is required");
    process.exit(1);
  }

  const eventsFile = "data/events/events-current.json";
  const eventsSql = "data/imports/load-events.sql";
  const resultsSql = "data/imports/load-results.sql";

  run("node backend/scripts/update/update-current-year.mjs");
  run(`node backend/scripts/load/load-events.mjs ${eventsFile}`);

  const eventsSize = await fileSize(path.join(ROOT, eventsSql));
  if (eventsSize > 0) {
    run(`npx wrangler d1 execute pc-db --remote --file=./${eventsSql}`);
  } else {
    console.log("Skipping events SQL — file empty");
  }

  run(`node backend/scripts/load/load-results.mjs ${eventsFile}`);

  const resultsSize = await fileSize(path.join(ROOT, resultsSql));
  if (resultsSize > 0) {
    run(`npx wrangler d1 execute pc-db --remote --file=./${resultsSql}`);
  } else {
    console.log("Skipping results SQL — file empty");
  }

  console.log("\n✓ CI database update completed");
}

main().catch((err) => {
  console.error("CI update failed:", err.message);
  process.exit(1);
});
