import { describe, expect, it } from 'vitest'
import { normalizeProtocolPageTitle } from '../parsers/shared/protocol-title'

describe('normalizeProtocolPageTitle', () => {
  it('strips protocol suffix, date and location', () => {
    expect(
      normalizeProtocolPageTitle(
        'Чемпионат РКФ по курсингу борзых, 15-16.04.2023 (Московская обл., Михайловское): Полные результаты состязания',
      ),
    ).toBe('Чемпионат РКФ по курсингу борзых')
  })

  it('handles single-day event', () => {
    expect(
      normalizeProtocolPageTitle(
        'Чемпионат ранга CACL по курсингу борзых, 06.04.2025 (Ставрополь): Полные результаты состязания',
      ),
    ).toBe('Чемпионат ранга CACL по курсингу борзых')
  })
})
