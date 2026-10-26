const EXCEL_EPOCH_OFFSET = 25569

function excelSerialToDate(serial: number): Date {
  return new Date(Math.round((serial - EXCEL_EPOCH_OFFSET) * 86400 * 1000))
}

function isExcelSerial(value: number): boolean {
  return value >= 30000 && value <= 60000
}

/** Парсит дату замера: DD.MM.YYYY (в т.ч. DD;MM.YYYY из Донино), YYYY-MM-DD или Excel serial (46153). */
export function parseRecordDate(value: string | number | null | undefined): Date | null {
  if (value == null || value === '') return null

  if (typeof value === 'number' && isExcelSerial(value)) {
    return excelSerialToDate(value)
  }

  const str = String(value).trim()
  if (!str) return null

  if (/^\d{5}$/.test(str)) {
    const serial = parseInt(str, 10)
    if (isExcelSerial(serial)) return excelSerialToDate(serial)
  }

  const dmy = str.match(/^(\d{1,2})[.;](\d{1,2})[.;](\d{4})$/)
  if (dmy) {
    const [, day, month, year] = dmy
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const dashed = str.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dashed) {
    const [, year, month, day] = dashed
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const parsed = new Date(str)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** Форматирует дату замера как DD.MM.YYYY. */
export function formatRecordDate(value: string | number | null | undefined): string {
  const date = parseRecordDate(value)
  if (!date) return String(value ?? '')

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

export function getRecordYear(value: string | number | null | undefined): number | null {
  return parseRecordDate(value)?.getFullYear() ?? null
}

export function compareRecordDates(
  a: string | number | null | undefined,
  b: string | number | null | undefined
): number {
  const aDate = parseRecordDate(a)
  const bDate = parseRecordDate(b)
  if (!aDate && !bDate) return 0
  if (!aDate) return 1
  if (!bDate) return -1
  return bDate.getTime() - aDate.getTime()
}

export function normalizeRecordDateIso(value: string | number | null | undefined): string {
  const date = parseRecordDate(value)
  if (!date) return String(value ?? '').trim()
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${year}-${month}-${day}`
}

/** Время на 350 м (сек) по скорости км/ч: 0.35 км / (v/3600) = 1260/v. */
export function speedKmhToTime350(speedKmh: number): number {
  return 1260 / speedKmh
}

export function avgTime350FromSpeeds(speeds: number[]): number | null {
  const valid = speeds.filter((s) => s > 0)
  if (!valid.length) return null
  return valid.reduce((sum, s) => sum + speedKmhToTime350(s), 0) / valid.length
}

export function bestTime350FromSpeeds(speeds: number[]): number | null {
  const valid = speeds.filter((s) => s > 0)
  if (!valid.length) return null
  return speedKmhToTime350(Math.max(...valid))
}

/** Скорость км/ч по времени на 350 м (сек): v = 1260/t. */
export function time350ToSpeedKmh(timeSeconds: number): number {
  return 1260 / timeSeconds
}

export function avgTimeFromCoursingTimes(times: number[]): number | null {
  const valid = times.filter((t) => t > 0)
  if (!valid.length) return null
  return valid.reduce((sum, t) => sum + t, 0) / valid.length
}

export function bestTimeFromCoursingTimes(times: number[]): number | null {
  const valid = times.filter((t) => t > 0)
  if (!valid.length) return null
  return Math.min(...valid)
}

export function avgSpeedFromCoursingTimes(times: number[]): number | null {
  const valid = times.filter((t) => t > 0)
  if (!valid.length) return null
  const speeds = valid.map(time350ToSpeedKmh)
  return speeds.reduce((sum, s) => sum + s, 0) / speeds.length
}

export function bestSpeedFromCoursingTimes(times: number[]): number | null {
  const valid = times.filter((t) => t > 0)
  if (!valid.length) return null
  return time350ToSpeedKmh(Math.min(...valid))
}

export function coursingTimesToStats(times: number[]): {
  avgSpeed: number
  maxSpeed: number
  avgTime350: number
  bestTime350: number
} | null {
  const valid = times.filter((t) => t > 0)
  if (!valid.length) return null
  const speeds = valid.map(time350ToSpeedKmh)
  return {
    avgSpeed: speeds.reduce((sum, s) => sum + s, 0) / speeds.length,
    maxSpeed: Math.max(...speeds),
    avgTime350: valid.reduce((sum, t) => sum + t, 0) / valid.length,
    bestTime350: Math.min(...valid),
  }
}

/** Ключ дедупликации замера скорости (нормализованная дата). */
export function speedRecordDedupeKey(record: {
  name: string
  breed: string
  sex: string
  date: string | number | null | undefined
  speed_km_h: string | number
}): string {
  return `${record.name}_${record.breed}_${record.sex}_${normalizeRecordDateIso(record.date)}_${record.speed_km_h}`
}

/** Убирает точные дубликаты замеров (та же собака, дата и скорость). */
export function dedupeSpeedRecords<
  T extends {
    name: string
    breed: string
    sex: string
    date: string | number | null | undefined
    speed_km_h: string | number
  },
>(records: T[]): T[] {
  const seen = new Map<string, T>()
  for (const record of records) {
    const key = speedRecordDedupeKey(record)
    if (!seen.has(key)) {
      seen.set(key, record)
    }
  }
  return [...seen.values()]
}

/** Оставляет один результат на дату; при дублях выбирает лучший по isBetter(candidate, existing). */
export function dedupeByRecordDate<T extends { date: string | number | null | undefined } & Record<string, unknown>>(
  records: T[],
  isBetter: (candidate: T, existing: T) => boolean
): T[] {
  const byDate = new Map<string, T>()

  for (const record of records) {
    const key = formatRecordDate(record.date)
    if (!key) continue
    const existing = byDate.get(key)
    if (!existing || isBetter(record, existing)) {
      byDate.set(key, record)
    }
  }

  return [...byDate.values()].sort((a, b) => compareRecordDates(a.date, b.date))
}

export function parseRecordHistory(history: unknown): unknown[] {
  if (!history) return []
  if (Array.isArray(history)) return history
  if (typeof history === 'string') {
    try {
      const parsed = JSON.parse(history)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function isCoursingHistoryEntry(value: unknown): value is { time_seconds: number; date: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'time_seconds' in value &&
    'date' in value &&
    Number.isFinite(Number((value as { time_seconds: unknown }).time_seconds)) &&
    (value as { date: unknown }).date != null
  )
}

/** Собирает полную хронологию бегов: текущий рекорд + записи из примечаний (history). */
export function expandCoursingTimeline(
  records: Array<{ time_seconds: number | string; date: string | number; history?: unknown }>
): Array<{ time_seconds: number; date: string }> {
  const points: Array<{ time_seconds: number; date: string; ts: number }> = []

  for (const record of records) {
    for (const entry of parseRecordHistory(record.history)) {
      if (!isCoursingHistoryEntry(entry)) continue
      const ts = parseRecordDate(entry.date)?.getTime()
      if (ts == null) continue
      points.push({ time_seconds: Number(entry.time_seconds), date: String(entry.date), ts })
    }

    const time = Number(record.time_seconds)
    const currentTs = parseRecordDate(record.date)?.getTime()
    if (Number.isFinite(time) && time > 0 && currentTs != null) {
      points.push({ time_seconds: time, date: String(record.date), ts: currentTs })
    }
  }

  const byDate = new Map<string, { time_seconds: number; date: string }>()
  for (const point of points.sort((a, b) => a.ts - b.ts)) {
    const key = normalizeRecordDateIso(point.date)
    const existing = byDate.get(key)
    if (!existing || point.time_seconds < existing.time_seconds) {
      byDate.set(key, { time_seconds: point.time_seconds, date: point.date })
    }
  }

  return [...byDate.values()].sort(
    (a, b) =>
      (parseRecordDate(a.date)?.getTime() ?? 0) - (parseRecordDate(b.date)?.getTime() ?? 0)
  )
}

/** Собирает полную хронологию скорости: текущий рекорд + записи из истории (history). */
export function expandSpeedTimeline(
  records: Array<{
    speed_km_h: number | string
    date: string | number
    track_type?: unknown
    screenshot_url?: unknown
    history?: unknown
  }>
): Array<{
  speed_km_h: number
  date: string
  track_type?: string | null
  screenshot_url?: string | null
}> {
  const points: Array<{
    speed_km_h: number
    date: string
    track_type?: string | null
    screenshot_url?: string | null
    ts: number
  }> = []

  for (const record of records) {
    for (const entry of parseRecordHistory(record.history)) {
      if (typeof entry !== 'object' || entry == null || !('speed_km_h' in entry)) continue
      const e = entry as { speed_km_h: unknown; date: unknown; track_type?: unknown; screenshot_url?: unknown }
      const speed = Number(e.speed_km_h)
      const ts = parseRecordDate(e.date as string | number)?.getTime()
      if (Number.isFinite(speed) && speed > 0 && ts != null) {
        points.push({
          speed_km_h: speed,
          date: String(e.date),
          track_type: (e.track_type as string) || null,
          screenshot_url: (e.screenshot_url as string) || null,
          ts,
        })
      }
    }

    const currentSpeed = Number(record.speed_km_h)
    const currentTs = parseRecordDate(record.date)?.getTime()
    if (Number.isFinite(currentSpeed) && currentSpeed > 0 && currentTs != null) {
      points.push({
        speed_km_h: currentSpeed,
        date: String(record.date),
        track_type: (record.track_type as string) || null,
        screenshot_url: (record.screenshot_url as string) || null,
        ts: currentTs,
      })
    }
  }

  const byDate = new Map<string, {
    speed_km_h: number
    date: string
    track_type?: string | null
    screenshot_url?: string | null
  }>()

  for (const point of points.sort((a, b) => a.ts - b.ts)) {
    const key = normalizeRecordDateIso(point.date)
    const existing = byDate.get(key)
    if (!existing || point.speed_km_h > existing.speed_km_h) {
      byDate.set(key, {
        speed_km_h: point.speed_km_h,
        date: point.date,
        track_type: point.track_type,
        screenshot_url: point.screenshot_url,
      })
    }
  }

  return [...byDate.values()].sort(
    (a, b) =>
      (parseRecordDate(a.date)?.getTime() ?? 0) - (parseRecordDate(b.date)?.getTime() ?? 0)
  )
}

/** км/ч: 64 → «64», 64.5 → «64.5» (без лишнего .0) */
export function formatDoninoSpeedKmh(value: number | string | null | undefined): string {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  const rounded = Math.round(n * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}
export const DEFAULT_MAX_RECENT_RECORD_DAYS = 30

/**
 * Проверяет, является ли дата замера недавней (по умолчанию не старше 30 дней).
 * @param value Дата (строка ISO, DD.MM.YYYY, серийный номер Excel и т.д.)
 * @param maxDays Максимальный возраст в днях (по умолчанию 30)
 * @param referenceDate Опорная дата (по умолчанию Date.now(), можно передать для тестов)
 */
export function isRecentRecordDate(
  value: string | number | null | undefined,
  maxDays = DEFAULT_MAX_RECENT_RECORD_DAYS,
  referenceDate: Date | number = Date.now()
): boolean {
  const date = parseRecordDate(value)
  if (!date) return false
  const refTime = typeof referenceDate === 'number' ? referenceDate : referenceDate.getTime()
  const diffMs = refTime - date.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= -1 && diffDays <= maxDays
}

/**
 * Проверяет «свежесть» замера Донино:
 * 1) либо в пределах maxDays (30 дней) от Date.now();
 * 2) либо входит в последнюю проведённую сессию (в пределах batchWindowDays от максимальной даты в наборе данных).
 */
export function isRecentDoninoDate(
  value: string | number | null | undefined,
  latestDateInDataset?: string | number | null,
  maxDays = DEFAULT_MAX_RECENT_RECORD_DAYS,
  batchWindowDays = 14
): boolean {
  if (!value) return false

  if (isRecentRecordDate(value, maxDays)) return true

  if (latestDateInDataset) {
    const recordDate = parseRecordDate(value)
    const refDate = parseRecordDate(latestDateInDataset)
    if (recordDate && refDate) {
      const diffMs = refDate.getTime() - recordDate.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      return diffDays >= -1 && diffDays <= batchWindowDays
    }
  }

  return false
}
