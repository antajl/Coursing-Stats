/**
 * Парсинг забегов racing: две колонки на слот — «Забег» (номер) и «Попона» (1–4 + цвет).
 *
 * CC-формат (18 кол., 2025): забег | попона | время+скорость × 3, затем CC/титул.
 * VS-формат (21 кол., 2026): забег | попона | время | скорость × 3, затем ВС/титул.
 */
import type { Cheerio, CheerioAPI } from 'cheerio';
import type { Element } from 'domhandler';
import { extractBibColor, extractNumber } from '../coursing/utils';

export type RacingHeat = {
  /** Номер забега из колонки «Забег» (16, 23, …) */
  heat_number: number;
  /** Номер попоны 1–4 */
  bib_number: number | null;
  bib_color: string | null;
  time: number | null;
  speed_kmh: number | null;
  disqualified?: boolean;
  disqualification_reason?: string | null;
};

/** Стандартные цвета попон в бегах борзых */
export const STANDARD_BIB_COLORS: Record<number, string> = {
  1: 'red',
  2: 'blue',
  3: 'white',
  4: 'black',
};

export function standardBibColor(bibNumber: number | null): string | null {
  if (bibNumber === null || bibNumber < 1 || bibNumber > 4) return null;
  return STANDARD_BIB_COLORS[bibNumber] ?? null;
}

const CC_SLOTS = [
  { runIdx: 7, bibIdx: 8, timeIdx: 9 },
  { runIdx: 10, bibIdx: 11, timeIdx: 12 },
  { runIdx: 13, bibIdx: 14, timeIdx: 15 },
] as const;

const VS_SLOTS = [
  { runIdx: 7, bibIdx: 8, timeIdx: 9, speedIdx: 10 },
  { runIdx: 11, bibIdx: 12, timeIdx: 13, speedIdx: 14 },
  { runIdx: 15, bibIdx: 16, timeIdx: 17, speedIdx: 18 },
] as const;

function parseTimeSpeedHtml(html: string | null | undefined): { time: number | null; speed_kmh: number | null } {
  if (!html) return { time: null, speed_kmh: null };
  const timeMatch = html.match(/(\d+\.?\d*)\s*с/i);
  const speedMatch = html.match(/(\d+\.?\d*)\s*км\/ч/i);
  return {
    time: timeMatch ? parseFloat(timeMatch[1]) : null,
    speed_kmh: speedMatch ? parseFloat(speedMatch[1]) : null,
  };
}

function resolveBibColor(bibCell: Cheerio<Element> | null, bibNumber: number | null): string | null {
  const fromCell = bibCell ? extractBibColor(bibCell) : null;
  if (fromCell) return fromCell;
  return standardBibColor(bibNumber);
}

function parseHeatSlot(
  $cells: Cheerio<Element>,
  runIdx: number,
  bibIdx: number,
  timeIdx: number,
  speedIdx?: number,
): RacingHeat | null {
  if (timeIdx >= $cells.length) return null;

  const timeCell = $cells.eq(timeIdx);
  const colspan = timeCell.attr('colspan');
  if (colspan && parseInt(colspan, 10) >= 3) {
    return {
      heat_number: 0,
      bib_number: null,
      bib_color: null,
      time: null,
      speed_kmh: null,
      disqualified: true,
      disqualification_reason: timeCell.text().trim() || null,
    };
  }

  let time: number | null = null;
  let speed_kmh: number | null = null;

  if (speedIdx !== undefined && speedIdx < $cells.length) {
    const timeText = $cells.eq(timeIdx).text();
    const timeMatch = timeText.match(/(\d+\.?\d*)\s*с/i);
    time = timeMatch ? parseFloat(timeMatch[1]) : null;
    const speedHtml = $cells.eq(speedIdx).html();
    const speedMatch = speedHtml?.match(/(\d+\.?\d*)\s*км\/ч/i);
    speed_kmh = speedMatch ? parseFloat(speedMatch[1]) : null;
  } else {
    const parsed = parseTimeSpeedHtml(timeCell.html());
    time = parsed.time;
    speed_kmh = parsed.speed_kmh;
  }

  if (time === null && speed_kmh === null) return null;

  const runCell = runIdx < $cells.length ? $cells.eq(runIdx) : null;
  const bibCell = bibIdx < $cells.length ? $cells.eq(bibIdx) : null;
  const heat_number = runCell ? extractNumber(runCell.text()) : null;
  const bib_number = bibCell ? extractNumber(bibCell.text()) : null;
  const bib_color = resolveBibColor(bibCell, bib_number);

  return {
    heat_number: heat_number ?? 0,
    bib_number,
    bib_color,
    time,
    speed_kmh,
  };
}

export function parseRacingHeatsFromRow(
  _$: CheerioAPI,
  $cells: Cheerio<Element>,
  cellCount: number,
): RacingHeat[] {
  const slots = cellCount === 21 ? VS_SLOTS : CC_SLOTS;
  const heats: RacingHeat[] = [];

  for (const slot of slots) {
    const heat = parseHeatSlot(
      $cells,
      slot.runIdx,
      slot.bibIdx,
      slot.timeIdx,
      'speedIdx' in slot ? slot.speedIdx : undefined,
    );
    if (!heat) continue;
    if (heat.disqualified) {
      heats.push(heat);
      continue;
    }
    heats.push(heat);
  }

  return heats;
}

export function racingHeatsToRawScores(heats: RacingHeat[]) {
  const timed = heats.filter((h) => h.time !== null && !h.disqualified);
  const grandTotal = timed.length > 0 ? Math.min(...timed.map((h) => h.time!)) : null;

  return {
    heats,
    grand_total: grandTotal,
    normalized_score: grandTotal,
    format: 'racing' as const,
  };
}
