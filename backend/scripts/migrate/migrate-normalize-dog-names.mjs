/**
 * Нормализация кличек и пород в таблице dogs.
 * Склеивает дубликаты, которые после нормализации совпадают.
 *
 * Usage:
 *   node backend/scripts/migrate-normalize-dog-names.mjs          # локальная D1 (miniflare)
 *   node backend/scripts/migrate-normalize-dog-names.mjs --sql    # только SQL-файл для remote
 */

import Database from "better-sqlite3";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeDogName, normalizeBreed } from "../../lib/dog-lookup.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlOnly = process.argv.includes("--sql");

const LOCAL_DB = path.resolve(
  __dirname,
  "../../.wrangler/state/v3/d1/miniflare-D1DatabaseObject/25a9fdfb5f2c0e75c4b581cbf0100f9e751bd9d7099c87a38bf84799002c7481.sqlite"
);

function buildMigrationPlan(dogs) {
  const groups = new Map();

  for (const dog of dogs) {
    const key = `${normalizeDogName(dog.name_lat)}|${normalizeBreed(dog.breed)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(dog);
  }

  const updates = [];
  const merges = [];

  for (const [key, group] of groups) {
    const [normName, normBreed] = key.split("|");
    group.sort((a, b) => a.id - b.id);
    const canonical = group[0];

    if (canonical.name_lat !== normName || canonical.breed !== normBreed) {
      updates.push({ id: canonical.id, name_lat: normName, breed: normBreed });
    }

    for (let i = 1; i < group.length; i++) {
      merges.push({ sourceId: group[i].id, targetId: canonical.id });
    }
  }

  return { updates, merges };
}

function reconcilePlan(plan) {
  const merges = [...plan.merges];
  const mergedSources = new Set(merges.map((m) => m.sourceId));
  const targetOwner = new Map();
  const updates = [];

  for (const u of plan.updates) {
    if (mergedSources.has(u.id)) continue;

    const tkey = `${u.name_lat}|${u.breed}`;
    const existingOwner = targetOwner.get(tkey);

    if (existingOwner && existingOwner !== u.id) {
      merges.push({ sourceId: u.id, targetId: existingOwner });
      mergedSources.add(u.id);
      continue;
    }

    targetOwner.set(tkey, u.id);
    updates.push(u);
  }

  return { updates, merges };
}

function applyPlan(db, plan) {
  const migrate = db.transaction(() => {
    for (const { sourceId, targetId } of plan.merges) {
      db.prepare(`UPDATE results SET dog_id = ? WHERE dog_id = ?`).run(
        targetId,
        sourceId
      );
      db.prepare(
        `UPDATE dogs SET merged_into_dog_id = ? WHERE id = ?`
      ).run(targetId, sourceId);
    }
    for (const { id, name_lat, breed } of plan.updates) {
      const others = db
        .prepare(
          `SELECT id, name_lat, breed FROM dogs
           WHERE id != ? AND merged_into_dog_id IS NULL`
        )
        .all(id);

      const conflict = others.find(
        (d) =>
          normalizeDogName(d.name_lat) === name_lat &&
          normalizeBreed(d.breed) === breed
      );

      if (conflict) {
        db.prepare(`UPDATE results SET dog_id = ? WHERE dog_id = ?`).run(
          conflict.id,
          id
        );
        db.prepare(
          `UPDATE dogs SET merged_into_dog_id = ? WHERE id = ?`
        ).run(conflict.id, id);
        continue;
      }

      db.prepare(`UPDATE dogs SET name_lat = ?, breed = ? WHERE id = ?`).run(
        name_lat,
        breed,
        id
      );
    }
  });

  try {
    migrate();
  } catch (err) {
    if (err.code !== "SQLITE_CONSTRAINT_UNIQUE") throw err;
    applyPlanOneByOne(db, plan);
  }
}

function applyPlanOneByOne(db, plan) {
  for (const { sourceId, targetId } of plan.merges) {
    db.prepare(`UPDATE results SET dog_id = ? WHERE dog_id = ?`).run(
      targetId,
      sourceId
    );
    db.prepare(
      `UPDATE dogs SET merged_into_dog_id = ? WHERE id = ?`
    ).run(targetId, sourceId);
  }

  for (const { id, name_lat, breed } of plan.updates) {
    const merged = db
      .prepare(`SELECT merged_into_dog_id FROM dogs WHERE id = ?`)
      .get(id);
    if (merged?.merged_into_dog_id) continue;

    try {
      db.prepare(`UPDATE dogs SET name_lat = ?, breed = ? WHERE id = ?`).run(
        name_lat,
        breed,
        id
      );
    } catch (err) {
      if (err.code !== "SQLITE_CONSTRAINT_UNIQUE") throw err;

      const conflict = db
        .prepare(
          `SELECT id FROM dogs WHERE name_lat = ? AND breed = ? AND id != ?`
        )
        .get(name_lat, breed, id);

      if (!conflict) throw err;

      db.prepare(`UPDATE results SET dog_id = ? WHERE dog_id = ?`).run(
        conflict.id,
        id
      );
      db.prepare(
        `UPDATE dogs SET merged_into_dog_id = ? WHERE id = ?`
      ).run(conflict.id, id);
    }
  }
}

function planToSql(plan) {
  const lines = [];
  for (const { sourceId, targetId } of plan.merges) {
    lines.push(`UPDATE results SET dog_id = ${targetId} WHERE dog_id = ${sourceId};`);
    lines.push(
      `UPDATE dogs SET merged_into_dog_id = ${targetId} WHERE id = ${sourceId};`
    );
  }
  for (const { id, name_lat, breed } of plan.updates) {
    lines.push(
      `UPDATE dogs SET name_lat = '${name_lat.replace(/'/g, "''")}', breed = '${breed.replace(/'/g, "''")}' WHERE id = ${id};`
    );
  }
  return lines.join("\n");
}

async function main() {
  const db = new Database(LOCAL_DB);
  db.pragma("journal_mode = WAL");

  const dogs = db
    .prepare(
      `SELECT id, name_lat, breed FROM dogs WHERE merged_into_dog_id IS NULL`
    )
    .all();

  const plan = reconcilePlan(buildMigrationPlan(dogs));
  console.log(
    `Plan: ${plan.updates.length} renames, ${plan.merges.length} merges`
  );

  if (plan.updates.length === 0 && plan.merges.length === 0) {
    console.log("Nothing to migrate");
    db.close();
    return;
  }

  if (!sqlOnly) {
    applyPlan(db, plan);
    console.log("✓ Migration applied to local D1");
  }

  const sql = planToSql(plan);
  const outPath = path.resolve(__dirname, "../../data/migrations/migrate-normalize-dogs.sql");
  await fs.writeFile(outPath, sql);
  console.log(`SQL saved to data/migrations/migrate-normalize-dogs.sql`);

  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
