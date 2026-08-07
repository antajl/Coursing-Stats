/**
 * Нормализация и ключ слияния имён судей выставок РКФ.
 * Используется в build-show-indexes и тестах.
 */

/** Латинские омоглифы → кириллица (и наоборот), если в строке доминирует один алфавит. */
const LATIN_TO_CYR: Record<string, string> = {
  A: 'А', a: 'а', B: 'В', E: 'Е', e: 'е', K: 'К', k: 'к', M: 'М', m: 'м',
  H: 'Н', O: 'О', o: 'о', P: 'Р', p: 'р', C: 'С', c: 'с', T: 'Т', X: 'Х', x: 'х',
  Y: 'У', y: 'у',
}
const CYR_TO_LAT: Record<string, string> = Object.fromEntries(
  Object.entries(LATIN_TO_CYR).map(([lat, cyr]) => [cyr, lat]),
)

/** Частые варианты латиницы одного имени → канон (для First Last западных записей). */
const LATIN_GIVEN_CANON: Record<string, string> = {
  tatiana: 'tatyana',
  tatyana: 'tatyana',
  dmitrii: 'dmitry',
  dmitriy: 'dmitry',
  dmitry: 'dmitry',
  nikolai: 'nikolay',
  nikolay: 'nikolay',
  vasilii: 'vasiliy',
  vasiliy: 'vasiliy',
  victor: 'viktor',
  viktor: 'viktor',
  yulia: 'yuliya',
  yuliya: 'yuliya',
  natalia: 'natalya',
  natalya: 'natalya',
  maria: 'maria',
  maryia: 'maria',
  evgeniy: 'evgeny',
  evgenii: 'evgeny',
  evgeny: 'evgeny',
}

const COMMON_GIVEN_NAMES = new Set([
  'яна', 'алексей', 'ольга', 'елена', 'ирина', 'мария', 'анна', 'олег', 'иван',
  'петр', 'сергей', 'андрей', 'дмитрий', 'александр', 'наталья',
  'татьяна', 'екатерина', 'светлана', 'юлия', 'юлианна', 'вероника', 'виктория',
  'марина', 'ксения', 'дарья', 'полина', 'софия', 'алина', 'михаил',
  'николай', 'владимир', 'владислав', 'артем', 'роман',
  'максим', 'константин', 'геннадий', 'валентин', 'виктор', 'галина', 'любовь',
  'надежда', 'зоя', 'лариса', 'оксана', 'элина', 'эдуард', 'эмиль', 'юрий',
  'григорий', 'степан', 'федор', 'илья', 'кирилл', 'павел', 'руслан', 'тимур',
  'вячеслав', 'ярослав', 'игорь', 'василий', 'алекс', 'лена', 'наташа',
  'таня', 'саша', 'катя', 'маша', 'людмила', 'инесса',
])

/** Известные опечатки в выгрузках РКФ (точные токены после lower+ё→е). */
const TOKEN_TYPOS: Record<string, string> = {
  белки: 'белкин',
  покровскя: 'покровская',
  lychkovskay: 'lychkovskaya',
  екатериа: 'екатерина',
}

function fixJudgeScriptHomoglyphs(s: string): string {
  const cyr = (s.match(/[а-яё]/gi) || []).length
  const lat = (s.match(/[a-z]/gi) || []).length
  if (cyr === 0 && lat === 0) return s
  if (cyr >= lat) {
    return s.replace(/[A-Za-z]/g, (ch) => LATIN_TO_CYR[ch] || ch)
  }
  return s.replace(/[А-Яа-яЁё]/g, (ch) => CYR_TO_LAT[ch] || ch)
}

/**
 * Нормализация имени судьи выставок для дедупликации.
 * Убирает скобки/страны, ё→е, омоглифы, удвоенную фамилию.
 */
export function normalizeShowJudgeDisplayName(raw: string): string {
  let normalized = raw
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')

  normalized = normalized.replace(/\([^)]*\)/g, '')

  normalized = normalized.replace(
    /\s*[-–—]\s*(serbia|russia|rf|rkf|azerbaijan|azerba[iy]dzhan|kazakhstan|kazahstan|ukraine|belarus|poland|germany|france|italy|spain|finland|sweden|norway|china|japan|korea|usa|uk|россия|ркф|украина|беларусь|казахстан|азербайджан)\s*$/iu,
    '',
  )

  normalized = normalized.replace(/[,;.]+/g, ' ')
  normalized = normalized.replace(/[\u00a0\s]+/g, ' ').trim()
  normalized = fixJudgeScriptHomoglyphs(normalized)

  let words = normalized.split(/\s+/).filter(Boolean)
  words = words.map((word) => {
    if (TOKEN_TYPOS[word]) return TOKEN_TYPOS[word]
    if (word.length >= 10) {
      const match = word.match(/^(.*?(?:ова|ева|ина|ына|ская|цкая|ский|цкий))([а-я]{3,})$/iu)
      if (match) {
        const [, surname, name] = match
        if (COMMON_GIVEN_NAMES.has(name) && surname.length >= 5) {
          return `${surname} ${name}`
        }
      }
    }
    if (/^[a-z]+$/i.test(word) && LATIN_GIVEN_CANON[word]) {
      return LATIN_GIVEN_CANON[word]
    }
    return word
  })

  if (words.length >= 3 && words[0] === words[words.length - 1]) {
    words = words.slice(0, -1)
  }

  normalized = words.join(' ')
  normalized = normalized.replace(/\b([а-я]{3,})ов\s+на\b/gu, '$1овна')
  normalized = normalized.replace(/\b([а-я]{3,})ев\s+на\b/gu, '$1евна')
  normalized = normalized.replace(/\b([а-я]{3,})ин\s+ич\b/gu, '$1инична')

  return normalized.trim()
}

export interface ShowJudgeNameParts {
  last: string
  first: string
  middle: string
  firstInitial: string
  middleInitial: string
}

export function parseShowJudgeNameParts(normalized: string): ShowJudgeNameParts {
  const parts = normalized.split(/\s+/).filter(Boolean)
  const joined = parts.join('')
  const lat = (joined.match(/[a-z]/gi) || []).length
  const cyr = (joined.match(/[а-я]/gi) || []).length

  // Западный порядок Given [Middle…] Family — иначе все «Yulia *» схлопываются в один ключ
  if (lat > cyr && parts.length >= 2) {
    const first = parts[0] || ''
    const last = parts[parts.length - 1] || ''
    const middle = parts.length > 2 ? parts.slice(1, -1).join(' ') : ''
    return {
      last,
      first,
      middle,
      firstInitial: first ? first.replace(/\./g, '').charAt(0) : '',
      middleInitial: middle ? middle.replace(/\./g, '').charAt(0) : '',
    }
  }

  const last = parts[0] || ''
  const first = parts[1] || ''
  const middle = parts[2] || ''
  return {
    last,
    first,
    middle,
    firstInitial: first ? first.replace(/\./g, '').charAt(0) : '',
    middleInitial: middle ? middle.replace(/\./g, '').charAt(0) : '',
  }
}

/** Ключ: фамилия|имя|отчество. Для кириллицы имя/отчество — инициалы; для латиницы — полное given name (иначе Natalia/Nikolay Sedykh схлопнутся). */
export function showJudgeMergeKey(parts: ShowJudgeNameParts): string {
  const latinGiven = /^[a-z]/i.test(parts.first) && parts.first.length > 1
  const firstKey = latinGiven ? parts.first : parts.firstInitial
  const middle = parts.middleInitial || '*'
  return `${parts.last}|${firstKey}|${middle}`
}

export function showJudgeMergeKeyFromRaw(raw: string): string {
  return showJudgeMergeKey(parseShowJudgeNameParts(normalizeShowJudgeDisplayName(raw)))
}
