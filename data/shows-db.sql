-- SQLite schema for shows database (local, like pc-db for competitions)

-- Import runs tracking
CREATE TABLE IF NOT EXISTS import_runs (
  run_id TEXT PRIMARY KEY,
  sources_commit TEXT NOT NULL,
  parser_version TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL,
  accepted_documents INTEGER DEFAULT 0,
  quarantined_documents INTEGER DEFAULT 0,
  accepted_entries INTEGER DEFAULT 0
);

-- Source documents tracking
CREATE TABLE IF NOT EXISTS source_documents (
  source_id TEXT PRIMARY KEY,
  git_path TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  source_kind TEXT NOT NULL,
  year INTEGER,
  status TEXT NOT NULL,
  parser_version TEXT,
  last_run_id TEXT,
  parsed_entries INTEGER DEFAULT 0,
  accepted_entries INTEGER DEFAULT 0,
  error_json TEXT,
  updated_at TEXT NOT NULL
);

-- Exhibitions
CREATE TABLE IF NOT EXISTS exhibitions (
  exhibition_id TEXT PRIMARY KEY,
  external_id TEXT NOT NULL,
  source_kind TEXT NOT NULL,
  date TEXT NOT NULL,
  title TEXT,
  location TEXT,
  rank TEXT,
  type TEXT,
  club TEXT,
  url TEXT,
  reports_link TEXT,
  bis_reports_link TEXT
);

-- Show dogs
CREATE TABLE IF NOT EXISTS show_dogs (
  show_dog_id TEXT PRIMARY KEY,
  name_lat TEXT NOT NULL,
  name_ru TEXT,
  normalized_name TEXT,
  breed TEXT NOT NULL,
  breed_en TEXT,
  breed_group TEXT,
  sex TEXT
);

-- Show judges
CREATE TABLE IF NOT EXISTS show_judges (
  show_judge_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  merge_key TEXT NOT NULL
);

-- Ring entries (results)
CREATE TABLE IF NOT EXISTS ring_entries (
  ring_entry_id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  exhibition_id TEXT NOT NULL,
  show_dog_id TEXT NOT NULL,
  show_judge_id TEXT,
  raw_locator TEXT NOT NULL,
  breed TEXT NOT NULL,
  breed_en TEXT,
  breed_group TEXT,
  class TEXT,
  placement TEXT,
  grade TEXT,
  title TEXT,
  points TEXT,
  owner TEXT,
  FOREIGN KEY (source_id) REFERENCES source_documents(source_id),
  FOREIGN KEY (exhibition_id) REFERENCES exhibitions(exhibition_id),
  FOREIGN KEY (show_dog_id) REFERENCES show_dogs(show_dog_id),
  FOREIGN KEY (show_judge_id) REFERENCES show_judges(show_judge_id)
);

-- Dog links (competition ↔ shows)
CREATE TABLE IF NOT EXISTS dog_links (
  show_dog_id TEXT PRIMARY KEY,
  competition_dog_id INTEGER NOT NULL,
  match_method TEXT NOT NULL,
  evidence_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (show_dog_id) REFERENCES show_dogs(show_dog_id)
);

-- Import progress
CREATE TABLE IF NOT EXISTS import_progress (
  progress_key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_source_documents_status ON source_documents(status);
CREATE INDEX IF NOT EXISTS idx_source_documents_year ON source_documents(year);
CREATE INDEX IF NOT EXISTS idx_exhibitions_date ON exhibitions(date);
CREATE INDEX IF NOT EXISTS idx_exhibitions_source_kind ON exhibitions(source_kind);
CREATE INDEX IF NOT EXISTS idx_ring_entries_exhibition ON ring_entries(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_ring_entries_show_dog ON ring_entries(show_dog_id);
CREATE INDEX IF NOT EXISTS idx_ring_entries_breed ON ring_entries(breed);
