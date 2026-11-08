import { describe, expect, it } from 'vitest'
import {
  convertKeyboardLayout,
  damerauLevenshtein,
  detectShowConversationalIntent,
  executeSmartShowSearch,
  extractSalientTokens,
  isFuzzyWordMatch,
  isPhraseMatch,
  stemWord,
} from './smartShowSearch'

describe('smartShowSearch', () => {
  it('converts wrong keyboard layout for show terms', () => {
    expect(convertKeyboardLayout('сфс')).toBe('cac')
    expect(convertKeyboardLayout('сфсши')).toBe('cacib')
    expect(convertKeyboardLayout('ищи')).toBe('bob')
    expect(convertKeyboardLayout('ишы')).toBe('bis')
  })

  it('stems Russian show terms accurately', () => {
    expect(stemWord('выставочный')).toBe('выставоч')
    expect(stemWord('юниорский')).toBe('юниорск')
    expect(stemWord('ветеранами')).toBe('ветеран')
    expect(stemWord('лентами')).toBe('лент')
    expect(stemWord('экспертизой')).toBe('экспертиз')
  })

  it('calculates Damerau-Levenshtein distance correctly for show terms', () => {
    expect(damerauLevenshtein('сертификат', 'сертификат')).toBe(0)
    expect(damerauLevenshtein('сертификат', 'сертефикат')).toBe(1)
    expect(damerauLevenshtein('эксперт', 'експерт')).toBe(1)
  })

  it('matches fuzzy typos and endings', () => {
    expect(isFuzzyWordMatch('сертефикат', 'сертификат')).toBe(true)
    expect(isFuzzyWordMatch('юниоры', 'юниор')).toBe(true)
    expect(isFuzzyWordMatch('ветеранов', 'ветеран')).toBe(true)
    expect(isFuzzyWordMatch('ленточкой', 'лента')).toBe(true)
  })

  it('filters stop words and extracts salient tokens from show queries', () => {
    const res = extractSalientTokens('как получить титул чемпион россии по красоте на выставке')
    expect(res.salientTokens).toEqual(['чемпион', 'россии', 'красоте'])

    const res2 = extractSalientTokens('со скольки месяцев можно выставлять щенка в класс бэби')
    expect(res2.salientTokens).toEqual(['месяцев', 'выставлять', 'щенка', 'класс', 'бэби'])
  })

  it('matches multi-word phrases and collocations with morphological flexibility', () => {
    expect(isPhraseMatch('как получить титул чемпион россии по красоте', 'чемпион россии')).toBe(true)
    expect(isPhraseMatch('кто судит главный ринг best in show', 'best in show')).toBe(true)
    expect(isPhraseMatch('какого цвета красная наградная лента', 'красная лента')).toBe(true)
  })

  it('detects conversational intents from natural queries', () => {
    expect(detectShowConversationalIntent('как получить титул чемпион россии по красоте')).toBe('show-ch-rus')
    expect(detectShowConversationalIntent('что нужно чтобы собака стала юным чемпионом россии')).toBe('show-jch-rus')
    expect(detectShowConversationalIntent('в чем разница между cac и cacib')).toBe('show-cac-vs-cacib')
    expect(detectShowConversationalIntent('со скольки месяцев можно выставлять щенка в класс бэби')).toBe('show-age-classes')
    expect(detectShowConversationalIntent('кто выходит в сравнение на bob и bos')).toBe('show-bob-bos-comparison')
    expect(detectShowConversationalIntent('как проходит главный ринг best in show')).toBe('show-main-ring-bis')
    expect(detectShowConversationalIntent('какие бывают оценки и какого цвета наградные ленты')).toBe('show-ribbon-colors')
    expect(detectShowConversationalIntent('чем отличаются ранги выставок cacib чркф и чф')).toBe('show-ranks-diff')
    expect(detectShowConversationalIntent('что такое r.cac и кому он переходит')).toBe('show-rcac-transfer')
    expect(detectShowConversationalIntent('как закрыть гранд чемпиона россии по красоте')).toBe('show-grand-ch')
    expect(detectShowConversationalIntent('что нужно для интерчемпиона fci c.i.b.')).toBe('show-intl-cib')
    expect(detectShowConversationalIntent('почему с оценкой очень хорошо не дают cac')).toBe('show-grade-excellent-rule')
    expect(detectShowConversationalIntent('как начисляются очки в рейтинге выставок coursing stats')).toBe('show-rating-points')
    expect(detectShowConversationalIntent('как получить титул чемпион нкп чк')).toBe('show-club-ch')
    expect(detectShowConversationalIntent('что значит cw bob bos big bis')).toBe('show-abbreviations')
  })

  it('accurately resolves complex conversational queries to their exact exhibition cards', () => {
    // 1. Чемпион России по красоте (ЧР)
    const chRes = executeSmartShowSearch('как получить титул чемпион россии по красоте')
    expect(chRes.matchedDirectAnswer?.id).toBe('show-ch-rus')
    expect(chRes.matchedSectionIds.has('sec-show-career-titles')).toBe(true)

    // 2. Юный чемпион (ЮЧР)
    const jchRes = executeSmartShowSearch('что нужно чтобы собака стала юным чемпионом россии')
    expect(jchRes.matchedDirectAnswer?.id).toBe('show-jch-rus')
    expect(jchRes.matchedSectionIds.has('sec-show-career-titles')).toBe(true)

    // 3. Разница CAC и CACIB
    const diffRes = executeSmartShowSearch('в чем разница между cac и cacib')
    expect(diffRes.matchedDirectAnswer?.id).toBe('show-cac-vs-cacib')
    expect(diffRes.matchedSectionIds.has('sec-show-ring-awards')).toBe(true)

    // 4. Возраст бэби
    const ageRes = executeSmartShowSearch('со скольки месяцев можно выставлять щенка в класс бэби')
    expect(ageRes.matchedDirectAnswer?.id).toBe('show-age-classes')
    expect(ageRes.matchedSectionIds.has('sec-show-classes')).toBe(true)

    // 5. BOB и BOS
    const bobRes = executeSmartShowSearch('кто выходит в сравнение на bob и bos')
    expect(bobRes.matchedDirectAnswer?.id).toBe('show-bob-bos-comparison')
    expect(bobRes.matchedSectionIds.has('sec-show-ring-awards')).toBe(true)

    // 6. Best in Show (BIS)
    const bisRes = executeSmartShowSearch('как проходит главный ринг best in show')
    expect(bisRes.matchedDirectAnswer?.id).toBe('show-main-ring-bis')
    expect(bisRes.matchedSectionIds.has('sec-show-roadmap')).toBe(true)

    // 7. Цвета наградных лент
    const ribbonRes = executeSmartShowSearch('какие бывают оценки и какого цвета наградные ленты')
    expect(ribbonRes.matchedDirectAnswer?.id).toBe('show-ribbon-colors')
    expect(ribbonRes.matchedSectionIds.has('sec-show-grades')).toBe(true)

    // 8. Ранги выставок
    const ranksRes = executeSmartShowSearch('чем отличаются ранги выставок cacib чркф и чф')
    expect(ranksRes.matchedDirectAnswer?.id).toBe('show-ranks-diff')
    expect(ranksRes.matchedSectionIds.has('sec-show-ranks')).toBe(true)

    // 9. Переход R.CAC
    const rcacRes = executeSmartShowSearch('что такое r.cac и кому он переходит')
    expect(rcacRes.matchedDirectAnswer?.id).toBe('show-rcac-transfer')
    expect(rcacRes.matchedSectionIds.has('sec-show-ring-awards')).toBe(true)

    // 10. Гранд чемпион (ГЧР)
    const gchRes = executeSmartShowSearch('как закрыть гранд чемпиона россии по красоте')
    expect(gchRes.matchedDirectAnswer?.id).toBe('show-grand-ch')
    expect(gchRes.matchedSectionIds.has('sec-show-career-titles')).toBe(true)

    // 11. Интерчемпион C.I.B.
    const cibRes = executeSmartShowSearch('что нужно для интерчемпиона fci c.i.b.')
    expect(cibRes.matchedDirectAnswer?.id).toBe('show-intl-cib')
    expect(cibRes.matchedSectionIds.has('sec-show-career-titles')).toBe(true)

    // 12. Очень хорошо без CAC
    const ogradRes = executeSmartShowSearch('почему с оценкой очень хорошо не дают cac')
    expect(ogradRes.matchedDirectAnswer?.id).toBe('show-grade-excellent-rule')
    expect(ogradRes.matchedSectionIds.has('sec-show-grades')).toBe(true)

    // 13. Очки рейтинга
    const ptsRes = executeSmartShowSearch('как начисляются очки в рейтинге выставок coursing stats')
    expect(ptsRes.matchedDirectAnswer?.id).toBe('show-rating-points')
    expect(ptsRes.matchedSectionIds.has('sec-show-ring-awards')).toBe(true)

    // 14. Чемпион НКП
    const nkpRes = executeSmartShowSearch('как получить титул чемпион нкп чк')
    expect(nkpRes.matchedDirectAnswer?.id).toBe('show-club-ch')
    expect(nkpRes.matchedSectionIds.has('sec-show-career-titles')).toBe(true)

    // 15. Словарь сокращений
    const abbrRes = executeSmartShowSearch('что значит cw bob bos big bis')
    expect(abbrRes.matchedDirectAnswer?.id).toBe('show-abbreviations')
    expect(abbrRes.matchedSectionIds.has('sec-show-abbr')).toBe(true)
  })
})
