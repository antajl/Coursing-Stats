/**
 * Интеллектуальный поисковый движок для справочника выставок CoursingStats (/guide/?tab=shows).
 *
 * Возможности:
 * 1. Автоматическая смена раскладки клавиатуры (QWERTY ↔ ЙЦУКЕН: "сфс" → "cac", "ищи" → "bob", "ишы" → "bis").
 * 2. Русская и английская лемматизация / стемминг (нормализация падежей, чисел и окончаний).
 * 3. Нечёткий поиск с устойчивостью к опечаткам (Damerau-Levenshtein distance ≤ 2).
 * 4. Фильтрация выставочных стоп-слов и разговорного шума («как получить», «титул», «по», «для»).
 * 5. Извлечение семантических N-грамм и коллокаций («чемпион россии», «главный ринг», «красная лента»).
 * 6. Детектор естественных интентов (Conversational Intent Matcher) для сложных фраз.
 * 7. Взвешивание специфичности терминов (Anchor Salience Boost): якори («cacib», «ючр», «лента») доминируют над общими словами.
 * 8. 15 готовых прямых ответов (Direct Answer Snippets) по всем аспектам выставок РКФ и FCI.
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

/** Конвертирует строку из одной раскладки в другую (например, "сфс" → "cac"). */
export function convertKeyboardLayout(text: string): string {
  const ruConverted = [...text.toLowerCase()].map((ch) => EN_TO_RU_KEYBOARD[ch] ?? ch).join('')
  if (ruConverted !== text.toLowerCase() && /[а-яё]/.test(ruConverted)) {
    return ruConverted
  }
  const enConverted = [...text.toLowerCase()].map((ch) => RU_TO_EN_KEYBOARD[ch] ?? ch).join('')
  return enConverted
}

// 2. Фонетические и сленговые алиасы выставочных аббревиатур
const SHOW_PHONETIC_ALIASES: Record<string, string> = {
  сас: 'cac',
  как: 'cac',
  рсас: 'r.cac',
  'р.сас': 'r.cac',
  сасиб: 'cacib',
  рсасиб: 'r.cacib',
  'р.сасиб': 'r.cacib',
  юсас: 'jcac',
  всас: 'vcac',
  лпп: 'bob',
  лппп: 'bos',
  боб: 'bob',
  бос: 'bos',
  биг: 'big',
  бис: 'bis',
  св: 'cw',
  чр: 'чемпион россии',
  ючр: 'юный чемпион россии',
  вчр: 'ветеран чемпион россии',
  гчр: 'гранд чемпион россии',
  чркф: 'чемпион ркф',
  ючркф: 'юный чемпион ркф',
  вчркф: 'ветеран чемпион ркф',
  ачр: 'абсолютный чемпион россии',
  чк: 'чемпион нкп',
  кчк: 'кандидат в чемпионы нкп',
  пк: 'победитель клуба',
  сиб: 'c.i.b.',
  сибп: 'c.i.b.p.',
  'c.i.b': 'c.i.b.',
  'c.i.b.p': 'c.i.b.p.',
}

// 3. Упрощённый русский стеммер
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

// 4. Расстояние Дамерау-Левенштейна
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
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      )
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }

  return d[la][lb]
}

// 5. Стоп-слова и разговорные связки в русскоязычных поисковых запросах
export const RUSSIAN_STOP_WORDS = new Set<string>([
  'как', 'что', 'где', 'куда', 'откуда', 'когда', 'почему', 'зачем', 'кто', 'чем',
  'какой', 'какая', 'какое', 'какие', 'каком', 'каких', 'какому', 'какую', 'каким',
  'сколько', 'скольки', 'со', 'до', 'при',
  'в', 'во', 'на', 'с', 'из', 'для', 'от', 'к', 'ко', 'у', 'о', 'об', 'обо',
  'по', 'без', 'через', 'над', 'под', 'за', 'и', 'а', 'но', 'или', 'да',
  'ли', 'же', 'то', 'бы', 'вот', 'если', 'чтобы', 'только', 'хоть', 'хотя',
  'мне', 'нам', 'вам', 'им', 'его', 'ее', 'их', 'мой', 'твой', 'наш', 'ваш',
  'себя', 'себе', 'собой', 'это', 'эта', 'этот', 'эти', 'этом', 'этих', 'тому',
  'абсолютно', 'совсем', 'очень', 'просто', 'точно', 'действительно',
  'получить', 'получать', 'получение', 'получения', 'получению', 'получив',
  'стать', 'становится', 'делать', 'сделать', 'быть', 'является', 'являются',
  'нужно', 'надо', 'можно', 'нельзя', 'хочу', 'хотим',
  'подскажи', 'подскажите', 'расскажи', 'расскажите', 'скажи', 'скажите',
  'объясни', 'объясните', 'узнать', 'пожалуйста', 'спасибо',
  'титул', 'титула', 'титулы', 'титулу', 'титулом', 'титулах', 'титулов',
  'собака', 'собаке', 'собаки', 'собаку', 'собакой', 'собакам', 'собаках',
  'правило', 'правила', 'правилу', 'правилом', 'правилах', 'правилам',
  'выставка', 'выставки', 'выставке', 'выставку', 'выставкой', 'выставках',
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

  if (q.length >= 4 && t.length >= 4 && (t.startsWith(q) || q.startsWith(t))) {
    return true
  }

  const stemQ = stemWord(q)
  const stemT = stemWord(t)
  if (stemQ.length >= 3 && stemT.length >= 3 && (stemT.startsWith(stemQ) || stemQ.startsWith(stemT))) {
    return true
  }

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

  // 1. Прямой последовательный порядок стеммов
  let pIdx = 0
  for (let i = 0; i < qStems.length; i += 1) {
    if (qStems[i] === pStems[pIdx] || isFuzzyWordMatch(qWords[i], pWords[pIdx])) {
      pIdx += 1
      if (pIdx === pStems.length) return true
    }
  }

  // 2. Для двухсловных коллокаций: окно близости <= 3 слов
  if (pStems.length === 2) {
    const idx0 = qStems.findIndex((s, i) => s === pStems[0] || isFuzzyWordMatch(qWords[i], pWords[0]))
    const idx1 = qStems.findIndex((s, i) => s === pStems[1] || isFuzzyWordMatch(qWords[i], pWords[1]))
    if (idx0 !== -1 && idx1 !== -1 && Math.abs(idx0 - idx1) <= 3) {
      return true
    }
  }

  return false
}

// 7. База готовых прямых ответов по выставкам (Direct Answer Snippets)
export type ShowDirectAnswer = {
  id: string
  title: string
  triggerKeywords: readonly string[]
  shortAnswer: string
  bulletPoints: readonly string[]
  officialRef: string
  targetSectionId: string
}

export const SHOW_DIRECT_ANSWERS: readonly ShowDirectAnswer[] = [
  {
    id: 'show-ch-rus',
    title: 'Титул «Чемпион России по красоте» (ЧР / CH RUS)',
    triggerKeywords: [
      'чемпион россии', 'чр', 'чр по красоте', 'как закрыть чемпиона россии', 'как получить чр',
      'схемы чр', '4 cac', '6 cac', 'ючр + 3 cac', 'набор cac', 'титул чемпион россии по красоте',
      'как получить титул чемпион россии', 'как стать чемпионом россии',
    ],
    shortAnswer:
      'Оформляется в РКФ по одной из 6 официальных схем набора сертификатов САС:',
    bulletPoints: [
      'Вариант 1: 4 × CAC у 4 разных судей на любых выставках (интервал ≥ 1 года между первым и последним CAC).',
      'Вариант 2: 4 × CAC у 4 разных судей на выставках ранга CACIB и/или ЧРКФ ОС (без ограничения по времени).',
      'Вариант 3: 6 × CAC у 6 разных судей на любых выставках (без интервала по времени).',
      'Вариант 4: Диплом «Юный чемпион России» (ЮЧР) + 3 × CAC у 3 разных судей (без интервала).',
      'Вариант 5: Диплом «Юный гранд чемпион» (ЮГЧР) + 2 × CAC у 2 разных судей (без интервала).',
      'Вариант 6: Сертификат «Победитель Евразии / России / Кубка Президента РКФ» + 1 × CAC у другого судьи.',
    ],
    officialRef: 'Положение РКФ о порядке присвоения титулов, разд. 4',
    targetSectionId: 'sec-show-career-titles',
  },
  {
    id: 'show-jch-rus',
    title: 'Юный чемпион России (ЮЧР) и Ветеран чемпион (ВЧР)',
    triggerKeywords: [
      'юный чемпион', 'ючр', 'ветеран чемпион', 'вчр', 'jcac', 'vcac', 'как закрыть ючр',
      'как получить юного чемпиона', 'сколько jcac', 'возраст юниоров', 'юниорский чемпион',
      'юный чемпион россии', 'ветеран чемпион россии',
    ],
    shortAnswer:
      'Официальные возрастные титулы РКФ, подтверждающие лидерство в классе юниоров или ветеранов:',
    bulletPoints: [
      'ЮЧР (Юный чемпион России): оформляется по 3 × JCAC у 3 разных судей ИЛИ диплом «Юный чемпион РКФ» (ЮЧРКФ) + 2 × JCAC.',
      'ВЧР (Ветеран чемпион России): оформляется по 3 × VCAC у 3 разных судей ИЛИ диплом «Ветеран чемпион РКФ» (ВЧРКФ) + 2 × VCAC.',
      'Срок сбора: сертификаты JCAC собираются строго в возрасте от 9 до 18 месяцев; титул вносится в родословную пожизненно.',
    ],
    officialRef: 'Положение РКФ о титулах, п. 3, 5',
    targetSectionId: 'sec-show-career-titles',
  },
  {
    id: 'show-cac-vs-cacib',
    title: 'Разница между сертификатами CAC и CACIB',
    triggerKeywords: [
      'разница cac и cacib', 'cac и cacib', 'чем отличается cacib', 'cacib vs cac', 'cacib fci',
      'международный сертификат', 'что такое cacib', 'в чем разница между cac и cacib', 'сас и сасиб',
    ],
    shortAnswer:
      'Ключевое различие между национальным и международным статусом выставки:',
    bulletPoints: [
      'CAC (Кандидат в чемпионы России): национальный сертификат РКФ. Разыгрывается на всех сертификатных выставках. Накапливается для оформления титула Чемпиона России (ЧР).',
      'CACIB (Certificat d\'Aptitude au Championnat International de Beauté): международный сертификат FCI. Присуждается только на выставках ранга CACIB одному лучшему кобелю и одной лучшей суке породы.',
      'Необходим для закрытия пожизненных титулов Интернационального чемпиона FCI (C.I.B. и C.I.B.P.).',
    ],
    officialRef: 'Положение о сертификатных выставках РКФ, п. 9.5 · Регламент FCI',
    targetSectionId: 'sec-show-ring-awards',
  },
  {
    id: 'show-age-classes',
    title: 'Выставочные классы собак и возрастные рамки',
    triggerKeywords: [
      'классы выставок', 'со скольки месяцев', 'с какого возраста', 'класс бэби', 'класс щенков',
      'класс юниоров', 'промежуточный класс', 'открытый класс', 'рабочий класс', 'класс чемпионов',
      'класс ветеранов', 'до скольки лет', 'возраст собаки', 'со скольки месяцев можно выставлять',
    ],
    shortAnswer:
      'На выставках РКФ собаки строго разделяются по половозрастным категориям на день выставки:',
    bulletPoints: [
      'Беби (Baby): 3–6 месяцев (первый опыт, оценки «очень перспективный / перспективный», без CAC).',
      'Щенки (Puppy): 6–9 месяцев (выбор лучшего щенка ЛЩ).',
      'Юниоры (Junior): 9–18 месяцев (сертификаты JCAC, ЮЧРКФ, сравнение за BOB).',
      'Промежуточный (Intermediate): 15–24 месяца (полноценный взрослый класс с CAC и CACIB).',
      'Открытый (Open): с 15 месяцев (основной класс для взрослых собак без титулов).',
      'Рабочий (Working): с 15 месяцев (только при наличии рабочего сертификата по курсингу/бегам).',
      'Чемпионов (Champion): с 15 месяцев (только с оформленным дипломом Чемпиона любой страны FCI).',
      'Ветераны (Veteran): с 8 лет и старше (сертификаты VCAC, сравнение за BOB).',
    ],
    officialRef: 'Положение о сертификатных выставках РКФ, п. 8.2',
    targetSectionId: 'sec-show-classes',
  },
  {
    id: 'show-bob-bos-comparison',
    title: 'Сравнение на BOB (ЛПП) и BOS (ЛППП)',
    triggerKeywords: [
      'bob', 'bos', 'лпп', 'лппп', 'кто выходит на bob', 'сравнение на лпп',
      'лучший представитель породы', 'лучший противоположного пола', 'как выбирают bob',
      'кто выходит в сравнение на bob',
    ],
    shortAnswer:
      'Кульминация породного ринга — выбор абсолютно лучшей собаки породы и лучшего представителя противоположного пола:',
    bulletPoints: [
      'Кто выходит на сравнение BOB: ровно 4 собаки — Лучший юниор (ЛЮ), Лучший взрослый кобель (ЛК), Лучшая взрослая сука (ЛС) и Лучший ветеран (ЛВ).',
      'Победитель получает звание BOB (Best of Breed / ЛПП) и путёвку в Главный ринг на Best in Group (BIG).',
      'Выбор BOS (Best of Opposite Sex / ЛППП): оставшиеся финалисты противоположного пола сравниваются за звание лучшего представителя противоположного пола.',
    ],
    officialRef: 'Положение о сертификатных выставках РКФ, п. 9.4',
    targetSectionId: 'sec-show-ring-awards',
  },
  {
    id: 'show-main-ring-bis',
    title: 'Главный ринг: Best in Group (BIG) и Best in Show (BIS)',
    triggerKeywords: [
      'главный ринг', 'best in show', 'bis', 'best in group', 'big', 'как проходит бис',
      'финал выставки', 'победитель выставки', '10 группа fci', 'биг', 'бис',
      'как проходит главный ринг best in show',
    ],
    shortAnswer:
      'Торжественная финальная часть всепородной выставки, где соревнуются лучшие собаки всех пород:',
    bulletPoints: [
      'Шаг 1 (Best in Group — BIG): обладатели BOB всех пород одной группы FCI соревнуются за звание лучшей собаки группы (борзые входят в 10-ю группу FCI). Расставляются 1–3 места.',
      'Шаг 2 (Best in Show — BIS): 10 победителей групп (BIG-1) выходят в суперфинал за звание абсолютно лучшей собаки всей выставки (BIS-1).',
      'Дополнительные финалы: параллельно проводятся отдельные бесты: BIS Беби, BIS Щенков, BIS Юниоров (BIS-J) и BIS Ветеранов (BIS-V).',
    ],
    officialRef: 'Положение о сертификатных выставках РКФ, п. 9.6',
    targetSectionId: 'sec-show-roadmap',
  },
  {
    id: 'show-ribbon-colors',
    title: 'Шкала оценок и официальные цвета наградных лент РКФ',
    triggerKeywords: [
      'цвета лент', 'наградные ленты', 'какого цвета лента', 'красная лента', 'синяя лента',
      'зеленая лента', 'желтая лента', 'оценка отлично', 'очень хорошо', 'шкала оценок', 'ленты ркф',
      'какие бывают оценки и какого цвета ленты',
    ],
    shortAnswer:
      'Эксперт оценивает анатомию и движения каждой собаки и присваивает нормативную оценку с соответствующей наградной лентой:',
    bulletPoints: [
      '«Отлично» (Excellent) — Красная лента: собака максимально приближена к идеалу стандарта, в безупречной кондиции. Только с оценкой «отлично» собака может получить CW и сертификаты CAC/CACIB.',
      '«Очень хорошо» (Very Good) — Синяя лента: типичная породная собака с небольшими анатомическими погрешностями, без права на титульные сертификаты.',
      '«Хорошо» (Good) — Зелёная лента: собака с явными дефектами сложения или шерсти.',
      '«Удовлетворительно» (Satisfactory) — Жёлтая лента: собака без породного лоска с выраженными недостатками.',
      'Для беби и щенков: «Очень перспективный» (красная лента), «Перспективный» (синяя), «Неперспективный» (зелёная).',
    ],
    officialRef: 'Положение о сертификатных выставках РКФ, разд. 7 · Оценки и ленты',
    targetSectionId: 'sec-show-grades',
  },
  {
    id: 'show-ranks-diff',
    title: 'Ранги выставок РКФ (CACIB, ЧРКФ ОС, CAC ЧРКФ, CAC ЧФ, Моно)',
    triggerKeywords: [
      'ранги выставок', 'чем отличаются выставки', 'cacib', 'чркф ос', 'особый статус',
      'cac чркф', 'cac чф', 'чемпион федерации', 'монопородная', 'кчк', 'ранг выставки',
      'чем отличаются ранги выставок',
    ],
    shortAnswer:
      'Ранг выставки определяет статус судейства, конкуренцию и правила присуждения сертификатов:',
    bulletPoints: [
      'CACIB FCI: международная всепородная; CAC присуждается каждому CW взрослых классов, CACIB — лучшему взрослому кобелю и суке.',
      'ЧРКФ ОС (Особый статус): национальная всепородная высшего статуса. Прямой титул ЧРКФ победителям, а сертификат CAC присуждается каждому победителю взрослого класса (CW).',
      'CAC ЧРКФ: классическая национальная выставка. Титул ЧРКФ победителям, но сертификат CAC выдаётся только победителю сравнения взрослых классов.',
      'CAC ЧФ: выставка ранга Чемпион федерации (РФЛС, РФСС, РФОС, ОАНКОО). Сертификат CAC присуждается победителю сравнения взрослых классов; 3 диплома ЧФ 3 разных федераций дают 1 ЧРКФ.',
      'Монопородная: специализированная выставка клуба породы (НКП) с присуждением КЧК и титула «Победитель клуба года» (ПК).',
    ],
    officialRef: 'Положение о сертификатных выставках РКФ, п. 1.2',
    targetSectionId: 'sec-show-ranks',
  },
  {
    id: 'show-rcac-transfer',
    title: 'Резервные сертификаты R.CAC и R.CACIB (Правило перехода)',
    triggerKeywords: [
      'r.cac', 'rcac', 'r-cac', 'рсас', 'r.cacib', 'rcacib', 'рсасиб', 'переход r.cac',
      'второе место на выставке', 'кому достается cac', 'переход сертификата',
      'что такое r.cac и кому он переходит',
    ],
    shortAnswer:
      'Сертификаты присуждаются второй лучшей собаке в ринге сравнения и могут перейти в полноценные титулы:',
    bulletPoints: [
      'Присуждение: судья может присудить R.CAC / R.CACIB собаке, занявшей 2-е место при сравнении на CAC/CACIB (с оценкой «отлично-2»).',
      'Переход R.CAC → CAC: если собака, выигравшая полноценный CAC, на день выставки уже имеет официально зарегистрированный диплом Чемпиона России (ЧР), сертификат официально переходит к обладателю R.CAC.',
      'Переход R.CACIB → CACIB: аналогично в FCI — резервный CACIB переходит обладателю 2-го места, если победитель уже имеет утверждённый титул C.I.B. или C.I.B.P.',
    ],
    officialRef: 'Положение о сертификатных выставках РКФ, п. 9.5 · Регламент FCI',
    targetSectionId: 'sec-show-ring-awards',
  },
  {
    id: 'show-grand-ch',
    title: 'Гранд чемпион России по красоте (ГЧР / GCH RUS)',
    triggerKeywords: [
      'гранд чемпион', 'гчр', 'как получить гранд чемпиона', 'гранд чемпион по красоте',
      'гчр по выставкам', 'чр + чк', 'титул гчр', 'как стать гранд чемпионом по выставкам',
    ],
    shortAnswer:
      'Высший пожизненный национальный титул взрослой собаки за покорение всех вершин экстерьера:',
    bulletPoints: [
      'Для пород с Национальным клубом (НКП, включая большинство борзых): оформленный диплом «Чемпион России» (ЧР) + диплом «Чемпион НКП» (ЧК) ЛИБО диплом «Победитель породы года» (Breed Winner RUS).',
      'Для пород без НКП: диплом «Чемпион России» (ЧР) + диплом «Чемпион РКФ» (ЧРКФ).',
      'Титул вносится в единую базу РКФ и пожизненно отображается во всех родословных потомков.',
    ],
    officialRef: 'Положение РКФ о титулах, п. 16',
    targetSectionId: 'sec-show-career-titles',
  },
  {
    id: 'show-intl-cib',
    title: 'Интернациональный чемпион красоты FCI: C.I.B. и C.I.B.P.',
    triggerKeywords: [
      'c.i.b.', 'cib', 'сиб', 'c.i.b.p.', 'cibp', 'сибп', 'интерчемпион', 'международный чемпион красоты',
      'как закрыть интерчемпиона', 'титулы fci', 'что нужно для интерчемпиона c.i.b.',
    ],
    shortAnswer:
      'Элитные мировые титулы Всемирной кинологической федерации (FCI, штаб-квартира в Бельгии):',
    bulletPoints: [
      'C.I.B. (Champion International de Beauté) — чистый экстерьерный интерчемпион: 4 × CACIB у 3 разных судей в 3 разных странах (интервал между первым и последним CACIB не менее 1 года и 1 дня).',
      'C.I.B.P. (Champion International de Beauté et Performance) — высший абсолют FCI для борзых: 2 × CACIB на выставках в 2 странах + 2 × CACIL на состязаниях по курсингу/бегам в 2 странах (интервал ≥ 1 года и 1 дня).',
      'Дипломы подтверждаются непосредственно Генеральным секретариатом FCI.',
    ],
    officialRef: 'Список титулов РКФ, разд. 1.1, 1.2 · Регламент FCI',
    targetSectionId: 'sec-show-career-titles',
  },
  {
    id: 'show-grade-excellent-rule',
    title: 'Почему за оценку «очень хорошо» не выдают сертификаты CAC и звание CW',
    triggerKeywords: [
      'очень хорошо без cac', 'почему не дали cac', 'очень хорошо первое место',
      'cw только отлично', 'условие получения cac', 'можно ли получить cac с очень хорошо',
    ],
    shortAnswer:
      'Железное правило экспертизы РКФ и FCI: титулы присуждаются только собакам эталонного качества:',
    bulletPoints: [
      'Положение о выставках РКФ (п. 9.2) категорически запрещает присуждать звание победителя класса (CW) и сертификаты (CAC, CACIB, JCAC, VCAC) собакам с оценкой ниже «отлично».',
      'Если в ринге класса единственная собака получает оценку «очень хорошо», она занимает 1-е место в классе, но звание CW и сертификат CAC ей не выдаются.',
      'Оценка «очень хорошо» означает наличие заметных недостатков, препятствующих чемпионской карьере в данный день.',
    ],
    officialRef: 'Положение о сертификатных выставках РКФ, п. 9.2–9.3',
    targetSectionId: 'sec-show-grades',
  },
  {
    id: 'show-rating-points',
    title: 'Очки рейтинга выставок сайта Coursing Stats',
    triggerKeywords: [
      'очки выставок', 'рейтинг выставок', 'сколько очков за bis', 'баллы за bob',
      'как считается рейтинг выставок', 'веса наград', '10000 очков',
      'как начисляются очки в рейтинге выставок coursing stats',
    ],
    shortAnswer:
      'Система весовых коэффициентов Coursing Stats отражает спортивную и выставочную ценность наград:',
    bulletPoints: [
      'Best in Show (BIS-1) — 10 000 очков (абсолютная победа на выставке).',
      'Best in Group (BIG-1) — 5 000 очков (лучшая борзая 10 группы).',
      'BIS Юниоров (BIS-J) — 3 500 очков; BIS Ветеранов (BIS-V) — 3 200 очков.',
      'Best of Breed (BOB / ЛПП) — 2 000 очков (лучший в породе).',
      'Best of Opposite Sex (BOS / ЛППП) — 1 500 очков.',
      'CACIB — 500 очков; CAC — 100 очков; CW (Победитель класса) — 40 очков.',
    ],
    officialRef: 'Методика расчёта рейтинга Coursing Stats · ведомости главного ринга type3',
    targetSectionId: 'sec-show-ring-awards',
  },
  {
    id: 'show-club-ch',
    title: 'Чемпион национального клуба породы (ЧК / КЧК)',
    triggerKeywords: [
      'чемпион нкп', 'чк', 'кчк', 'клубный чемпион', 'как получить чк',
      'национальный клуб породы', 'монопородная выставка', 'пк', 'победитель клуба',
    ],
    shortAnswer:
      'Высший монопородный титул, который присуждается экспертами-породниками в рамках Национального клуба породы (НКП):',
    bulletPoints: [
      'Оформление: 4 × КЧК (Кандидат в чемпионы клуба) у 4 разных судей, из которых минимум 2 сертификата получены непосредственно на монопородных выставках.',
      'Альтернатива: Прямой титул «Победитель НКП года» (ПК) на Национальной выставке породы + 1 × КЧК на любой монопородке.',
      'Титул ЧК является обязательным условием для оформления Гранд чемпиона России (ГЧР).',
    ],
    officialRef: 'Розетки и жетоны РКФ, п. 11 · Положение о титулах РКФ',
    targetSectionId: 'sec-show-career-titles',
  },
  {
    id: 'show-abbreviations',
    title: 'Словарь выставочных сокращений (CW, BOB, BOS, BIG, BIS, CAC, CACIB)',
    triggerKeywords: [
      'сокращения выставок', 'словарь сокращений', 'что значит bob', 'что значит cw',
      'расшифровка титулов', 'что такое bos', 'аббревиатуры выставок', 'бис', 'боб', 'сасиб', 'сас',
      'что значит cw bob bos big bis',
    ],
    shortAnswer:
      'Общепринятые международные и российские аббревиатуры в протоколах выставок РКФ/FCI:',
    bulletPoints: [
      'CW — Class Winner (Победитель класса с оценкой «отлично»).',
      'BOB / ЛПП — Best of Breed (Лучший представитель породы, выходит в Главный ринг).',
      'BOS / ЛППП — Best of Opposite Sex (Лучший представитель противоположного пола).',
      'BIG — Best in Group (Лучшая собака 10-й группы борзых в Главном ринге).',
      'BIS — Best in Show (Абсолютный победитель всей выставки).',
      'CAC / CACIB — Кандидат в национальные / интернациональные чемпионы красоты.',
    ],
    officialRef: 'Принятые сокращения в родословных и каталогах РКФ',
    targetSectionId: 'sec-show-abbr',
  },
] as const

// 8. Детектор естественных интентов выставок (Show Conversational Intent Matcher)
export function detectShowConversationalIntent(query: string): string | null {
  const q = query.toLowerCase().replace(/ё/g, 'е')

  // 1. Гранд чемпион по красоте
  if (/(гранд\s*чемпион|гчр|титул.*гранд|как\s+получить\s+.*гранд|как\s+стать\s+.*гранд)/i.test(q)) {
    return 'show-grand-ch'
  }

  // 2. Юный чемпион (ЮЧР) или Ветеран (ВЧР)
  if (/(юн[а-яёa-z]*\s+чемпион|ючр|ветеран[а-яёa-z]*\s+чемпион|вчр|jcac|vcac|юсас|всас)/i.test(q)) {
    return 'show-jch-rus'
  }

  // 3. Чемпион России по красоте (ЧР)
  if (/(чемпион[а-яёa-z]*\s*росси|чр\b|как\s+закрыть\s+чр|схем[а-яёa-z]*\s*(чр|набора|cac))/i.test(q) && !/гранд|юны|ветеран/i.test(q)) {
    return 'show-ch-rus'
  }

  // 4. Разница CAC и CACIB
  if (/(разниц[а-яёa-z]*\s*.*(cac|сас).*cacib|cac\s*(vs|или|и)\s*cacib|сас\s*(vs|или|и)\s*сасиб|чем\s+отличается\s+cacib)/i.test(q)) {
    return 'show-cac-vs-cacib'
  }

  // 5. Возрастные рамки и классы
  if (/(со\s+скольк|с\s+какого\s+возраст|в\s+каком\s+возраст|до\s+скольк|класс[а-яёa-z]*\s+выстав|бэби|щенок|щенк|юниор|промежуточн|открыт[а-яёa-z]*\s+класс)/i.test(q)) {
    return 'show-age-classes'
  }

  // 6. Сравнение BOB / BOS
  if (/(сравнени[а-яёa-z]*\s*.*(bob|bos|лпп|лппп)|кто\s+выходит\s*.*(bob|bos|лпп)|лучш[а-яёa-z]*\s+представител[а-яёa-z]*\s+пород)/i.test(q)) {
    return 'show-bob-bos-comparison'
  }

  // 7. Главный ринг Best in Show
  if (/(главн[а-яёa-z]*\s+ринг|best\s+in\s+show|best\s+in\s+group|бис|биг|как\s+проходит\s+бис|суперфинал)/i.test(q)) {
    return 'show-main-ring-bis'
  }

  // 8. Цвета наградных лент и шкала оценок
  if (/(цвет[а-яёa-z]*\s+лент|наградн[а-яёa-z]*\s+лент|какого\s+цвета\s+лент|красн[а-яёa-z]*\s+лент|синяя\s+лент|зеленая\s+лент|желтая\s+лент)/i.test(q)) {
    return 'show-ribbon-colors'
  }

  // 9. Ранги выставок
  if (/(ранг[а-яёa-z]*\s+выстав|чркф\s+ос|особ[а-яёa-z]*\s+статус|cac\s+чркф|cac\s+чф|чемпион\s+федераци|монопородн[а-яёa-z]*\s+выстав)/i.test(q)) {
    return 'show-ranks-diff'
  }

  // 10. Резервный R.CAC / R.CACIB
  if (/(r[-.\s]?cac|рсас|r[-.\s]?cacib|рсасиб|переход[а-яёa-z]*\s*(cac|сас|сертификат)|втор[а-яёa-z]*\s+мест[а-яёa-z]*\s*.*(cac|сас))/i.test(q)) {
    return 'show-rcac-transfer'
  }

  // 11. Международные титулы FCI C.I.B. и C.I.B.P.
  if (/(c\.?i\.?b\.?|c\.?i\.?b\.?p\.?|сиб\b|сибп|интерчемпион|международн[а-яёa-z]*\s+чемпион\s+красот)/i.test(q)) {
    return 'show-intl-cib'
  }

  // 12. Почему не дают CAC за очень хорошо
  if (/(очень\s+хорошо\s*.*(cac|сас|cw)|почему\s+не\s+дали\s+cac|только\s+отлично)/i.test(q)) {
    return 'show-grade-excellent-rule'
  }

  // 13. Очки рейтинга Coursing Stats
  if (/(очк[а-яёa-z]*\s+выстав|рейтинг[а-яёa-z]*\s+выстав|балл[а-яёa-z]*\s+за\s+(bis|big|bob|cac)|веса\s+наград|10000\s+очков)/i.test(q)) {
    return 'show-rating-points'
  }

  // 14. Клубный чемпион НКП (ЧК / КЧК)
  if (/(чемпион\s+нкп|чк\b|кчк|клубн[а-яёa-z]*\s+чемпион|победител[а-яёa-z]*\s+клуб)/i.test(q)) {
    return 'show-club-ch'
  }

  // 15. Словарь сокращений
  if (/(сокращени[а-яёa-z]*\s+выстав|словар[а-яёa-z]*\s+сокращен|что\s+значит\s+(cw|bob|bos|big|bis|cac)|аббревиатур[а-яёa-z]*\s+выстав)/i.test(q)) {
    return 'show-abbreviations'
  }

  return null
}

// 9. Специфичные семантические якоря (высокий вес IDF)
const SHOW_ANCHOR_TERMS: Record<string, { answerId: string; sectionId: string; weight: number }> = {
  cacib: { answerId: 'show-cac-vs-cacib', sectionId: 'sec-show-ring-awards', weight: 450 },
  сасиб: { answerId: 'show-cac-vs-cacib', sectionId: 'sec-show-ring-awards', weight: 450 },
  jcac: { answerId: 'show-jch-rus', sectionId: 'sec-show-career-titles', weight: 450 },
  vcac: { answerId: 'show-jch-rus', sectionId: 'sec-show-career-titles', weight: 450 },
  юсас: { answerId: 'show-jch-rus', sectionId: 'sec-show-career-titles', weight: 450 },
  всас: { answerId: 'show-jch-rus', sectionId: 'sec-show-career-titles', weight: 450 },
  ючр: { answerId: 'show-jch-rus', sectionId: 'sec-show-career-titles', weight: 450 },
  вчр: { answerId: 'show-jch-rus', sectionId: 'sec-show-career-titles', weight: 450 },
  гчр: { answerId: 'show-grand-ch', sectionId: 'sec-show-career-titles', weight: 450 },
  гранд: { answerId: 'show-grand-ch', sectionId: 'sec-show-career-titles', weight: 450 },
  лент: { answerId: 'show-ribbon-colors', sectionId: 'sec-show-grades', weight: 450 },
  бис: { answerId: 'show-main-ring-bis', sectionId: 'sec-show-roadmap', weight: 400 },
  биг: { answerId: 'show-main-ring-bis', sectionId: 'sec-show-roadmap', weight: 400 },
  боб: { answerId: 'show-bob-bos-comparison', sectionId: 'sec-show-ring-awards', weight: 400 },
  бос: { answerId: 'show-bob-bos-comparison', sectionId: 'sec-show-ring-awards', weight: 400 },
  лпп: { answerId: 'show-bob-bos-comparison', sectionId: 'sec-show-ring-awards', weight: 400 },
  лппп: { answerId: 'show-bob-bos-comparison', sectionId: 'sec-show-ring-awards', weight: 400 },
  бэби: { answerId: 'show-age-classes', sectionId: 'sec-show-classes', weight: 400 },
  щенок: { answerId: 'show-age-classes', sectionId: 'sec-show-classes', weight: 400 },
  щенк: { answerId: 'show-age-classes', sectionId: 'sec-show-classes', weight: 400 },
  юниор: { answerId: 'show-age-classes', sectionId: 'sec-show-classes', weight: 400 },
  ветеран: { answerId: 'show-age-classes', sectionId: 'sec-show-classes', weight: 400 },
  чркф: { answerId: 'show-ranks-diff', sectionId: 'sec-show-ranks', weight: 400 },
  кчк: { answerId: 'show-club-ch', sectionId: 'sec-show-career-titles', weight: 400 },
  нкп: { answerId: 'show-club-ch', sectionId: 'sec-show-career-titles', weight: 400 },
  rcac: { answerId: 'show-rcac-transfer', sectionId: 'sec-show-ring-awards', weight: 450 },
  rcacib: { answerId: 'show-rcac-transfer', sectionId: 'sec-show-ring-awards', weight: 450 },
  переход: { answerId: 'show-rcac-transfer', sectionId: 'sec-show-ring-awards', weight: 450 },
}

// 10. Проверка совпадения поискового запроса с элементом
export type ShowSearchMatchResult = {
  score: number
  matchedDirectAnswer: ShowDirectAnswer | null
  matchedSectionIds: Set<string>
  matchedTokens: Set<string>
}

/** Выполняет интеллектуальный поиск по выставкам */
export function executeSmartShowSearch(rawQuery: string): ShowSearchMatchResult {
  const qTrim = rawQuery.trim().toLowerCase().replace(/ё/g, 'е')
  if (!qTrim) {
    return {
      score: 0,
      matchedDirectAnswer: null,
      matchedSectionIds: new Set<string>(),
      matchedTokens: new Set<string>(),
    }
  }

  // Расширяем запрос раскладкой и фонетикой
  const queryVariants = new Set<string>([qTrim])

  const convertedLayout = convertKeyboardLayout(qTrim)
  if (convertedLayout && convertedLayout !== qTrim) {
    queryVariants.add(convertedLayout)
  }

  if (SHOW_PHONETIC_ALIASES[qTrim]) {
    queryVariants.add(SHOW_PHONETIC_ALIASES[qTrim])
  }

  // Извлекаем значимые слова без стоп-слов
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
  let bestDirectAnswer: ShowDirectAnswer | null = null
  let maxAnswerScore = 0

  // 1. Детектор естественных интентов
  let intentTargetAnswerId: string | null = null
  for (const qv of queryVariants) {
    const detected = detectShowConversationalIntent(qv)
    if (detected) {
      intentTargetAnswerId = detected
      break
    }
  }

  // 2. Семантические якоря
  for (const sw of effectiveSearchWords) {
    const stem = stemWord(sw)
    for (const [anchor, info] of Object.entries(SHOW_ANCHOR_TERMS)) {
      if (stem.startsWith(anchor) || anchor.startsWith(stem) || isFuzzyWordMatch(sw, anchor)) {
        matchedSectionIds.add(info.sectionId)
        matchedTokens.add(sw)
      }
    }
  }

  // 3. Проверка прямых ответов (SHOW_DIRECT_ANSWERS)
  for (const answer of SHOW_DIRECT_ANSWERS) {
    let answerScore = 0

    // Бонус за интент
    if (intentTargetAnswerId === answer.id) {
      answerScore += 450
      matchedSectionIds.add(answer.targetSectionId)
    }

    // Бонус за семантический якорь
    for (const sw of effectiveSearchWords) {
      const stem = stemWord(sw)
      for (const [anchor, info] of Object.entries(SHOW_ANCHOR_TERMS)) {
        if (info.answerId === answer.id && (stem.startsWith(anchor) || anchor.startsWith(stem) || isFuzzyWordMatch(sw, anchor))) {
          answerScore += info.weight
        }
      }
    }

    // Сопоставление с triggerKeywords
    for (const kw of answer.triggerKeywords) {
      const isMultiWord = kw.includes(' ')

      if (isMultiWord) {
        for (const qv of queryVariants) {
          if (isPhraseMatch(qv, kw)) {
            answerScore += 350
            kw.split(/\s+/).forEach((w) => matchedTokens.add(w))
          }
        }
      } else {
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

  // 4. Общие правила привязки слов к разделам выставок
  const sectionKeywords: Record<string, string[]> = {
    'sec-show-roadmap': ['роадмап', 'путь', 'cw', 'cac', 'cacib', 'bob', 'bos', 'big', 'bis', 'best in show', 'главный ринг'],
    'sec-show-ring-awards': ['награды', 'очки', 'рейтинг', 'баллы', '10000', '5000', '2000', '1500', '500', '100', '40', 'cw', 'cac', 'cacib', 'bob', 'bos', 'r.cac', 'r.cacib', 'переход'],
    'sec-show-classes': ['класс', 'классы', 'возраст', 'месяцев', 'беби', 'щенок', 'юниор', 'промежуток', 'открытый', 'рабочий', 'чемпион', 'ветеран'],
    'sec-show-grades': ['оценка', 'оценки', 'лента', 'ленты', 'цвета', 'отлично', 'очень хорошо', 'хорошо', 'удовлетворительно', 'красная', 'синяя', 'зеленая', 'желтая'],
    'sec-show-ranks': ['ранг', 'ранги', 'cacib', 'чркф ос', 'особый статус', 'cac чркф', 'cac чф', 'федерация', 'рфлс', 'рфос', 'рфсс', 'оанкоо', 'монопородная', 'кчк', 'пк'],
    'sec-show-career-titles': ['титул', 'титулы', 'родословная', 'чр', 'ючр', 'вчр', 'гчр', 'ачр', 'чркф', 'чк', 'c.i.b.', 'c.i.b.p.', 'диплом', 'схемы', 'закрыть'],
    'sec-show-requirements': ['памятка', 'регламент', 'правила', 'требования', 'условие', 'оценка отлично', 'только отлично'],
    'sec-show-abbr': ['сокращение', 'аббревиатура', 'словарь', 'cw', 'bob', 'bos', 'big', 'bis', 'cac', 'cacib', 'jcac', 'vcac', 'чркф', 'чф', 'кчк', 'пк'],
    'sec-show-sources': ['первоисточник', 'регламент', 'положение', 'ркф', 'fci', 'документ', 'pdf', 'ссылка'],
    'sec-show-faqs': ['faq', 'вопрос', 'ответ', 'почему'],
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
