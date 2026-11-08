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

  it('retrieves accurate direct answers for all 15 key cynological domains', () => {
    // 1. Возраст
    const ageRes = executeSmartGuideSearch('со скольки месяцев можно бегать?')
    expect(ageRes.matchedDirectAnswer?.id).toBe('age-rules')
    expect(ageRes.matchedSectionIds.has('sec-requirements')).toBe(true)

    // 2. Кворум (раскладка)
    const layoutRes = executeSmartGuideSearch('rdjhev')
    expect(layoutRes.matchedDirectAnswer?.id).toBe('quorum-rules')

    // 3. Переход R.CACL
    const transferRes = executeSmartGuideSearch('почему второе место получило cacl?')
    expect(transferRes.matchedDirectAnswer?.id).toBe('rcacl-transfer')

    // 4. Тай-брейк / ничья
    const tieRes = executeSmartGuideSearch('тайбрек если равные баллы')
    expect(tieRes.matchedDirectAnswer?.id).toBe('tie-break')

    // 5. Намордник и попоны
    const muzzleRes = executeSmartGuideSearch('какой наморднек нужен для состязаний')
    expect(muzzleRes.matchedDirectAnswer?.id).toBe('muzzles-blankets')

    // 6. 6 схем НЧ РК
    const schemesRes = executeSmartGuideSearch('как закрыть нч рк по схемам')
    expect(schemesRes.matchedDirectAnswer?.id).toBe('nch-schemes')

    // 7. Беговой допуск
    const licenseRes = executeSmartGuideSearch('как получить беговой допуск')
    expect(licenseRes.matchedDirectAnswer?.id).toBe('license-booklet')

    // 8. Норматив ВС
    const vcRes = executeSmartGuideSearch('что такое знак вс')
    expect(vcRes.matchedDirectAnswer?.id).toBe('vc-norm')

    // 9. Разница курсинг vs бега
    const diffRes = executeSmartGuideSearch('в чем разница курсинг и бега')
    expect(diffRes.matchedDirectAnswer?.id).toBe('disciplines-diff')

    // 10. 5 критериев судейства
    const critRes = executeSmartGuideSearch('за что судьи ставят баллы 5 критериев')
    expect(critRes.matchedDirectAnswer?.id).toBe('judging-5-criteria')

    // 11. Чемпион России (ЧР РК)
    const chRusRes = executeSmartGuideSearch('как получить титул чемпион россии чр рк')
    expect(chRusRes.matchedDirectAnswer?.id).toBe('ch-rus-annual')

    // 12. Международные титулы FCI
    const fciRes = executeSmartGuideSearch('международный чемпион по бегам cic fci')
    expect(fciRes.matchedDirectAnswer?.id).toBe('intl-titles-fci')

    // 13. Дисквалификации
    const disqRes = executeSmartGuideSearch('на сколько дисквалифицируют за драку disq')
    expect(disqRes.matchedDirectAnswer?.id).toBe('disqualifications-rules')

    // 14. Гранд и Абсолютный чемпион
    const grandRes = executeSmartGuideSearch('что такое гранд чемпион гчр рк мультиспорт')
    expect(grandRes.matchedDirectAnswer?.id).toBe('grand-absolute-titles')

    // 15. Барьер 2-го круга
    const round2Res = executeSmartGuideSearch('почему сняли после первого круга барьер 50%')
    expect(round2Res.matchedDirectAnswer?.id).toBe('round2-barrier')
  })
})
