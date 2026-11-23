// RKF Competitions 2026 Tracker (Track 4 & Directive from Coordinator)
import competitions2026 from '../data/competitions-2026.json';

export interface CompetitionEvent {
  id: string;
  sheetName: string;
  dateRaw: string;
  discipline: string;
  rank: string;
  location: string;
  club: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'CANCELLED' | string;
  reglament?: string;
  summary?: string;
  decision?: string;
  judges?: string;
  notes?: string;
  updatedAt?: string;
}

export const TARGET_DISCIPLINES = [
  'Курсинг борзых',
  'Бега борзых',
  'Бега за мех. приманкой'
] as const;

export const STATUS_RUSSIAN: Record<string, string> = {
  APPROVED: 'Утверждено',
  PENDING: 'На согласовании',
  REJECTED: 'Отклонено',
  CANCELLED: 'Отменено'
};

export function getAllCompetitions(): CompetitionEvent[] {
  return competitions2026 as CompetitionEvent[];
}

export function filterCompetitions(filters: {
  discipline?: string;
  status?: string;
  query?: string;
  limit?: number;
}): CompetitionEvent[] {
  const all = getAllCompetitions();
  const q = (filters.query || '').trim().toLowerCase();

  const filtered = all.filter(ev => {
    if (filters.discipline && filters.discipline !== 'all') {
      const d = filters.discipline.toLowerCase();
      if (!ev.discipline.toLowerCase().includes(d) && !ev.sheetName.toLowerCase().includes(d)) {
        return false;
      }
    }

    if (filters.status && filters.status !== 'all') {
      if (ev.status.toUpperCase() !== filters.status.toUpperCase()) {
        return false;
      }
    }

    if (q) {
      const matchText = (
        (ev.location || '') + ' ' +
        (ev.club || '') + ' ' +
        (ev.discipline || '') + ' ' +
        (ev.rank || '') + ' ' +
        (ev.judges || '') + ' ' +
        (ev.id || '')
      ).toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    return true;
  });

  return filters.limit ? filtered.slice(0, filters.limit) : filtered;
}

export function findCompetitionById(id: string): CompetitionEvent | undefined {
  return getAllCompetitions().find(ev => ev.id === id);
}

export function getDisciplineCounts() {
  const all = getAllCompetitions();
  let coursing = 0;
  let racing = 0;
  let bzmp = 0;
  let approved = 0;
  let pending = 0;

  for (const ev of all) {
    const d = ev.discipline.toLowerCase();
    if (d.includes('курсинг')) coursing++;
    else if (d.includes('бега борзых')) racing++;
    else if (d.includes('приманк') || d.includes('бзмп')) bzmp++;

    if (ev.status === 'APPROVED') approved++;
    else if (ev.status === 'PENDING') pending++;
  }

  return { total: all.length, coursing, racing, bzmp, approved, pending };
}

export function formatCompetitionCard(ev: CompetitionEvent): string {
  const st = STATUS_RUSSIAN[ev.status] || ev.status;
  const badge = ev.status === 'APPROVED' ? '[УТВЕРЖДЕНО]' : `[${st.toUpperCase()}]`;

  const judgesLine = ev.judges ? `\n• Судьи: ${ev.judges}` : '';
  const reglLine = ev.reglament ? `\n• Регламент: ${ev.reglament}` : '';
  const notesLine = ev.notes ? `\n• Примечание: ${ev.notes}` : '';

  return (
    `${badge} ${ev.discipline} (${ev.rank})\n` +
    `• Дата: ${ev.dateRaw}\n` +
    `• Город/место: ${ev.location}\n` +
    `• Клуб: ${ev.club}${judgesLine}${reglLine}${notesLine}\n` +
    `• ID для подписки: /track_event ${ev.id}`
  );
}

export function formatApprovalAlert(ev: CompetitionEvent): string {
  return (
    `[УТВЕРЖДЕНО СОСТЯЗАНИЕ РКФ]\n\n` +
    `• Дисциплина: ${ev.discipline}\n` +
    `• Ранг: ${ev.rank}\n` +
    `• Дата: ${ev.dateRaw}\n` +
    `• Место: ${ev.location}\n` +
    `• Клуб: ${ev.club}\n` +
    (ev.judges ? `• Судейская коллегия: ${ev.judges}\n` : '') +
    `\nСостязание официально включено в утвержденный график РКФ.`
  );
}
