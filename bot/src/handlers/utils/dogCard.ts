import type { DogData } from '../../types';

/** Краткая сводка выставок (отдельный namespace show id). */
export type ShowDogCardSummary = {
  total_shows: number;
  best_award: string | null;
  /** Ключи наград с ненулевым счётчиком, в порядке престижа как на сайте. */
  title_keys: string[];
  /** Счётчики по ключу (для ×N если больше 1). */
  title_counts?: Record<string, number>;
};

export type FormatDogCardOptions = {
  shows?: ShowDogCardSummary | null;
};

/** Короткие бейджи наград как на сайте (SHOW_AWARD_BADGE). */
const SHOW_AWARD_BADGE: Record<string, string> = {
  BIS: 'BIS',
  BIG: 'BIG',
  BIS_JUNIOR: 'BIS-Ю',
  BIS_VETERAN: 'BIS-В',
  BIS_PUPPY: 'BIS-Щ',
  BIS_BABY: 'BIS-Б',
  BOB: 'ЛПП',
  BOS: 'ЛППП',
  LB: 'ЛБ',
  LSH: 'ЛЩ',
  LYU: 'ЛЮ',
  LV: 'ЛВ',
  CACIB: 'CACIB',
  CAC: 'CAC',
  JCAC: 'JCAC',
  VCAC: 'VCAC',
  CW: 'CW',
  R_CACIB: 'R.CACIB',
  R_CAC: 'R.CAC',
  R_JCAC: 'R.JCAC',
  R_VCAC: 'R.VCAC',
  CHRKF: 'ЧРКФ',
  YCHRKF: 'ЮЧРКФ',
  VCHRKF: 'ВЧРКФ',
  KCHK: 'КЧК',
  YKCHK: 'ЮКЧК',
  VKCHK: 'ВКЧК',
  KCHP: 'КЧП',
  YKCHP: 'ЮКЧП',
  VKCHP: 'ВКЧП',
  P_RUSSIA: 'П «России»',
  P_MOSCOW: 'П Москвы',
  YP_RUSSIA: 'ЮП «России»',
  YP_MOSCOW: 'ЮП Москвы',
  VP_RUSSIA: 'ВП «России»',
  VP_MOSCOW: 'ВП Москвы',
  SS: 'СС',
  YSS: 'ЮСС',
  VSS: 'ВСС',
};

function hasDisciplineActivity(stats: {
  total_starts: number;
  gold: number;
  silver: number;
  bronze: number;
}): boolean {
  return (
    (stats.total_starts ?? 0) > 0 ||
    (stats.gold ?? 0) > 0 ||
    (stats.silver ?? 0) > 0 ||
    (stats.bronze ?? 0) > 0
  );
}

/** Порядок как SHOW_AWARD_ORDER на сайте — от крутых к менее крутым. */
const SHOW_AWARD_ORDER = [
  'BIS',
  'BIG',
  'BIS_JUNIOR',
  'BIS_VETERAN',
  'BIS_PUPPY',
  'BIS_BABY',
  'BOB',
  'BOS',
  'LYU',
  'LV',
  'LSH',
  'LB',
  'CACIB',
  'R_CACIB',
  'CAC',
  'JCAC',
  'VCAC',
  'CHRKF',
  'YCHRKF',
  'VCHRKF',
  'P_RUSSIA',
  'P_MOSCOW',
  'YP_RUSSIA',
  'YP_MOSCOW',
  'VP_RUSSIA',
  'VP_MOSCOW',
  'KCHK',
  'KCHP',
  'YKCHK',
  'YKCHP',
  'VKCHK',
  'VKCHP',
  'CW',
  'R_CAC',
  'R_JCAC',
  'R_VCAC',
  'SS',
  'YSS',
  'VSS',
] as const;

function formatShowAward(bestAward: string | null): string {
  if (!bestAward) return '—';
  return SHOW_AWARD_BADGE[bestAward] || bestAward;
}

function formatShowTitleLines(shows: ShowDogCardSummary): string[] {
  const counts = shows.title_counts ?? {};
  const keys =
    shows.title_keys.length > 0
      ? shows.title_keys
      : SHOW_AWARD_ORDER.filter((key) => (counts[key] ?? 0) > 0);

  if (keys.length === 0) return [];

  const parts = keys.map((key) => {
    const badge = SHOW_AWARD_BADGE[key] || key;
    const count = counts[key] ?? 1;
    return count > 1 ? `${badge} ×${count}` : badge;
  });

  return [parts.join(', ')];
}

/**
 * Краткая карточка собаки (aggregates only — без списка участий).
 * Медали курсинга и бегов раздельно; чистая блочная вёрстка с blockquote.
 */
export function formatDogCard(dogData: DogData, options: FormatDogCardOptions = {}): string {
  const dog = dogData.dog;
  const name = (dog.name_lat || dog.name_ru || 'N/A').toUpperCase();
  const breed = dog.breed || 'N/A';
  const c = dog.coursing_stats;
  const r = dog.racing_stats;
  const shows = options.shows;

  const lines: string[] = [
    `<b>${name}</b>`,
    `<i>${breed}</i>`,
  ];

      if (hasDisciplineActivity(c) || c.best_score != null || c.best_judge_score != null) {
    const bestScore = c.best_score != null ? String(c.best_score) : "—";
    const bestJudge = c.best_judge_score != null ? String(c.best_judge_score) : "—";

    let avgScoreStr: string | null = null;
    if (dogData.competitions && dogData.competitions.length > 0) {
      const coursingComps = dogData.competitions.filter(
        (comp: any) => (comp.event_type === "coursing" || comp.event_type === "bzmp") && typeof comp.total_score === "number"
      );
      if (coursingComps.length > 0) {
        const sum = coursingComps.reduce((acc: number, cur: any) => acc + (cur.total_score as number), 0);
        avgScoreStr = String(Math.round((sum / coursingComps.length) * 10) / 10);
      }
    }
    if (!avgScoreStr && c.avg_judge_score != null) {
      avgScoreStr = String(c.avg_judge_score);
    }

    const scoreParts = ["Лучший балл: " + bestScore];
    if (avgScoreStr) {
      scoreParts.push("Средний: " + avgScoreStr);
    }

    const coursingBlock = [
      "<b>Курсинг</b>",
      "• Участий: " + c.total_starts,
      "• " + scoreParts.join(" · "),
      "• Лучшая оценка судьи: " + bestJudge,
      "• Медали: 🥇 " + c.gold + "  🥈 " + c.silver + "  🥉 " + c.bronze,
    ].join("\n");
    lines.push("", "<blockquote>" + coursingBlock + "</blockquote>");
  }

  if (hasDisciplineActivity(r) || r.best_speed != null) {
    const bestSpeed = r.best_speed != null ? r.best_speed + " км/ч" : "—";
    const avgSpeed = r.avg_speed != null ? r.avg_speed + " км/ч" : null;

    const speedParts = ["Макс. скорость: " + bestSpeed];
    if (avgSpeed) {
      speedParts.push("Средняя: " + avgSpeed);
    }

    const racingBlock = [
      "<b>Бега борзых</b>",
      "• Участий: " + r.total_starts,
      "• " + speedParts.join(" · "),
      "• Медали: 🥇 " + r.gold + "  🥈 " + r.silver + "  🥉 " + r.bronze,
    ].join("\n");
    lines.push("", "<blockquote>" + racingBlock + "</blockquote>");
  }

  if (shows && shows.total_shows > 0) {
    const titleLines = formatShowTitleLines(shows);
    const showsBlock = [
      "<b>Выставки РКФ</b>",
      "• Участий: " + shows.total_shows + " · Высшая награда: " + formatShowAward(shows.best_award),
      ...(titleLines.length > 0 ? ["• Титулы: " + titleLines.join(", ")] : []),
    ].join("\n");
    const quoteTag = titleLines.length > 0 ? "blockquote expandable" : "blockquote";
    lines.push("", "<" + quoteTag + ">" + showsBlock + "</" + quoteTag.split(" ")[0] + ">");
  }

  return lines.join("\n").trim();
}
