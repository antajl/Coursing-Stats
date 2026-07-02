/**
 * Синхронизация remote D1 → local D1
 * 
 * Usage:
 *   npx tsx backend/scripts/sync/sync-remote-to-local.ts
 */

import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const BACKUP_DIR = path.resolve(ROOT, "data/backup");

async function syncRemoteToLocal() {
  console.log("Синхронизация remote D1 → local D1...");
  
  // Создаем директорию для бэкапов
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  
  // Экспортируем remote D1 в SQL файл
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sqlFile = path.join(BACKUP_DIR, `remote-dump-${timestamp}.sql`);
  
  console.log("Экспорт remote D1...");
  try {
    execSync(`npx wrangler d1 export pc-db --remote --output=${sqlFile}`, {
      cwd: ROOT,
      stdio: "inherit"
    });
  } catch (error) {
    console.error("Ошибка при экспорте remote D1:", error);
    throw error;
  }
  
  console.log("Импорт в local D1...");
  try {
    // Удаляем локальную базу через wrangler
    try {
      execSync("npx wrangler d1 delete pc-db --local --yes", {
        cwd: ROOT,
        stdio: "inherit"
      });
      console.log("Локальная база удалена через wrangler");
    } catch {
      // База может не существовать
      console.log("Локальная база не найдена или уже удалена");
    }
    
    // Создаём локальную базу заново
    execSync("npx wrangler d1 create pc-db --local", {
      cwd: ROOT,
      stdio: "inherit"
    });
    console.log("Локальная база создана");
    
    // Импортируем SQL в локальную базу
    execSync(`npx wrangler d1 execute pc-db --local --file=${sqlFile}`, {
      cwd: ROOT,
      stdio: "inherit"
    });
  } catch (error) {
    console.error("Ошибка при импорте в local D1:", error);
    throw error;
  }
  
  console.log("Синхронизация завершена!");
}

syncRemoteToLocal().catch(console.error);
