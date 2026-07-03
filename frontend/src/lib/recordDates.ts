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

/** Ключ дедупликации замера скорости (как в sync-speed-records.ts). */
export function speedRecordDedupeKey(record: {
  name: string
  breed: string
  sex: string
  date: string | number | null | undefined
  speed_km_h: string | number
}): string {
  return `${record.name}_${record.breed}_${record.sex}_${record.date}_${record.speed_km_h}`
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
export function dedupeByRecordDate<T extends { date: string | number | null | undefined }>(
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
