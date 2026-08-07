/**
 * Извлечение судей со страниц результатов procoursing.ru.
 * Поддерживает «Судьи:» и «Судья:», многострочный/однострочный формат,
 * ячейки colspan, текст до таблицы.
 */

const JUDGE_NOISE = [
  'Номера забегов',
  'не отражены',
  'не получена',
  'отсутствием информации',
];

function hasJudgesHeader(text: string): boolean {
  return /Судь[ия]\s*:/i.test(text);
}

function isNoiseJudgesText(text: string): boolean {
  return JUDGE_NOISE.some((n) => text.includes(n));
}

function normalizeJudgesString(judges: string): string {
  let s = judges.replace(/\s+/g, ' ').replace(/[,;]$/, '').trim();
  if (s.startsWith('-')) s = s.substring(1).trim();
  return s;
}

/** «Главный судья - X, судья - Y» → «X, Y» */
export function normalizeJudgesOutput(raw: string | null): string | null {
  if (!raw) return null;

  const judgesList: string[] = [];
  const mainJudgeMatch = raw.match(/Главный\s+судья\s*[:\s-]+\s*([^,]+)/i);
  if (mainJudgeMatch?.[1]) {
    judgesList.push(mainJudgeMatch[1].trim());
  }

  for (const match of raw.matchAll(/(?:,\s*)?(?!Главный)судья\s*[:\s-]+\s*([^,]+)/gi)) {
    const judge = match[1]?.trim();
    if (judge && !judgesList.includes(judge)) {
      judgesList.push(judge);
    }
  }

  if (judgesList.length > 0) {
    return judgesList.join(', ');
  }

  const trimmed = normalizeJudgesString(raw);
  if (!trimmed || /главный\s+судья/i.test(trimmed)) return null;
  return trimmed;
}

function stripNumberedJudgePrefixes(text: string): string {
  return text
    .replace(/,\s*\d+\s*-\s*/g, ', ')
    .replace(/^\d+\s*-\s*/, '')
    .trim();
}

function salvageJudgeNames(text: string): string | null {
  const matches = [...text.matchAll(/([А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.[А-ЯЁ]\.)/g)];
  const names = [...new Set(matches.map((m) => m[1]))];
  return names.length > 0 ? names.slice(0, 4).join(', ') : null;
}

function validateJudges(judges: string | null): string | null {
  if (!judges) return null;
  let normalized = normalizeJudgesOutput(judges) ?? normalizeJudgesString(judges);
  if (!normalized || normalized.length <= 3) return null;
  if (isNoiseJudgesText(normalized)) return null;
  if (normalized.includes('Сумма') || normalized.includes('Забег')) return null;
  if (/^\d+$/.test(normalized)) return null;

  normalized = stripNumberedJudgePrefixes(normalized);

  if (
    normalized.length > 80 ||
    /круг:|примечание|в породах/i.test(normalized)
  ) {
    const salvaged = salvageJudgeNames(normalized);
    if (salvaged) return salvaged;
    return null;
  }

  return normalized;
}

function parseJudgesFromMainLine(nextLine: string): string | null {
  const judgeMatch = nextLine.match(
    /Главный\s+судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?)(?:\s*,\s*судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?))?(?:\s*,\s*судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?))?/i,
  );
  if (judgeMatch) {
    const parts = [judgeMatch[1], judgeMatch[2], judgeMatch[3]].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }

  const veryFlexibleMatch = nextLine.match(
    /Главный\s+судья\s*[:\s-]+\s*([А-ЯЁа-яё]+(?:\s+[А-ЯЁа-яё]+)*)(?:\s*,\s*судья\s*[:\s-]+\s*([А-ЯЁа-яё]+(?:\s+[А-ЯЁа-яё]+)*))?/i,
  );
  if (veryFlexibleMatch) {
    const parts = [veryFlexibleMatch[1], veryFlexibleMatch[2]].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }

  const fullMatch = nextLine.match(/Главный\s+судья\s*[:\s-]+\s*(.+)/i);
  if (fullMatch) {
    const parts = fullMatch[1]
      .split(',')
      .map((p) => p.trim())
      .filter((p) => /^[А-ЯЁа-яё]+(?:\s+[А-ЯЁа-яё.]+)*$/.test(p) && p.length > 2);
    if (parts.length > 0) return parts.join(', ');
  }

  return null;
}

function parseJudgesFromCellText(cellText: string): string | null {
  const lines = cellText.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^Судь[ия]\s*:?\s*$/i.test(line) && i + 1 < lines.length) {
      const fromNext = parseJudgesFromMainLine(lines[i + 1].trim());
      if (fromNext) return fromNext;
    }
  }

  const judgesList: string[] = [];
  const mainJudgeMatch = cellText.match(/Главный\s+судья\s*[:\s-]+\s*([^,]+)/i);
  if (mainJudgeMatch?.[1]) {
    judgesList.push(mainJudgeMatch[1].trim());
  }

  for (const match of cellText.matchAll(/(?:,\s*)?(?!Главный)судья\s*[:\s-]+\s*([^,]+)/gi)) {
    const judge = match[1]?.trim();
    if (judge && !judgesList.includes(judge)) {
      judgesList.push(judge);
    }
  }

  if (judgesList.length > 0) {
    return judgesList.join(', ');
  }

  const judgePatterns = [
    /Главный\s+судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?)(?:\s*,\s*судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?))/i,
    /Главный\s+судья\s*[:\s-]+\s*([^.]+?)(?:\s*,\s*судья\s*[:\s-]+\s*([^.]+))/i,
    /Главный\s+судья\s*[:\s-]+\s*([^.]+)/i,
    /Судь[ия]\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?(?:\s*,\s*[А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?)*)/i,
    /Судь[ия]\s*[:\s-]+\s*([^.]+)/i,
  ];

  for (const pattern of judgePatterns) {
    const match = cellText.match(pattern);
    if (!match) continue;
    if (match[1] && match[2]) {
      return `${match[1].trim()}, ${match[2].trim()}`;
    }
    if (match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function parseJudgesFromTextBlock(text: string): string | null {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^Судь[ия]\s*:?\s*$/i.test(line) && i + 1 < lines.length) {
      const fromNext = parseJudgesFromMainLine(lines[i + 1].trim());
      if (fromNext) return fromNext;
    }
  }

  const beforeTablePatterns = [
    /Главный\s+судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.?[А-ЯЁ]\.?)?)(?:\s*,\s*судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.?[А-ЯЁ]\.?)?))?/i,
    /Судь[ия][:\s]+([^.]+?)(?:\n|$)/i,
    /(?:Судья|Судьи)[:\s]+([^.]+?)(?:\n|Клуб|Организация|Место|Дата|Время|Таблица)/i,
  ];

  for (const pattern of beforeTablePatterns) {
    const match = text.match(pattern);
    if (!match) continue;
    if (match[1] && match[2]) {
      return `${match[1].trim()}, ${match[2].trim()}`;
    }
    if (match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

export function extractJudgesFromPage(
  $: cheerio.CheerioAPI,
  options: { colspans?: string[] } = {},
): string | null {
  const colspans = options.colspans ?? ['25', '18'];
  let judges: string | null = null;

  $('table tr').each((_, row) => {
    const $row = $(row);
    const $firstCell = $row.find('td').first();
    const colspan = $firstCell.attr('colspan');
    if (!colspan || !colspans.includes(colspan)) return;

    const cellText = $firstCell.text();
    if (!hasJudgesHeader(cellText)) return;

    judges = validateJudges(parseJudgesFromCellText(cellText));
    if (judges) return false;
  });

  if (judges) return judges;

  const $tables = $('table');
  if ($tables.length > 0) {
    const textBeforeTable = $tables.first().prevAll().text();
    judges = validateJudges(parseJudgesFromTextBlock(textBeforeTable));
    if (judges) return judges;
  }

  const bodyText = $('body').text();
  const strictPatterns = [
    /Главный\s+судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?)(?:\s*,\s*(?:\d+\s*-\s*)?судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?))?/i,
  ];

  for (const pattern of strictPatterns) {
    const match = bodyText.match(pattern);
    if (!match) continue;
    if (match[1] && match[2]) {
      judges = validateJudges(`${match[1].trim()}, ${match[2].trim()}`);
    } else if (match[1]) {
      judges = validateJudges(match[1].trim());
    }
    if (judges) return judges;
  }

  return null;
}

// Cheerio type hint for TS tooling (runtime uses cheerio instance from caller)
declare namespace cheerio {
  type CheerioAPI = import('cheerio').CheerioAPI;
}
