import { describe, expect, it } from 'vitest'
import {
  buildDogProfileTitleGroups,
  classifyDogProfileTitle,
  isCertificateToken,
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

describe('isCertificateToken', () => {
  it('correctly identifies candidate/class certificates to filter from title bars', () => {
    // Show certificates
    expect(isCertificateToken('JCAC')).toBe(true)
    expect(isCertificateToken('R.JCAC')).toBe(true)
    expect(isCertificateToken('CAC')).toBe(true)
    expect(isCertificateToken('R.CAC')).toBe(true)
    expect(isCertificateToken('RCAC')).toBe(true)
    expect(isCertificateToken('CACIB')).toBe(true)
    expect(isCertificateToken('R.CACIB')).toBe(true)
    expect(isCertificateToken('VCAC')).toBe(true)
    expect(isCertificateToken('R.VCAC')).toBe(true)
    expect(isCertificateToken('CW')).toBe(true)
    expect(isCertificateToken('СС')).toBe(true)
    expect(isCertificateToken('ЮСС')).toBe(true)
    expect(isCertificateToken('ВСС')).toBe(true)
    expect(isCertificateToken('CC')).toBe(true)
    expect(isCertificateToken('КЧК')).toBe(true)
    expect(isCertificateToken('ЮКЧК')).toBe(true)
    expect(isCertificateToken('ВКЧК')).toBe(true)
    expect(isCertificateToken('КЧП')).toBe(true)
    expect(isCertificateToken('ЮКЧП')).toBe(true)

    // Sport certificates
    expect(isCertificateToken('CACL')).toBe(true)
    expect(isCertificateToken('R.CACL')).toBe(true)
    expect(isCertificateToken('CACIL')).toBe(true)
    expect(isCertificateToken('R.CACIL')).toBe(true)
    expect(isCertificateToken('RegCACL')).toBe(true)
    expect(isCertificateToken('CACLBr')).toBe(true)

    // Genuine titles must NOT be treated as certificates
    expect(isCertificateToken('BIS')).toBe(false)
    expect(isCertificateToken('BIG')).toBe(false)
    expect(isCertificateToken('ЛПП')).toBe(false)
    expect(isCertificateToken('BOB')).toBe(false)
    expect(isCertificateToken('ЛППП')).toBe(false)
    expect(isCertificateToken('BOS')).toBe(false)
    expect(isCertificateToken('ЛЮ')).toBe(false)
    expect(isCertificateToken('ЛВ')).toBe(false)
    expect(isCertificateToken('ЛЩ')).toBe(false)
    expect(isCertificateToken('ЛБ')).toBe(false)
    expect(isCertificateToken('ЧРКФ')).toBe(false)
    expect(isCertificateToken('ЮЧРКФ')).toBe(false)
    expect(isCertificateToken('ВЧРКФ')).toBe(false)
    expect(isCertificateToken('П Москвы')).toBe(false)
    expect(isCertificateToken('П «России»')).toBe(false)
    expect(isCertificateToken('ЧР РК')).toBe(false)
    expect(isCertificateToken('ГЧР РК')).toBe(false)
    expect(isCertificateToken('ЧРКФ РК')).toBe(false)
    expect(isCertificateToken('ПКР РК')).toBe(false)
    expect(isCertificateToken('ПЧРКФ РК')).toBe(false)
    expect(isCertificateToken('C.I.C.')).toBe(false)
  })
})
