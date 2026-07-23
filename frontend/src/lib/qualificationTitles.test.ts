import { describe, expect, it } from 'vitest'
import {
  classifyDogProfileTitle,
  mergeDogProfileTitles,
} from './qualificationTitles'
import { EMPTY_SHOW_TITLES } from '../../../backend/lib/show-award-ranking'

describe('mergeDogProfileTitles', () => {
  it('merges competition and show titles without collapsing ЧРКФ into Чемпион РКФ', () => {
    const titles = mergeDogProfileTitles(
      [
        { title: 'Чемпион РКФ', count: 1 },
        { title: 'RegCACL', count: 2 },
      ],
      { ...EMPTY_SHOW_TITLES, BIS: 1, BIG: 1, BOB: 5, CAC: 7, CHRKF: 1 },
    )

    const byTitle = Object.fromEntries(titles.map((t) => [t.title, t.count]))
    expect(byTitle['Чемпион РКФ']).toBe(1)
    expect(byTitle.ЧРКФ).toBe(1)
    expect(byTitle.BIS).toBe(1)
    expect(byTitle.ЛПП).toBe(5)
    expect(byTitle.RegCACL).toBe(2)
    expect(titles[0]?.title).toBe('BIS')
  })

  it('keeps working Чемпион РКФ as prestige, not cumulative', () => {
    expect(classifyDogProfileTitle('Чемпион РКФ')).toBe('prestige')
    expect(classifyDogProfileTitle('BIS')).toBe('prestige')
    expect(classifyDogProfileTitle('ЛПП')).toBe('prestige')
    expect(classifyDogProfileTitle('RegCACL')).toBe('certificate')
  })
})
