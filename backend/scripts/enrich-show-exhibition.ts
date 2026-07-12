/**
 * Полный пайплайн обогащения одной выставки (ru-RU).
 * Run: cd backend && npx tsx scripts/enrich-show-exhibition.ts 106
 */
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendDir = path.join(__dirname, '..')
const exhibitionId = process.argv[2] || '106'

const steps: Array<{ script: string; label: string }> = [
  { script: 'enrich-show-catalog.ts', label: 'Каталог FCI + мета выставки (ru-RU)' },
  { script: 'enrich-show-breed-results.ts', label: 'Результаты BreedView (пол, классы, оценки)' },
  { script: 'enrich-show-breed-titles.ts', label: 'Титулы BreedView' },
]

console.log(`Enriching exhibition ${exhibitionId}...`)

for (const { script, label } of steps) {
  console.log(`\n=== ${label} ===`)
  execSync(`npx tsx scripts/${script} ${exhibitionId}`, {
    cwd: backendDir,
    stdio: 'inherit',
  })
}

console.log(`\nDone: exhibition ${exhibitionId}`)
