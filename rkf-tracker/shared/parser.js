// In-Memory Streaming Parser for RKF Competition Calendars (.xlsx)
import XLSX from 'xlsx';
import { APPROVAL_STATUS } from './types.js';

const HEADER_MAP = {
  startDate: ['дата начала', 'дата', 'период', 'сроки', 'date'],
  endDate: ['дата окончания', 'по'],
  rank: ['ранг', 'статус состязания', 'ранг мероприятия'],
  discipline: ['дисциплина', 'вид состязаний', 'вид спорта', 'вид'],
  location: ['место проведения', 'город', 'место', 'субъект', 'регион'],
  club: ['организация', 'организатор', 'клуб', 'федерация', 'наименование клуба'],
  reglament: ['регламент', 'согласован'],
  summary: ['сводка', 'статус', 'входящий', 'вх.№', 'вх.'],
  decision: ['решения комиссии', 'решение'],
  notes: ['примечания', 'примечание'],
  judges: ['руководитель', 'судья', 'судьи', 'эксперт']
};

export function parseRkfCalendarWorkbook(data, options = {}) {
  const workbook = XLSX.read(data, { type: 'array' });
  const allEvents = [];
  const allowedDisciplines = options.disciplines || ['курсинг', 'бега'];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet || !sheet['!ref']) continue;

    // Filter sheets: if options specified, only process greyhound coursing/racing
    const lowerName = sheetName.toLowerCase();
    if (allowedDisciplines.length > 0) {
      const matches = allowedDisciplines.some(d => lowerName.includes(d));
      if (!matches && options.strictDisciplines) continue;
    }

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!rows || rows.length < 2) continue;

    const parsedSheetEvents = parseSheetRows(rows, sheetName, options);
    allEvents.push(...parsedSheetEvents);
  }

  return allEvents;
}

function parseSheetRows(rows, sheetName, options) {
  let headerIndex = -1;
  let colIndices = null;

  for (let r = 0; r < Math.min(rows.length, 6); r++) {
    const row = rows[r];
    if (!Array.isArray(row)) continue;
    const mapping = matchHeaderColumns(row);
    if (mapping && (mapping.startDate !== undefined || mapping.club !== undefined)) {
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

    const rawStart = row[colIndices.startDate];
    const rawEnd = colIndices.endDate !== undefined ? row[colIndices.endDate] : '';
    const dateFormatted = buildDisplayDate(rawStart, rawEnd);

    const rawClub = String(row[colIndices.club] || '').trim();
    const rawLocation = String(row[colIndices.location] || '').trim();

    if (!dateFormatted && !rawClub && !rawLocation) continue;

    const rawRank = colIndices.rank !== undefined ? String(row[colIndices.rank] || '').trim() : '';
    const rawDiscipline = colIndices.discipline !== undefined && row[colIndices.discipline]
      ? String(row[colIndices.discipline]).trim()
      : sheetName;

    const rawReglament = colIndices.reglament !== undefined ? String(row[colIndices.reglament] || '').trim() : '';
    const rawSummary = colIndices.summary !== undefined ? String(row[colIndices.summary] || '').trim() : '';
    const rawDecision = colIndices.decision !== undefined ? String(row[colIndices.decision] || '').trim() : '';
    const rawJudges = colIndices.judges !== undefined ? String(row[colIndices.judges] || '').trim() : '';
    const rawNotes = colIndices.notes !== undefined ? String(row[colIndices.notes] || '').trim() : '';

    const status = resolveApprovalStatus(rawReglament, rawSummary, rawDecision);
    const eventId = generateEventId(dateFormatted, rawDiscipline, rawClub, rawLocation);

    events.push({
      id: eventId,
      sheetName,
      dateRaw: dateFormatted,
      discipline: rawDiscipline,
      rank: rawRank,
      location: rawLocation,
      club: rawClub,
      status,
      reglament: rawReglament,
      summary: rawSummary,
      decision: rawDecision,
      judges: rawJudges,
      notes: rawNotes,
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

export function formatExcelDate(val) {
  if (val === undefined || val === null || val === '') return '';
  if (typeof val === 'number' || (!isNaN(val) && Number(val) > 40000 && Number(val) < 60000)) {
    const parsed = XLSX.SSF.parse_date_code(Number(val));
    if (parsed) {
      const d = String(parsed.d).padStart(2, '0');
      const m = String(parsed.m).padStart(2, '0');
      return `${d}.${m}.${parsed.y}`;
    }
  }
  return String(val).trim();
}

function buildDisplayDate(startVal, endVal) {
  const s = formatExcelDate(startVal);
  const e = formatExcelDate(endVal);
  if (!s && !e) return '';
  if (!e || s === e) return s;

  // If same month and year, format "04-05.04.2026"
  const sParts = s.split('.');
  const eParts = e.split('.');
  if (sParts.length === 3 && eParts.length === 3 && sParts[1] === eParts[1] && sParts[2] === eParts[2]) {
    return `${sParts[0]}-${eParts[0]}.${sParts[1]}.${sParts[2]}`;
  }
  return `${s} — ${e}`;
}

export function resolveApprovalStatus(reglament = '', summary = '', decision = '') {
  const text = `${reglament} ${summary} ${decision}`.toLowerCase();

  if (text.includes('отклон') || text.includes('отказ')) return APPROVAL_STATUS.REJECTED;
  if (text.includes('отмен')) return APPROVAL_STATUS.CANCELLED;
  if (text.includes('задержан')) return APPROVAL_STATUS.DELAYED;
  if (text.includes('утвержден') || text.includes('в графике') || text.includes('согласован')) {
    return APPROVAL_STATUS.APPROVED;
  }
  // Если заявка принята секретаритом либо статус еще не указан — состязание на согласовании
  return APPROVAL_STATUS.PENDING;
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
