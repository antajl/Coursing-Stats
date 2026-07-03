import { describe, expect, it } from 'vitest'
import { formatRecordDate, parseRecordDate } from '../../frontend/src/lib/recordDates'

describe('recordDates', () => {
  it('parses DD.MM.YYYY', () => {
    expect(formatRecordDate('27.06.2026')).toBe('27.06.2026')
  })

  it('normalizes DD;MM.YYYY (Donino semicolon separator)', () => {
    expect(formatRecordDate('27;06.2026')).toBe('27.06.2026')
  })

  it('normalizes mixed ; and . separators', () => {
    expect(formatRecordDate('27.06;2026')).toBe('27.06.2026')
    expect(formatRecordDate('27;06;2026')).toBe('27.06.2026')
  })

  it('does not treat semicolon outside DMY pattern as date separator', () => {
    expect(parseRecordDate('note;27.06.2026')).toBeNull()
    expect(parseRecordDate('27;06')).toBeNull()
  })
})
