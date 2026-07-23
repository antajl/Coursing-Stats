import { describe, expect, it } from 'vitest'
import { parseCertificateTokens } from '../parsers/shows/parse-rkf-certificate-pdf'

describe('parseCertificateTokens', () => {
  it('parses a flat token stream from RKF certificate PDF', () => {
    const tokens = [
      'Порода',
      'Судья',
      'АВСТРАЛИЙСКАЯ ОВЧАРКА',
      'Ivanova Irina',
      '1',
      'REISING PRAID NIKANOR',
      '03.04.2024',
      '7043047',
      'ЧЕМ',
      'ОТЛ',
      'CAC',
      'ЧРКФ',
      'BOB/ЛПП',
      '05.07.2026',
      'БОРДЕР КОЛЛИ',
      'Ivanova Irina',
      '3',
      'BIKER',
      '27.04.2024',
      '7051441',
      'ЧЕМ',
      'ОТЛ',
      'CAC',
      '05.07.2026',
    ]
    const dogs = parseCertificateTokens(tokens)
    expect(dogs.length).toBe(2)
    expect(dogs[0]?.breed).toBe('АВСТРАЛИЙСКАЯ ОВЧАРКА')
    expect(dogs[0]?.dog_name).toContain('REISING')
    expect(dogs[0]?.grade).toBe('ОТЛ')
    expect(dogs[0]?.title).toContain('CAC')
    expect(dogs[0]?.bob).toBe(true)
    expect(dogs[1]?.catalog_number).toBe(3)
  })
})
