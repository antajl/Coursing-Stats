import { describe, expect, it } from 'vitest'
import { sortShowHistory } from '../../../../backend/lib/show-dates'

describe('ShowsColumn history sorting', () => {
  it('sorts history entries in strictly descending chronological order (newest first)', () => {
    // Exact scrambled case from user screenshot
    const rawHistory = [
      {
        date: '29.01.2023',
        exhibition_id: 1,
        exhibition_title: 'МОНОПОРОДНАЯ ВЫСТАВКА КЛУБА "МКОО "МАСТЕРС""',
      },
      {
        date: '28.01.2024',
        exhibition_id: 2,
        exhibition_title: 'МОНОПОРОДНАЯ ВЫСТАВКА КЛУБА "МКОО "МАСТЕРС""',
      },
      {
        date: '27.08.2023',
        exhibition_id: 3,
        exhibition_title: 'МОНОПРОДНАЯ ВЫСТАВКА КЛУБА "МОО "ГЛОБУС ПЛЮС""',
      },
    ]

    const sorted = sortShowHistory([...rawHistory])

    expect(sorted.map((e) => e.date)).toEqual([
      '28.01.2024',
      '27.08.2023',
      '29.01.2023',
    ])
  })
})
