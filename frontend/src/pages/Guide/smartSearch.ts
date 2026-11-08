/**
 * Интеллектуальный поисковый движок для справочника соревнований CoursingStats.
 *
 * Возможности:
 * 1. Автоматическая смена раскладки клавиатуры (QWERTY ↔ ЙЦУКЕН: "rdjhev" → "кворум", "сасл" → "cacl").
 * 2. Русская и английская лемматизация / стемминг (нормализация падежей, чисел и окончаний).
 * 3. Нечёткий поиск с устойчивостью к опечаткам (Damerau-Levenshtein distance ≤ 2).
 * 4. База смысловых синонимов и естественных вопросов («со скольки месяцев», «почему второе место», «ничья»).
 * 5. Быстрые готовые ответы (Direct Answer Snippets) по ключевым правилам состязаний.
 */

// 1. Таблица переключения раскладки клавиатуры QWERTY ↔ ЙЦУКЕН
const EN_TO_RU_KEYBOARD: Record<string, string> = {
  q: 'й', w: 'ц', e: 'у', r: 'к', t: 'е', y: 'н', u: 'г', i: 'ш', o: 'щ', p: 'з',
  '[': 'х', ']': 'ъ', a: 'ф', s: 'ы', d: 'в', f: 'а', g: 'п', h: 'р', j: 'о',
  k: 'л', l: 'д', ';': 'ж', "'": 'э', z: 'я', x: 'ч', c: 'с', v: 'м', b: 'и',
  n: 'т', m: 'ь', ',': 'б', '.': 'ю',
}

const RU_TO_EN_KEYBOARD: Record<string, string> = Object.fromEntries(
  Object.entries(EN_TO_RU_KEYBOARD).map(([en, ru]) => [ru, en])
)

/** Конвертирует строку из одной раскладки в другую (например, "rdjhev" → "кворум"). */
export function convertKeyboardLayout(text: string): string {
  const ruConverted = [...text.toLowerCase()].map((ch) => EN_TO_RU_KEYBOARD[ch] ?? ch).join('')
  if (ruConverted !== text.toLowerCase() && /[а-яё]/.test(ruConverted)) {
    return ruConverted
  }
  const enConverted = [...text.toLowerCase()].map((ch) => RU_TO_EN_KEYBOARD[ch] ?? ch).join('')
  return enConverted
}

// 2. Фонетическое сопоставление спортивных аббревиатур (сасл ↔ cacl, сасил ↔ cacil)
const PHONETIC_ALIASES: Record<string, string> = {
  сасл: 'cacl',
  какл: 'cacl',
  рсасл: 'r.cacl',
  'р.сасл': 'r.cacl',
  сасил: 'cacil',
  какил: 'cacil',
  рсасил: 'r.cacil',
  'р.сасил': 'r.cacil',
  сибп: 'c.i.b.p.',
  сиб: 'c.i.b.',
  сик: 'c.i.c.',
  нч: 'нч рк',
  чр: 'чр рк',
  пкр: 'пкр рк',
  чркф: 'чркф рк',
  гчр: 'гчр рк',
  ачр: 'ачр',
  ачк: 'ачк',
}

// 3. Упрощённый русский стеммер (удаление словоизменительных окончаний)
const RUSSIAN_ENDINGS_REGEX = /(?:остями|естями|остям|естям|остях|естях|остей|естей|ости|ести|ость|есть|ому|ему|ыми|ими|ого|его|ами|ями|ной|ным|ных|ную|ные|ный|ное|ная|ов|ев|ей|ам|ям|ах|ях|ом|ем|ой|ей|ую|юю|ий|ый|ой|ая|яя|ое|ее|ые|ие|ть|ти|ся|сь|ет|ут|ют|ит|ат|ят|ал|ла|ли|ло|а|я|у|ю|е|о|и|ы|ь)$/i

export function stemWord(word: string): string {
  const clean = word.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]/gi, '')
  if (clean.length <= 3) return clean
  let stemmed = clean.replace(RUSSIAN_ENDINGS_REGEX, '')
  if (stemmed.endsWith('тн') || stemmed.endsWith('сн')) {
    stemmed = stemmed.slice(0, -1)
  }
  return stemmed
}

// 4. Расстояние Дамерау-Левенштейна (для поиска опечаток)
export function damerauLevenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length

  const la = a.length
  const lb = b.length
  const d: number[][] = Array.from({ length: la + 1 }, () => Array(lb + 1).fill(0))

  for (let i = 0; i <= la; i += 1) d[i][0] = i
  for (let j = 0; j <= lb; j += 1) d[0][j] = j

  for (let i = 1; i <= la; i += 1) {
    for (let j = 1; j <= lb; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(
        d[i - 1][j] + 1,       // удаление
        d[i][j - 1] + 1,       // вставка
        d[i - 1][j - 1] + cost // замена
      )
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1) // перестановка
      }
    }
  }

  return d[la][lb]
}

// 5. Проверка нечёткого совпадения слова с учётом опечаток и стемминга
export function isFuzzyWordMatch(queryWord: string, targetWord: string): boolean {
  const q = queryWord.toLowerCase().replace(/ё/g, 'е')
  const t = targetWord.toLowerCase().replace(/ё/g, 'е')

  if (q === t) return true
  if (t.includes(q) && q.length >= 3) return true

  // Проверка по стеммингу
  const stemQ = stemWord(q)
  const stemT = stemWord(t)
  if (stemQ.length >= 3 && (stemT.startsWith(stemQ) || stemQ.startsWith(stemT))) {
    return true
  }

  // Проверка по опечаткам (допустима 1 опечатка при длине от 4 символов, 2 опечатки от 7)
  const maxDistance = q.length >= 7 ? 2 : q.length >= 4 ? 1 : 0
  if (maxDistance > 0 && Math.abs(q.length - t.length) <= maxDistance) {
    if (damerauLevenshtein(q, t) <= maxDistance) {
      return true
    }
  }

  return false
}

// 6. База смысловых интентов (вопросов) и готовых прямых ответов (Direct Answer Snippets)
export type DirectAnswer = {
  id: string
  title: string
  triggerKeywords: readonly string[]
  shortAnswer: string
  bulletPoints: readonly string[]
  officialRef: string
  targetSectionId: string
}

export const DIRECT_ANSWERS: readonly DirectAnswer[] = [
  {
    id: 'age-rules',
    title: 'Возрастные ограничения в спорте борзых (РКФ)',
    triggerKeywords: [
      'возраст', 'возрасте', 'возрастной', 'возрастом', 'со скольки', 'сколько месяцев',
      'когда можно', 'щенок', 'щенка', 'щенком', 'юниор', 'ветеран', 'до скольки', 'предел',
      'djphfcn',
    ],
    shortAnswer:
      'Официальные правила РКФ строго регламентируют минимальный и предельный возраст допуска собаки к тренировкам и состязаниям:',
    bulletPoints: [
      'Тренировки за механическим зайцем: с 9 месяцев (для всех пород).',
      'Сдача бегового допуска (квалификационная книжка): малые породы (уиппет, левретка, басенджи) — с 12 месяцев; крупные борзые (РПБ, грейхаунд, салюки и др.) — с 15 месяцев.',
      'Сертификатные состязания CACL / CACIL: малые породы — с 15 месяцев; крупные борзые — с 18 месяцев.',
      'Класс ветеранов: с 6 лет (по желанию владельца).',
      'Предельный возраст: до конца календарного года, в котором собаке исполняется 8 лет.',
    ],
    officialRef: 'Правила проведения состязаний по курсингу и бегам борзых РКФ, разд. II',
    targetSectionId: 'sec-requirements',
  },
  {
    id: 'quorum-rules',
    title: 'Кворум участников и разделение по полу',
    triggerKeywords: [
      'кворум', 'кворума', 'кворуме', 'кворумом', 'сколько собак', 'минимум собак', 'мало участников',
      'одна собака', 'две собаки', 'раздельно', 'по полу', 'кобели и суки', 'микс', 'смешанный',
      'rdjhev',
    ],
    shortAnswer:
      'Кворум — минимальное число стартовавших собак породы, необходимое для присуждения сертификатов CACL и CACIL:',
    bulletPoints: [
      'Минимум на старте: не менее 3 стартовавших собак одной породы.',
      'Разделение по полу: если стартует от 3 кобелей и от 3 сук, судьи обязаны разделить забеги и разыграть 2 раздельных CACL.',
      'Смешанный забег (микс): если кворума по полу нет, проводится общий забег кобелей и сук за 1 сертификат CACL.',
      'Без кворума (1–2 собаки): состязания проводятся, место присуждается, но сертификаты CACL/CACIL не выдаются даже за 1-е место.',
    ],
    officialRef: 'Правила курсинга РКФ, п. 4.3.2.1–4.3.2.3',
    targetSectionId: 'sec-requirements',
  },
  {
    id: 'rcacl-transfer',
    title: 'Правило перехода сертификата (R.CACL → CACL)',
    triggerKeywords: [
      'переход', 'переходит', 'перейдет', 'второе место', 'второму месту', 'серебро',
      'вторая собака', 'почему дали cacl', 'чемпион выиграл', 'r.cacl', 'р.сасл',
      'ghj[jl', 'r-cacl',
    ],
    shortAnswer:
      'Сертификат кандидата в Чемпионы России (CACL) официально переходит обладателю 2-го места:',
    bulletPoints: [
      'Условие: собака на 1-м месте на момент старта уже имеет официально оформленный титул Чемпиона России (ЧР РК) или Национального чемпиона (НЧ РК) по данной дисциплине.',
      'Требование к собаке на 2-м месте: должна набрать норматив ВС (не менее 66,7% баллов) и в породе должен соблюдаться кворум от 3 собак.',
      'Аналогично для CACIL: резервный R.CACIL переходит в полноценный CACIL при победе закрытого Интернационального чемпиона FCI (C.I.C. или C.I.B.P.).',
    ],
    officialRef: 'Положение РКФ о титулах по рабочим качествам, разд. 3.4',
    targetSectionId: 'sec-hierarchy',
  },
  {
    id: 'tie-break',
    title: 'Как разрешается ничья в курсинге (Тай-брейк)',
    triggerKeywords: [
      'тай-брейк', 'тайбрейк', 'ничья', 'одинаково', 'поровну', 'равные баллы', 'одинаковые баллы',
      'равенство', 'кто победил', 'кто выше', 'одинаковая сумма',
      'nfq-ihtqr', 'nfqihtqr',
    ],
    shortAnswer:
      'Если две собаки набрали одинаковую итоговую сумму баллов за состязание, победитель определяется строго по каскаду:',
    bulletPoints: [
      'Шаг 1: Побеждает собака, набравшая больше баллов во 2-м круге состязаний.',
      'Шаг 2: При равенстве во 2-м круге сравниваются баллы по 5 критериям в строгом приоритете: 1. Маневренность → 2. Резвость → 3. Выносливость → 4. Преследование → 5. Энтузиазм.',
      'Шаг 3: Если и все 5 критериев абсолютно равны — назначается перезабег (run-off) или места разделяются по согласованию с ГСК.',
    ],
    officialRef: 'Правила проведения состязаний по курсингу борзых РКФ, п. 7.4.1.5',
    targetSectionId: 'sec-judging',
  },
  {
    id: 'muzzles-blankets',
    title: 'Беговые намордники и цвета попон',
    triggerKeywords: [
      'намордник', 'намордники', 'намордника', 'наморднике', 'намордником',
      'попона', 'попоны', 'попонах', 'жилетка', 'жилетки', 'красная', 'белая', 'синяя', 'черная', 'желтая',
      'экипировка', 'цвета', 'номер попоны',
      'yfvhlybr', 'gjgjyf',
    ],
    shortAnswer:
      'Безопасность и официальная цветовая идентификация собак на трассе:',
    bulletPoints: [
      'Намордник: строго обязателен безопасный корзинчатый намордник (из проволоки или пластика), позволяющий собаке свободно дышать с открытой пастью и высунутым языком на полном скаку. Глухие кожаные намордники запрещены.',
      'Попона № 1 — Красная (Red): 1-я собака по жеребьёвке в паре (или бокс № 1 на треке).',
      'Попона № 2 — Белая (White): 2-я собака по жеребьёвке в паре (или бокс № 2).',
      'Попона № 3 — Синяя (Blue): 3-я собака забега при тройках в курсинге (или бокс № 3).',
      'Попоны № 4 (Чёрная), № 5 (Жёлтая), № 6 (Полосатая): применяются на трековых бегах.',
    ],
    officialRef: 'Правила состязаний борзых РКФ, разд. III · п. 3.2',
    targetSectionId: 'sec-requirements',
  },
  {
    id: 'nch-schemes',
    title: '6 официальных схем набора титула НЧ РК',
    triggerKeywords: [
      'схема', 'схемы', 'схемам', 'нч рк', 'национальный чемпион', 'как закрыть нч',
      'как стать чемпионом', 'набор сертификатов', 'сколько cacl', '5 регионов', 'субъекты рф',
      'схема 1', 'схема 2', 'схема 3', 'схема 4', 'схема 5', 'схема 6',
      'c[tvf', 'yxt hr',
    ],
    shortAnswer:
      'С 15.12.2022 титул Чемпиона России набором талонов больше не выдаётся. Вместо него оформляется накопительный титул «Национальный чемпион по рабочим качествам» (НЧ РК) по одной из 6 схем:',
    bulletPoints: [
      'Схема 1: ПКР РК + ЧРКФ РК (Победитель Кубка России + Чемпион РКФ у 2 разных судей).',
      'Схема 2: 2 × ПКР РК (дважды Победитель Кубка России у 2 разных судей).',
      'Схема 3: ПКР РК + 2 × CACL (Победитель Кубка + 2 сертификата CACL у 3 разных судей).',
      'Схема 4: 2 × ЧРКФ РК (дважды Чемпион РКФ у 2 разных судей).',
      'Схема 5: ЧРКФ РК + 2 × CACL (Чемпион РКФ + 2 сертификата CACL у 3 разных судей).',
      'Схема 6 (базовая накопительная): 5 × CACL в 5 разных субъектах РФ у 4 разных судей.',
    ],
    officialRef: 'Положение РКФ о порядке присвоения титулов по состязаниям, п. 3.3.1',
    targetSectionId: 'sec-schemes',
  },
  {
    id: 'license-booklet',
    title: 'Беговой допуск и квалификационная книжка РКФ',
    triggerKeywords: [
      'допуск', 'книжка', 'квалификационная книжка', 'беговой паспорт', 'лицензия',
      'как получить допуск', 'одиночный пуск', 'парный пуск', 'первый старт', 'входной билет',
      'ljgenc', 'rybcrf',
    ],
    shortAnswer:
      'Базовый допуск к официальному спорту борзых:',
    bulletPoints: [
      'Без сданного норматива и оформленной книжки собака не допускается ни к одним состязаниям CACL/CACIL.',
      'Одиночный забег: судья оценивает способность преследовать приманку на полной дистанции с азартом и без сходов.',
      'Парный забег: проверка корректного бега в паре строго без драки, помех и агрессии к сопернику.',
      'По результату оформляется постоянная номерная Квалификационная книжка борзой РКФ установленного образца.',
    ],
    officialRef: 'Положение РКФ о квалификационных книжках по бегам и курсингу',
    targetSectionId: 'sec-roadmap',
  },
  {
    id: 'vc-norm',
    title: 'Квалификационная отметка «ВС» (≥ 66,7% баллов)',
    triggerKeywords: [
      'вс', 'норма вс', 'отметка вс', 'что такое вс', '66.7', 'две трети', 'высшая квалификация',
      'сс', 'cc', 'почему не дали cacl', 'первое место без титула',
      'dc', 'cc',
    ],
    shortAnswer:
      '«ВС» (Высшая квалификация РКФ, в старых протоколах «CC» или «+»):',
    bulletPoints: [
      'Норматив: собака обязана набрать не менее 50% баллов в 1-м круге и не менее 66,7% (⅔) от максимума за 2 круга.',
      'Обязательное условие: без отметки ВС сертификаты CACL, CACIL и титулы не присуждаются даже за занятое 1-е место.',
    ],
    officialRef: 'Правила проведения состязаний по курсингу борзых, п. 4.3.4',
    targetSectionId: 'sec-requirements',
  },
] as const

// 7. Проверка совпадения поискового запроса с элементом
export type SearchMatchResult = {
  score: number
  matchedDirectAnswer: DirectAnswer | null
  matchedSectionIds: Set<string>
  matchedTokens: Set<string>
}

/** Выполняет комплексный интеллектуальный поиск с обработкой раскладок, опечаток и синонимов */
export function executeSmartGuideSearch(rawQuery: string): SearchMatchResult {
  const qTrim = rawQuery.trim().toLowerCase().replace(/ё/g, 'е')
  if (!qTrim) {
    return {
      score: 0,
      matchedDirectAnswer: null,
      matchedSectionIds: new Set<string>(),
      matchedTokens: new Set<string>(),
    }
  }

  // Расширяем запрос альтернативными формами:
  const queryVariants = new Set<string>([qTrim])

  // Вариант 1: переключение раскладки клавиатуры (rdjhev → кворум)
  const convertedLayout = convertKeyboardLayout(qTrim)
  if (convertedLayout && convertedLayout !== qTrim) {
    queryVariants.add(convertedLayout)
  }

  // Вариант 2: фонетические алиасы (сасл → cacl)
  if (PHONETIC_ALIASES[qTrim]) {
    queryVariants.add(PHONETIC_ALIASES[qTrim])
  }

  // Извлекаем слова из всех вариантов запроса
  const searchWords: string[] = []
  for (const v of queryVariants) {
    v.split(/[\s,.;:!?/-]+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 2)
      .forEach((w) => searchWords.push(w))
  }

  const matchedSectionIds = new Set<string>()
  const matchedTokens = new Set<string>()
  let bestDirectAnswer: DirectAnswer | null = null
  let maxAnswerScore = 0

  // Проверяем прямые смысловые ответы (DIRECT_ANSWERS)
  for (const answer of DIRECT_ANSWERS) {
    let answerScore = 0
    for (const kw of answer.triggerKeywords) {
      for (const sw of searchWords) {
        if (isFuzzyWordMatch(sw, kw)) {
          answerScore += kw === sw ? 100 : 70
          matchedTokens.add(sw)
        }
      }
      // Проверка на фразу целиком
      for (const qv of queryVariants) {
        if (qv.includes(kw) || kw.includes(qv)) {
          answerScore += 120
        }
      }
    }

    if (answerScore > maxAnswerScore) {
      maxAnswerScore = answerScore
      bestDirectAnswer = answer
    }

    if (answerScore > 50) {
      matchedSectionIds.add(answer.targetSectionId)
    }
  }

  // Общие правила привязки слов к секциям:
  const sectionKeywords: Record<string, string[]> = {
    'sec-disciplines': ['курсинг', 'бега', 'рейсинг', 'трек', 'овал', 'дисциплина', 'lure', 'track'],
    'sec-roadmap': ['маршрут', 'шаг', 'допуск', 'книжка', 'тренировка', 'старт', 'щенок', 'возраст'],
    'sec-hierarchy': ['титул', 'сертификат', 'cacl', 'cacil', 'r.cacl', 'r.cacil', 'чр рк', 'пкр рк', 'чркф', 'нч рк', 'cic', 'cibp', 'гранд', 'абсолютный'],
    'sec-schemes': ['схема', 'схемы', 'схеме', 'нч рк', 'набор', '5 регионов', 'субъекты', 'закрыть'],
    'sec-judging': ['судейство', 'судья', 'балл', 'маневренность', 'скорость', 'резвость', 'выносливость', 'преследование', 'энтузиазм', 'тай-брейк', 'ничья', 'критерий'],
    'sec-requirements': ['кворум', 'норма', 'вс', 'попона', 'попоны', 'намордник', 'экипировка', 'переход', 'дисквалификация', 'возраст'],
    'sec-abbr': ['сокращение', 'аббревиатура', 'словарь', 'dns', 'dnf', 'inj', 'disq', 'гск', 'bob', 'bos'],
    'sec-sources': ['регламент', 'правила', 'положение', 'ркф', 'fci', 'документ', 'первоисточник', 'pdf'],
    'sec-faqs': ['faq', 'вопрос', 'ответ', 'почему', 'как', 'можно ли'],
  }

  for (const [secId, kws] of Object.entries(sectionKeywords)) {
    for (const kw of kws) {
      for (const sw of searchWords) {
        if (isFuzzyWordMatch(sw, kw)) {
          matchedSectionIds.add(secId)
          matchedTokens.add(sw)
        }
      }
    }
  }

  return {
    score: maxAnswerScore,
    matchedDirectAnswer: maxAnswerScore >= 70 ? bestDirectAnswer : null,
    matchedSectionIds,
    matchedTokens,
  }
}
