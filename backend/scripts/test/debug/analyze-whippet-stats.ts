import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

// Import parse by running fetch script output
const out = execSync('npx tsx backend/scripts/speed/fetch-speed-records.ts', { cwd: 'D:/Site/Procoursing', encoding: 'utf8', maxBuffer: 10_000_000 });

// Re-parse inline - duplicate minimal logic
import * as XLSX from 'xlsx';

const SPEED_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/export?format=xlsx';

const buffer = await fetch(SPEED_SHEET_URL).then((r) => r.arrayBuffer());

// dynamic import parser functions - copy from fetch-speed-records
const { parseXLSX } = await import('../../speed/fetch-speed-records.ts').catch(() => ({ parseXLSX: null }));

// parseXLSX not exported - inline call via eval alternative
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Simple: load module and call main pieces
const mod = await import('../../../scripts/speed/fetch-speed-records.ts').catch(() => null);
