/** Creates the shows read-model schema. Requires TURSO_URL and TURSO_AUTH_TOKEN. */
import { createClient } from '@libsql/client'
import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// Load .env from project root
const __dirname = fileURLToPath(new URL('.', import.meta.url))
config({ path: resolve(__dirname, '../../.env') })

const url = process.env.TURSO_URL
const authToken = process.env.TURSO_AUTH_TOKEN
if (!url || !authToken) throw new Error('TURSO_URL and TURSO_AUTH_TOKEN are required')

const statements = [
  'DROP TABLE IF EXISTS ring_entries',
  'DROP TABLE IF EXISTS awards',
  'DROP TABLE IF EXISTS dog_links',
  'DROP TABLE IF EXISTS show_judges',
  'DROP TABLE IF EXISTS show_dogs',
  'DROP TABLE IF EXISTS exhibitions',
  'DROP TABLE IF EXISTS source_documents',
  'DROP TABLE IF EXISTS import_runs',
  'DROP TABLE IF EXISTS import_progress',
  `CREATE TABLE IF NOT EXISTS import_runs (
    run_id TEXT PRIMARY KEY, sources_commit TEXT, parser_version TEXT NOT NULL,
    started_at TEXT NOT NULL, finished_at TEXT, status TEXT NOT NULL,
    accepted_documents INTEGER NOT NULL DEFAULT 0, quarantined_documents INTEGER NOT NULL DEFAULT 0,
    accepted_entries INTEGER NOT NULL DEFAULT 0, error_json TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS source_documents (
    source_id TEXT PRIMARY KEY, git_path TEXT NOT NULL UNIQUE, sha256 TEXT NOT NULL,
    source_kind TEXT NOT NULL, year INTEGER, status TEXT NOT NULL,
    parser_version TEXT NOT NULL, last_run_id TEXT, parsed_entries INTEGER NOT NULL DEFAULT 0,
    accepted_entries INTEGER NOT NULL DEFAULT 0, error_json TEXT, updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS exhibitions (
    exhibition_id TEXT PRIMARY KEY, external_id TEXT NOT NULL, source_kind TEXT NOT NULL,
    date TEXT, title TEXT NOT NULL, location TEXT, rank TEXT, type TEXT, club TEXT,
    url TEXT, reports_link TEXT, bis_reports_link TEXT, UNIQUE(external_id, source_kind)
  )`,
  `CREATE TABLE IF NOT EXISTS show_dogs (
    show_dog_id TEXT PRIMARY KEY, name_lat TEXT NOT NULL, name_ru TEXT,
    normalized_name TEXT NOT NULL, breed TEXT NOT NULL, breed_en TEXT, breed_group TEXT,
    sex TEXT, UNIQUE(normalized_name, breed)
  )`,
  `CREATE TABLE IF NOT EXISTS show_judges (
    show_judge_id TEXT PRIMARY KEY, display_name TEXT NOT NULL, merge_key TEXT NOT NULL UNIQUE
  )`,
  `CREATE TABLE IF NOT EXISTS ring_entries (
    ring_entry_id TEXT PRIMARY KEY, source_id TEXT NOT NULL REFERENCES source_documents(source_id),
    exhibition_id TEXT NOT NULL REFERENCES exhibitions(exhibition_id),
    show_dog_id TEXT NOT NULL REFERENCES show_dogs(show_dog_id),
    show_judge_id TEXT REFERENCES show_judges(show_judge_id), raw_locator TEXT NOT NULL,
    breed TEXT NOT NULL, breed_en TEXT, breed_group TEXT, class TEXT, placement INTEGER,
    grade TEXT, title TEXT, points INTEGER, owner TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS awards (
    show_dog_id TEXT NOT NULL REFERENCES show_dogs(show_dog_id),
    exhibition_id TEXT NOT NULL REFERENCES exhibitions(exhibition_id), award_type TEXT NOT NULL,
    award_count INTEGER NOT NULL DEFAULT 1, PRIMARY KEY(show_dog_id, exhibition_id, award_type)
  )`,
  `CREATE TABLE IF NOT EXISTS dog_links (
    show_dog_id TEXT PRIMARY KEY REFERENCES show_dogs(show_dog_id),
    competition_dog_id INTEGER NOT NULL UNIQUE, match_method TEXT NOT NULL,
    evidence_json TEXT NOT NULL, created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS import_progress (
    progress_key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL
  )`,
  'CREATE INDEX IF NOT EXISTS idx_ring_entries_exhibition ON ring_entries(exhibition_id)',
  'CREATE INDEX IF NOT EXISTS idx_ring_entries_dog ON ring_entries(show_dog_id)',
  'CREATE INDEX IF NOT EXISTS idx_ring_entries_judge ON ring_entries(show_judge_id)',
  'CREATE INDEX IF NOT EXISTS idx_source_documents_status ON source_documents(status)',
]

async function main() {
  const client = createClient({ url, authToken })
  for (const sql of statements) await client.execute(sql)
  console.log(`Created ${statements.length} Turso schema statements`)
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
