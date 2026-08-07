import { describe, expect, it } from 'vitest'
import {
  buildDogProfileTitleGroups,
  classifyDogProfileTitle,
  mergeDogProfileTitles,
  resolveCompetitionTitles,
  resolveShowTitles,
} from './qualificationTitles'
import { EMPTY_SHOW_TITLES } from '../../../backend/lib/show-award-ranking'

describe('mergeDogProfileTitles', () => {
  it('merges competition and show titles without collapsing ЧРКФ into ЧРКФ РК', () => {
    const titles = mergeDogProfileTitles(
      [
        { title: 'Чемпион РКФ', count: 1 },
        { title: 'RegCACL', count: 2 },
      ],
      { ...EMPTY_SHOW_TITLES, BIS: 1, BIG: 1, BOB: 5, CAC: 7, CHRKF: 1 },
    )

    const byTitle = Object.fromEntries(titles.map((t) => [t.title, t.count]))
    expect(byTitle['ЧРКФ РК']).toBe(1)
    expect(byTitle.ЧРКФ).toBe(1)
    expect(byTitle.BIS).toBe(1)
    expect(byTitle.ЛПП).toBe(5)
    expect(byTitle.RegCACL).toBe(2)
    expect(titles[0]?.title).toBe('BIS')
  })

  it('keeps working ЧРКФ РК as prestige, not cumulative', () => {
    expect(classifyDogProfileTitle('ЧРКФ РК')).toBe('prestige')
    expect(classifyDogProfileTitle('Чемпион РКФ')).toBe('prestige')
    expect(classifyDogProfileTitle('BIS')).toBe('prestige')
    expect(classifyDogProfileTitle('ЛПП')).toBe('prestige')
    expect(classifyDogProfileTitle('RegCACL')).toBe('certificate')
  })
})

describe('buildDogProfileTitleGroups', () => {
  it('splits show vs competition domains with official badges', () => {
    const groups = buildDogProfileTitleGroups({
      competitionIndexed: [
        { title: 'Чемпион РКФ', count: 1 },
        { title: 'RegCACL', count: 2 },
      ],
      showTitles: { ...EMPTY_SHOW_TITLES, BIS: 1, BIG: 1, BOB: 5, CAC: 7, CHRKF: 1 },
    })

    expect(groups.show.map((t) => t.title)).toEqual(['BIS', 'BIG', 'ЛПП', 'CAC', 'ЧРКФ'])
    expect(groups.competition.map((t) => t.title)).toEqual(['ЧРКФ РК', 'RegCACL'])
  })

  it('merges old long names with new short badges by key', () => {
    const titles = resolveCompetitionTitles({
      indexed: [{ title: 'Чемпион РКФ', count: 2 }],
      competitions: [
        { status: 'finished', qualification: 'ЧРКФ РК' },
        { status: 'finished', qualification: 'Чемпион РКФ' },
      ],
    })
    expect(titles).toEqual([{ title: 'ЧРКФ РК', count: 2 }])
  })

  it('picks up competition titles missing from index via history', () => {
    const titles = resolveCompetitionTitles({
      indexed: [{ title: 'RegCACL', count: 1 }],
      competitions: [
        { status: 'finished', qualification: 'RegCACL' },
        { status: 'finished', qualification: 'RegCACL' },
        { status: 'finished', qualification: 'CACL, ПЧРКФ РК' },
        { status: 'dns', qualification: 'CACL' },
      ],
    })
    const byTitle = Object.fromEntries(titles.map((t) => [t.title, t.count]))
    expect(byTitle.RegCACL).toBe(2)
    expect(byTitle.CACL).toBe(1)
    expect(byTitle['ПЧРКФ РК']).toBe(1)
  })

  it('uses max of card titles and summed history for shows', () => {
    const titles = resolveShowTitles({
      titles: { ...EMPTY_SHOW_TITLES, CAC: 2 },
      history: [
        { title: 'CAC, CW' },
        { title: 'CAC' },
        { title: 'CAC, BOB' },
      ],
    })
    const byTitle = Object.fromEntries(titles.map((t) => [t.title, t.count]))
    expect(byTitle.CAC).toBe(3)
    expect(byTitle.ЛПП).toBe(1)
    expect(byTitle.CW).toBe(1)
  })
})
