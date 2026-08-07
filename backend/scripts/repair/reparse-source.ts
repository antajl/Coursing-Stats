/**
 * Reparse a single source document by source_id.
 * Downloads/takes raw document, reparses, validates, replaces only its data.
 * Usage: npx tsx backend/scripts/repair/reparse-source.ts <source_id>
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { createClient, type InStatement } from '@libsql/client'
import { stableTursoId, normalizeShowIdentity } from '../../lib/shows/turso-ids'
import { showJudgeMergeKey, parseShowJudgeNameParts, normalizeShowJudgeDisplayName } from '../../lib/show-judge-name'

const url = process.env.TURSO_URL
const authToken = process.env.TURSO_AUTH_TOKEN
const sourcesDir = path.resolve(process.env.SHOWS_SOURCES_DIR || 'data/local/shows')
const parserVersion = process.env.SHOWS_PARSER_VERSION || 'turso-v1'

if (!url || !authToken) throw new Error('TURSO_URL and TURSO_AUTH_TOKEN are required')

const sourceId = process.argv[2]
if (!sourceId) {
  console.error('Usage: npx tsx backend/scripts/repair/reparse-source.ts <source_id>')
  process.exit(1)
}

type Result = { dog_name?: string; breed?: string; breed_en?: string; breed_group?: string; class?: string; placement?: number; grade?: string; title?: string; points?: number; owner?: string; judge?: string; breed_judge?: string }
type Exhibition = { id?: string | number; date?: string; title?: string; location?: string; rank?: string; type?: string; club?: string; url?: string; reports_link?: string; bis_reports_link?: string; judges?: string[]; results?: Result[] }

function sha256(value: Buffer | string) { return crypto.createHash('sha256').update(value).digest('hex') }
function sourceKind(file: string) { return file.includes('exhibitions-rkf') ? 'rkf_pdf' : 'lc_json' }
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

async function main() {
  const client = createClient({ url, authToken })
  const startTime = Date.now()
  const startedAt = new Date().toISOString()
  const runId = stableTursoId('repair-run', sourceId, startedAt)

  console.log(`Reparse source: ${sourceId}`)
  console.log(`Started at: ${startedAt}`)

  // Get source document from Turso
  const sourceDoc = await client.execute({
    sql: `SELECT git_path, sha256, source_kind, year, status FROM source_documents WHERE source_id = ?`,
    args: [sourceId]
  })

  if (sourceDoc.rows.length === 0) {
    console.error(`Source document ${sourceId} not found in Turso`)
    process.exit(1)
  }

  const doc = sourceDoc.rows[0] as unknown as { git_path: string; sha256: string; source_kind: string; year: number | null; status: string }
  console.log(`Found source: ${doc.git_path} (${doc.status})`)

  // Load raw file from sources directory
  const filePath = path.join(sourcesDir, doc.git_path)
  if (!fs.existsSync(filePath)) {
    console.error(`Source file not found: ${filePath}`)
    process.exit(1)
  }

  const raw = fs.readFileSync(filePath)
  const currentHash = sha256(raw)

  if (currentHash !== doc.sha256) {
    console.warn(`File hash changed: ${doc.sha256} -> ${currentHash}`)
  }

  let show: Exhibition
  try { show = JSON.parse(raw.toString('utf8')) } catch { show = {} }
  const errors = validate(show)
  const now = new Date().toISOString()

  // Create repair run record
  await client.execute({
    sql: `INSERT INTO import_runs(run_id,sources_commit,parser_version,started_at,status) VALUES(?,?,?,?,'repair-running')`,
    args: [runId, 'repair', parserVersion, startedAt]
  })

  if (errors.length) {
    console.error(`Validation errors: ${errors.join(', ')}`)
    
    // Update source document to quarantined
    await client.execute({
      sql: `UPDATE source_documents SET status='quarantined',error_json=?,updated_at=? WHERE source_id=?`,
      args: [JSON.stringify(errors), now, sourceId]
    })

    await client.execute({
      sql: `UPDATE import_runs SET finished_at=?,status='repair-quarantined',accepted_documents=0,quarantined_documents=1,accepted_entries=0 WHERE run_id=?`,
      args: [now, runId]
    })

    console.log(`Source ${sourceId} quarantined due to validation errors`)
    process.exit(1)
  }

  // Reparse: delete old ring entries and insert new ones
  const exhibitionId = stableTursoId('exhibition', doc.source_kind, show.id!)
  const statements: InStatement[] = [
    { sql: `UPDATE source_documents SET status='accepted',parser_version=?,last_run_id=?,parsed_entries=?,accepted_entries=?,error_json='[]',updated_at=? WHERE source_id=?`, args: args(parserVersion, runId, show.results!.length, show.results!.length, now, sourceId) },
    { sql: `INSERT INTO exhibitions(exhibition_id,external_id,source_kind,date,title,location,rank,type,club,url,reports_link,bis_reports_link) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(exhibition_id) DO UPDATE SET date=excluded.date,title=excluded.title,location=excluded.location,rank=excluded.rank,type=excluded.type,club=excluded.club,url=excluded.url,reports_link=excluded.reports_link,bis_reports_link=excluded.bis_reports_link`, args: args(exhibitionId, show.id, doc.source_kind, show.date, show.title, show.location, show.rank, show.type, show.club, show.url, show.reports_link, show.bis_reports_link) },
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

  for (let i = 0; i < statements.length; i += 250) {
    await client.batch(statements.slice(i, i + 250), 'write')
  }

  const finishedAt = new Date().toISOString()
  const durationMs = Date.now() - startTime

  await client.execute({
    sql: `UPDATE import_runs SET finished_at=?,status='repair-accepted',accepted_documents=1,quarantined_documents=0,accepted_entries=? WHERE run_id=?`,
    args: [finishedAt, show.results!.length, runId]
  })

  console.log(`Reparse completed successfully`)
  console.log(`Processed: ${show.results!.length} entries`)
  console.log(`Duration: ${durationMs}ms`)
  console.log(`Run ID: ${runId}`)
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
