import {
  matchShowAwardToken,
  normalizeCertLookalikes,
} from '../../../lib/show-award-ranking'

export const CLASS_RE =
  /^(БЕБ|Б|ЩЕН|ЮН|ПРМ|ОТК|РАБ|ЧЕМ(?:\s+НКП)?|ЧНКП|ПОЧ(?:\s+НКП)?|ВЕТ|BABY|PUPPY|JUNIOR|INTERMEDIATE|OPEN|WORKING|CHAMPION|VETERAN)$/i

export const GRADE_RE =
  /^(ОТЛ|ОЧ\.?\s*ХОР|ОЧХОР|ХОР|УД|ОП|П|БР|НЯ|Н\/Я|БО|Б\/О|Б\/ОЦ|НЕЯВК(?:А)?|EXC|VG|G|S|VERY\s*GOOD|N\/B)$/i

export const CERT_TOKENS = new Set(
  [
    'CACIB',
    'R.CACIB',
    'CAC',
    'R.CAC',
    'ЧРКФ',
    'ЧФ',
    'JCAC',
    'R.JCAC',
    'ЮЧРКФ',
    'ЮЧФ',
    'VCAC',
    'R.VCAC',
    'ВЧРКФ',
    'ВЧФ',
    'КЧК',
    'КЧП',
    'КЧК/КЧП',
    'КЧК/ КЧП',
    'ЮКЧК',
    'ЮКЧП',
    'ЮКЧК/ЮКЧП',
    'ВКЧК',
    'ВЧКП',
    'ВКЧП',
    'ВКЧК/ВКЧП',
    'ВКЧК/ВЧКП',
    'СС',
    'ЮСС',
    'ВСС',
    'BOB',
    'ЛПП',
    'ЛПП /',
    'BOB/ЛПП',
    'BOS',
    'ЛПС',
    'BOS/ЛПС',
    'JBOB',
    'ЛЮ',
    'ЛБ',
    'ЛЩ',
    'ЛВ',
    'ПК/ПП',
    'ЮПК/ЮПП',
    'ВПК/ВПП',
  ].map((s) => s.toUpperCase()),
)

export const DATE_RE = /^\d{2}\.\d{2}\.\d{4}$/
export const MAIN_RING_RE = /ВЕДОМОСТЬ\s+ГЛАВНОГО\s+РИНГА/i

export function normToken(raw: string): string {
  return raw.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
}

export function isCertToken(tok: string): boolean {
  const normalized = normalizeCertLookalikes(tok)
  const u = normalized.toUpperCase().replace(/\s+/g, '')
  if (CERT_TOKENS.has(normalized.toUpperCase()) || CERT_TOKENS.has(u)) return true
  if (CERT_TOKENS.has(tok.toUpperCase()) || CERT_TOKENS.has(tok.toUpperCase().replace(/\s+/g, ''))) {
    return true
  }
  if (/^R\.(J)?CAC(IB)?$/i.test(normalized)) return true
  if (/^BOB\s*\/\s*ЛПП$/i.test(tok) || /^BOS\s*\/\s*ЛПС$/i.test(tok)) return true
  if (/^ЛПП\s*\/?$/i.test(tok)) return true
  // Already in certs column: accept if ranking lexicon knows the award
  if (matchShowAwardToken(tok) || matchShowAwardToken(normalized)) return true
  return false
}

export function isGrade(tok: string): boolean {
  return GRADE_RE.test(tok.replace(/\s+/g, ' ').trim())
}

export function isClass(tok: string): boolean {
  return CLASS_RE.test(tok.trim())
}

export function looksLikeBreed(tok: string): boolean {
  if (tok.length < 3) return false
  if (DATE_RE.test(tok) || isCertToken(tok) || isGrade(tok) || isClass(tok)) return false
  if (/^\d+$/.test(tok)) return false
  const letters = tok.replace(/[^A-Za-zА-Яа-яЁё]/g, '')
  if (letters.length < 3) return false
  const upper = letters === letters.toUpperCase()
  const hasCyr = /[А-ЯЁ]/.test(letters)
  return upper && (hasCyr || /^[A-Z][A-Z\s\-']+$/.test(tok))
}
