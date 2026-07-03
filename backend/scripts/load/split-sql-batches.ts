import fs from 'node:fs/promises';
import path from 'node:path';

const INPUT = process.argv[2] || 'data/updates/reparse-2025.sql';
const OUT_DIR = process.argv[3] || 'data/updates/reparse-2025-batches';
const EVENTS_PER_FILE = Number(process.argv[4] || 5);

async function main() {
  const sql = await fs.readFile(INPUT, 'utf8');
  const blocks = sql
    .split(/(?=DELETE FROM results WHERE event_id = \d+;)/)
    .map((block) => block.trim())
    .filter(Boolean);

  await fs.mkdir(OUT_DIR, { recursive: true });

  const files: string[] = [];
  for (let i = 0; i < blocks.length; i += EVENTS_PER_FILE) {
    const chunk = blocks.slice(i, i + EVENTS_PER_FILE).join('\n\n');
    const index = String(Math.floor(i / EVENTS_PER_FILE) + 1).padStart(2, '0');
    const fileName = `batch-${index}.sql`;
    const filePath = path.join(OUT_DIR, fileName);
    await fs.writeFile(filePath, chunk);
    files.push(filePath);
  }

  console.log(`Split ${blocks.length} event blocks into ${files.length} files in ${OUT_DIR}`);
  for (const file of files) {
    const stat = await fs.stat(file);
    console.log(`  ${file} (${Math.round(stat.size / 1024)} KB)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
