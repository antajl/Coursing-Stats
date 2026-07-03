import * as cheerio from 'cheerio';
import type { Cheerio, CheerioAPI } from 'cheerio';
import type { Element } from 'domhandler';

export const CALENDAR_BASE = 'http://procoursing.ru';

export interface ScrapedCalendarEvent {
  year: number;
  date_start: string;
  date_end: string | null;
  rank_label: string;
  event_type: string | null;
  competition_kind: string | null;
  competition_type: string | null;
  title: string;
  host_club: string;
  location: string;
  catalog_url: string | null;
  results_url: string | null;
  confirmed: number;
  cancelled: boolean;
}

export function parseDateRange(text: string): { date_start: string | null; date_end: string | null } {
  const m = text.trim().match(/^(\d{1,2})(?:-(\d{1,2}))?\.(\d{2})\.(\d{4})$/);
  if (!m) return { date_start: null, date_end: null };
  const [, d1, d2, mm, yyyy] = m;
  const pad = (n: string) => String(n).padStart(2, '0');
  const date_start = `${yyyy}-${pad(mm)}-${pad(d1)}`;
  const date_end = d2 ? `${yyyy}-${pad(mm)}-${pad(d2)}` : null;
  return { date_start, date_end };
}

export function typeFromHref(href: string): string | null {
  const name = href.split('/').pop() || href;
  if (/coursing/i.test(name)) return 'coursing';
  if (/bzmp/i.test(name)) return 'bzmp';
  if (/racing/i.test(name)) return 'racing';
  if (/_C(_|\.)/i.test(name)) return 'coursing';
  if (/_B(_|\.)/i.test(name)) return 'bzmp';
  if (/_R(_|\.)/i.test(name)) return 'racing';
  return null;
}

export function typeFromRankLabel(rankLabel: string): string | null {
  const lower = rankLabel.toLowerCase();
  if (lower.includes('курсинг')) return 'coursing';
  if (lower.includes('бзмп') || lower.includes('механической приманкой')) return 'bzmp';
  if (lower.includes('рейсинг') || lower.includes('бега борзых')) return 'racing';
  return null;
}

export function extractCompetitionKind(rankLabel: string): string | null {
  const competitionCodes = [
    'Чемпионат России',
    'ПЧРКФ',
    'ЧРКФ',
    'CACL',
    'CACIB',
    'CACMB',
    'CAC',
    'Кубок России',
    'Кубок',
  ];

  const upperLabel = rankLabel.toUpperCase();
  for (const code of competitionCodes) {
    if (upperLabel.includes(code.toUpperCase())) return code;
  }
  return null;
}

const DISCIPLINE_LABELS = [
  'Курсинг борзых',
  'Бега за механической приманкой',
  'БЗМП',
  'Бега борзых',
] as const;

export function extractCompetitionType(rankLabel: string): string | null {
  const upperLabel = rankLabel.toUpperCase();
  for (const disc of DISCIPLINE_LABELS) {
    if (upperLabel.includes(disc.toUpperCase())) {
      if (disc === 'Бега за механической приманкой') return 'БЗМП';
      return disc;
    }
  }
  if (upperLabel.includes('КУРСИНГ')) return 'Курсинг борзых';
  return null;
}

export function rankLabelFromCell($: CheerioAPI, cell: Cheerio<Element>): string {
  const html = cell.html();
  if (!html) return cell.text().replace(/\s+/g, ' ').trim();

  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function isCancelledRankLabel(rankLabel: string): boolean {
  return /\[отмен[её]н\]/i.test(rankLabel);
}

function resolveUrl(href: string): string {
  return href.startsWith('http') ? href : `${CALENDAR_BASE}/${href.replace(/^\//, '')}`;
}

function isMainResultsHref(href: string): boolean {
  if (/\.pdf$/i.test(href)) return false;
  if (!/_Complete_Results_/i.test(href) && !/Complete_Results_/i.test(href)) {
    return false;
  }
  if (/_by_/i.test(href)) return false;
  return true;
}

export function extractLinksFromRow(
  $: CheerioAPI,
  $row: Cheerio<Element>
): { catalog_url: string | null; results_url: string | null; event_type: string | null } {
  let catalog_url: string | null = null;
  let results_url: string | null = null;
  let event_type: string | null = null;

  $row.find('a').each((__, a) => {
    const href = $(a).attr('href');
    if (!href) return;

    const absolute = resolveUrl(href);
    const text = $(a).text().replace(/\s+/g, ' ').trim();

    if (/каталог|catalog/i.test(text) || /_Catalog_/i.test(absolute)) {
      catalog_url = absolute;
    }

    if (isMainResultsHref(absolute) || (/результат/i.test(text) && !/_by_/i.test(absolute))) {
      results_url = absolute;
      const resultsType = typeFromHref(absolute);
      if (resultsType) event_type = resultsType;
    }
  });

  return { catalog_url, results_url, event_type };
}

function deriveUniqueTitle(
  title: string,
  location: string,
  rankLabel: string,
  competitionKind: string | null,
  competitionType: string | null
): string {
  const firstLine = rankLabel
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)[0];

  if (!title || title === location) {
    if (competitionKind && competitionType) return `${competitionKind} (${competitionType})`;
    return firstLine || title || location;
  }

  if (competitionKind && competitionType) {
    const disambiguated = `${competitionKind} (${competitionType})`;
    if (!title.toLowerCase().includes(competitionKind.toLowerCase())) {
      return `${title} — ${disambiguated}`;
    }
    return disambiguated;
  }

  if (competitionKind && !title.includes(competitionKind)) {
    return `${title} — ${competitionKind}`;
  }

  return title;
}

function finalizeEvent(
  year: number,
  base: Omit<ScrapedCalendarEvent, 'year' | 'cancelled'> & { rank_label: string }
): ScrapedCalendarEvent {
  const cancelled = isCancelledRankLabel(base.rank_label);
  let event_type = base.event_type;
  let competition_type = base.competition_type;
  let competition_kind = base.competition_kind;

  if (!event_type) {
    event_type = typeFromRankLabel(base.rank_label);
  }

  if (!competition_kind) {
    competition_kind = extractCompetitionKind(base.rank_label);
  }

  if (!competition_type) {
    competition_type = extractCompetitionType(base.rank_label);
  }

  const isUniqueEvent =
    base.rank_label.includes('Кубок Котейки Глюка') ||
    base.rank_label.includes('Тройки') ||
    base.rank_label.includes('Тройка');

  if (isUniqueEvent) {
    event_type = 'other';
    competition_type = base.rank_label.split('\n')[0]?.trim() || base.rank_label;
  }

  return {
    year,
    date_start: base.date_start,
    date_end: base.date_end,
    rank_label: base.rank_label,
    event_type,
    competition_kind,
    competition_type,
    title: deriveUniqueTitle(base.title, base.location, base.rank_label, competition_kind, competition_type),
    host_club: base.host_club,
    location: base.location,
    catalog_url: base.catalog_url,
    results_url: base.results_url,
    confirmed: base.confirmed,
    cancelled,
  };
}

export function scrapeYearPageFromHtml(html: string, year: number): ScrapedCalendarEvent[] {
  const $ = cheerio.load(html);
  const events: ScrapedCalendarEvent[] = [];

  $('table tr').each((_, row) => {
    const $row = $(row);
    const cells = $row.find('td');
    if (cells.length < 6) return;

    const dateText = $(cells[0]).text().trim();
    const { date_start, date_end } = parseDateRange(dateText);
    if (!date_start) return;

    const links = extractLinksFromRow($, $row);
    let rankLabel = '';
    let title = '';
    let hostClub = '';
    let location = '';
    let confirmed = 0;

    if (cells.length === 6) {
      rankLabel = rankLabelFromCell($, $(cells[1]));
      location = $(cells[2]).text().replace(/\s+/g, ' ').trim();
      title = location;
      hostClub = '';
    } else if (cells.length === 7) {
      rankLabel = rankLabelFromCell($, $(cells[1]));
      hostClub = $(cells[2]).text().replace(/\s+/g, ' ').trim();
      location = $(cells[3]).text().replace(/\s+/g, ' ').trim();
      title = hostClub;
    } else {
      rankLabel = rankLabelFromCell($, $(cells[1]));
      title = $(cells[2]).text().replace(/\s+/g, ' ').trim();
      hostClub = $(cells[3]).text().replace(/\s+/g, ' ').trim();
      location = $(cells[4]).text().replace(/\s+/g, ' ').trim();
      const confirmedText = $(cells[7]).text().trim();
      confirmed = confirmedText.includes('+') ? 1 : 0;
    }

    events.push(
      finalizeEvent(year, {
        date_start,
        date_end,
        rank_label: rankLabel,
        event_type: links.event_type,
        competition_kind: extractCompetitionKind(rankLabel),
        competition_type: extractCompetitionType(rankLabel),
        title,
        host_club: hostClub,
        location,
        catalog_url: links.catalog_url,
        results_url: links.results_url,
        confirmed,
      })
    );
  });

  return events;
}
