import competitionsData from './competitions-2026.json';
import type { CompetitionSubscription } from './types';

export interface TrackerCompetitionEvent {
  id: string;
  dateRaw: string;
  discipline: string;
  rank: string;
  location: string;
  club: string;
  status: 'APPROVED' | 'PENDING' | 'DELAYED' | string;
  reglament?: string;
  summary?: string;
  decision?: string;
  judges?: string;
  notes?: string;
}

export const STATUS_RUSSIAN: Record<string, string> = {
  APPROVED: 'Утверждено',
  PENDING: 'На согласовании',
  DELAYED: 'Задерживается',
  CANCELLED: 'Отменено',
};

const ALL_EVENTS = (Array.isArray(competitionsData) ? competitionsData : []) as TrackerCompetitionEvent[];

export function getTrackerCompetitions(): TrackerCompetitionEvent[] {
  return ALL_EVENTS;
}

export function findTrackerCompetitionById(id: string): TrackerCompetitionEvent | undefined {
  return ALL_EVENTS.find((e) => e.id === id);
}

export function getTrackerDisciplineCounts() {
  let coursing = 0;
  let racing = 0;
  let bzmp = 0;
  let approved = 0;
  let pending = 0;
  let delayed = 0;

  for (const ev of ALL_EVENTS) {
    const d = (ev.discipline || '').toLowerCase();
    if (d.includes('курсинг')) coursing++;
    else if (d.includes('приманк') || d.includes('бзмп')) bzmp++;
    else if (d.includes('бега')) racing++;

    if (ev.status === 'APPROVED') approved++;
    else if (ev.status === 'DELAYED') delayed++;
    else if (ev.status === 'PENDING') pending++;
  }

  return { total: ALL_EVENTS.length, coursing, racing, bzmp, approved, pending, delayed };
}

export function filterTrackerCompetitions(discKey: string): TrackerCompetitionEvent[] {
  if (discKey === 'approved') return ALL_EVENTS.filter((e) => e.status === 'APPROVED');
  if (discKey === 'coursing') return ALL_EVENTS.filter((e) => (e.discipline || '').toLowerCase().includes('курсинг'));
  if (discKey === 'racing') return ALL_EVENTS.filter((e) => (e.discipline || '').toLowerCase().includes('бега борзых'));
  if (discKey === 'bzmp') return ALL_EVENTS.filter((e) => (e.discipline || '').toLowerCase().includes('приманк'));
  return ALL_EVENTS;
}

export function buildTrackerSubscriptionsText(subs: CompetitionSubscription[]): string {
  if (subs.length === 0) {
    return (
      `📋 <b>Подписки на состязания РКФ 2026</b>\n` +
      `У вас пока нет активных подписок на согласование РКФ.\n\n` +
      `Выберите дисциплину ниже, чтобы подписаться в 1 клик.`
    );
  }
  let text = `📋 <b>Отслеживаемые состязания (${subs.length})</b>\n\n`;
  subs.forEach((s, idx) => {
    const city = s.city ? `, ${s.city}` : '';
    const date = s.date ? ` (${s.date})` : '';
    const st = STATUS_RUSSIAN[s.lastStatus] || s.lastStatus;
    text += `${idx + 1}. <b>${s.title}</b>${city}${date}\n   Статус: ${st}\n   Отписаться: /untrack ${s.id}\n\n`;
  });
  return text;
}
