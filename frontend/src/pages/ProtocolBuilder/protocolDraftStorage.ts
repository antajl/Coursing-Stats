import type { CompetitionHeader, CategoryGroup, CompetitionKind } from './types'
import { createRunData, createEmptyScores } from './types'
import { STORAGE_KEY, DEFAULT_HEADER } from './constants'

export interface LoadedProtocolDraft {
  header?: CompetitionHeader
  kind?: CompetitionKind
  categories?: CategoryGroup[]
}

export function loadProtocolDraft(): LoadedProtocolDraft | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null
    const parsed = JSON.parse(saved)
    let header: CompetitionHeader | undefined
    if (parsed.header) {
      const raw = parsed.header
      header = {
        ...DEFAULT_HEADER,
        ...raw,
        title:
          raw.title === 'Чемпионат РКФ по курсингу'
            ? DEFAULT_HEADER.title
            : raw.title || DEFAULT_HEADER.title,
        rank: raw.rank === 'ЧРКФ' ? DEFAULT_HEADER.rank : raw.rank || DEFAULT_HEADER.rank,
        location:
          raw.location === 'Московская обл., Донино'
            ? DEFAULT_HEADER.location
            : raw.location || DEFAULT_HEADER.location,
        club:
          raw.club === 'МКОО Клуб Спортивного Собаководства'
            ? DEFAULT_HEADER.club
            : raw.club || DEFAULT_HEADER.club
      }
    }
    const kind: CompetitionKind | undefined = parsed.kind
    let categories: CategoryGroup[] | undefined
    if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
      categories = parsed.categories.map((c: any) => ({
        ...c,
        id: c.id || 'cat_' + Math.random().toString(36).substring(2, 9),
        breed: c.breed || 'Басенджи',
        className: c.className || 'Стандартный',
        sex: c.sex || 'male',
        runsCount: c.runsCount === 1 || c.runsCount === 2 || c.runsCount === 3 ? c.runsCount : 2,
        dogs: (c.dogs || []).map((d: any, dIdx: number) => {
          const rawRuns =
            Array.isArray(d.runs) && d.runs.length > 0
              ? d.runs
              : [
                  d.run1_scores
                    ? {
                        heat: d.run1_heat || '1',
                        blanket: d.run1_blanket || 'red',
                        scores: d.run1_scores
                      }
                    : createRunData('1', 'red'),
                  d.run2_scores
                    ? {
                        heat: d.run2_heat || '1',
                        blanket: d.run2_blanket || 'white',
                        scores: d.run2_scores
                      }
                    : createRunData('1', 'white')
                ]

          const runs = rawRuns.map((r: any, rIdx: number) => ({
            heat:
              String(r?.heat || String(rIdx + 1))
                .replace(/\D/g, '')
                .slice(0, 3) || String(rIdx + 1),
            blanket: r?.blanket || (rIdx === 0 ? 'red' : rIdx === 1 ? 'white' : 'blue'),
            scores: r?.scores
              ? {
                  speed: typeof r.scores.speed === 'number' ? r.scores.speed : '',
                  enthusiasm: typeof r.scores.enthusiasm === 'number' ? r.scores.enthusiasm : '',
                  intelligence:
                    typeof r.scores.intelligence === 'number' ? r.scores.intelligence : '',
                  agility: typeof r.scores.agility === 'number' ? r.scores.agility : '',
                  endurance: typeof r.scores.endurance === 'number' ? r.scores.endurance : ''
                }
              : createEmptyScores(),
            status: r?.status || 'normal',
            reason: r?.reason || ''
          }))

          return {
            id: d.id || 'dog_' + Math.random().toString(36).substring(2, 9),
            catalogNumber: d.catalogNumber ?? String(dIdx + 1),
            dogName: d.dogName || '',
            sex: d.sex || 'male',
            runs,
            racing_box: d.racing_box || '1',
            racing_time1: d.racing_time1 || '',
            racing_time2: d.racing_time2 || '',
            racing_final_time: d.racing_final_time || '',
            disqualified: Boolean(d.disqualified),
            comment: d.comment || '',
            awards: Array.isArray(d.awards) ? d.awards : []
          }
        })
      }))
    }
    return { header, kind, categories }
  } catch {
    return null
  }
}

export function saveProtocolDraft(data: {
  header: CompetitionHeader
  kind: CompetitionKind
  categories: CategoryGroup[]
}): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function clearProtocolDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
