import type { CumulativeTitle } from '../../../lib/cumulativeTitles'

export type ShowNeedKind = 'kchk' | 'cac' | 'chrkf' | 'cacib'
export type SportRankNeed = 'chr' | 'chrkf' | 'pkr' | 'cacl' | 'pchrkf' | 'cacil'

export interface SportNeed {
  discipline: 'coursing' | 'racing'
  ranks: SportRankNeed[]
}

export interface TitleUpcomingNeeds {
  showNeeds: ShowNeedKind[]
  sportNeeds: SportNeed[]
  calendarKind: 'show' | 'sport' | 'both'
}

export function resolveTitleUpcomingNeeds(title: CumulativeTitle, allTitles: CumulativeTitle[]): TitleUpcomingNeeds {
  const id = title.id
  const reqs = title.requirements ?? []

  if (id === 'ch-nkp' || id === 'jch-nkp' || id === 'vch-nkp') {
    return { showNeeds: ['kchk'], sportNeeds: [], calendarKind: 'show' }
  }
  if (id === 'ch-russia' || id === 'jch-russia' || id === 'vch-russia') {
    return { showNeeds: ['cac'], sportNeeds: [], calendarKind: 'show' }
  }
  if (id === 'ch-rkf' || id === 'jch-rkf' || id === 'vch-rkf') {
    return { showNeeds: ['chrkf'], sportNeeds: [], calendarKind: 'show' }
  }
  if (id === 'grand-ch-russia' || id === 'jgrand-ch-russia' || id === 'vgrand-ch-russia') {
    const showNeeds: ShowNeedKind[] = []
    if (!reqs[0]?.completed) showNeeds.push('cac')
    if (!reqs[1]?.completed) showNeeds.push('kchk')
    return { showNeeds, sportNeeds: [], calendarKind: 'show' }
  }
  if (id === 'grand-ch-rkf-sport') {
    const sportNeeds: SportNeed[] = []
    if (!reqs[0]?.completed) sportNeeds.push({ discipline: 'coursing', ranks: ['chrkf'] })
    if (!reqs[1]?.completed) sportNeeds.push({ discipline: 'racing', ranks: ['chrkf'] })
    return { showNeeds: [], sportNeeds, calendarKind: 'sport' }
  }
  if (id === 'grand-ch-sport') {
    const sportNeeds: SportNeed[] = []
    if (!reqs[0]?.completed) sportNeeds.push({ discipline: 'racing', ranks: ['chr'] })
    if (!reqs[1]?.completed) sportNeeds.push({ discipline: 'coursing', ranks: ['chr'] })
    return { showNeeds: [], sportNeeds, calendarKind: 'sport' }
  }
  if (id === 'national-ch-sport-coursing' || id === 'national-ch-sport-racing') {
    const discipline = id.includes('racing') ? 'racing' : 'coursing'
    return {
      showNeeds: [],
      sportNeeds: [{ discipline, ranks: ['chrkf', 'pkr', 'cacl'] }],
      calendarKind: 'sport',
    }
  }
  if (id === 'breed-ch-sport-coursing' || id === 'breed-ch-sport-racing') {
    const discipline = id.includes('racing') ? 'racing' : 'coursing'
    return {
      showNeeds: [],
      sportNeeds: [{ discipline, ranks: ['pchrkf'] }],
      calendarKind: 'sport',
    }
  }
  if (id === 'absolute-ch-russia') {
    const sportDone = Boolean(reqs[0]?.completed)
    const gchrDone = Boolean(reqs[1]?.completed)
    const sportNeeds: SportNeed[] = sportDone
      ? []
      : [
          { discipline: 'coursing', ranks: ['chr', 'chrkf', 'pkr', 'cacl'] },
          { discipline: 'racing', ranks: ['chr', 'chrkf', 'pkr', 'cacl'] },
        ]
    let showNeeds: ShowNeedKind[] = []
    if (!gchrDone) {
      const gchrTitle = allTitles.find((t) => t.id === 'grand-ch-russia')
      if (gchrTitle) {
        showNeeds = resolveTitleUpcomingNeeds(gchrTitle, allTitles).showNeeds
      } else {
        const chrDone = allTitles.some((t) => t.id === 'ch-russia' && t.status === 'completed')
        const chnkpDone = allTitles.some((t) => t.id === 'ch-nkp' && t.status === 'completed')
        if (!chrDone) showNeeds.push('cac')
        if (!chnkpDone) showNeeds.push('kchk')
      }
    }
    const calendarKind = showNeeds.length > 0 && sportNeeds.length === 0
      ? 'show'
      : sportNeeds.length > 0 && showNeeds.length === 0
        ? 'sport'
        : 'both'
    return { showNeeds, sportNeeds, calendarKind }
  }
  if (id === 'intl-ch-cic') {
    const cacilDone = Boolean(reqs[0]?.completed)
    const showDone = Boolean(reqs[1]?.completed)
    const sportNeeds: SportNeed[] = cacilDone
      ? []
      : [
          { discipline: 'coursing', ranks: ['cacil'] },
          { discipline: 'racing', ranks: ['cacil'] },
        ]
    const showNeeds: ShowNeedKind[] = showDone ? [] : ['cacib']
    const calendarKind = showNeeds.length > 0 && sportNeeds.length === 0
      ? 'show'
      : sportNeeds.length > 0 && showNeeds.length === 0
        ? 'sport'
        : 'both'
    return { showNeeds, sportNeeds, calendarKind }
  }

  return {
    showNeeds: title.domain === 'show' ? ['cac'] : [],
    sportNeeds: title.domain === 'sport' ? [{ discipline: 'coursing', ranks: ['cacl'] }] : [],
    calendarKind: title.domain === 'show' ? 'show' : title.domain === 'sport' ? 'sport' : 'both',
  }
}
