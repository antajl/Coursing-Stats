import { describe, expect, it } from 'vitest'
import {
  convertKeyboardLayout,
  damerauLevenshtein,
  detectConversationalIntent,
  executeSmartGuideSearch,
  extractSalientTokens,
  isFuzzyWordMatch,
  isPhraseMatch,
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

  it('filters stop words and extracts salient tokens from conversational questions', () => {
    const res = extractSalientTokens('как получить титул гранд Чемпион по рабочим качествам')
    expect(res.salientTokens).toEqual(['гранд', 'чемпион', 'рабочим', 'качествам'])

    const res2 = extractSalientTokens('подскажи пожалуйста со скольки месяцев можно начинать тренировки щенка')
    expect(res2.salientTokens).toEqual(['месяцев', 'начинать', 'тренировки', 'щенка'])
  })

  it('matches multi-word phrases and collocations with morphological flexibility', () => {
    expect(isPhraseMatch('как получить титул гранд Чемпион по рабочим качествам', 'гранд чемпион')).toBe(true)
    expect(isPhraseMatch('как получить титул гранд Чемпион по рабочим качествам', 'гранд чемпион по рабочим качествам')).toBe(true)
    expect(isPhraseMatch('где получить беговой допуск для щенка', 'беговой допуск')).toBe(true)
    expect(isPhraseMatch('что делать если равные баллы у собак', 'равные баллы')).toBe(true)
  })

  it('detects conversational intents from natural queries', () => {
    expect(detectConversationalIntent('как получить титул гранд Чемпион по рабочим качествам')).toBe('grand-absolute-titles')
    expect(detectConversationalIntent('что нужно сделать чтобы получить титул чемпиона россии')).toBe('ch-rus-annual')
    expect(detectConversationalIntent('подскажи со скольки месяцев можно бегать')).toBe('age-rules')
    expect(detectConversationalIntent('почему собаке на втором месте дали cacl')).toBe('rcacl-transfer')
    expect(detectConversationalIntent('как судьи определяют победителя если баллы абсолютно одинаковые')).toBe('tie-break')
    expect(detectConversationalIntent('сколько собак должно быть в породе для cacl кворум')).toBe('quorum-rules')
  })

  it('accurately resolves complex conversational queries to their exact cynological cards', () => {
    // 1. Точный запрос пользователя: "как получить титул гранд Чемпион по рабочим качествам"
    const grandRes = executeSmartGuideSearch('как получить титул гранд Чемпион по рабочим качествам')
    expect(grandRes.matchedDirectAnswer?.id).toBe('grand-absolute-titles')
    expect(grandRes.matchedSectionIds.has('sec-hierarchy')).toBe(true)

    // 2. Ежегодный Чемпион России (ЧР РК) без гранда
    const chRusRes = executeSmartGuideSearch('что нужно сделать чтобы получить титул чемпиона россии')
    expect(chRusRes.matchedDirectAnswer?.id).toBe('ch-rus-annual')
    expect(chRusRes.matchedSectionIds.has('sec-hierarchy')).toBe(true)

    // 3. Возраст щенка
    const ageRes = executeSmartGuideSearch('подскажи пожалуйста со скольки месяцев можно начинать тренировки щенка')
    expect(ageRes.matchedDirectAnswer?.id).toBe('age-rules')
    expect(ageRes.matchedSectionIds.has('sec-requirements')).toBe(true)

    // 4. Переход R.CACL серебру
    const transferRes = executeSmartGuideSearch('почему собаке на втором месте отдали сертификат cacl')
    expect(transferRes.matchedDirectAnswer?.id).toBe('rcacl-transfer')
    expect(transferRes.matchedSectionIds.has('sec-hierarchy')).toBe(true)

    // 5. Одинаковые баллы (тай-брейк)
    const tieRes = executeSmartGuideSearch('как судьи определяют победителя если баллы абсолютно одинаковые')
    expect(tieRes.matchedDirectAnswer?.id).toBe('tie-break')
    expect(tieRes.matchedSectionIds.has('sec-judging')).toBe(true)

    // 6. Кворум породы
    const quorumRes = executeSmartGuideSearch('сколько собак должно быть в породе чтобы дали cacl')
    expect(quorumRes.matchedDirectAnswer?.id).toBe('quorum-rules')
    expect(quorumRes.matchedSectionIds.has('sec-requirements')).toBe(true)
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

    // 16. Анатомия строки протокола соревнований
    const protocolRes = executeSmartGuideSearch('как читать строку протокола?')
    expect(protocolRes.matchedDirectAnswer?.id).toBe('protocol-anatomy')
    expect(protocolRes.matchedSectionIds.has('sec-protocol')).toBe(true)

    const catalogRes = executeSmartGuideSearch('каталожный номер')
    expect(catalogRes.matchedSectionIds.has('sec-protocol')).toBe(true)
  })

  it('matches all 10 popular queries from TitlesTab cleanly without cross-domain false positives', () => {
    const popularSportQueries = [
      { label: 'Как читать строку протокола?', expectedAnswerId: 'protocol-anatomy', expectedSectionId: 'sec-protocol' },
      { label: 'С какого возраста можно бегать?', expectedAnswerId: 'age-rules', expectedSectionId: 'sec-requirements' },
      { label: 'Что такое кворум и как делят по полу?', expectedAnswerId: 'quorum-rules', expectedSectionId: 'sec-requirements' },
      { label: 'Переход сертификата CACL со 2-го места', expectedAnswerId: 'rcacl-transfer', expectedSectionId: 'sec-hierarchy' },
      { label: '6 схем оформления титула НЧ РК', expectedAnswerId: 'nch-schemes', expectedSectionId: 'sec-schemes' },
      { label: '5 критериев судейства (100 баллов)', expectedAnswerId: 'judging-5-criteria', expectedSectionId: 'sec-judging' },
      { label: 'Как решается ничья (тай-брейк)', expectedAnswerId: 'tie-break', expectedSectionId: 'sec-judging' },
      { label: 'Беговой намордник и цвета попон', expectedAnswerId: 'muzzles-blankets', expectedSectionId: 'sec-requirements' },
      { label: 'Что означает отметка «ВС»?', expectedAnswerId: 'vc-norm', expectedSectionId: 'sec-requirements' },
      { label: 'В чём разница: курсинг и бега?', expectedAnswerId: 'disciplines-diff', expectedSectionId: 'sec-disciplines' },
    ]

    for (const item of popularSportQueries) {
      const res = executeSmartGuideSearch(item.label)
      expect(res.matchedDirectAnswer?.id).toBe(item.expectedAnswerId)
      expect(res.matchedSectionIds.has(item.expectedSectionId)).toBe(true)
    }
  })
})
