import { describe, expect, it } from 'vitest'
import {
  formatCompactShowTitle,
  formatRuDate,
  formatShortLocation,
  formatShowDate,
} from './historyFormatters'

describe('historyFormatters', () => {
  it('formats dates consistently', () => {
    expect(formatRuDate('2026-10-10')).toBe('10.10.2026')
    expect(formatRuDate(null)).toBe('—')
    expect(formatShowDate('06.09.2026')).toBe('06.09.2026')
  })

  it('extracts concise settlement name from full regional addresses', () => {
    expect(formatShortLocation('Московская область, Раменский р-н, д. Донино')).toBe('Донино')
    expect(formatShortLocation('Ставропольский край, г. Ставрополь')).toBe('Ставрополь')
    expect(
      formatShortLocation('Калужская область, Жуковский р-н, с. Спас-Прогнанье, б/о «Иволга»'),
    ).toBe('Спас-Прогнанье')
    expect(formatShortLocation('Калужская область, Жуковский р-н, б/о Головинка')).toBe(
      'б/о Головинка',
    )
    expect(formatShortLocation('Московская область, Сергиево-Посадский г.о.')).toBe(
      'Сергиево-Посадский',
    )
  })

  it('condenses verbose RKF show prefixes cleanly while keeping club and specialty info', () => {
    expect(formatCompactShowTitle('Монопородная выставка клуба МОО ОЛС "КОНГУР"')).toBe(
      'Моно · МОО ОЛС "КОНГУР"',
    )
    expect(formatCompactShowTitle('Выставка клуба РОО КК "СТОЛИЦА"')).toBe('РОО КК "СТОЛИЦА"')
    expect(formatCompactShowTitle('Выставка клуба "МКОО "ТРЕЙЛ""')).toBe('МКОО "ТРЕЙЛ"')
    expect(formatCompactShowTitle('ЕВРАЗИЯ. Кубок СНГ 2024')).toBe('ЕВРАЗИЯ. Кубок СНГ 2024')
  })
})
