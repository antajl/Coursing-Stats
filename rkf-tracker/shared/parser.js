// In-Memory Streaming Parser for RKF Competition Calendars (.xlsx)
import XLSX from 'xlsx';
import { APPROVAL_STATUS } from './types.js';

const HEADER_MAP = {
  date: ['дата', 'даты', 'период', 'сроки', 'date', 'время'],
  rank: ['ранг', 'статус состязания', 'ранг мероприятия', 'уровень'],
  discipline: ['дисциплина', 'вид состязаний', 'вид спорта', 'вид', 'раздел'],
  location: ['город', 'место проведения', 'место', 'субъект', 'регион', 'локация'],
  club: ['организатор', 'клуб', 'федерация', 'проводящая организация', 'наименование клуба'],
  status: ['статус', 'согласование', 'отметка', 'утверждение', 'решение комиссии', 'результат'],
  calendarCode: ['номер в екп', 'номер в календаре', '№ в календаре', 'код', '№ заявки'],
  judges: ['судья', 'судьи', 'эксперт', 'ответственный', 'контакты']
};

export function parseRkfCalendarWorkbook(data, options = {}) {
  // data can be Buffer, Uint8Array or ArrayBuffer
  const workbook = XLSX.read(data, { type: 'array' });
  const allEvents = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet || !sheet['!ref']) continue;

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!rows || rows.length < 2) continue;

    const parsedSheetEvents = parseSheetRows(rows, sheetName, options);
    allEvents.push(...parsedSheetEvents);
  }

  return allEvents;
}

function parseSheetRows(rows, sheetName, options) {
  // Find header row (check first 6 rows)
  let headerIndex = -1;
  let colIndices = null;

  for (let r = 0; r < Math.min(rows.length, 6); r++) {
    const row = rows[r];
    if (!Array.isArray(row)) continue;
    const mapping = matchHeaderColumns(row);
    if (mapping && (mapping.date !== undefined || mapping.club !== undefined)) {
      headerIndex = r;
      colIndices = mapping;
      break;
    }
  }

  if (headerIndex === -1 || !colIndices) return [];

  const events = [];
  for (let r = headerIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!Array.isArray(row) || row.length === 0) continue;

    const rawDate = String(row[colIndices.date] || '').trim();
    const rawClub = String(row[colIndices.club] || '').trim();
    const rawLocation = String(row[colIndices.location] || '').trim();

    // Skip empty separator rows
    if (!rawDate && !rawClub && !rawLocation) continue;

    const rawRank = colIndices.rank !== undefined ? String(row[colIndices.rank] || '').trim() : '';
    const rawDiscipline = colIndices.discipline !== undefined && row[colIndices.discipline]
      ? String(row[colIndices.discipline]).trim()
      : sheetName;
    const rawStatus = colIndices.status !== undefined ? String(row[colIndices.status] || '').trim() : '';
    const rawCode = colIndices.calendarCode !== undefined ? String(row[colIndices.calendarCode] || '').trim() : '';
    const rawJudges = colIndices.judges !== undefined ? String(row[colIndices.judges] || '').trim() : '';

    const status = resolveStatus(rawStatus, rawCode);
    const eventId = generateEventId(rawDate, rawDiscipline, rawClub, rawLocation);

    events.push({
      id: eventId,
      sheetName,
      dateRaw: rawDate,
      discipline: rawDiscipline,
      rank: rawRank,
      location: rawLocation,
      club: rawClub,
      status,
      statusRaw: rawStatus,
      calendarCode: rawCode,
      judges: rawJudges,
      updatedAt: new Date().toISOString()
    });
  }

  return events;
}

function matchHeaderColumns(row) {
  const result = {};
  for (let c = 0; c < row.length; c++) {
    const cell = String(row[c] || '').toLowerCase().trim();
    if (!cell) continue;

    for (const [key, synonyms] of Object.entries(HEADER_MAP)) {
      if (result[key] === undefined && synonyms.some(s => cell.includes(s))) {
        result[key] = c;
      }
    }
  }
  return result;
}

export function resolveStatus(rawStatus, calendarCode) {
  const norm = (rawStatus || '').toLowerCase();
  if (norm.includes('отклон') || norm.includes('отказ')) return APPROVAL_STATUS.REJECTED;
  if (norm.includes('отмен')) return APPROVAL_STATUS.CANCELLED;
  if (norm.includes('на согласовани') || norm.includes('рассмотр') || norm.includes('в работе') || norm.includes('подан') || norm.includes('проверк')) {
    return APPROVAL_STATUS.PENDING;
  }
  if (norm.includes('утвержд') || norm.includes('согласован') || norm.includes('в графике') || norm.includes('включен')) {
    return APPROVAL_STATUS.APPROVED;
  }
  // If calendarCode exists and is non-empty, RKF assigned a registration ID, indicating approved status
  if (calendarCode && calendarCode.length > 2 && !calendarCode.startsWith('-')) {
    return APPROVAL_STATUS.APPROVED;
  }
  return rawStatus ? APPROVAL_STATUS.PENDING : APPROVAL_STATUS.UNKNOWN;
}

function generateEventId(date, discipline, club, location) {
  const seed = `${date}|${discipline}|${club}|${location}`.toLowerCase().replace(/\s+/g, '_');
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return 'ev_' + Math.abs(hash).toString(36);
}
