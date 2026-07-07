/**
 * Клиентский порт backend/src/lib/judge-stats.ts + judge-names.ts.
 * Используется когда выбраны фильтры (порода/дисциплина), для которых
 * precomputed indexes/judges-summary.json и indexes/judge-details/*.json
 * не подходят (они считаются без фильтров). Источник строк —
 * indexes/judges-raw-rows.json (тот же набор, что видит build-derived-indexes.ts).
 */

export interface JudgeRawRow {
  heats_json: string | null
  event_judges: string | null
  event_type: string | null
  breed: string | null
  total_score: number | null
  event_id: number
  name_lat?: string | null
  name_ru?: string | null
  event_title?: string | null
  date_start?: string | null
}

/** Порт backend/src/lib/judge-names.ts */
export function parseJudgeNames(judgesString: string | null | undefined): string[] {
  if (!judgesString) return []

  const cleaned = judgesString
    .replace(/Главный\s+судья\s*[:\s-]+\s*/gi, '')
    .replace(/судья\s*[:\s-]+\s*/gi, '')
    .replace(/^\d+\s*[-–]\s*/gm, '')
    .trim()

  const names = cleaned
    .split(',')
    .map((n) => n.trim().replace(/^\d+\s*[-–]\s*/, ''))
    .filter((n) => n)

  if (names.length === 1 && cleaned.includes(' и ')) {
    return cleaned.split(' и ').map((n) => n.trim()).filter((n) => n)
  }

  return names
}

interface JudgeStatsAcc {
  name: string
  total_evaluations: number
  scores: number[]
  breeds: Set<string>
  disciplines: Set<string>
  events: Set<number>
}

export function aggregateJudgeStats(rows: JudgeRawRow[]): Map<string, JudgeStatsAcc> {
  const judgeStats = new Map<string, JudgeStatsAcc>()

  for (const row of rows) {
    try {
      const heats = JSON.parse(row.heats_json || '[]')
      const judgeNames = parseJudgeNames(row.event_judges)

      for (const heat of heats) {
        if (heat.judges && Array.isArray(heat.judges)) {
          for (const judge of heat.judges) {
            const judgeNum = judge.judge_number
            const judgeName = judgeNames[judgeNum - 1] || `Судья ${judgeNum}`

            if (!judgeStats.has(judgeName)) {
              judgeStats.set(judgeName, {
                name: judgeName,
                total_evaluations: 0,
                scores: [],
                breeds: new Set(),
                disciplines: new Set(),
                events: new Set(),
              })
            }

            const stats = judgeStats.get(judgeName)!
            if (judge.scores && Array.isArray(judge.scores)) {
              stats.total_evaluations += judge.scores.length
              stats.scores.push(...judge.scores)
              if (row.breed) stats.breeds.add(row.breed)
              if (row.event_type) stats.disciplines.add(row.event_type)
              stats.events.add(row.event_id)
            }
          }
        }
      }
    } catch {
      /* skip malformed row */
    }
  }

  return judgeStats
}

export function formatJudgesData(judgeStats: Map<string, JudgeStatsAcc>) {
  const judgesData: Record<string, unknown>[] = []

  for (const [, stats] of judgeStats.entries()) {
    const validScores = stats.scores.filter((s) => s !== null && !Number.isNaN(s))
    const avgScore =
      validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : null

    judgesData.push({
      id: stats.name,
      name: stats.name,
      total_evaluations: stats.total_evaluations,
      total_evaluations_count: Math.round(stats.total_evaluations / 5),
      avg_score: avgScore,
      unique_breeds: stats.breeds.size,
      unique_disciplines: stats.disciplines.size,
      unique_events: stats.events.size,
    })
  }

  judgesData.sort((a, b) => (b.total_evaluations as number) - (a.total_evaluations as number))
  return judgesData
}

interface BreedStatsAcc {
  count: number
  scores: number[]
}

export function aggregateBreedStats(rows: JudgeRawRow[], judgeName: string): Map<string, BreedStatsAcc> {
  const breedStats = new Map<string, BreedStatsAcc>()

  for (const row of rows) {
    try {
      const heats = JSON.parse(row.heats_json || '[]')
      const judgeNames = parseJudgeNames(row.event_judges)
      const judgeNum = judgeNames.indexOf(judgeName) + 1

      if (judgeNum > 0) {
        for (const heat of heats) {
          if (heat.judges && Array.isArray(heat.judges)) {
            const judge = heat.judges.find((j: { judge_number: number }) => j.judge_number === judgeNum)
            if (judge?.scores && Array.isArray(judge.scores)) {
              const validScores = judge.scores.filter((s: number | null) => s !== null && !Number.isNaN(s))
              const breed = row.breed || ''
              if (!breedStats.has(breed)) breedStats.set(breed, { count: 0, scores: [] })
              const stats = breedStats.get(breed)!
              stats.count += validScores.length
              stats.scores.push(...validScores)
            }
          }
        }
      }
    } catch {
      /* skip malformed row */
    }
  }

  return breedStats
}

interface DogStatsAcc {
  name: string
  name_ru: string | null
  scores: number[]
  events: Array<{ title: string; date: string; total: number }>
}

function aggregateDogStats(rows: JudgeRawRow[], judgeName: string, breed: string): Map<string, DogStatsAcc> {
  const dogStats = new Map<string, DogStatsAcc>()

  for (const row of rows) {
    if (row.breed !== breed) continue
    try {
      const heats = JSON.parse(row.heats_json || '[]')
      const judgeNames = parseJudgeNames(row.event_judges)
      const judgeNum = judgeNames.indexOf(judgeName) + 1

      if (judgeNum > 0) {
        for (const heat of heats) {
          if (heat.judges && Array.isArray(heat.judges)) {
            const judge = heat.judges.find((j: { judge_number: number }) => j.judge_number === judgeNum)
            if (judge?.scores && Array.isArray(judge.scores)) {
              const validScores = judge.scores.filter((s: number | null) => s !== null && !Number.isNaN(s))
              const dogKey = `${row.name_lat}_${row.name_ru || ''}`
              if (!dogStats.has(dogKey)) {
                dogStats.set(dogKey, {
                  name: row.name_lat || '',
                  name_ru: row.name_ru || null,
                  scores: [],
                  events: [],
                })
              }
              const stats = dogStats.get(dogKey)!
              stats.scores.push(...validScores)
              stats.events.push({
                title: row.event_title || '',
                date: row.date_start || '',
                total: validScores.reduce((a: number, b: number) => a + b, 0),
              })
            }
          }
        }
      }
    } catch {
      /* skip malformed row */
    }
  }

  return dogStats
}

function formatDogsArray(
  dogStats: Map<string, DogStatsAcc>,
  rows: JudgeRawRow[],
  judgeName: string,
  breed: string,
) {
  const dogsArray = [...dogStats.values()].map((dog) => ({
    name: dog.name,
    name_ru: dog.name_ru,
    avg_score: dog.scores.length > 0 ? dog.scores.reduce((a, b) => a + b, 0) / dog.scores.length : null,
    total_evaluations: dog.scores.length / 5,
    scores_by_criteria: { 0: [], 1: [], 2: [], 3: [], 4: [] } as Record<number, number[]>,
    events: dog.events,
  }))

  for (const row of rows) {
    if (row.breed !== breed) continue
    try {
      const heats = JSON.parse(row.heats_json || '[]')
      const judgeNames = parseJudgeNames(row.event_judges)
      const judgeNum = judgeNames.indexOf(judgeName) + 1

      if (judgeNum > 0) {
        for (const heat of heats) {
          if (heat.judges && Array.isArray(heat.judges)) {
            const judge = heat.judges.find((j: { judge_number: number }) => j.judge_number === judgeNum)
            if (judge?.scores && Array.isArray(judge.scores)) {
              const validScores = judge.scores.filter((s: number | null) => s !== null && !Number.isNaN(s))
              const dogData = dogsArray.find((d) => d.name === row.name_lat && d.name_ru === row.name_ru)
              if (dogData) {
                validScores.forEach((score: number, idx: number) => {
                  if (idx < 5 && dogData.scores_by_criteria[idx] !== undefined) {
                    dogData.scores_by_criteria[idx].push(score)
                  }
                })
              }
            }
          }
        }
      }
    } catch {
      /* skip malformed row */
    }
  }

  dogsArray.sort((a, b) => (b.avg_score || 0) - (a.avg_score || 0))
  return dogsArray
}

export function formatBreedData(breedStats: Map<string, BreedStatsAcc>, rows: JudgeRawRow[], judgeName: string) {
  const breedData: Record<string, unknown>[] = []

  for (const [breed, stats] of breedStats.entries()) {
    const validScores = stats.scores.filter((s) => s !== null && !Number.isNaN(s))
    const avgScore = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : null
    const minScore = validScores.length > 0 ? Math.min(...validScores) : null
    const maxScore = validScores.length > 0 ? Math.max(...validScores) : null

    const dogStats = aggregateDogStats(rows, judgeName, breed)
    const dogsArray = formatDogsArray(dogStats, rows, judgeName, breed)

    breedData.push({
      breed,
      count: stats.count,
      evaluations_count: Math.round(stats.count / 5),
      avg_score: avgScore,
      min_score: minScore,
      max_score: maxScore,
      dogs: dogsArray,
    })
  }

  breedData.sort((a, b) => (b.count as number) - (a.count as number))
  return breedData
}

type CriteriaStats = Record<number, number[]>

export function aggregateCriteriaStats(rows: JudgeRawRow[], judgeName: string): CriteriaStats {
  const criteriaStats: CriteriaStats = { 0: [], 1: [], 2: [], 3: [], 4: [] }

  for (const row of rows) {
    try {
      const heats = JSON.parse(row.heats_json || '[]')
      const judgeNames = parseJudgeNames(row.event_judges)
      const judgeNum = judgeNames.indexOf(judgeName) + 1

      if (judgeNum > 0) {
        for (const heat of heats) {
          if (heat.judges && Array.isArray(heat.judges)) {
            const judge = heat.judges.find((j: { judge_number: number }) => j.judge_number === judgeNum)
            if (judge?.scores && Array.isArray(judge.scores)) {
              const validScores = judge.scores.filter((s: number | null) => s !== null && !Number.isNaN(s))
              validScores.forEach((score: number, idx: number) => {
                if (idx < 5 && criteriaStats[idx] !== undefined) criteriaStats[idx].push(score)
              })
            }
          }
        }
      }
    } catch {
      /* skip malformed row */
    }
  }

  return criteriaStats
}

export function formatCriteriaData(criteriaStats: CriteriaStats) {
  const criteriaData: Record<string, unknown>[] = []
  const criteriaNames = ['Манёвренность', 'Резвость', 'Выносливость', 'Преследование', 'Энтузиазм']

  for (let i = 0; i < 5; i++) {
    const scores = criteriaStats[i].filter((s) => s !== null && !Number.isNaN(s))
    if (scores.length > 0) {
      criteriaData.push({
        name: criteriaNames[i],
        count: scores.length,
        evaluations_count: Math.round(scores.length / 5),
        avg_score: scores.reduce((a, b) => a + b, 0) / scores.length,
        min_score: Math.min(...scores),
        max_score: Math.max(...scores),
      })
    }
  }

  return criteriaData
}

export function aggregateAllScores(rows: JudgeRawRow[], judgeName: string): number[] {
  const allScores: number[] = []

  for (const row of rows) {
    try {
      const heats = JSON.parse(row.heats_json || '[]')
      const judgeNames = parseJudgeNames(row.event_judges)
      const judgeNum = judgeNames.indexOf(judgeName) + 1

      if (judgeNum > 0) {
        for (const heat of heats) {
          if (heat.judges && Array.isArray(heat.judges)) {
            const judge = heat.judges.find((j: { judge_number: number }) => j.judge_number === judgeNum)
            if (judge?.scores && Array.isArray(judge.scores)) {
              const validScores = judge.scores.filter((s: number | null) => s !== null && !Number.isNaN(s))
              allScores.push(...validScores)
            }
          }
        }
      }
    } catch {
      /* skip malformed row */
    }
  }

  return allScores
}
