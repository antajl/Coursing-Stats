/**
 * Интеллектуальный поисковый движок для справочника соревнований CoursingStats.
 *
 * Возможности:
 * 1. Автоматическая смена раскладки клавиатуры (QWERTY ↔ ЙЦУКЕН: "rdjhev" → "кворум", "сасл" → "cacl").
 * 2. Русская и английская лемматизация / стемминг (нормализация падежей, чисел и окончаний).
 * 3. Нечёткий поиск с устойчивостью к опечаткам (Damerau-Levenshtein distance ≤ 2).
 * 4. Фильтрация кинологических стоп-слов и разговорного шума («как получить», «титул», «по», «для»).
 * 5. Извлечение семантических N-грамм и коллокаций («гранд чемпион», «рабочим качествам», «беговой допуск»).
 * 6. Детектор естественных интентов (Conversational Intent Matcher) для сложных многословных фраз.
 * 7. Взвешивание специфичности терминов (Anchor Salience Boost): якори («гранд», «кворум») доминируют над общими словами.
 * 8. 15 готовых прямых ответов (Direct Answer Snippets) по всем аспектам состязаний.
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
import { RUSSIAN_ENDINGS_REGEX, stemWord } from '../../lib/stemmer'
export { RUSSIAN_ENDINGS_REGEX, stemWord }

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

// 5. Стоп-слова и разговорные связки в русскоязычных поисковых запросах
export const RUSSIAN_STOP_WORDS = new Set<string>([
  // Вопросительные частицы и местоимения
  'как', 'что', 'где', 'куда', 'откуда', 'когда', 'почему', 'зачем', 'кто', 'чем',
  'какой', 'какая', 'какое', 'какие', 'каком', 'каких', 'какому', 'какую', 'каким',
  'сколько', 'скольки', 'со', 'до', 'при',
  // Предлоги и союзы
  'в', 'во', 'на', 'с', 'из', 'для', 'от', 'к', 'ко', 'у', 'о', 'об', 'обо',
  'по', 'без', 'через', 'над', 'под', 'за', 'и', 'а', 'но', 'или', 'да',
  'ли', 'же', 'то', 'бы', 'вот', 'если', 'чтобы', 'только', 'хоть', 'хотя',
  // Местоимения
  'мне', 'нам', 'вам', 'им', 'его', 'ее', 'их', 'мой', 'твой', 'наш', 'ваш',
  'себя', 'себе', 'собой', 'это', 'эта', 'этот', 'эти', 'этом', 'этих', 'тому',
  // Наречия-усилители и вводные слова
  'абсолютно', 'совсем', 'очень', 'просто', 'точно', 'действительно',
  // Разговорные связки и общие глаголы-запросы
  'получить', 'получать', 'получение', 'получения', 'получению', 'получив',
  'стать', 'становится', 'делать', 'сделать', 'быть', 'является', 'являются',
  'нужно', 'надо', 'можно', 'нельзя', 'хочу', 'хотим',
  'подскажи', 'подскажите', 'расскажи', 'расскажите', 'скажи', 'скажите',
  'объясни', 'объясните', 'узнать', 'пожалуйста', 'спасибо',
  // Размытый кинологический шум (при наличии более специфичных терминов)
  'титул', 'титула', 'титулы', 'титулу', 'титулом', 'титулах', 'титулов',
  'собака', 'собаке', 'собаки', 'собаку', 'собакой', 'собакам', 'собаках',
  'правило', 'правила', 'правилу', 'правилом', 'правилах', 'правилам',
])

/** Извлекает ключевые значимые токены, отсеивая стоп-слова */
export function extractSalientTokens(text: string): {
  allTokens: string[]
  salientTokens: string[]
} {
  const allTokens = text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .split(/[\s,.;:!?/\\—–\-()"]+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2)

  const salientTokens = allTokens.filter((token) => !RUSSIAN_STOP_WORDS.has(token))
  return {
    allTokens,
    salientTokens: salientTokens.length > 0 ? salientTokens : allTokens,
  }
}

// 6. Проверка нечёткого совпадения одного слова (word-to-word)
export function isFuzzyWordMatch(queryWord: string, targetWord: string): boolean {
  const q = queryWord.toLowerCase().replace(/ё/g, 'е').trim()
  const t = targetWord.toLowerCase().replace(/ё/g, 'е').trim()

  if (q === t) return true

  // Проверка по общему префиксу для длинных слов (от 4 символов)
  if (q.length >= 4 && t.length >= 4 && (t.startsWith(q) || q.startsWith(t))) {
    return true
  }

  // Проверка по стеммингу
  const stemQ = stemWord(q)
  const stemT = stemWord(t)
  if (stemQ.length >= 3 && stemT.length >= 3 && (stemT.startsWith(stemQ) || stemQ.startsWith(stemT))) {
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

/** Проверяет совпадение многословной фразы / коллокации в запросе с поддержкой свободного порядка */
export function isPhraseMatch(query: string, phrase: string): boolean {
  const q = query.toLowerCase().replace(/ё/g, 'е').trim()
  const p = phrase.toLowerCase().replace(/ё/g, 'е').trim()

  if (q.includes(p)) return true

  const pWords = p.split(/\s+/).filter(Boolean)
  if (pWords.length <= 1) return false

  const pStems = pWords.map(stemWord)
  const qWords = q.split(/[\s,.;:!?/\\—–\-()"]+/).filter(Boolean)
  const qStems = qWords.map(stemWord)

  // 1. Проверка прямого последовательного порядка стеммов
  let pIdx = 0
  for (let i = 0; i < qStems.length; i += 1) {
    if (qStems[i] === pStems[pIdx] || isFuzzyWordMatch(qWords[i], pWords[pIdx])) {
      pIdx += 1
      if (pIdx === pStems.length) return true
    }
  }

  // 2. Для двухсловных коллокаций: если оба стемма присутствуют рядом (окно <= 3 слов)
  if (pStems.length === 2) {
    const idx0 = qStems.findIndex((s, i) => s === pStems[0] || isFuzzyWordMatch(qWords[i], pWords[0]))
    const idx1 = qStems.findIndex((s, i) => s === pStems[1] || isFuzzyWordMatch(qWords[i], pWords[1]))
    if (idx0 !== -1 && idx1 !== -1 && Math.abs(idx0 - idx1) <= 3) {
      return true
    }
  }

  return false
}

// 7. База смысловых интентов (вопросов) и готовых прямых ответов (Direct Answer Snippets)
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
      'возраст', 'со скольки', 'сколько месяцев', 'в каком возрасте', 'когда можно',
      'щенок', 'щенки', 'юниор', 'ветеран', 'предельный возраст', 'со скольки месяцев',
      'с какого возраста', 'минимальный возраст',
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
    title: 'Кворум участников и разделение забегов по полу',
    triggerKeywords: [
      'кворум', 'кворума', 'кворуме', 'сколько собак', 'минимум собак', 'мало участников',
      'одна собака', 'две собаки', 'раздельно', 'по полу', 'кобели и суки', 'микс', 'смешанный',
      'сколько нужно собак', 'кворум породы', 'сколько собак должно быть',
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
      'переход', 'второе место', 'серебро', 'вторая собака', 'почему дали cacl',
      'чемпион выиграл', 'r.cacl', 'р.сасл', 'переход сертификата', 'r-cacl', 'rcacl',
      'почему собаке на втором месте отдали cacl', 'кому переходит cacl',
      'ghj[jl',
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
      'равенство', 'кто победил', 'кто выше', 'равенство сумм', 'ничейный результат',
      'как судьи определяют победителя если баллы абсолютно одинаковые',
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
      'намордник', 'намордники', 'попона', 'попоны', 'жилетка', 'красная', 'белая', 'синяя',
      'черная', 'желтая', 'полосатая', 'экипировка', 'номер попоны', 'какой намордник', 'нужен ли намордник',
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
      'схема', 'схемы', 'нч рк', 'национальный чемпион', 'как закрыть нч',
      'набор сертификатов', 'сколько cacl', '5 регионов', 'субъекты рф',
      'схема 1', 'схема 2', 'схема 3', 'схема 4', 'схема 5', 'схема 6', '4 судьи',
      'национальный чемпион по рабочим качествам', 'титул нч рк',
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
      'беговой допуск', 'одиночный пуск', 'парный пуск', 'первый старт', 'сдача допуска',
      'как получить беговой допуск', 'где сдать беговой допуск',
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
      'баллы вс', 'знак вс', 'квалификационная норма',
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
  {
    id: 'disciplines-diff',
    title: 'Разница между курсингом и бегами борзых (рейсингом)',
    triggerKeywords: [
      'курсинг и бега', 'разница', 'отличие', 'чем отличается курсинг', 'курсинг vs бега',
      'поле или трек', 'длина трассы', 'дистанция', 'песчаный овал', 'стартовые боксы',
      'в чем разница курсинг и бега',
      'ghfdbkf',
    ],
    shortAnswer:
      'Две официальные дисциплины с принципиально разными правилами и судейством:',
    bulletPoints: [
      'Курсинг (КБ / LC): открытое поле с естественным рельефом, трасса 400–1000 м с резкими поворотами («зигзагами»). Старт из рук хэндлера. Судьи оценивают 5 охотничьих качеств (до 100 баллов). Важны маневренность и интеллект.',
      'Бега по кругу (ББ / TR / Рейсинг): замкнутый песчаный трек 250–500 м. Старт из 6-местных боксов. Решают секундомер и фотофиниш по кончику носа.',
      'Сертификаты раздельны: CACL (КБ) не равен CACL (ББ), а Чемпион России разыгрывается отдельно по каждой дисциплине.',
    ],
    officialRef: 'Правила РКФ по бегам и курсингу борзых, разд. I, VI, VII',
    targetSectionId: 'sec-disciplines',
  },
  {
    id: 'judging-5-criteria',
    title: '5 критериев судейства в курсинге (до 100 баллов у судьи)',
    triggerKeywords: [
      '5 критериев', 'как судят', 'за что баллы', 'максимальный балл', '100 баллов', '20 баллов',
      'маневренность', 'скорость', 'резвость', 'выносливость', 'преследование', 'энтузиазм',
      'охотничий азарт', 'критерии оценки', 'пять критериев', 'за что судьи ставят баллы',
    ],
    shortAnswer:
      'В курсинге каждый судья оценивает забег по 5 нормативным критериям FCI/РКФ (до 20 баллов каждый):',
    bulletPoints: [
      '1. Маневренность (Agility, до 20 б.) — реакция на резкие виражи приманки без заносов и срезок (приоритет №1 при ничьей).',
      '2. Скорость / Резвость (Speed, до 20 б.) — взрывной разгон на старте и настигание зайца на прямых (приоритет №2).',
      '3. Выносливость (Endurance, до 20 б.) — сохранение темпа до конца трассы длиной до 1000 м (приоритет №3).',
      '4. Преследование / Азарт (Follow-up, до 20 б.) — непрерывный зрительный контакт с приманкой без отвлечений (приоритет №4).',
      '5. Энтузиазм (Enthusiasm, до 20 б.) — охотничья страсть и напор при преодолении неровностей грунта (приоритет №5).',
    ],
    officialRef: 'Правила курсинга РКФ, разд. VII · Критерии оценки',
    targetSectionId: 'sec-judging',
  },
  {
    id: 'ch-rus-annual',
    title: 'Титул «Чемпион России по рабочим качествам» (ЧР РК)',
    triggerKeywords: [
      'чемпион россии', 'чр рк', 'чр', 'чр рк кб', 'чр рк бб',
      'чемпион россии по рабочим качествам', 'титул чемпиона россии',
      'главный чемпионат', 'главный старт года', 'норматив 75%', '112.5 баллов', 'победа на чемпионате россии',
      'как получить чемпиона россии',
    ],
    shortAnswer:
      'Высший ежегодный соревновательный титул страны:',
    bulletPoints: [
      'Разыгрывается строго 1 раз в год на главном всероссийском Чемпионате России по курсингу или бегам.',
      'Присуждается исключительно за 1-е место в породе (или в поле) при выполнении квалификационной нормы не менее 75% баллов (от 112.5 б. в курсинге).',
      'Важно: с 15.12.2022 набором сертификатов CACL этот титул больше не оформляется (вместо него выдаётся НЧ РК).',
    ],
    officialRef: 'Положение РКФ о порядке присвоения титулов по состязаниям, п. 3.2.1',
    targetSectionId: 'sec-hierarchy',
  },
  {
    id: 'intl-titles-fci',
    title: 'Международные титулы FCI: C.I.C., C.I.B.P. и CACIL',
    triggerKeywords: [
      'cacil', 'сасил', 'cic', 'cibp', 'cib', 'интерчемпион', 'международный чемпион',
      'за границей', 'зарубежные состязания', 'бельгия fci', 'интерчемпион по бегам',
    ],
    shortAnswer:
      'Высшие международные звания Всемирной кинологической федерации (FCI):',
    bulletPoints: [
      'C.I.C. (Champion International de Course) — чисто спортивный чемпион: 2 × CACIL в 2 разных странах с интервалом от 1 года + оценка «очень хорошо» на выставке CACIB во взрослом классе.',
      'C.I.B.P. (Champion International de Beauté et Performance) — высший абсолют FCI: 2 × CACIB на выставках за рубежом + 2 × CACIL на состязаниях в 2 разных странах.',
      'C.I.B. — чисто выставочный титул по красоте (собака не обязана бегать).',
    ],
    officialRef: 'Список титулов РКФ, разд. 1.2 · Регламент состязаний борзых FCI',
    targetSectionId: 'sec-hierarchy',
  },
  {
    id: 'disqualifications-rules',
    title: 'Дисквалификации, сход и технические статусы (DNS, DNF, DISQ)',
    triggerKeywords: [
      'дисквал', 'дисквалификация', 'драка', 'агрессия', 'помеха', 'подрезал',
      'dns', 'dnf', 'inj', 'disq', 'сняли', 'травма', 'неявка', 'на сколько дисквалифицируют',
      'бан на сезон', 'дисквалификация за драку',
    ],
    shortAnswer:
      'Официальные статусы протоколов и строгие правила безопасности участников:',
    bulletPoints: [
      'DNS (Did Not Start) — неявка на старт; DNF (Did Not Finish) — сход с дистанции; INJ (Injured) — снята судьёй или ветеринаром по травме.',
      'DISQ (Disqualified) — дисквалификация за драку, агрессию к собаке-напарнику или намеренную помеху бегу.',
      'Накопительная система РКФ на сезон: 1-я дисквалификация — предупреждение; 2-я — отстранение от состязаний на 4 недели; 3-я — отстранение на 8 недель; 4-я — дисквалификация до конца текущего бегового сезона.',
    ],
    officialRef: 'Правила проведения состязаний по курсингу борзых РКФ, разд. VII · Дисквалификации',
    targetSectionId: 'sec-abbr',
  },
  {
    id: 'grand-absolute-titles',
    title: 'Гранд чемпион (ГЧР РК) и Абсолютный чемпион (АЧР / АЧК)',
    triggerKeywords: [
      'гчр рк', 'гчр', 'гранд чемпион', 'гранд чемпион россии',
      'гранд чемпион по рабочим качествам', 'титул гранд чемпион',
      'как получить титул гранд чемпион по рабочим качествам',
      'как получить гранд чемпиона', 'как стать гранд чемпионом',
      'ачр', 'ачк', 'абсолютный чемпион', 'мультиспорт',
      'шоу плюс спорт', 'выставки и спорт', 'чемпион нкп', 'клуб породы',
    ],
    shortAnswer:
      'Элитные кумулятивные звания за объединение дисциплин и направлений:',
    bulletPoints: [
      'ГЧР РК (Гранд чемпион России по рабочим качествам) — оформляется при наличии двух оформленных дипломов ЧР РК по 2 разным видам состязаний (курсинг + круговой трек).',
      'АЧР (Абсолютный чемпион России) — национальная вершина: диплом «Гранд чемпион России» (ГЧР) по выставкам + диплом Чемпиона или Национального чемпиона (ЧР РК / НЧ РК) по спорту.',
      'АЧК (Абсолютный чемпион НКП) — породная вершина: диплом «Чемпион НКП» по выставкам + диплом победителя состязаний Национального клуба породы.',
    ],
    officialRef: 'Положение о титулах РКФ, п. 1 · Положение о порядке присвоения титулов, п. 3.3.2',
    targetSectionId: 'sec-hierarchy',
  },
  {
    id: 'round2-barrier',
    title: 'Барьер допуска ко 2-му кругу состязаний (< 50% баллов)',
    triggerKeywords: [
      'барьер 2 круга', 'барьер второго круга', '50%', 'менее 50%', 'сняли после первого круга',
      'почему не допустили ко второму забегу', 'не допущен', 'порог первого круга',
    ],
    shortAnswer:
      'Строгий квалификационный фильтр после первого забега состязаний:',
    bulletPoints: [
      'По Правилам курсинга РКФ (п. 7.4.1.3) собака, набравшая в 1-м круге менее 50% от максимального количества баллов, категорически отстраняется от состязаний.',
      'Она не допускается ко второму забегу независимо от занятого места в паре.',
      'Это исключает участие физически неподготовленных или потерявших интерес к приманке собак в решающих финальных кругах.',
    ],
    officialRef: 'Правила состязаний по курсингу борзых РКФ, п. 7.4.1.3',
    targetSectionId: 'sec-requirements',
  },
] as const

// 8. Детектор естественных интентов (Conversational Intent Matcher)
export function detectConversationalIntent(query: string): string | null {
  const q = query.toLowerCase().replace(/ё/g, 'е')

  // 1. Гранд чемпион (ГЧР РК) и Абсолютный чемпион (АЧР / АЧК)
  if (/(гранд\s*чемпион|гчр|титул.*гранд|как\s+получить\s+.*гранд|как\s+стать\s+.*гранд)/i.test(q)) {
    return 'grand-absolute-titles'
  }
  if (/(абсолютн[а-яёa-z]*\s*чемпион|ачр|ачк|шоу\s*плюс\s*спорт)/i.test(q)) {
    return 'grand-absolute-titles'
  }

  // 2. Схемы набора НЧ РК
  if (/(национальн[а-яёa-z]*\s*чемпион|нч\s*рк|схем[а-яёa-z]*\s*(набора|закрытия|1|2|3|4|5|6)|как\s+закрыть\s+нч|5\s+регион)/i.test(q)) {
    return 'nch-schemes'
  }

  // 3. Чемпион России (ЧР РК) — только главный турнир года
  if (/(чемпион[а-яёa-z]*\s*росси|чр\s*рк|главн[а-яёa-z]*\s*чемпионат)/i.test(q) && !/гранд|национальн/i.test(q)) {
    return 'ch-rus-annual'
  }

  // 4. Беговой допуск и квалификационная книжка
  if (/(как\s+получить|где\s+сдать|как\s+сдать|что\s+нужно\s+для|сдача)\s*.*(допуск|книжк|лицензи|паспорт)/i.test(q) || /(бегов[а-яёa-z]*\s+допуск|квалификационн[а-яёa-z]*\s+книжк)/i.test(q)) {
    return 'license-booklet'
  }

  // 5. Возрастные рамки
  if (/(со\s+скольк|с\s+какого\s+возраст|в\s+каком\s+возраст|до\s+скольк|минимальн[а-яёa-z]*\s+возраст|когда\s+можно\s+бегать)/i.test(q)) {
    return 'age-rules'
  }

  // 6. Переход R.CACL -> CACL
  if (/(почему|как)\s*.*(втор[а-яёa-z]*\s+мест|серебр)\s*.*(cacl|сасл|сертификат)|переход[а-яёa-z]*\s*(cacl|сасл|сертификат)|r[\s.-]?cacl/i.test(q)) {
    return 'rcacl-transfer'
  }

  // 7. Ничья и тай-брейк
  if (/(равн[а-яёa-z]*|одинаков[а-яёa-z]*)\s+([а-яёa-z]+\s+)?балл|балл[а-яёa-z]*\s+([а-яёa-z]+\s+)?(равн[а-яёa-z]*|одинаков[а-яёa-z]*)|ничь[а-яёa-z]*|тай[\s-]?брейк|кто\s+победил\s+при\s+равенстве/i.test(q)) {
    return 'tie-break'
  }

  // 8. Кворум и разделение по полу
  if (/(скольк[а-яёa-z]*|минимум|мало)\s+собак\s*.*(для\s+cacl|кворум|на\s+старт)|кворум/i.test(q)) {
    return 'quorum-rules'
  }

  // 9. Намордники и цвета попон
  if (/(какой\s+намордник|нужен\s+ли\s+намордник|цвет[а-яёa-z]*\s+попон|номер[а-яёa-z]*\s+попон|экипировк)/i.test(q)) {
    return 'muzzles-blankets'
  }

  // 10. 5 критериев судейства
  if (/(5\s+критериев|пять\s+критериев|за\s+что\s+судьи\s+ставят\s+баллы|как\s+оценивают\s+курсинг|критери[а-яёa-z]*\s+оценк)/i.test(q)) {
    return 'judging-5-criteria'
  }

  // 11. Разница курсинг vs бега
  if (/(в\s+чем\s+разниц[а-яёa-z]*|чем\s+отличается)\s*.*(курсинг|бега|рейсинг)|курсинг\s*(vs|или|и)\s*бега/i.test(q)) {
    return 'disciplines-diff'
  }

  // 12. Отметка ВС (Высшая квалификация)
  if (/(что\s+такое|знак|отметка|норматив)\s*(вс|cc)|норма\s+вс|66\.7%/i.test(q)) {
    return 'vc-norm'
  }

  // 13. Барьер 2-го круга (< 50% баллов)
  if (/(барьер|порог|почему\s+сняли|почему\s+не\s+допустили)\s*.*(втор[а-яёa-z]*\s+круг|50%)/i.test(q)) {
    return 'round2-barrier'
  }

  // 14. Международные титулы FCI
  if (/(международн[а-яёa-z]*\s+чемпион|интерчемпион|как\s+получить\s+cacil|титул\s+cic|титул\s+cibp|cacil)/i.test(q)) {
    return 'intl-titles-fci'
  }

  // 15. Дисквалификации
  if (/(дисквалификац|за\s+что\s+снимают|драка|на\s+сколько\s+банят|disq)/i.test(q)) {
    return 'disqualifications-rules'
  }

  return null
}

// 9. Специфичные семантические якоря (высокий вес IDF, отсекающий ложные совпадения)
const ANCHOR_TERMS: Record<string, { answerId: string; sectionId: string; weight: number }> = {
  гранд: { answerId: 'grand-absolute-titles', sectionId: 'sec-hierarchy', weight: 450 },
  гчр: { answerId: 'grand-absolute-titles', sectionId: 'sec-hierarchy', weight: 450 },
  ачр: { answerId: 'grand-absolute-titles', sectionId: 'sec-hierarchy', weight: 450 },
  ачк: { answerId: 'grand-absolute-titles', sectionId: 'sec-hierarchy', weight: 450 },
  кворум: { answerId: 'quorum-rules', sectionId: 'sec-requirements', weight: 400 },
  намордник: { answerId: 'muzzles-blankets', sectionId: 'sec-requirements', weight: 400 },
  попон: { answerId: 'muzzles-blankets', sectionId: 'sec-requirements', weight: 400 },
  тайбрейк: { answerId: 'tie-break', sectionId: 'sec-judging', weight: 400 },
  ничь: { answerId: 'tie-break', sectionId: 'sec-judging', weight: 400 },
  допуск: { answerId: 'license-booklet', sectionId: 'sec-roadmap', weight: 400 },
  книжк: { answerId: 'license-booklet', sectionId: 'sec-roadmap', weight: 400 },
  дисквалифик: { answerId: 'disqualifications-rules', sectionId: 'sec-abbr', weight: 400 },
  маневренн: { answerId: 'judging-5-criteria', sectionId: 'sec-judging', weight: 350 },
  энтузиазм: { answerId: 'judging-5-criteria', sectionId: 'sec-judging', weight: 350 },
}

// 10. Проверка совпадения поискового запроса с элементом
export type SearchMatchResult = {
  score: number
  matchedDirectAnswer: DirectAnswer | null
  matchedSectionIds: Set<string>
  matchedTokens: Set<string>
}

/** Выполняет комплексный интеллектуальный поиск с обработкой раскладок, опечаток, стоп-слов и интентов */
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

  // Расширяем запрос альтернативными формами (раскладка и фонетика)
  const queryVariants = new Set<string>([qTrim])

  const convertedLayout = convertKeyboardLayout(qTrim)
  if (convertedLayout && convertedLayout !== qTrim) {
    queryVariants.add(convertedLayout)
  }

  if (PHONETIC_ALIASES[qTrim]) {
    queryVariants.add(PHONETIC_ALIASES[qTrim])
  }

  // Извлекаем значимые токены (без шума и стоп-слов)
  const allSearchWords: string[] = []
  const salientSearchWords: string[] = []

  for (const v of queryVariants) {
    const { allTokens, salientTokens } = extractSalientTokens(v)
    allTokens.forEach((t) => allSearchWords.push(t))
    salientTokens.forEach((t) => salientSearchWords.push(t))
  }

  const effectiveSearchWords = salientSearchWords.length > 0 ? salientSearchWords : allSearchWords

  const matchedSectionIds = new Set<string>()
  const matchedTokens = new Set<string>()
  let bestDirectAnswer: DirectAnswer | null = null
  let maxAnswerScore = 0

  // 1. Проверяем естественные интенты (Conversational Intent Matcher)
  let intentTargetAnswerId: string | null = null
  for (const qv of queryVariants) {
    const detected = detectConversationalIntent(qv)
    if (detected) {
      intentTargetAnswerId = detected
      break
    }
  }

  // 2. Проверяем семантические якоря (Anchor Terms)
  for (const sw of effectiveSearchWords) {
    const stem = stemWord(sw)
    for (const [anchor, info] of Object.entries(ANCHOR_TERMS)) {
      if (stem.startsWith(anchor) || anchor.startsWith(stem) || isFuzzyWordMatch(sw, anchor)) {
        matchedSectionIds.add(info.sectionId)
        matchedTokens.add(sw)
      }
    }
  }

  // 3. Проверяем прямые смысловые ответы (DIRECT_ANSWERS)
  for (const answer of DIRECT_ANSWERS) {
    let answerScore = 0

    // Бонус за соответствие естественному интенту
    if (intentTargetAnswerId === answer.id) {
      answerScore += 450
      matchedSectionIds.add(answer.targetSectionId)
    }

    // Бонус за семантические якоря
    for (const sw of effectiveSearchWords) {
      const stem = stemWord(sw)
      for (const [anchor, info] of Object.entries(ANCHOR_TERMS)) {
        if (info.answerId === answer.id && (stem.startsWith(anchor) || anchor.startsWith(stem) || isFuzzyWordMatch(sw, anchor))) {
          answerScore += info.weight
        }
      }
    }

    // Сопоставление с triggerKeywords
    for (const kw of answer.triggerKeywords) {
      const isMultiWord = kw.includes(' ')

      if (isMultiWord) {
        // Проверяем фразу целиком
        for (const qv of queryVariants) {
          if (isPhraseMatch(qv, kw)) {
            answerScore += 350
            kw.split(/\s+/).forEach((w) => matchedTokens.add(w))
          }
        }
      } else {
        // Одиночное ключевое слово
        for (const sw of effectiveSearchWords) {
          if (isFuzzyWordMatch(sw, kw)) {
            answerScore += kw === sw ? 120 : 80
            matchedTokens.add(sw)
          }
        }
      }
    }

    if (answerScore > maxAnswerScore) {
      maxAnswerScore = answerScore
      bestDirectAnswer = answer
    }

    if (answerScore >= 70) {
      matchedSectionIds.add(answer.targetSectionId)
    }
  }

  // 4. Общие правила привязки значимых слов к разделам справки
  const sectionKeywords: Record<string, string[]> = {
    'sec-disciplines': ['курсинг', 'бега', 'рейсинг', 'трек', 'овал', 'дисциплина', 'lure', 'track', 'песок', 'разница', 'отличие'],
    'sec-roadmap': ['маршрут', 'шаг', 'допуск', 'книжка', 'тренировка', 'старт', 'щенок', 'возраст', 'паспорт', 'лицензия'],
    'sec-hierarchy': ['титул', 'сертификат', 'cacl', 'cacil', 'r.cacl', 'r.cacil', 'чр рк', 'пкр рк', 'чркф', 'нч рк', 'cic', 'cibp', 'гранд', 'абсолютный', 'чемпион россии'],
    'sec-schemes': ['схема', 'схемы', 'нч рк', 'набор', '5 регионов', 'субъекты', 'закрыть', 'комбинации'],
    'sec-judging': ['судейство', 'судья', 'балл', 'маневренность', 'скорость', 'резвость', 'выносливость', 'преследование', 'энтузиазм', 'тай-брейк', 'ничья', 'критерий', '100 баллов'],
    'sec-requirements': ['кворум', 'норма', 'вс', 'попона', 'попоны', 'намордник', 'экипировка', 'переход', 'дисквалификация', 'возраст', 'барьер'],
    'sec-protocol': ['протокол', 'строка', 'анатомия', 'ячейка', 'каталог', 'сумма', 'итог', 'барьер', 'колонка', 'как читать протокол'],
    'sec-abbr': ['сокращение', 'аббревиатура', 'словарь', 'dns', 'dnf', 'inj', 'disq', 'гск', 'bob', 'bos'],
    'sec-sources': ['регламент', 'правила', 'положение', 'ркф', 'fci', 'документ', 'первоисточник', 'pdf'],
    'sec-faqs': ['faq', 'вопрос', 'ответ', 'почему'],
  }

  for (const [secId, kws] of Object.entries(sectionKeywords)) {
    for (const kw of kws) {
      for (const sw of effectiveSearchWords) {
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
