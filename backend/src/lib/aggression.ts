import type Database from 'better-sqlite3';

/**
 * Утилиты детекции и типизации дисквалификаций за агрессию.
 */

export const AGGRESSION_PATTERN = /агресс|напад|драка|покус/i;

export interface AggressionIncident {
  event_id: number;
  year?: number | null;
  date: string | null;
  title: string | null;
  reason: string;
}

/**
 * Проверяет, является ли результат забега снятием/дисквалификацией за агрессию.
 */
export function isAggressionDisqualification(
  status: string | null | undefined,
  reason: string | null | undefined,
  rawText?: string | null,
): boolean {
  if (status !== 'disqualified') return false;
  if (reason && AGGRESSION_PATTERN.test(reason)) return true;
  if (rawText && AGGRESSION_PATTERN.test(rawText)) return true;
  return false;
}

/**
 * Загружает агрегированную карту инцидентов агрессии по dog_id из SQLite-базы.
 */
export function loadDogAggressionMap(db: Database.Database): Map<number, AggressionIncident[]> {
  const map = new Map<number, AggressionIncident[]>();

  const rows = db
    .prepare(
      `SELECT
        r.dog_id,
        r.status,
        r.status_reason,
        r.raw_text,
        e.id AS event_id,
        e.date_start,
        e.title,
        e.year
      FROM results r
      JOIN events e ON r.event_id = e.id
      WHERE r.status = 'disqualified'
      ORDER BY e.date_start DESC, e.id DESC`,
    )
    .all() as Array<{
    dog_id: number;
    status: string;
    status_reason: string | null;
    raw_text: string | null;
    event_id: number;
    date_start: string | null;
    title: string | null;
    year: number | null;
  }>;

  for (const row of rows) {
    if (isAggressionDisqualification(row.status, row.status_reason, row.raw_text)) {
      const arr = map.get(row.dog_id) ?? [];
      const reason = row.status_reason?.trim() || 'Агрессия';
      arr.push({
        event_id: row.event_id,
        year: row.year ?? (row.date_start ? parseInt(row.date_start.slice(0, 4), 10) : null),
        date: row.date_start,
        title: row.title,
        reason,
      });
      map.set(row.dog_id, arr);
    }
  }

  return map;
}
