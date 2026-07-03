import { describe, expect, it } from 'vitest'
import { aggregateQualificationTitles } from '../src/lib/qualification-titles'

describe('aggregateQualificationTitles', () => {
  it('counts comma-separated titles per start', () => {
    const titles = aggregateQualificationTitles([
      { qualification: 'CACL, RegCACL' },
      { qualification: 'CACL' },
      { qualification: 'Чемпион РКФ' },
      { qualification: null },
      { qualification: '' },
    ])

    expect(titles).toEqual([
      { title: 'Чемпион РКФ', count: 1 },
      { title: 'CACL', count: 2 },
      { title: 'RegCACL', count: 1 },
    ])
  })

  it('sorts from highest to lowest rank', () => {
    const titles = aggregateQualificationTitles([
      { qualification: 'CACL' },
      { qualification: 'CACL' },
      { qualification: 'CACL' },
      { qualification: 'CACL' },
      { qualification: 'RegCACL' },
      { qualification: 'RegCACL' },
      { qualification: 'Чемпион РКФ' },
    ])

    expect(titles.map((t) => `${t.title}${t.count > 1 ? ` X${t.count}` : ''}`)).toEqual([
      'Чемпион РКФ',
      'CACL X4',
      'RegCACL X2',
    ])
  })
})
