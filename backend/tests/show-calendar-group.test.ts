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

  it('does not merge different show kinds on the same day', () => {
    const mono = entry({ id: 1, title: 'Монопородная выставка клуба ТООЛЖ' })
    const rating = entry({
      id: 2,
      title: 'Рейтинговая выставка (ранг ЧРКФ с особым статусом) клуба "ТООЛЖ"',
    })
    expect(rkfMonoMergeKey(mono)).not.toBe(rkfMonoMergeKey(rating))
  })
})
