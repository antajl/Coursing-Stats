/**
 * Add a procoursing source file to the local warehouse.
 *
 * Usage:
 *   npx tsx backend/scripts/source/add-procoursing-source.ts --event-id 1426 --type html --file "C:/path/results.html" --note "saved earlier"
 */
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type SourceType = 'html' | 'pdf' | 'image'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const WAREHOUSE_ROOT = path.join(ROOT, 'data/source/procoursing/events')

function argValue(flag: string): string | null {
  const args = process.argv.slice(2)
  const i = args.indexOf(flag)
  return i >= 0 && args[i + 1] ? args[i + 1] : null
}

function hasFlag(flag: string): boolean {
  return process.argv.slice(2).includes(flag)
}

function requireInt(name: string, val: string | null): number {
  const n = val ? Number(val) : NaN
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Missing/invalid --${name}`)
  return Math.trunc(n)
}

async function ensureDir(p: string) {
  await fsp.mkdir(p, { recursive: true })
}

function guessExt(type: SourceType, filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  if (type === 'html') return ext === '.htm' ? '.htm' : '.html'
  if (type === 'pdf') return '.pdf'
  if (type === 'image') return ext || '.bin'
  return ext || '.bin'
}

async function main() {
  const eventId = requireInt('event-id', argValue('--event-id'))
  const type = (argValue('--type') as SourceType | null) ?? null
  const file = argValue('--file')
  const note = argValue('--note') ?? null
  const originalUrl = argValue('--original-url') ?? null

  if (!type || !['html', 'pdf', 'image'].includes(type)) throw new Error('Missing/invalid --type (html|pdf|image)')
  if (!file) throw new Error('Missing --file')
  if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`)

  const eventDir = path.join(WAREHOUSE_ROOT, String(eventId))
  const sourceDir = path.join(eventDir, 'source')
  await ensureDir(sourceDir)

  let destRel: string
  if (type === 'html') destRel = 'results.html'
  else if (type === 'pdf') destRel = 'catalog.pdf'
  else destRel = `images/${path.basename(file).replace(/[^\w.\-]+/g, '_')}`

  const destAbs = path.join(sourceDir, destRel)
  if (type === 'image') await ensureDir(path.dirname(destAbs))

  // Copy file
  await fsp.copyFile(file, destAbs)

  // Update meta.json
  const metaPath = path.join(eventDir, 'meta.json')
  const now = new Date().toISOString()
  const existing = fs.existsSync(metaPath) ? JSON.parse(await fsp.readFile(metaPath, 'utf-8')) : {}
  const meta = {
    ...existing,
    event_id: eventId,
    added_at: existing.added_at ?? now,
    updated_at: now,
    source_note: note ?? existing.source_note ?? null,
    original_url: originalUrl ?? existing.original_url ?? null,
    files: {
      ...(existing.files ?? {}),
      [type]: path.relative(eventDir, destAbs).replace(/\\/g, '/'),
    },
  }
  await fsp.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8')

  console.log(`Saved ${type}: ${destAbs}`)
  console.log(`Updated meta: ${metaPath}`)
  if (hasFlag('--print-path')) {
    console.log(destAbs)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

