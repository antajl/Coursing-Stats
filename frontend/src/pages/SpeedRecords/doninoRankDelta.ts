import { isRecentDoninoDate } from '../../lib/recordDates'

export interface DoninoRecordForDelta {
  name: string
  breed: string
  date?: string
  speed_km_h?: number
  time_seconds?: number
  history?: unknown
}

/**
 * Рассчитывает дельту ранга собаки по сравнению с положением до последнего выезда:
 * - 'NEW': собака дебютировала в последнюю сессию
 * - number > 0: поднялась на N мест (зелёный цвет)
 * - number < 0: опустилась на N мест (розово-красный цвет)
 * - null / отсутствует: место не изменилось
 */
export function computeDoninoDeltas<T extends DoninoRecordForDelta>(
  records: T[],
  mode: 'speed' | 'coursing'
): Map<string, number | 'NEW'> {
  const deltaMap = new Map<string, number | 'NEW'>()
  if (records.length === 0) return deltaMap

  // 1. Находим последнюю дату среди всех записей
  let latestDate = ''
  for (const r of records) {
    if (r.date && r.date > latestDate) {
      latestDate = r.date
    }
  }
  if (!latestDate) return deltaMap

  // 2. Вычисляем лучший результат каждой собаки ДО недавней сессии
  interface PrevEntry {
    key: string
    val: number
  }
  const prevList: PrevEntry[] = []

  for (const r of records) {
    const key = `${r.name}::${r.breed}`
    const isRecent = isRecentDoninoDate(r.date, latestDate)
    const currentVal = mode === 'speed' ? Number(r.speed_km_h ?? 0) : Number(r.time_seconds ?? 0)

    if (!isRecent) {
      if (currentVal > 0) {
        prevList.push({ key, val: currentVal })
      }
    } else {
      // Замер был сделан в последнюю сессию. Ищем предыдущий замер в history
      const historyArr = Array.isArray(r.history) ? r.history : []
      const olderRuns = historyArr.filter((h: any) => h && h.date && !isRecentDoninoDate(h.date, latestDate))
      if (olderRuns.length > 0) {
        if (mode === 'speed') {
          const speeds = olderRuns.map((h: any) => Number(h.speed_km_h ?? h.speed ?? 0)).filter((s) => s > 0)
          if (speeds.length > 0) {
            prevList.push({ key, val: Math.max(...speeds) })
          }
        } else {
          const times = olderRuns.map((h: any) => Number(h.time_seconds ?? h.time ?? 0)).filter((t) => t > 0)
          if (times.length > 0) {
            prevList.push({ key, val: Math.min(...times) })
          }
        }
      }
    }
  }

  // 3. Сортируем предыдущие результаты для определения prevRank
  if (mode === 'speed') {
    prevList.sort((a, b) => b.val - a.val)
  } else {
    prevList.sort((a, b) => a.val - b.val)
  }

  const prevRankMap = new Map<string, number>()
  prevList.forEach((entry, idx) => {
    prevRankMap.set(entry.key, idx + 1)
  })

  // 4. Сравниваем с currentRank (индекс в текущем отсортированном списке records)
  records.forEach((r, idx) => {
    const currentRank = idx + 1
    const key = `${r.name}::${r.breed}`
    const isRecent = isRecentDoninoDate(r.date, latestDate)
    const prevRank = prevRankMap.get(key)

    if (isRecent) {
      if (prevRank == null) {
        deltaMap.set(key, 'NEW')
      } else {
        const diff = prevRank - currentRank
        if (diff !== 0) {
          deltaMap.set(key, diff)
        }
      }
    } else if (prevRank != null) {
      const diff = prevRank - currentRank
      if (diff !== 0) {
        deltaMap.set(key, diff)
      }
    }
  })

  return deltaMap
}
