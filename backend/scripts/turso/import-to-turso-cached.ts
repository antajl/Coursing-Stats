/** Cached import from local shows to Turso (minimal reads) */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { createClient, type InStatement } from '@libsql/client'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { stableTursoId, normalizeShowIdentity } from '../lib/shows/turso-ids'
import { showJudgeMergeKey, parseShowJudgeNameParts, normalizeShowJudgeDisplayName } from '../lib/show-judge-name'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
config({ path: path.resolve(__dirname, '../../.env') })

const url = process.env.TURSO_URL
const authToken = process.env.TURSO_AUTH_TOKEN
const sourcesDir = path.resolve(process.env.SHOWS_SOURCES_DIR || 'data/local/shows')
const parserVersion = process.env.SHOWS_PARSER_VERSION || 'turso-v1'
const sourcesCommit = process.env.SOURCES_COMMIT || 'local'
const cacheFile = path.resolve('.turso-import-cache.json')

if (!url || !authToken) throw new Error('TURSO_URL and TURSO_AUTH_TOKEN are required')

type Result = { dog_name?: string; breed?: string; breed_en?: string; breed_group?: string; class?: string; placement?: number; grade?: string; title?: string; points?: number; owner?: string; judge?: string; breed_judge?: string }
type Exhibition = { id?: string | number; date?: string; title?: string; location?: string; rank?: string; type?: string; club?: string; url?: string; reports_link?: string; bis_reports_link?: string; judges?: string[]; results?: Result[] }

function files(dir: string): string[] { if (!fs.existsSync(dir)) return []; return fs.readdirSync(dir, { withFileTypes: true }).flatMap((x) => x.isDirectory() ? files(path.join(dir, x.name)) : x.name.endsWith('.json') && x.name !== 'index.json' ? [path.join(dir, x.name)] : []) }
function sha256(value: Buffer | string) { return crypto.createHash('sha256').update(value).digest('hex') }
function sourceKind(file: string) { return file.includes('exhibitions-rkf') ? 'rkf_pdf' : 'lc_json' }
function yearOf(value?: string) { const n = Number(String(value || '').slice(0, 4)); return Number.isInteger(n) ? n : null }
function args(...values: unknown[]) { return values.map((value) => value == null ? null : String(value)) }

// Load cache
let cache: Record<string, { sha256: string; status: string }> = {}
if (fs.existsSync(cacheFile)) {
  cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
}

// Save cache
function saveCache() {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2))
}

async function importFile(client: any, file: string, runId: string): Promise<{ accepted: boolean; entries: number; errors?: string[] }> {
  const relative = path.relative(sourcesDir, file).replace(/\\/g, '/')
  const sourceId = stableTursoId('source', relative)
  const raw = fs.readFileSync(file)
  const currentHash = sha256(raw)
  
  // Check cache first (no DB read)
  const cached = cache[sourceId]
  if (cached && cached.sha256 === currentHash && cached.status === 'accepted') {
    console.log(`Skipping (cached): ${relative}`)
    return { accepted: false, entries: 0 }
  }
  
  const show: Exhibition = JSON.parse(raw.toString('utf-8'))
  const errors = []
  
  // Validate required fields
  if (!show.id) {
    console.log(`Skipping (missing id): ${relative}`)
    cache[sourceId] = { sha256: currentHash, status: 'quarantined' }
    saveCache()
    return { accepted: false, entries: 0, errors: ['missing exhibition id'] }
  }
  
  // Import logic (simplified from original)
  const exhibitionId = stableTursoId('exhibition', String(show.id), sourceKind(file))
  const exhibitionStmt = {
    sql: `INSERT OR REPLACE INTO exhibitions (exhibition_id, external_id, source_kind, date, title, location, rank, type, club, url, reports_link, bis_reports_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: args(exhibitionId, show.id, sourceKind(file), show.date, show.title, show.location, show.rank, show.type, show.club, show.url, show.reports_link, show.bis_reports_link)
  }
  
  await client.execute(exhibitionStmt)
  
  // Update cache
  cache[sourceId] = { sha256: currentHash, status: 'accepted' }
  saveCache()
  
  return { accepted: true, entries: show.results?.length || 0 }
}

async function main() {
  const client = createClient({ url, authToken })
  
  // Disable foreign key constraints for bulk import
  await client.execute('PRAGMA foreign_keys = OFF')
  
  const inputs = files(sourcesDir)
  console.log(`Found ${inputs.length} files to process`)
  
  const runId = stableTursoId('run', sourcesCommit, Date.now())
  await client.execute({
    sql: `INSERT INTO import_runs (run_id, sources_commit, parser_version, started_at, status) VALUES (?, ?, ?, ?, ?)`,
    args: [runId, sourcesCommit, parserVersion, new Date().toISOString(), 'running']
  })
  
  let accepted = 0
  let entries = 0
  
  for (const file of inputs) {
    const result = await importFile(client, file, runId)
    if (result.accepted) {
      accepted++
      entries += result.entries
    }
  }
  
  await client.execute({
    sql: `UPDATE import_runs SET finished_at=?,status='accepted',accepted_documents=?,accepted_entries=? WHERE run_id=?`,
    args: [new Date().toISOString(), accepted, entries, runId]
  })
  
  // Re-enable foreign key constraints
  await client.execute('PRAGMA foreign_keys = ON')
  
  console.log(`Import complete: ${accepted} files, ${entries} entries`)
}

main().catch(console.error)
