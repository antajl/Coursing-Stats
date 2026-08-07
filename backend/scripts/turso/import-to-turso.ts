/** Idempotent import from checked-out coursing-stats-sources into Turso. */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { createClient, type InStatement } from '@libsql/client'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { stableTursoId, normalizeShowIdentity } from '../lib/shows/turso-ids'
import { showJudgeMergeKey, parseShowJudgeNameParts, normalizeShowJudgeDisplayName } from '../lib/show-judge-name'
import { getExhibitionsRkfStore } from '../../lib/exhibitions-rkf-store'

// Load .env from project root
const __dirname = fileURLToPath(new URL('.', import.meta.url))
config({ path: path.resolve(__dirname, '../../.env') })

const url = process.env.TURSO_URL
const authToken = process.env.TURSO_AUTH_TOKEN
const sourcesDir = path.resolve(process.env.SHOWS_SOURCES_DIR || 'data/local/shows')
const parserVersion = process.env.SHOWS_PARSER_VERSION || 'turso-v1'
const sourcesCommit = process.env.SOURCES_COMMIT || 'local'
const cacheFile = path.resolve('.turso-import-cache.json')
if (!url || !authToken) throw new Error('TURSO_URL and TURSO_AUTH_TOKEN are required')

// Load cache
let cache: Record<string, { sha256: string; status: string }> = {}
if (fs.existsSync(cacheFile)) {
  cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
}

// Save cache
function saveCache() {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2))
}

type Result = { dog_name?: string; breed?: string; breed_en?: string; breed_group?: string; class?: string; placement?: number; grade?: string; title?: string; points?: number; owner?: string; judge?: string; breed_judge?: string }
type Exhibition = { id?: string | number; date?: string; title?: string; location?: string; rank?: string; type?: string; club?: string; url?: string; reports_link?: string; bis_reports_link?: string; judges?: string[]; results?: Result[] }

function files(dir: string): string[] { if (!fs.existsSync(dir)) return []; return fs.readdirSync(dir, { withFileTypes: true }).flatMap((x) => x.isDirectory() ? files(path.join(dir, x.name)) : x.name.endsWith('.json') && x.name !== 'index.json' ? [path.join(dir, x.name)] : []) }
function sha256(value: Buffer | string) { return crypto.createHash('sha256').update(value).digest('hex') }
function sourceKind(file: string, isRkfSqlite: boolean = false) { return isRkfSqlite || file.includes('exhibitions-rkf') ? 'rkf_pdf' : 'lc_json' }
function yearOf(value?: string) { const n = Number(String(value || '').slice(0, 4)); return Number.isInteger(n) ? n : null }
function args(...values: unknown[]) { return values.map((value) => value == null ? null : String(value)) }

function validate(show: Exhibition): string[] {
  const errors: string[] = []
  if (!show.id) errors.push('missing exhibition id')
  if (!show.title?.trim()) errors.push('missing exhibition title')
  if (!Array.isArray(show.results)) errors.push('missing results array')
  for (const [i, row] of (show.results || []).entries()) if (!row.dog_name?.trim() || !row.breed?.trim()) errors.push(`invalid result ${i}`)
  return errors
}

async function importFile(client: ReturnType<typeof createClient>, file: string, runId: string) {
  const raw = fs.readFileSync(file)
  const relative = path.relative(sourcesDir, file).replace(/\\/g, '/')
  const sourceId = stableTursoId('source', relative)
  const hash = sha256(raw)
  let show: Exhibition
  try { show = JSON.parse(raw.toString('utf8')) } catch { show = {}; }
  const errors = validate(show)
  const now = new Date().toISOString()
  const base: InStatement = { sql: `INSERT INTO source_documents(source_id,git_path,sha256,source_kind,year,status,parser_version,last_run_id,parsed_entries,accepted_entries,error_json,updated_at) VALUES(?,?,?,?,?,'quarantined',?,?,0,0,?,?) ON CONFLICT(source_id) DO UPDATE SET sha256=excluded.sha256,status=excluded.status,last_run_id=excluded.last_run_id,error_json=excluded.error_json,updated_at=excluded.updated_at`, args: args(sourceId, relative, hash, sourceKind(file), yearOf(show.date), parserVersion, runId, JSON.stringify(errors), now) }
  if (errors.length) { await client.execute(base); return { accepted: false, entries: 0, errors } }

  const exhibitionId = stableTursoId('exhibition', sourceKind(file), show.id!)
  const statements: InStatement[] = [
    { sql: `INSERT INTO source_documents(source_id,git_path,sha256,source_kind,year,status,parser_version,last_run_id,parsed_entries,accepted_entries,error_json,updated_at) VALUES(?,?,?,?,?,'accepted',?,?,?,?,'[]',?) ON CONFLICT(source_id) DO UPDATE SET sha256=excluded.sha256,status='accepted',parser_version=excluded.parser_version,last_run_id=excluded.last_run_id,parsed_entries=excluded.parsed_entries,accepted_entries=excluded.accepted_entries,error_json='[]',updated_at=excluded.updated_at`, args: args(sourceId, relative, hash, sourceKind(file), yearOf(show.date), parserVersion, runId, show.results!.length, show.results!.length, now) },
    { sql: `INSERT INTO exhibitions(exhibition_id,external_id,source_kind,date,title,location,rank,type,club,url,reports_link,bis_reports_link) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(exhibition_id) DO UPDATE SET date=excluded.date,title=excluded.title,location=excluded.location,rank=excluded.rank,type=excluded.type,club=excluded.club,url=excluded.url,reports_link=excluded.reports_link,bis_reports_link=excluded.bis_reports_link`, args: args(exhibitionId, show.id, sourceKind(file), show.date, show.title, show.location, show.rank, show.type, show.club, show.url, show.reports_link, show.bis_reports_link) },
    { sql: 'DELETE FROM ring_entries WHERE source_id = ?', args: [sourceId] },
  ]
  for (const [index, row] of show.results!.entries()) {
    const name = row.dog_name!.replace(/^\(\d+\)\s*/, '').trim()
    const breed = row.breed!.trim()
    const dogId = stableTursoId('dog', name, breed)
    const judge = (row.breed_judge || row.judge || '').trim()
    const judgeKey = judge ? showJudgeMergeKey(parseShowJudgeNameParts(normalizeShowJudgeDisplayName(judge))) : ''
    const judgeId = judgeKey ? stableTursoId('judge', judgeKey) : null
    const locator = `row:${index}`
    const entryId = stableTursoId('entry', sourceId, locator)
    statements.push({ sql: `INSERT INTO show_dogs(show_dog_id,name_lat,name_ru,normalized_name,breed,breed_en,breed_group,sex) VALUES(?,?,NULL,?,?,?,?,NULL) ON CONFLICT(show_dog_id) DO UPDATE SET breed_en=COALESCE(excluded.breed_en,show_dogs.breed_en),breed_group=COALESCE(excluded.breed_group,show_dogs.breed_group)`, args: args(dogId, name, normalizeShowIdentity(name), breed, row.breed_en, row.breed_group) })
    if (judgeId) statements.push({ sql: `INSERT INTO show_judges(show_judge_id,display_name,merge_key) VALUES(?,?,?) ON CONFLICT(show_judge_id) DO UPDATE SET display_name=excluded.display_name`, args: args(judgeId, judge, judgeKey) })
    statements.push({ sql: `INSERT INTO ring_entries(ring_entry_id,source_id,exhibition_id,show_dog_id,show_judge_id,raw_locator,breed,breed_en,breed_group,class,placement,grade,title,points,owner) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, args: args(entryId, sourceId, exhibitionId, dogId, judgeId, locator, breed, row.breed_en, row.breed_group, row.class, row.placement, row.grade, row.title, row.points, row.owner) })
  }
  for (let i = 0; i < statements.length; i += 250) await client.batch(statements.slice(i, i + 250), 'write')
  
  // Update local cache
  cache[sourceId] = { sha256: hash, status: 'accepted' }
  saveCache()
  
  return { accepted: true, entries: show.results!.length }
}

async function importRkfFromSqlite(client: ReturnType<typeof createClient>, id: string, year: number, runId: string) {
  const rkfStore = getExhibitionsRkfStore()
  const show = rkfStore.read(id, year)
  rkfStore.close()
  
  if (!show) {
    return { accepted: false, entries: 0 }
  }
  
  const relative = `exhibitions-rkf/${year}/${id}.json`
  const sourceId = stableTursoId('source', relative)
  const json = JSON.stringify(show)
  const hash = sha256(json)
  const errors = validate(show)
  const now = new Date().toISOString()
  const base: InStatement = { sql: `INSERT INTO source_documents(source_id,git_path,sha256,source_kind,year,status,parser_version,last_run_id,parsed_entries,accepted_entries,error_json,updated_at) VALUES(?,?,?,?,?,'quarantined',?,?,0,0,?,?) ON CONFLICT(source_id) DO UPDATE SET sha256=excluded.sha256,status=excluded.status,last_run_id=excluded.last_run_id,error_json=excluded.error_json,updated_at=excluded.updated_at`, args: args(sourceId, relative, hash, sourceKind('', true), yearOf(show.date), parserVersion, runId, JSON.stringify(errors), now) }
  if (errors.length) { await client.execute(base); return { accepted: false, entries: 0 } }

  const exhibitionId = stableTursoId('exhibition', sourceKind('', true), show.id!)
  const statements: InStatement[] = [
    { sql: `INSERT INTO source_documents(source_id,git_path,sha256,source_kind,year,status,parser_version,last_run_id,parsed_entries,accepted_entries,error_json,updated_at) VALUES(?,?,?,?,?,'accepted',?,?,?,?,'[]',?) ON CONFLICT(source_id) DO UPDATE SET sha256=excluded.sha256,status='accepted',parser_version=excluded.parser_version,last_run_id=excluded.last_run_id,parsed_entries=excluded.parsed_entries,accepted_entries=excluded.accepted_entries,error_json='[]',updated_at=excluded.updated_at`, args: args(sourceId, relative, hash, sourceKind('', true), yearOf(show.date), parserVersion, runId, show.results!.length, show.results!.length, now) },
    { sql: `INSERT INTO exhibitions(exhibition_id,external_id,source_kind,date,title,location,rank,type,club,url,reports_link,bis_reports_link) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(exhibition_id) DO UPDATE SET date=excluded.date,title=excluded.title,location=excluded.location,rank=excluded.rank,type=excluded.type,club=excluded.club,url=excluded.url,reports_link=excluded.reports_link,bis_reports_link=excluded.bis_reports_link`, args: args(exhibitionId, show.id, sourceKind('', true), show.date, show.title, show.location, show.rank, show.type, show.club, show.url, show.reports_link, show.bis_reports_link) },
    { sql: 'DELETE FROM ring_entries WHERE source_id = ?', args: [sourceId] },
  ]
  for (const [index, row] of show.results!.entries()) {
    const name = row.dog_name!.replace(/^\(\d+\)\s*/, '').trim()
    const breed = row.breed!.trim()
    const dogId = stableTursoId('dog', name, breed)
    const judge = (row.breed_judge || row.judge || '').trim()
    const judgeKey = judge ? showJudgeMergeKey(parseShowJudgeNameParts(normalizeShowJudgeDisplayName(judge))) : ''
    const judgeId = judgeKey ? stableTursoId('judge', judgeKey) : null
    const locator = `row:${index}`
    const entryId = stableTursoId('entry', sourceId, locator)
    statements.push({ sql: `INSERT INTO show_dogs(show_dog_id,name_lat,name_ru,normalized_name,breed,breed_en,breed_group,sex) VALUES(?,?,NULL,?,?,?,?,NULL) ON CONFLICT(show_dog_id) DO UPDATE SET breed_en=COALESCE(excluded.breed_en,show_dogs.breed_en),breed_group=COALESCE(excluded.breed_group,show_dogs.breed_group)`, args: args(dogId, name, normalizeShowIdentity(name), breed, row.breed_en, row.breed_group) })
    if (judgeId) statements.push({ sql: `INSERT INTO show_judges(show_judge_id,display_name,merge_key) VALUES(?,?,?) ON CONFLICT(show_judge_id) DO UPDATE SET display_name=excluded.display_name`, args: args(judgeId, judge, judgeKey) })
    statements.push({ sql: `INSERT INTO ring_entries(ring_entry_id,source_id,exhibition_id,show_dog_id,show_judge_id,raw_locator,breed,breed_en,breed_group,class,placement,grade,title,points,owner) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, args: args(entryId, sourceId, exhibitionId, dogId, judgeId, locator, breed, row.breed_en, row.breed_group, row.class, row.placement, row.grade, row.title, row.points, row.owner) })
  }
  for (let i = 0; i < statements.length; i += 250) await client.batch(statements.slice(i, i + 250), 'write')
  
  // Update local cache
  cache[sourceId] = { sha256: hash, status: 'accepted' }
  saveCache()
  
  return { accepted: true, entries: show.results!.length }
}

async function main() {
  const client = createClient({ url, authToken })
  const startTime = Date.now()
  const startedAt = new Date().toISOString()
  const runId = stableTursoId('run', sourcesCommit, startedAt)
  await client.execute({ sql: `INSERT INTO import_runs(run_id,sources_commit,parser_version,started_at,status) VALUES(?,?,?,?, 'running')`, args: [runId, sourcesCommit, parserVersion, startedAt] })
  
  // Incremental import: check import_progress for last processed commit
  const progressResult = await client.execute({ sql: `SELECT value FROM import_progress WHERE progress_key = 'last_commit'` })
  const lastCommit = progressResult.rows[0]?.value as string | undefined
  
  // Force incremental mode to use local cache and skip already processed files
  const isFullReimport = false
  
  console.log(`Using local cache - processing only files not in cache (skipping already processed)`)
  
  let accepted = 0, quarantined = 0, entries = 0
  const quarantineList: Array<{ source_id: string; git_path: string; errors: string[]; timestamp: string }> = []
  
  // Process exhibitions from local filesystem
  const localInputs = files(path.join(sourcesDir, 'exhibitions'))
  console.log(`Processing ${localInputs.length} local exhibition files...`)
  
  for (let i = 0; i < localInputs.length; i++) {
    const file = localInputs[i]
    
    // Log progress every 10 files
    if (i % 10 === 0) {
      console.log(`Progress: ${i}/${localInputs.length} local files (${Math.round(i/localInputs.length*100)}%) - Accepted: ${accepted}, Entries: ${entries}`)
    }
    
    const relative = path.relative(sourcesDir, file).replace(/\\/g, '/')
    const sourceId = stableTursoId('source', relative)
    const raw = fs.readFileSync(file)
    const currentHash = sha256(raw)
    
    // Check if file needs processing (use local cache to minimize DB reads)
    let shouldProcess = isFullReimport
    
    if (!shouldProcess) {
      const cached = cache[sourceId]
      const existingHash = cached?.sha256 as string | undefined
      
      // Process if hash changed or document doesn't exist in cache
      if (!existingHash || existingHash !== currentHash) {
        shouldProcess = true
      }
    }
    
    if (!shouldProcess) {
      console.log(`Skipping unchanged file: ${relative}`)
      continue
    }
    
    // Log first file processing
    if (i === 0) {
      console.log(`Processing first file: ${relative}`)
    }
    
    try {
      const result = await importFile(client, file, runId)
      if (result.accepted) {
        accepted++
      } else {
        quarantined++
        quarantineList.push({
          source_id: sourceId,
          git_path: relative,
          errors: result.errors || [],
          timestamp: new Date().toISOString(),
        })
      }
      entries += result.entries
    } catch (error) {
      console.error(`Error processing file ${relative}:`, error)
      quarantined++
      quarantineList.push({
        source_id: sourceId,
        git_path: relative,
        errors: [String(error)],
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Process RKF exhibitions from SQLite
  console.log('Processing RKF exhibitions from SQLite...')
  const rkfStore = getExhibitionsRkfStore()
  const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]
  let rkfProcessed = 0
  let rkfTotal = 0
  
  for (const year of years) {
    const ids = rkfStore.listIds(year)
    rkfTotal += ids.length
    console.log(`Found ${ids.length} RKF exhibitions for year ${year}`)
    
    for (const id of ids) {
      const relative = `exhibitions-rkf/${year}/${id}.json`
      const sourceId = stableTursoId('source', relative)
      
      // Check if already in cache
      const cached = cache[sourceId]
      const isCached = cached?.status === 'accepted'
      
      if (isCached) {
        rkfProcessed++
        continue
      }
      
      try {
        const result = await importRkfFromSqlite(client, id, year, runId)
        if (result.accepted) {
          accepted++
        } else {
          quarantined++
          quarantineList.push({
            source_id: sourceId,
            git_path: relative,
            errors: result.errors || [],
            timestamp: new Date().toISOString(),
          })
        }
        entries += result.entries
        rkfProcessed++
        
        if (rkfProcessed % 100 === 0) {
          console.log(`Progress: ${rkfProcessed}/${rkfTotal} RKF exhibitions - Accepted: ${accepted}, Entries: ${entries}`)
        }
      } catch (error) {
        console.error(`Error processing RKF exhibition ${id}/${year}:`, error)
        quarantined++
        quarantineList.push({
          source_id: sourceId,
          git_path: relative,
          errors: [String(error)],
          timestamp: new Date().toISOString(),
        })
        rkfProcessed++
      }
    }
  }
  
  rkfStore.close()
  console.log(`Processed ${rkfProcessed} RKF exhibitions from SQLite`)

  const finishedAt = new Date().toISOString()
  const durationMs = Date.now() - startTime

  await client.execute({
    sql: `UPDATE import_runs SET finished_at=?,status='accepted',accepted_documents=?,quarantined_documents=?,accepted_entries=? WHERE run_id=?`,
    args: [finishedAt, accepted, quarantined, entries, runId],
  })

  // Update import_progress with last processed commit
  await client.execute({
    sql: `INSERT INTO import_progress(progress_key,value,updated_at) VALUES('last_commit',?,?) ON CONFLICT(progress_key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at`,
    args: [sourcesCommit, finishedAt],
  })

  // Write audit ledger to data/audit/shows/
  const auditDir = path.resolve(process.cwd(), 'data/audit/shows')
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true })
  }

  const summary = {
    sources_commit: sourcesCommit,
    parser_version: parserVersion,
    accepted_documents: accepted,
    quarantined_documents: quarantined,
    accepted_entries: entries,
    updated_at: finishedAt,
  }

  const importRun = {
    run_id: runId,
    sources_commit: sourcesCommit,
    parser_version: parserVersion,
    started_at: startedAt,
    finished_at: finishedAt,
    duration_ms: durationMs,
    accepted_documents: accepted,
    quarantined_documents: quarantined,
    accepted_entries: entries,
    status: 'accepted',
  }

  fs.writeFileSync(path.join(auditDir, 'summary.json'), JSON.stringify(summary, null, 2))
  fs.writeFileSync(path.join(auditDir, 'quarantine.json'), JSON.stringify(quarantineList, null, 2))
  fs.writeFileSync(path.join(auditDir, 'import-run.json'), JSON.stringify(importRun, null, 2))

  console.log(`Audit reports saved to data/audit/shows/`)
  console.log(JSON.stringify({ runId, accepted, quarantined, entries, durationMs }))
}
main().catch((error) => { console.error(error); process.exitCode = 1 })

