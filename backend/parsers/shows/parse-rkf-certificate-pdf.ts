/**
 * Parse RKF «Итоговый отчет» PDF (certificate table) into lean dog rows.
 * Text comes from Excel→PDF exports on tables.rkf.org.ru.
 */

import fs from 'node:fs'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

export interface ParsedCertDog {
  breed: string
  judge: string
  catalog_number: number
  dog_name: string
  birth_date: string
  pedigree: string
  class: string
  grade: string
  title: string
  bob: boolean
  show_date: string
}

export interface ParseCertificatePdfResult {
  dogs: ParsedCertDog[]
  page_count: number
  raw_token_count: number
}

const CLASS_RE =
  /^(БЕБ|ЩЕН|ЮН|ПРМ|ОТК|РАБ|ЧЕМ|ПОЧ|ВЕТ|BABY|PUPPY|JUNIOR|INTERMEDIATE|OPEN|WORKING|CHAMPION|VETERAN)$/i

const GRADE_RE = /^(ОТЛ|ОЧ\.?\s*ХОР|ОЧХОР|ХОР|УД|ОП|БР|EXC|VG|G|S|VERY\s*GOOD)$/i

const CERT_TOKENS = new Set(
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
    'ЮКЧК',
    'ЮКЧП',
    'ЮКЧК/ЮКЧП',
    'ВКЧК',
    'ВЧКП',
    'ВКЧК/ВЧКП',
    'СС',
    'ЮСС',
    'ВСС',
    'BOB',
    'ЛПП',
    'BOB/ЛПП',
    'BOS',
    'ЛПС',
    'BOS/ЛПС',
    'JBOB',
    'ЛЮ',
    'ЛБ',
    'ЛЩ',
    'ЛВ',
  ].map((s) => s.toUpperCase()),
)

const DATE_RE = /^\d{2}\.\d{2}\.\d{4}$/
const HEADER_MARKERS = /порода|судья|каталог|кличка|родословн|оценка|проведения/i

function normToken(raw: string): string {
  return raw.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
}

function isCertToken(tok: string): boolean {
  const u = tok.toUpperCase().replace(/\s+/g, '')
  if (CERT_TOKENS.has(tok.toUpperCase()) || CERT_TOKENS.has(u)) return true
  if (/^R\.(J)?CAC(IB)?$/i.test(tok)) return true
  if (/^BOB\s*\/\s*ЛПП$/i.test(tok) || /^BOS\s*\/\s*ЛПС$/i.test(tok)) return true
  return false
}

function isGrade(tok: string): boolean {
  return GRADE_RE.test(tok.replace(/\s+/g, ' ').trim())
}

function isClass(tok: string): boolean {
  return CLASS_RE.test(tok.trim())
}

function looksLikeBreed(tok: string): boolean {
  if (tok.length < 3) return false
  if (DATE_RE.test(tok) || isCertToken(tok) || isGrade(tok) || isClass(tok)) return false
  if (/^\d+$/.test(tok)) return false
  // Breeds in these PDFs are typically uppercase Cyrillic / Latin words
  const letters = tok.replace(/[^A-Za-zА-Яа-яЁё]/g, '')
  if (letters.length < 3) return false
  const upper = letters === letters.toUpperCase()
  const hasCyr = /[А-ЯЁ]/.test(letters)
  return upper && (hasCyr || /^[A-Z][A-Z\s\-']+$/.test(tok))
}

function looksLikeJudge(tok: string): boolean {
  if (tok.length < 3 || DATE_RE.test(tok) || /^\d+$/.test(tok)) return false
  if (isClass(tok) || isGrade(tok) || isCertToken(tok)) return false
  // "Ivanova Irina" / "Круценко Елена Юрьевна"
  return /[A-Za-zА-Яа-яЁё]/.test(tok) && /[a-zа-яё]/.test(tok)
}

async function extractTokens(pdfPath: string): Promise<{ tokens: string[]; pageCount: number }> {
  const data = new Uint8Array(fs.readFileSync(pdfPath))
  const doc = await getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise
  const tokens: string[] = []

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    type Item = { str?: string; transform?: number[] }
    const items = content.items as Item[]

    // Group by approximate Y (PDF Y grows up)
    const rows = new Map<number, Array<{ x: number; str: string }>>()
    for (const item of items) {
      const str = normToken(item.str || '')
      if (!str) continue
      const tr = item.transform || [1, 0, 0, 1, 0, 0]
      const x = tr[4] ?? 0
      const y = Math.round((tr[5] ?? 0) * 2) / 2
      const list = rows.get(y) || []
      list.push({ x, str })
      rows.set(y, list)
    }

    const sortedYs = [...rows.keys()].sort((a, b) => b - a)
    for (const y of sortedYs) {
      const row = (rows.get(y) || []).sort((a, b) => a.x - b.x)
      // Merge adjacent fragments on the same row into space-joined cells carefully:
      // keep each text item as a token unless it's a single punctuation glue.
      for (const cell of row) {
        tokens.push(cell.str)
      }
      tokens.push('\n')
    }
  }

  return { tokens, pageCount: doc.numPages }
}

/**
 * Flatten tokens and parse sequential dog records.
 * Layout: BREED JUDGE CATALOG NAME DOB PEDIGREE CLASS GRADE [certs...] [BOB] SHOW_DATE
 */
export function parseCertificateTokens(tokens: string[]): ParsedCertDog[] {
  const flat = tokens
    .map(normToken)
    .filter((t) => t && t !== '\n')
    // Drop repeated header crumbs
    .filter((t) => !HEADER_MARKERS.test(t) || t.length > 40)

  // Merge "ОЧ." + "ХОР" into one grade token
  const merged: string[] = []
  for (let i = 0; i < flat.length; i++) {
    const cur = flat[i]!
    const next = flat[i + 1]
    if (/^ОЧ\.?$/i.test(cur) && next && /^ХОР$/i.test(next)) {
      merged.push('ОЧ. ХОР')
      i++
      continue
    }
    if (/^BOB$/i.test(cur) && next && (/^\/$/.test(next) || /^ЛПП$/i.test(next))) {
      if (/^\/$/.test(next) && flat[i + 2] && /^ЛПП$/i.test(flat[i + 2]!)) {
        merged.push('BOB/ЛПП')
        i += 2
        continue
      }
      if (/^ЛПП$/i.test(next)) {
        merged.push('BOB/ЛПП')
        i++
        continue
      }
    }
    merged.push(cur)
  }

  const dogs: ParsedCertDog[] = []
  let i = 0

  while (i < merged.length) {
    const breed = merged[i]!
    if (!looksLikeBreed(breed)) {
      i++
      continue
    }

    // Judge may be 1–3 tokens until we hit a catalog number
    let j = i + 1
    const judgeParts: string[] = []
    while (j < merged.length && !/^\d{1,5}$/.test(merged[j]!) && judgeParts.length < 4) {
      if (looksLikeBreed(merged[j]!) && judgeParts.length > 0) break
      judgeParts.push(merged[j]!)
      j++
    }
    if (j >= merged.length || !/^\d{1,5}$/.test(merged[j]!)) {
      i++
      continue
    }

    const catalog = Number(merged[j]!)
    j++

    // Dog name until DOB
    const nameParts: string[] = []
    while (j < merged.length && !DATE_RE.test(merged[j]!)) {
      // Safety: if we hit another breed+looks catalog pattern, abort
      if (nameParts.length > 12) break
      nameParts.push(merged[j]!)
      j++
    }
    if (j >= merged.length || !DATE_RE.test(merged[j]!)) {
      i++
      continue
    }
    const birthDate = merged[j]!
    j++

    if (j >= merged.length) {
      i++
      continue
    }
    const pedigree = merged[j]!
    j++

    // Class
    if (j >= merged.length || !isClass(merged[j]!)) {
      // Some rows omit class — skip recovery
      i++
      continue
    }
    const dogClass = merged[j]!
    j++

    // Grade (optional for some DNS)
    let grade = ''
    if (j < merged.length && isGrade(merged[j]!)) {
      grade = merged[j]!
      j++
    }

    const titles: string[] = []
    let bob = false
    let showDate = ''
    while (j < merged.length) {
      const tok = merged[j]!
      if (DATE_RE.test(tok)) {
        showDate = tok
        j++
        break
      }
      if (isCertToken(tok) || /^BOB/i.test(tok) || /^ЛПП$/i.test(tok)) {
        if (/BOB/i.test(tok) || tok === 'ЛПП') bob = true
        titles.push(tok)
        j++
        continue
      }
      // Next breed starts
      if (looksLikeBreed(tok)) break
      // Unknown token — stop titles
      break
    }

    const dogName = nameParts.join(' ').replace(/\s+/g, ' ').trim()
    if (dogName && catalog > 0) {
      dogs.push({
        breed,
        judge: judgeParts.join(' ').replace(/\s+/g, ' ').trim(),
        catalog_number: catalog,
        dog_name: dogName,
        birth_date: birthDate,
        pedigree,
        class: dogClass,
        grade,
        title: titles.join(' '),
        bob,
        show_date: showDate,
      })
    }

    i = j
  }

  return dogs
}

export async function parseCertificatePdf(pdfPath: string): Promise<ParseCertificatePdfResult> {
  const { tokens, pageCount } = await extractTokens(pdfPath)
  const dogs = parseCertificateTokens(tokens)
  return { dogs, page_count: pageCount, raw_token_count: tokens.length }
}

/** Best-effort BIS PDF parse: lines with place + dog name when text is extractable. */
export async function parseBisPdf(pdfPath: string): Promise<Array<{ place: number; dog_name: string; raw: string }>> {
  const { tokens } = await extractTokens(pdfPath)
  const text = tokens.filter((t) => t !== '\n').join(' ')
  const out: Array<{ place: number; dog_name: string; raw: string }> = []
  // Common patterns: "BIS 1 NAME" / "1. NAME"
  const re = /\b(?:BIS\s*)?(\d{1,2})[.)\s]+([A-ZА-ЯЁ][A-ZА-ЯЁa-zа-яё0-9\s\-'.()]{2,80}?)(?=\s+(?:BIS\s*)?\d{1,2}[.)\s]|$)/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const place = Number(m[1])
    const dog_name = m[2]!.replace(/\s+/g, ' ').trim()
    if (place >= 1 && place <= 20 && dog_name.length >= 3) {
      out.push({ place, dog_name, raw: m[0] })
    }
  }
  return out
}
