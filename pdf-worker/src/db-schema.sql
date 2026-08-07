-- D1 Schema for PDF Documents Metadata
-- Table: pdf_documents
-- Purpose: Track processed PDF documents, their status, and cache keys

CREATE TABLE IF NOT EXISTS pdf_documents (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  processed_at TEXT NOT NULL,
  method_used TEXT NOT NULL,  -- 'pdf-parse' or 'workers-ai-vision'
  pages INTEGER NOT NULL,
  cache_key TEXT NOT NULL,  -- KV key for JSON result
  status TEXT NOT NULL,  -- 'success', 'failed', 'processing'
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Unique constraint on url for proper UPSERT
CREATE UNIQUE INDEX IF NOT EXISTS idx_pdf_documents_url_unique ON pdf_documents(url);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pdf_documents_status ON pdf_documents(status);
CREATE INDEX IF NOT EXISTS idx_pdf_documents_cache_key ON pdf_documents(cache_key);

-- Helper function to update timestamp
CREATE TRIGGER IF NOT EXISTS update_pdf_documents_timestamp
AFTER UPDATE ON pdf_documents
BEGIN
  UPDATE pdf_documents SET updated_at = datetime('now') WHERE id = NEW.id;
END;
