// Render helpers for competitions browser (Strict Zero Emoji & Old Money)
import type { CompetitionSubscription } from '../types.js';
import { STATUS_RUSSIAN, type CompetitionEvent } from '../services/competition-tracker.js';

export const PAGE_SIZE = 3;

export function getDisciplineTitle(discKey: string): string {
  switch (discKey) {
    case 'coursing': return 'Курсинг борзых';
    case 'racing': return 'Бега борзых';
    case 'bzmp': return 'БЗМП';
    case 'approved': return 'Утвержденные состязания';
    default: return 'Все состязания 2026';
  }
}

export function getFilterParams(discKey: string): { discipline?: string; status?: string } {
  if (discKey === 'approved') return { status: 'APPROVED' };
  if (discKey === 'coursing') return { discipline: 'курсинг' };
  if (discKey === 'racing') return { discipline: 'бега борзых' };
  if (discKey === 'bzmp') return { discipline: 'приманк' };
  return {};
}

export function buildCompetitionsHubText(counts: {
  total: number;
  coursing: number;
  racing: number;
  bzmp: number;
  approved: number;
  pending: number;
}): string {
  return (
    `Календарь состязаний РКФ 2026\n` +
    `— — — — — — — — — — — — — — —\n` +
    `Всего мероприятий в графике: ${counts.total}\n` +
    `• Курсинг борзых: ${counts.coursing}\n` +
    `• Бега борзых (круг): ${counts.racing}\n` +
    `• Бега за мех. приманкой (БЗМП): ${counts.bzmp}\n\n` +
    `Статусы согласования:\n` +
    `• Официально утверждено: ${counts.approved}\n` +
    `• На согласовании РКФ: ${counts.pending}\n\n` +
    `Выберите раздел для просмотра и быстрой подписки:`
  );
}

export function buildCompetitionsPageText(
  pageEvents: CompetitionEvent[],
  page: number,
  totalPages: number,
  totalEvents: number,
  subIds: Set<string>,
  discKey: string
): string {
  let text =
    `${getDisciplineTitle(discKey)} (Всего: ${totalEvents})\n` +
    `Страница ${page + 1} из ${totalPages}\n` +
    `— — — — — — — — — — — — — — —\n\n`;

  for (let i = 0; i < pageEvents.length; i++) {
    const ev = pageEvents[i];
    const isSub = subIds.has(ev.id);
    const subTag = isSub ? ' [ПОДПИСКА]' : '';
    const st = STATUS_RUSSIAN[ev.status] || ev.status;
    const badge = ev.status === 'APPROVED' ? '[УТВЕРЖДЕНО]' : `[${st.toUpperCase()}]`;

    text +=
      `${i + 1}. ${ev.dateRaw} • ${ev.location} ${badge}${subTag}\n` +
      `   ${ev.discipline} (${ev.rank}) • ${ev.club}\n` +
      `   ID: ${ev.id}\n\n`;
  }

  text += `Нажмите [+] под сообщением для быстрой подписки:`;
  return text;
}

export function buildSubscriptionsText(subs: CompetitionSubscription[]): string {
  if (subs.length === 0) {
    return (
      `Ваши подписки на состязания РКФ 2026\n` +
      `— — — — — — — — — — — — — — —\n` +
      `У вас пока нет активных подписок.\n\n` +
      `Выберите раздел состязаний для быстрой подписки в 1 клик.`
    );
  }

  let text =
    `Ваши отслеживаемые состязания РКФ (${subs.length}):\n` +
    `— — — — — — — — — — — — — — —\n\n`;

  for (let i = 0; i < subs.length; i++) {
    const s = subs[i];
    const city = s.city ? `, ${s.city}` : '';
    const date = s.date ? ` (${s.date})` : '';
    const st = STATUS_RUSSIAN[s.lastStatus] || s.lastStatus;
    text += `${i + 1}. ${s.title}${city}${date}\n   Статус: ${st}\n   Отписаться: /untrack ${s.id}\n\n`;
  }

  return text;
}
