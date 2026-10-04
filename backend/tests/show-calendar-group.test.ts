import { describe, expect, it } from 'vitest'
import {
  groupRkfMonoVariants,
  normalizeMergeText,
  rkfMonoMergeKey,
} from '../../frontend/src/pages/Shows/showCalendarGroup'
import type { ShowRkfCalendarEntry } from '../../frontend/src/lib/staticData'

function entry(partial: Partial<ShowRkfCalendarEntry> & Pick<ShowRkfCalendarEntry, 'id' | 'title'>): ShowRkfCalendarEntry {
  return {
    date: '17.01.2026',
    city: 'Тюмень',
    club: 'ТООЛЖ',
    ranks: 'КЧК',
    ...partial,
  }
}

describe('showCalendarGroup merge', () => {
  it('strips quotes in normalizeMergeText', () => {
    expect(normalizeMergeText('клуба "ТООЛЖ"')).toBe(normalizeMergeText('клуба ТООЛЖ'))
    expect(normalizeMergeText('клуба «ТООЛЖ»')).toBe(normalizeMergeText('клуба ТООЛЖ'))
  })

  it('merges same-day TOOLZH titles with and without quotes', () => {
    const a = entry({
      id: 94530,
      title: 'Монопородная выставка клуба "ТООЛЖ"',
      ranks: 'КЧК',
    })
    const b = entry({
      id: 94546,
      title: 'Монопородная выставка клуба ТООЛЖ',
      ranks: 'КЧК в каждом классе',
    })
    expect(rkfMonoMergeKey(a)).toBe(rkfMonoMergeKey(b))
    const groups = groupRkfMonoVariants([a, b])
    expect(groups).toHaveLength(1)
    expect(groups[0]!.children).toHaveLength(2)
  })

  it('merges different show kinds of the same club on the same day into one event', () => {
    const mono = entry({ id: 1, title: 'Монопородная выставка клуба ТООЛЖ', ranks: 'КЧК' })
    const rating = entry({
      id: 2,
      title: 'Рейтинговая выставка (ранг ЧРКФ с особым статусом) клуба "ТООЛЖ"',
      ranks: 'ЧРКФ с особым статусом',
    })
    expect(rkfMonoMergeKey(mono)).toBe(rkfMonoMergeKey(rating))
    const groups = groupRkfMonoVariants([mono, rating])
    expect(groups).toHaveLength(1)
    expect(groups[0]!.children).toHaveLength(2)
    // Rating exhibition has higher prestige, so it becomes the representative
    expect(groups[0]!.representative.id).toBe(2)
  })

  it('does not merge different clubs on the same day', () => {
    const club1 = entry({ id: 1, title: 'Выставка клуба ТООЛЖ', club: 'ТООЛЖ' })
    const club2 = entry({ id: 2, title: 'Выставка клуба СИБИРЬ', club: 'СИБИРЬ' })
    expect(rkfMonoMergeKey(club1)).not.toBe(rkfMonoMergeKey(club2))
    const groups = groupRkfMonoVariants([club1, club2])
    expect(groups).toHaveLength(2)
  })
})
