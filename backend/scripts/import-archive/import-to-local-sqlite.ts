/** Import shows data to local SQLite database (fast, no network limits) */
import Database from 'better-sqlite3'
import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
config({ path: resolve(__dirname, '../../.env') })

const sourcesDir = path.resolve(process.env.SHOWS_SOURCES_DIR || 'data/local/shows')
const parserVersion = process.env.SHOWS_PARSER_VERSION || 'local-v1'
const sourcesCommit = process.env.SOURCES_COMMIT || 'local'
const dbPath = path.resolve('data/shows.db')

// Open SQLite database
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

// Load schema
const schema = fs.readFileSync(resolve('data/shows-db.sql'), 'utf-8')
db.exec(schema)

// Helper functions
function sha256(data: Buffer): string {
  return createHash('sha256').update(data).digest('hex')
}

function stableTursoId(prefix: string, ...parts: (string | number)[]): string {
  const normalized = parts.map(p => String(p).toLowerCase().replace(/[^a-z0-9]/g, '-')).join('-')
  return `${prefix}:${normalized}`
}

function args(...values: any[]): any[] {
  return values
}

function files(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { recursive: true }).filter(f => f.endsWith('.json')).map(f => path.resolve(dir, f))
}

function sourceKind(file: string): string {
  return file.includes('exhibitions-rkf') ? 'exhibitions-rkf' : 'exhibitions'
}

function yearOf(dateStr: string): number {
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? 0 : date.getFullYear()
}

function normalizeShowIdentity(name: string): string {
  return name.toUpperCase().replace(/[^A-ZА-Я]/g, '')
}

function normalizeShowJudgeDisplayName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

function parseShowJudgeNameParts(name: string): { first: string; last: string } {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return { first: '', last: '' }
  if (parts.length === 1) return { first: '', last: parts[0] }
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

function showJudgeMergeKey(parts: { first: string; last: string }): string {
  return `${parts.last} ${parts.first}`.toUpperCase().replace(/[^A-ZА-Я]/g, '')
}

// Import single file
function importFile(file: string, runId: string): { accepted: boolean; entries: number; errors?: string[] } {
  const relative = path.relative(sourcesDir, file).replace(/\\/g, '/')
  const sourceId = stableTursoId('source', relative)
  const raw = fs.readFileSync(file)
  const hash = sha256(raw)
  const show = JSON.parse(raw.toString('utf-8'))
  
  const now = new Date().toISOString()
  const errors: string[] = []
  
  // Validate
  if (!show.id) {
    errors.push('Missing show.id')
  }
  if (!show.date) {
    errors.push('Missing show.date')
  }
  if (!show.results || show.results.length === 0) {
    errors.push('Missing or empty show.results')
  }
  
  // Insert quarantined if errors
  if (errors.length) {
    const stmt = db.prepare(`
      INSERT INTO source_documents(source_id,git_path,sha256,source_kind,year,status,parser_version,last_run_id,parsed_entries,accepted_entries,error_json,updated_at)
      VALUES(?,?,?,?,?,'quarantined',?,?,0,0,?,?)
      ON CONFLICT(source_id) DO UPDATE SET sha256=excluded.sha256,status=excluded.status,last_run_id=excluded.last_run_id,error_json=excluded.error_json,updated_at=excluded.updated_at
    `)
    stmt.run(sourceId, relative, hash, sourceKind(file), yearOf(show.date), parserVersion, runId, JSON.stringify(errors), now)
    return { accepted: false, entries: 0, errors }
  }
  
  const exhibitionId = stableTursoId('exhibition', sourceKind(file), show.id!)
  
  // Insert exhibition
  db.prepare(`
    INSERT INTO exhibitions(exhibition_id,external_id,source_kind,date,title,location,rank,type,club,url,reports_link,bis_reports_link)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(exhibition_id) DO UPDATE SET date=excluded.date,title=excluded.title,location=excluded.location,rank=excluded.rank,type=excluded.type,club=excluded.club,url=excluded.url,reports_link=excluded.reports_link,bis_reports_link=excluded.bis_reports_link
  `).run(exhibitionId, show.id, sourceKind(file), show.date, show.title, show.location, show.rank, show.type, show.club, show.url, show.reports_link, show.bis_reports_link)
  
  // Delete old ring entries
  db.prepare('DELETE FROM ring_entries WHERE source_id = ?').run(sourceId)
  
  // Insert dogs, judges, and ring entries
  for (const [index, row] of show.results!.entries()) {
    const name = row.dog_name!.replace(/^\(\d+\)\s*/, '').trim()
    const breed = row.breed!.trim()
    const dogId = stableTursoId('dog', name, breed)
    const judge = (row.breed_judge || row.judge || '').trim()
    const judgeKey = judge ? showJudgeMergeKey(parseShowJudgeNameParts(normalizeShowJudgeDisplayName(judge))) : ''
    const judgeId = judgeKey ? stableTursoId('judge', judgeKey) : null
    const locator = `row:${index}`
    const entryId = stableTursoId('entry', sourceId, locator)
    
    // Insert dog
    db.prepare(`
      INSERT INTO show_dogs(show_dog_id,name_lat,name_ru,normalized_name,breed,breed_en,breed_group,sex)
      VALUES(?,?,NULL,?,?,?,?,NULL)
      ON CONFLICT(show_dog_id) DO UPDATE SET breed_en=COALESCE(excluded.breed_en,show_dogs.breed_en),breed_group=COALESCE(excluded.breed_group,show_dogs.breed_group)
    `).run(dogId, name, normalizeShowIdentity(name), breed, row.breed_en, row.breed_group)
    
    // Insert judge if exists
    if (judgeId) {
      db.prepare(`
        INSERT INTO show_judges(show_judge_id,display_name,merge_key)
        VALUES(?,?,?)
        ON CONFLICT(show_judge_id) DO UPDATE SET display_name=excluded.display_name
      `).run(judgeId, judge, judgeKey)
    }
    
    // Insert ring entry
    db.prepare(`
      INSERT INTO ring_entries(ring_entry_id,source_id,exhibition_id,show_dog_id,show_judge_id,raw_locator,breed,breed_en,breed_group,class,placement,grade,title,points,owner)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(entryId, sourceId, exhibitionId, dogId, judgeId, locator, breed, row.breed_en, row.breed_group, row.class, row.placement, row.grade, row.title, row.points, row.owner)
  }
  
  // Update source document
  db.prepare(`
    INSERT INTO source_documents(source_id,git_path,sha256,source_kind,year,status,parser_version,last_run_id,parsed_entries,accepted_entries,error_json,updated_at)
    VALUES(?,?,?,?,?,'accepted',?,?,?,?,'[]',?)
    ON CONFLICT(source_id) DO UPDATE SET sha256=excluded.sha256,status='accepted',parser_version=excluded.parser_version,last_run_id=excluded.last_run_id,parsed_entries=excluded.parsed_entries,accepted_entries=excluded.accepted_entries,error_json='[]',updated_at=excluded.updated_at
  `).run(sourceId, relative, hash, sourceKind(file), yearOf(show.date), parserVersion, runId, show.results!.length, show.results!.length, now)
  
  return { accepted: true, entries: show.results!.length }
}

async function main() {
  const startTime = Date.now()
  const startedAt = new Date().toISOString()
  const runId = stableTursoId('run', sourcesCommit, startedAt)
  
  db.prepare(`INSERT INTO import_runs(run_id,sources_commit,parser_version,started_at,status) VALUES(?,?,?,?, 'running')`).run(runId, sourcesCommit, parserVersion, startedAt)
  
  // Check import progress
  const progressRow = db.prepare('SELECT value FROM import_progress WHERE progress_key = ?').get('last_commit') as { value: string } | undefined
  const lastCommit = progressRow?.value
  const isFullReimport = lastCommit !== sourcesCommit
  
  if (isFullReimport) {
    console.log(`Commit changed from ${lastCommit || 'none'} to ${sourcesCommit} - processing all files`)
  } else {
    console.log(`Commit ${sourcesCommit} unchanged - processing only modified files`)
  }
  
  let accepted = 0, quarantined = 0, entries = 0
  const inputs = ['exhibitions', 'exhibitions-rkf'].flatMap((name) => files(path.join(sourcesDir, name)))
  console.log(`Processing ${inputs.length} files...`)
  
  for (let i = 0; i < inputs.length; i++) {
    const file = inputs[i]
    
    // Log progress every 100 files
    if (i % 100 === 0) {
      console.log(`Progress: ${i}/${inputs.length} files (${Math.round(i/inputs.length*100)}%) - Accepted: ${accepted}, Entries: ${entries}`)
    }
    
    const relative = path.relative(sourcesDir, file).replace(/\\/g, '/')
    const sourceId = stableTursoId('source', relative)
    const raw = fs.readFileSync(file)
    const currentHash = sha256(raw)
    
    // Check if file needs processing
    let shouldProcess = isFullReimport
    
    if (!shouldProcess) {
      const existingDoc = db.prepare('SELECT sha256, status FROM source_documents WHERE source_id = ?').get(sourceId) as { sha256: string; status: string } | undefined
      const existingHash = existingDoc?.sha256
      
      if (!existingHash || existingHash !== currentHash) {
        shouldProcess = true
      }
    }
    
    if (!shouldProcess) {
      continue
    }
    
    try {
      const result = importFile(file, runId)
      if (result.accepted) {
        accepted++
      } else {
        quarantined++
      }
      entries += result.entries
    } catch (error) {
      console.error(`Error processing file ${relative}:`, error)
      quarantined++
    }
  }
  
  const finishedAt = new Date().toISOString()
  const durationMs = Date.now() - startTime
  
  db.prepare(`UPDATE import_runs SET finished_at=?,status='accepted',accepted_documents=?,quarantined_documents=?,accepted_entries=? WHERE run_id=?`).run(finishedAt, accepted, quarantined, entries, runId)
  
  db.prepare(`INSERT INTO import_progress(progress_key,value,updated_at) VALUES('last_commit',?,?) ON CONFLICT(progress_key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at`).run(sourcesCommit, finishedAt)
  
  console.log(`\nImport completed in ${(durationMs / 1000).toFixed(2)}s`)
  console.log(`Accepted: ${accepted} files, ${entries} entries`)
  console.log(`Quarantined: ${quarantined} files`)
  
  db.close()
}

main().catch(console.error)
