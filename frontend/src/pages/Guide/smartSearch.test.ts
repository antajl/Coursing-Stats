import { describe, expect, it } from 'vitest'
import {
  convertKeyboardLayout,
  damerauLevenshtein,
  executeSmartGuideSearch,
  isFuzzyWordMatch,
  stemWord,
} from './smartSearch'

describe('smartGuideSearch', () => {
  it('converts wrong keyboard layout correctly', () => {
    expect(convertKeyboardLayout('rdjhev')).toBe('кворум')
    expect(convertKeyboardLayout('djphfcn')).toBe('возраст')
    expect(convertKeyboardLayout('yfvjhlybr')).toBe('намордник')
  })

  it('stems Russian words by stripping endings', () => {
    expect(stemWord('возрастной')).toBe('возраст')
    expect(stemWord('кворумом')).toBe('кворум')
    expect(stemWord('намордники')).toBe('намордник')
    expect(stemWord('попонах')).toBe('попон')
    expect(stemWord('маневренности')).toBe('маневренн')
    expect(stemWord('маневренность')).toBe('маневренн')
  })

  it('calculates Damerau-Levenshtein distance correctly', () => {
    expect(damerauLevenshtein('кворум', 'кворум')).toBe(0)
    expect(damerauLevenshtein('кворум', 'кворумм')).toBe(1)
    expect(damerauLevenshtein('возраст', 'возрост')).toBe(1)
  })

  it('matches fuzzy typos and endings', () => {
    // 1 опечатка
    expect(isFuzzyWordMatch('кворумм', 'кворум')).toBe(true)
    expect(isFuzzyWordMatch('наморднек', 'намордник')).toBe(true)
    expect(isFuzzyWordMatch('возрост', 'возраст')).toBe(true)
    expect(isFuzzyWordMatch('сертефикат', 'сертификат')).toBe(true)
    expect(isFuzzyWordMatch('маневриность', 'маневренность')).toBe(true)

    // Окончания
    expect(isFuzzyWordMatch('попоне', 'попона')).toBe(true)
    expect(isFuzzyWordMatch('маневренностью', 'маневренность')).toBe(true)
  })

  it('retrieves accurate direct answers for natural language queries and typos', () => {
    // Вопрос о возрасте обычный и с опечаткой
    const ageRes = executeSmartGuideSearch('со скольки месяцев можно бегать?')
    expect(ageRes.matchedDirectAnswer?.id).toBe('age-rules')
    expect(ageRes.matchedSectionIds.has('sec-requirements')).toBe(true)

    const ageTypoRes = executeSmartGuideSearch('возростной ценз')
    expect(ageTypoRes.matchedDirectAnswer?.id).toBe('age-rules')

    // Запрос в английской раскладке "rdjhev" (кворум)
    const layoutRes = executeSmartGuideSearch('rdjhev')
    expect(layoutRes.matchedDirectAnswer?.id).toBe('quorum-rules')

    // Запрос про переход со 2-го места
    const transferRes = executeSmartGuideSearch('почему второе место получило cacl?')
    expect(transferRes.matchedDirectAnswer?.id).toBe('rcacl-transfer')

    // Запрос про ничью / тай-брейк с опечаткой "тайбрек"
    const tieRes = executeSmartGuideSearch('тайбрек если равные баллы')
    expect(tieRes.matchedDirectAnswer?.id).toBe('tie-break')

    // Запрос про намордник с опечаткой "наморднек"
    const muzzleRes = executeSmartGuideSearch('какой наморднек нужен для состязаний')
    expect(muzzleRes.matchedDirectAnswer?.id).toBe('muzzles-blankets')

    // Запрос про 6 схем НЧ РК
    const schemesRes = executeSmartGuideSearch('как закрыть нч рк по схемам')
    expect(schemesRes.matchedDirectAnswer?.id).toBe('nch-schemes')

    // Запрос про беговой допуск
    const licenseRes = executeSmartGuideSearch('как получить беговой допуск')
    expect(licenseRes.matchedDirectAnswer?.id).toBe('license-booklet')

    // Запрос про норматив ВС
    const vcRes = executeSmartGuideSearch('что такое знак вс')
    expect(vcRes.matchedDirectAnswer?.id).toBe('vc-norm')
  })
})
