/**
 * Связывание coursing_records с dogs через dog_id.
 * Сопоставляет имена из coursing_records с именами в dogs.
 *
 * Usage:
 *   node backend/scripts/migrate/link-coursing-records.mjs          # локальная D1
 *   node backend/scripts/migrate/link-coursing-records.mjs --sql    # только SQL-файл
 */

import Database from "better-sqlite3";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlOnly = process.argv.includes("--sql");

const LOCAL_DB = path.resolve(
  __dirname,
  "../../../.wrangler/state/v3/d1/miniflare-D1DatabaseObject/25a9fdfb5f2c0e75c4b581cbf0100f9e751bd9d7099c87a38bf84799002c7481.sqlite"
);

function sqlEscape(value) {
  return (value || "").replace(/'/g, "''");
}

async function main() {
  const db = new Database(LOCAL_DB);
  db.pragma("journal_mode = WAL");

  console.log('=== Связывание coursing_records с dogs ===');
  
  // Получаем все записи из coursing_records
  const coursingRecords = db.prepare('SELECT * FROM coursing_records').all();
  console.log(`Всего записей в coursing_records: ${coursingRecords.length}`);
  
  // Получаем всех собак
  const dogs = db.prepare('SELECT id, name_lat, name_ru, breed FROM dogs').all();
  console.log(`Всего собак в dogs: ${dogs.length}`);
  
  const updates = [];
  let notFound = [];
  
  for (const record of coursingRecords) {
    const recordName = record.name.trim().toUpperCase();
    const recordBreed = record.breed.trim().toUpperCase();
    
    // Ищем собаку по имени и породе
    let matchedDog = null;
    
    // Сначала пробуем точное совпадение по name_lat или name_ru
    matchedDog = dogs.find(d => {
      const dogNameLat = (d.name_lat || '').trim().toUpperCase();
      const dogNameRu = (d.name_ru || '').trim().toUpperCase();
      const dogBreed = (d.breed || '').trim().toUpperCase();
      
      return (dogNameLat === recordName || dogNameRu === recordName) && dogBreed === recordBreed;
    });
    
    // Если не найдено, пробуем частичное совпадение (содержится ли имя)
    if (!matchedDog) {
      matchedDog = dogs.find(d => {
        const dogNameLat = (d.name_lat || '').trim().toUpperCase();
        const dogNameRu = (d.name_ru || '').trim().toUpperCase();
        const dogBreed = (d.breed || '').trim().toUpperCase();
        
        return (dogNameLat.includes(recordName) || dogNameRu.includes(recordName)) && dogBreed === recordBreed;
      });
    }
    
    // Если не найдено, пробуем по первым буквам (Tair -> ALTAIR)
    if (!matchedDog) {
      const recordNameFirstPart = recordName.split(' ')[0];
      matchedDog = dogs.find(d => {
        const dogNameLat = (d.name_lat || '').trim().toUpperCase();
        const dogNameRu = (d.name_ru || '').trim().toUpperCase();
        const dogBreed = (d.breed || '').trim().toUpperCase();
        
        return (dogNameLat.includes(recordNameFirstPart) || dogNameRu.includes(recordNameFirstPart)) && dogBreed === recordBreed;
      });
    }
    
    if (matchedDog) {
      updates.push({ id: record.id, dog_id: matchedDog.id, recordName: record.name, dogName: matchedDog.name_lat });
    } else {
      notFound.push({ name: record.name, breed: record.breed });
    }
  }
  
  console.log(`\nРезультаты:`);
  console.log(`  Обновлено: ${updates.length}`);
  console.log(`  Не найдено: ${notFound.length}`);
  
  if (notFound.length > 0) {
    console.log(`\nНе найденные записи:`);
    notFound.forEach(n => console.log(`  - "${n.name}" (${n.breed})`));
  }
  
  if (!sqlOnly) {
    const updateStmt = db.prepare('UPDATE coursing_records SET dog_id = ? WHERE id = ?');
    const updateMany = db.transaction((updates) => {
      for (const update of updates) {
        updateStmt.run(update.dog_id, update.id);
      }
    });
    updateMany(updates);
    console.log("✓ Migration applied to local D1");
  }
  
  const sqlLines = updates.map(u => 
    `UPDATE coursing_records SET dog_id = ${u.dog_id} WHERE id = ${u.id};`
  );
  const sql = sqlLines.join('\n');
  const outPath = path.resolve(__dirname, "../../../data/migrations/link-coursing-records.sql");
  await fs.writeFile(outPath, sql);
  console.log(`SQL saved to data/migrations/link-coursing-records.sql`);
  
  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
