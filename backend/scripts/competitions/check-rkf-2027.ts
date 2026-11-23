import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as XLSX from 'xlsx';

/**
 * Daily Monitor & Ingestion Script for RKF 2027 Calendar Plan
 *
 * 1. Checks https://info.rkf.online/attachment/0a0cafba-68a6-4cfb-80f0-01407d9bff0f
 * 2. Compares SHA-256 against data/v1/calendar/2027-changelog.json
 * 3. Diffs RKF schedule against data/v1/calendar/2027.json
 * 4. Generates Telegram alert with <blockquote expandable>
 * 5. Supports --apply flag to update JSON, changelog, and rebuild indexes
 */

interface CalendarEvent2027 {
  id: number;
  year: number;
  month: string;
  date_start: string;
  date_end: string;
  title: string;
  full_title: string;
  rank_label: string;
  event_type: 'coursing' | 'racing';
  competition_kind: string;
  competition_type: string;
  host_club: string;
  region: string;
  location: string;
  results_url: string | null;
  catalog_url: string | null;
  confirmed: number;
  judges: string | null;
  has_results: boolean;
  results_file: string | null;
  result_count: number;
  participants_count: number;
  results_pdf_url: string | null;
  notes?: string | null;
  rules_url?: string | null;
  rules_file?: string | null;
}

interface CalendarChangelogEntry {
  date: string;
  version: string;
  title: string;
  summary: string;
  changes: string[];
}

interface CalendarChangelog {
  schema: string;
  season: number;
  source_url: string;
  attachment_url: string;
  last_checked_at: string;
  source_sha256: string;
  entries: CalendarChangelogEntry[];
}

interface RawRkfRow {
  dateStart: string;
  dateEnd: string;
  location: string;
  club: string;
  rank: string;
  discipline: string;
  rules?: string | null;
  notes?: string | null;
  sheetName: string;
}

interface EventDiff {
  added: RawRkfRow[];
  removed: CalendarEvent2027[];
  dateChanges: Array<{ event: CalendarEvent2027; oldDate: string; newDate: string }>;
  notesChanges: Array<{ event: CalendarEvent2027; oldNotes: string | null; newNotes: string | null }>;
  locationChanges: Array<{ event: CalendarEvent2027; oldLoc: string; newLoc: string }>;
  rulesAdded: Array<{ event: CalendarEvent2027; newRules: string }>;
}

const SOURCE_URL = 'https://info.rkf.online/article/fb2b53ca-bdf2-5e35-bea2-2e973592e2d7';

export async function resolveLatest2027AttachmentUrl(sourceUrl: string = SOURCE_URL): Promise<string> {
  console.log(`[check-rkf-2027] Resolving latest 2027 attachment URL from ${sourceUrl}...`);
  const res = await fetch(sourceUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CoursingStatsBot/1.0 (+https://coursing-stats.ru)',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch RKF source article: HTTP ${res.status} ${res.statusText}`);
  }

  const html = await res.text();

  // Pattern 1: header file icon title "Utility_National_2027*.xlsx"
  const titleMatch = html.match(/href=["'](\/attachment\/[a-f0-9\-]+)["'][^>]*title=["'][^"']*Utility_National_2027/i);
  if (titleMatch) {
    return `https://info.rkf.online${titleMatch[1]}`;
  }

  // Pattern 2: section 2027 link "Национальные сертификатные состязания"
  const secMatch = html.match(/<strong>2027<\/strong>[\s\S]*?href=["'](https?:\/\/info\.rkf\.online\/attachment\/[a-f0-9\-]+)["'][^>]*>Национальные сертификатные состязания/i);
  if (secMatch) {
    return secMatch[1];
  }

  // Pattern 3: any attachment right after 2027 header
  const any2027Match = html.match(/<strong>2027<\/strong>[\s\S]*?href=["'](\/attachment\/[a-f0-9\-]+)["']/i);
  if (any2027Match) {
    return `https://info.rkf.online${any2027Match[1]}`;
  }

  throw new Error('Failed to resolve 2027 schedule attachment link from RKF article.');
}

const MONTH_NAMES: Record<string, string> = {
  '01': '01-январь',
  '02': '02-февраль',
  '03': '03-март',
  '04': '04-апрель',
  '05': '05-май',
  '06': '06-июнь',
  '07': '07-июль',
  '08': '08-август',
  '09': '09-сентябрь',
  '10': '10-октябрь',
  '11': '11-ноябрь',
  '12': '12-декабрь',
};

function parseExcelDate(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(val).trim();
  const dmMatch = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dmMatch) {
    return `${dmMatch[3]}-${dmMatch[2].padStart(2, '0')}-${dmMatch[1].padStart(2, '0')}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  return str;
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/ё/g, 'е').replace(/[«»"']/g, '').replace(/\s+/g, ' ').trim();
}

function parseRkfWorkbook(buffer: Buffer): RawRkfRow[] {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const targetSheets = ['Курсинг борзых', 'Бега борзых', 'Бега за механической приманкой'];
  const rows: RawRkfRow[] = [];

  for (const sheetName of targetSheets) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;

    const data = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
    for (let r = 2; r < data.length; r++) {
      const row = data[r];
      if (!row || !Array.isArray(row) || row.length < 5) continue;

      const dateStartRaw = row[0];
      const dateEndRaw = row[1];
      const locRaw = row[2];
      const clubRaw = row[3];
      const rankRaw = row[4];
      const discRaw = row[5];
      const rulesRaw = row[9];
      const notesRaw = row[10];

      if (!dateStartRaw) continue;

      const dateStart = parseExcelDate(dateStartRaw);
      const dateEnd = parseExcelDate(dateEndRaw) || dateStart;
      const rank = String(rankRaw || '').trim();
      const disc = String(discRaw || '').trim();
      const club = String(clubRaw || '').trim();
      const location = String(locRaw || '').trim();
      const rules = rulesRaw ? String(rulesRaw).trim() : null;
      const notes = notesRaw ? String(notesRaw).trim() : null;

      // Filter out preliminary qualifications or training runs
      const fullRankDisc = `${rank} ${disc}`.toLowerCase();
      if (/квалификаци|тестирован|трениров/i.test(fullRankDisc)) {
        continue;
      }

      rows.push({
        dateStart,
        dateEnd,
        location,
        club,
        rank,
        discipline: disc,
        rules,
        notes: notes || null,
        sheetName,
      });
    }
  }

  return rows;
}

function computeDiff(currentEvents: CalendarEvent2027[], rkfRows: RawRkfRow[]): EventDiff {
  const diff: EventDiff = {
    added: [],
    removed: [],
    dateChanges: [],
    notesChanges: [],
    locationChanges: [],
    rulesAdded: [],
  };

  const matchedEventIds = new Set<number>();

  for (const row of rkfRows) {
    const normClub = normalizeText(row.club);
    const normRank = normalizeText(row.rank);

    // Try exact match on date_start + club + rank
    let matched = currentEvents.find(
      (e) =>
        !matchedEventIds.has(e.id) &&
        e.date_start === row.dateStart &&
        normalizeText(e.host_club) === normClub &&
        (normalizeText(e.competition_kind) === normRank ||
          normalizeText(e.title).includes(normRank) ||
          normRank.includes(normalizeText(e.competition_kind)))
    );

    // If not found, try match on club + rank/discipline (date might have changed)
    if (!matched) {
      matched = currentEvents.find(
        (e) =>
          !matchedEventIds.has(e.id) &&
          normalizeText(e.host_club) === normClub &&
          (normalizeText(e.competition_kind).includes(normRank) ||
            normRank.includes(normalizeText(e.competition_kind)))
      );
    }

    // Fallback: match by date_start + club
    if (!matched) {
      matched = currentEvents.find(
        (e) => !matchedEventIds.has(e.id) && e.date_start === row.dateStart && normalizeText(e.host_club) === normClub
      );
    }

    if (!matched) {
      diff.added.push(row);
      continue;
    }

    matchedEventIds.add(matched.id);

    // Check date change (treating null date_end as equal to date_start)
    const currentEnd = matched.date_end || matched.date_start;
    const newEnd = row.dateEnd || row.dateStart;
    if (matched.date_start !== row.dateStart || currentEnd !== newEnd) {
      diff.dateChanges.push({
        event: matched,
        oldDate: `${matched.date_start} — ${currentEnd}`,
        newDate: `${row.dateStart} — ${newEnd}`,
      });
    }

    // Check notes change (e.g. commission review status)
    const oldNotes = matched.notes ? matched.notes.trim() : null;
    const newNotes = row.notes ? row.notes.trim() : null;
    if (oldNotes !== newNotes) {
      diff.notesChanges.push({
        event: matched,
        oldNotes,
        newNotes,
      });
    }

    // Check location change
    if (row.location && normalizeText(matched.location) !== normalizeText(row.location)) {
      diff.locationChanges.push({
        event: matched,
        oldLoc: matched.location,
        newLoc: row.location,
      });
    }

    // Check rules added
    if (row.rules && !matched.rules_url && !matched.rules_file) {
      diff.rulesAdded.push({
        event: matched,
        newRules: row.rules,
      });
    }
  }

  // Events in current 2027.json not matched in RKF
  for (const e of currentEvents) {
    if (!matchedEventIds.has(e.id)) {
      diff.removed.push(e);
    }
  }

  return diff;
}

function hasAnyChanges(diff: EventDiff): boolean {
  return (
    diff.added.length > 0 ||
    diff.removed.length > 0 ||
    diff.dateChanges.length > 0 ||
    diff.notesChanges.length > 0 ||
    diff.locationChanges.length > 0 ||
    diff.rulesAdded.length > 0
  );
}

function formatTelegramAlert(diff: EventDiff, totalRows: number): string {
  const parts: string[] = [];
  parts.push('<b>📅 Обновление календарного плана РКФ 2027</b>\n');
  parts.push(`В официальном файле РКФ обнаружены изменения (всего стартов в плане: <b>${totalRows}</b>):`);

  const summaryItems: string[] = [];
  if (diff.added.length > 0) summaryItems.push(`➕ Новых стартов: <b>${diff.added.length}</b>`);
  if (diff.removed.length > 0) summaryItems.push(`➖ Отменено / удалено: <b>${diff.removed.length}</b>`);
  if (diff.dateChanges.length > 0) summaryItems.push(`📅 Перенос дат: <b>${diff.dateChanges.length}</b>`);
  if (diff.notesChanges.length > 0) summaryItems.push(`⚖️ Изменение статуса комиссии: <b>${diff.notesChanges.length}</b>`);
  if (diff.locationChanges.length > 0) summaryItems.push(`📍 Изменение места: <b>${diff.locationChanges.length}</b>`);
  if (diff.rulesAdded.length > 0) summaryItems.push(`📜 Опубликован регламент: <b>${diff.rulesAdded.length}</b>`);

  parts.push(summaryItems.join('\n'));
  parts.push('\n<blockquote expandable>');

  for (const a of diff.added) {
    parts.push(`➕ <b>${a.dateStart}</b>: ${a.rank} (${a.discipline}) — ${a.club} (${a.location})`);
  }
  for (const r of diff.removed) {
    parts.push(`➖ <b>${r.date_start}</b>: ${r.title} — ${r.host_club}`);
  }
  for (const d of diff.dateChanges) {
    parts.push(`📅 <b>${d.event.title}</b>: ${d.oldDate} ➔ <b>${d.newDate}</b>`);
  }
  for (const n of diff.notesChanges) {
    const oldStatus = n.oldNotes || 'утверждено';
    const newStatus = n.newNotes || 'утверждено';
    parts.push(`⚖️ <b>${n.event.title}</b>: «${oldStatus}» ➔ <b>«${newStatus}»</b>`);
  }
  for (const l of diff.locationChanges) {
    parts.push(`📍 <b>${l.event.title}</b>: ${l.oldLoc} ➔ <b>${l.newLoc}</b>`);
  }
  for (const ru of diff.rulesAdded) {
    parts.push(`📜 <b>${ru.event.title}</b>: прикреплён регламент`);
  }

  parts.push('</blockquote>\n');
  parts.push('Для применения запустите: <code>yarn check-rkf-2027 --apply</code>');
  return parts.join('\n');
}

async function sendTelegramMessage(token: string, chatId: string, text: string): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`[check-rkf-2027] Telegram sendMessage failed (${res.status}):`, errText);
      return false;
    }
    console.log('[check-rkf-2027] Telegram alert successfully sent to admin.');
    return true;
  } catch (err) {
    console.error('[check-rkf-2027] Failed to send Telegram alert:', err);
    return false;
  }
}

async function main() {
  const isForce = process.argv.includes('--force');
  const isApply = process.argv.includes('--apply');

  const changelogPath = path.join(process.cwd(), 'data/v1/calendar/2027-changelog.json');
  const calendarPath = path.join(process.cwd(), 'data/v1/calendar/2027.json');
  const frontendChangelogPath = path.join(process.cwd(), 'frontend/public/data/v1/calendar/2027-changelog.json');
  const frontendCalendarPath = path.join(process.cwd(), 'frontend/public/data/v1/calendar/2027.json');

  if (!fs.existsSync(changelogPath) || !fs.existsSync(calendarPath)) {
    throw new Error('Required calendar or changelog files not found.');
  }

  const changelog: CalendarChangelog = JSON.parse(fs.readFileSync(changelogPath, 'utf-8'));
  const calendarData: { events: CalendarEvent2027[] } = JSON.parse(fs.readFileSync(calendarPath, 'utf-8'));

  const attachmentUrl = await resolveLatest2027AttachmentUrl(SOURCE_URL);
  console.log(`[check-rkf-2027] Fetching RKF attachment: ${attachmentUrl}`);
  const res = await fetch(attachmentUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CoursingStatsBot/1.0 (+https://coursing-stats.ru)',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch RKF attachment: HTTP ${res.status} ${res.statusText}`);
  }

  const arrayBuf = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);
  const currentSha256 = crypto.createHash('sha256').update(buffer).digest('hex');

  console.log(`[check-rkf-2027] Attachment downloaded (${buffer.length} bytes). SHA-256: ${currentSha256}`);
  console.log(`[check-rkf-2027] Previous known SHA-256: ${changelog.source_sha256}`);

  const shaChanged = currentSha256 !== changelog.source_sha256;
  if (!shaChanged && !isForce) {
    console.log('[check-rkf-2027] Attachment SHA-256 unchanged. Plan is up-to-date.');
    return;
  }

  const rawRows = parseRkfWorkbook(buffer);
  console.log(`[check-rkf-2027] Parsed ${rawRows.length} competition rows from RKF workbook.`);

  const diff = computeDiff(calendarData.events, rawRows);
  const hasDiffs = hasAnyChanges(diff);

  if (!hasDiffs) {
    console.log('[check-rkf-2027] No semantic differences found in competition rows.');
    if (shaChanged) {
      changelog.attachment_url = attachmentUrl;
      changelog.source_sha256 = currentSha256;
      changelog.last_checked_at = new Date().toISOString();
      fs.writeFileSync(changelogPath, JSON.stringify(changelog, null, 2), 'utf-8');
      if (fs.existsSync(frontendChangelogPath)) {
        fs.writeFileSync(frontendChangelogPath, JSON.stringify(changelog, null, 2), 'utf-8');
      }
      console.log('[check-rkf-2027] Updated source_sha256 and last_checked_at timestamp.');
    }
    return;
  }

  console.log('[check-rkf-2027] Found differences in 2027 calendar:');
  console.log(`  Added: ${diff.added.length}`);
  console.log(`  Removed: ${diff.removed.length}`);
  console.log(`  Date changes: ${diff.dateChanges.length}`);
  console.log(`  Notes/Status changes: ${diff.notesChanges.length}`);
  console.log(`  Location changes: ${diff.locationChanges.length}`);
  console.log(`  Rules added: ${diff.rulesAdded.length}`);

  const tgMessage = formatTelegramAlert(diff, rawRows.length);
  console.log('\n--- Telegram Alert Preview ---');
  console.log(tgMessage);
  console.log('------------------------------\n');

  // Send to Telegram if credentials available
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (botToken && adminChatId) {
    await sendTelegramMessage(botToken, adminChatId, tgMessage);
  } else {
    console.log('[check-rkf-2027] TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID not configured; skipped Telegram notification.');
  }

  if (isApply) {
    console.log('[check-rkf-2027] Applying changes (--apply flag set)...');

    // Apply notes changes
    for (const nc of diff.notesChanges) {
      nc.event.notes = nc.newNotes;
    }
    // Apply date changes
    for (const dc of diff.dateChanges) {
      const [start, end] = dc.newDate.split(' — ');
      dc.event.date_start = start;
      dc.event.date_end = end || start;
      const m = start.split('-')[1];
      if (m && MONTH_NAMES[m]) {
        dc.event.month = MONTH_NAMES[m];
      }
    }
    // Apply location changes
    for (const lc of diff.locationChanges) {
      lc.event.location = lc.newLoc;
    }
    // Apply rules added
    for (const ra of diff.rulesAdded) {
      ra.event.rules_file = ra.newRules;
    }

    // Add new events with incremental IDs
    let maxId = Math.max(...calendarData.events.map((e) => e.id), 1400);
    for (const added of diff.added) {
      maxId++;
      const isCoursing = added.sheetName === 'Курсинг борзых';
      const m = added.dateStart.split('-')[1] || '01';
      const newEvent: CalendarEvent2027 = {
        id: maxId,
        year: 2027,
        month: MONTH_NAMES[m] || '01-январь',
        date_start: added.dateStart,
        date_end: added.dateEnd,
        title: `${added.rank} по ${added.discipline} (${added.location})`,
        full_title: `${added.rank} по ${added.discipline} (${added.location}) — ${added.club}`,
        rank_label: `${added.rank}\n(${added.sheetName})`,
        event_type: isCoursing ? 'coursing' : 'racing',
        competition_kind: added.rank,
        competition_type: added.sheetName,
        host_club: added.club,
        region: added.location,
        location: added.location,
        results_url: null,
        catalog_url: null,
        confirmed: 1,
        judges: null,
        has_results: false,
        results_file: null,
        result_count: 0,
        participants_count: 0,
        results_pdf_url: null,
        notes: added.notes || null,
        rules_file: added.rules || null,
        rules_url: null,
      };
      calendarData.events.push(newEvent);
    }

    // Sort events chronologically
    calendarData.events.sort((a, b) => a.date_start.localeCompare(b.date_start));

    // Update changelog
    const todayIso = new Date().toISOString().split('T')[0];
    const prevVersionNum = parseFloat(changelog.entries[0]?.version || '1.0');
    const newVersion = (prevVersionNum + 0.1).toFixed(1);

    const changeList: string[] = [];
    if (diff.added.length > 0) changeList.push(`Добавлено ${diff.added.length} новых состязаний`);
    if (diff.removed.length > 0) changeList.push(`Удалено ${diff.removed.length} состязаний`);
    if (diff.dateChanges.length > 0) changeList.push(`Обновлены даты проведения для ${diff.dateChanges.length} состязаний`);
    if (diff.notesChanges.length > 0) changeList.push(`Обновлен статус согласования комиссии для ${diff.notesChanges.length} состязаний`);
    if (diff.locationChanges.length > 0) changeList.push(`Уточнены локации для ${diff.locationChanges.length} состязаний`);
    if (diff.rulesAdded.length > 0) changeList.push(`Прикреплены регламенты для ${diff.rulesAdded.length} состязаний`);

    changelog.entries.unshift({
      date: todayIso,
      version: newVersion,
      title: `Обновление утвержденного плана РКФ (${todayIso})`,
      summary: `Синхронизация с официальным реестром РКФ. Изменений: ${changeList.length}.`,
      changes: changeList,
    });

    changelog.attachment_url = attachmentUrl;
    changelog.source_sha256 = currentSha256;
    changelog.last_checked_at = new Date().toISOString();

    // Write back files
    fs.writeFileSync(calendarPath, JSON.stringify(calendarData, null, 2), 'utf-8');
    fs.writeFileSync(changelogPath, JSON.stringify(changelog, null, 2), 'utf-8');
    if (fs.existsSync(frontendCalendarPath)) {
      fs.writeFileSync(frontendCalendarPath, JSON.stringify(calendarData, null, 2), 'utf-8');
    }
    if (fs.existsSync(frontendChangelogPath)) {
      fs.writeFileSync(frontendChangelogPath, JSON.stringify(changelog, null, 2), 'utf-8');
    }

    console.log(`[check-rkf-2027] Successfully applied updates (revision ${newVersion}).`);
  }
}

main().catch((err) => {
  console.error('[check-rkf-2027] Fatal error:', err);
  process.exit(1);
});
