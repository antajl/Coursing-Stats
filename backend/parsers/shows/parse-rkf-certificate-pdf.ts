/**
 * Parse RKF «Итоговый отчет» PDF into lean dog rows.
 * Uses column X positions so wrapped cells (breed / judge patronymic) stay correct.
 * Stops before «ВЕДОМОСТЬ ГЛАВНОГО РИНГА» (parsed later separately).
 */

import fs from 'node:fs'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import {
  matchShowAwardToken,
  normalizeCertLookalikes,
  glueWrappedTitleParts,
  SHOW_AWARD_BADGE,
} from '../../lib/show-award-ranking'
import { recoverInterleavedClassAndGrade, recoverWrappedPuppyClassAndGrade } from '../../lib/show-grades'

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
  has_main_ring_sheet: boolean
}

type PdfItem = { str: string; x: number; y: number; page: number }

const CLASS_RE =
  /^(БЕБ|Б|ЩЕН|ЮН|ПРМ|ОТК|РАБ|ЧЕМ(?:\s+НКП)?|ЧНКП|ПОЧ(?:\s+НКП)?|ВЕТ|BABY|PUPPY|JUNIOR|INTERMEDIATE|OPEN|WORKING|CHAMPION|VETERAN)$/i

const GRADE_RE =
  /^(ОТЛ|ОЧ\.?\s*ХОР|ОЧХОР|ХОР|УД|ОП|П|БР|НЯ|Н\/Я|БО|Б\/О|Б\/ОЦ|НЕЯВК(?:А)?|EXC|VG|G|S|VERY\s*GOOD|N\/B)$/i

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

const DATE_RE = /^\d{2}\.\d{2}\.\d{4}$/
const MAIN_RING_RE = /ВЕДОМОСТЬ\s+ГЛАВНОГО\s+РИНГА/i

function normToken(raw: string): string {
  return raw.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
}

export { normalizeCertLookalikes }

function isCertToken(tok: string): boolean {
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
  const letters = tok.replace(/[^A-Za-zА-Яа-яЁё]/g, '')
  if (letters.length < 3) return false
  const upper = letters === letters.toUpperCase()
  const hasCyr = /[А-ЯЁ]/.test(letters)
  return upper && (hasCyr || /^[A-Z][A-Z\s\-']+$/.test(tok))
}

/** Size / colour / variety lines that continue a multi-line breed cell (not a new breed). */
// Note: do not use \b — JS word boundaries ignore Cyrillic.
const BREED_CONTINUATION_START_RE =
  /^(?:ДРУГИЕ(?:\s+ОКРАСЫ)?|ОКРАСЫ|\(|\/|ПЛАЩОМ|ПОДПАЛОМ|ПОДПАЛЫЙ|ПЯТНИСТЫЙ|ТРЁХЦВЕТНЫЙ|ДВУХЦВЕТНЫЙ|МНОГОЦВЕТНЫЙ|ОДНОЦВЕТНЫЙ|ЧЁРНЫЙ|БЕЛЫЙ|СЕРЫЙ|РЫЖИЙ|КОРИЧНЕВЫЙ|ОРАНЖЕВЫЙ|КРАСНЫЙ|АБРИКОСОВЫЙ|КРЕМОВЫЙ|ГОЛУБОЙ|ПАЛЕВЫЙ|ЗОЛОТИСТЫЙ|СЕРЕБРИСТЫЙ|МИНИАТЮРНЫЙ|МИНИАТЮРНАЯ|ТОЙ|СРЕДНИЙ|СРЕДНЯЯ|ГИГАНТСКИЙ|СТАНДАРТНЫЙ|СТАНДАРТНАЯ|ДЛИННОШЕРСТНАЯ|ДЛИННОШЕРСТНЫЙ|КОРОТКОШЕРСТНАЯ|КОРОТКОШЕРСТНЫЙ|КОРОТКОШЁРСТНАЯ|ЖЁСТКОШЕРСТНАЯ|ЖЕСТКОШЕРСТНАЯ|ЖЕСТКОШЕРСТНЫЙ|ЖЕСТКОШЁРСТНАЯ|ГЛАДКОШЕРСТНАЯ|ГЛАДКОШЕРСТНЫЙ|ГЛАДКОШЁРСТНАЯ|МЯГКОШЕРСТНЫЙ|МАЛИНУА|ГРИНЕНДАЛЬ|ТЕРВЮРЕН|ЛАКЕНУА|FAWN|BLACK|WHITE|CREAM|RED|BLUE|BROWN|ORANGE|GREY|GRAY)(?:\s|,|$|\/|\))/i

/** Second half of a wrapped breed noun: «АВСТРАЛИЙСКАЯ» + «ОВЧАРКА», «МАЛАЯ ИТАЛЬЯНСКАЯ» + «БОРЗАЯ (ЛЕВРЕТКА)». */
const BREED_WRAP_SUFFIX_RE =
  /^(?:ОВЧАРКА|ТЕРЬЕР|РЕТРИВЕР|СПАНИЕЛЬ|ПИНЧЕР|БУЛЬДОГ|КОРГИ|ХАУНД|ДОГ|ШПИЦ|ТАКСА|БОРЗАЯ|ЛЕВРЕТКА|РИДЖБЕК|МАСТИФ|ШНАУЦЕР|ПИНЧЕР|ВОЛЬФХАУНД|ВОЛКОДАВ)(?:\s|$|,|\()/i

function isSoftHyphenContinuation(prev: string, next: string): boolean {
  const p = normToken(prev)
  const n = normToken(next)
  if (!p || !n) return false
  // «ВОСТОЧНОЕВРОПЕЙСКА» + «Я ОВЧАРКА»
  if (!/\s/.test(p) && p.length >= 8 && /[А-ЯЁA-Za-zа-яё]$/u.test(p)) {
    if (/^[А-ЯЁA-Z]{1,3}(?:\s|$)/u.test(n)) return true
  }
  // «АВСТРАЛИЙСКАЯ» + «ОВЧАРКА» (adjective line + noun)
  if (BREED_WRAP_SUFFIX_RE.test(n) && !BREED_WRAP_SUFFIX_RE.test(p) && !/(?:ОВЧАРКА|ТЕРЬЕР|РЕТРИВЕР)\s*$/i.test(p)) {
    return true
  }
  return false
}

export function isBreedContinuationLine(str: string): boolean {
  const t = normToken(str)
  if (!t) return false
  if (BREED_CONTINUATION_START_RE.test(t)) return true
  // Wrapped leftovers: «ПЛАЩОМ, С», «ПОДПАЛОМ,» — but NOT a new breed that ends with a comma
  // («ПУДЕЛЬ ТОЙ ЧЁРНЫЙ,» must start a new block, not glue onto «ПТИ БРАБАНСОН»).
  if (/,$/.test(t) && t.length < 48) {
    const withoutComma = t.replace(/,+\s*$/, '')
    const words = withoutComma.split(/\s+/).filter(Boolean)
    // Multi-word ALLCAPS breed header (ПУДЕЛЬ ТОЙ ЧЁРНЫЙ / НЕМЕЦКИЙ ШПИЦ …)
    if (words.length >= 2 && words.every((w) => /^[*]?[А-ЯЁA-Z0-9\-\/()]+$/u.test(w))) {
      return false
    }
    if (!/^[А-ЯЁA-Z]{5,}\s+[А-ЯЁA-Z]{5,}/u.test(t)) return true
  }
  return false
}

function isBreedHeaderLine(str: string): boolean {
  const t = normToken(str)
  if (!t || isBreedContinuationLine(t)) return false
  if (!/^[А-ЯЁA-Z*]/.test(t)) return false
  if (/^\d+$/.test(t)) return false
  return true
}

/** Single-token adjective / demonym left after wrap (e.g. «АВСТРАЛИЙСКАЯ» without ОВЧАРКА). */
const ORPHAN_BREED_ADJECTIVE_RE =
  /^[*]?[А-ЯЁA-Z]{3,}(?:СКИЙ|СКАЯ|СКОЕ|СКИЕ|ЦКИЙ|ЦКАЯ|НЫЙ|НАЯ|НОЕ|НЫЙ|ОВЫЙ|ОВАЯ|ИЙ|ЫЙ|АЯ|ЯЯ|ОЕ)$/u

/** Incomplete / orphan breed strings that should not appear as separate «породы» in indexes. */
export function isBreedFragment(raw: string): boolean {
  const t = normToken(raw)
  if (!t) return true
  if (t.startsWith('(') || t.startsWith('/')) return true
  if (isBreedContinuationLine(t)) return true
  if (BREED_WRAP_SUFFIX_RE.test(t) && t.split(/\s+/).length <= 2) return true
  const words = t.split(/\s+/).filter(Boolean)
  // Orphan wrap half: «АВСТРАЛИЙСКАЯ», «НЕМЕЦКИЙ», «БОРЗАЯ», «DOG»
  if (words.length === 1) {
    const w = words[0]!
    if (w === 'DOG' || w === 'DOGS') return true
    if (ORPHAN_BREED_ADJECTIVE_RE.test(w)) return true
  }
  const opens = (t.match(/\(/g) || []).length
  const closes = (t.match(/\)/g) || []).length
  if (opens !== closes) return true
  return false
}

function breedBaseForCarry(prev: string): string {
  const head = normToken(prev).split('(')[0]!.replace(/\s+ДРУГИЕ\s+ОКРАСЫ.*$/i, '').trim()
  // Keep «ПУДЕЛЬ» / «НЕМЕЦКИЙ ШПИЦ» without trailing size+colour when merging a size fragment
  const m = head.match(
    /^((?:\*?[А-ЯЁA-Z][А-ЯЁA-Z\-\s]*?)(?:\s+(?:ШПИЦ|ТЕРЬЕР|ОВЧАРКА|РЕТРИВЕР|СПАНИЕЛЬ|ПИНЧЕР|БУЛЬДОГ|КОРГИ|ХАУНД|ДОГ))?)/u,
  )
  if (m) {
    const base = m[1]!.replace(/\s+(?:МИНИАТЮРНЫЙ|ТОЙ|СРЕДНИЙ|ГИГАНТСКИЙ|СТАНДАРТНЫЙ)\b.*$/i, '').trim()
    if (base.length >= 4) return base
  }
  const first = head.split(/\s+/)[0]
  return first && first.length >= 4 ? first : head
}

function mergeBreedCarry(prevFull: string, fragment: string): string {
  const frag = normToken(fragment)
  const base = breedBaseForCarry(prevFull)
  if (!frag) return prevFull
  if (frag.toUpperCase().startsWith(base.toUpperCase())) return frag
  return joinCellLines([base, frag])
}

type BreedBlock = { page: number; yMax: number; yMin: number; parts: string[] }

function collectBreedBlocks(tableItems: PdfItem[], bounds: ColBounds): BreedBlock[] {
  const breedItems = tableItems
    .filter((it) => colForX(it.x, it.str, bounds) === 'breed' && !isHeaderLabel(it.str))
    .sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x)

  const blocks: BreedBlock[] = []
  let cur: BreedBlock | null = null
  for (const it of breedItems) {
    const prevPart = cur?.parts[cur.parts.length - 1] || ''
    const forceContinue =
      !!cur &&
      cur.page === it.page &&
      (/ДРУГИЕ$/i.test(prevPart) ||
        /\($/.test(prevPart) ||
        /,$/.test(prevPart) ||
        isSoftHyphenContinuation(prevPart, it.str))
    const startNew =
      !cur || cur.page !== it.page || (!forceContinue && isBreedHeaderLine(it.str))
    if (startNew) {
      cur = { page: it.page, yMax: it.y, yMin: it.y, parts: [it.str] }
      blocks.push(cur)
    } else {
      cur!.parts.push(it.str)
      cur!.yMin = Math.min(cur!.yMin, it.y)
      cur!.yMax = Math.max(cur!.yMax, it.y)
    }
  }
  return blocks
}

function assignBreedBlocksToAnchors(
  blocks: BreedBlock[],
  anchors: PdfItem[],
): Map<number, string> {
  const out = new Map<number, string>()
  const usedAnchors = new Set<number>()
  const usedBlocks = new Set<number>()

  // Dense Excel→PDF: breed label and catalog # share nearly the same Y.
  // Pair each catalog to the closest unused breed block (tight Y window).
  const byPage = new Map<number, number[]>()
  for (let i = 0; i < anchors.length; i++) {
    const p = anchors[i]!.page
    const list = byPage.get(p) || []
    list.push(i)
    byPage.set(p, list)
  }

  for (const [, anchorIdxs] of byPage) {
    const ordered = [...anchorIdxs].sort((a, b) => anchors[b]!.y - anchors[a]!.y)
    for (const ai of ordered) {
      const a = anchors[ai]!
      let bestBi = -1
      let bestDist = 10 // pt — same-row labels sit within a few points
      for (let bi = 0; bi < blocks.length; bi++) {
        if (usedBlocks.has(bi)) continue
        const block = blocks[bi]!
        if (block.page !== a.page) continue
        const yRef = (block.yMax + block.yMin) / 2
        const dist = Math.abs(a.y - yRef)
        const distTop = Math.abs(a.y - block.yMax)
        const d = Math.min(dist, distTop)
        if (d < bestDist) {
          bestDist = d
          bestBi = bi
        }
      }
      if (bestBi < 0) continue
      usedBlocks.add(bestBi)
      usedAnchors.add(ai)
      out.set(ai, joinCellLines(blocks[bestBi]!.parts))
    }
  }

  // Leftover blocks (wrapped orphan / empty section): nearest free catalog below
  for (let bi = 0; bi < blocks.length; bi++) {
    if (usedBlocks.has(bi)) continue
    const block = blocks[bi]!
    const text = joinCellLines(block.parts)
    if (!text) continue
    let idx = -1
    let bestDist = Infinity
    for (let i = 0; i < anchors.length; i++) {
      if (usedAnchors.has(i)) continue
      const a = anchors[i]!
      if (a.page !== block.page) continue
      if (a.y > block.yMax + 3) continue
      const dist = block.yMax - a.y
      if (dist < bestDist) {
        bestDist = dist
        idx = i
      }
    }
    if (idx < 0) continue
    usedAnchors.add(idx)
    usedBlocks.add(bi)
    out.set(idx, text)
  }

  return out
}

/** Judge FIO: mixed case or ALLCAPS surname+name (PDF often ALLCAPS). */
export function isPlausibleJudgeName(raw: string): boolean {
  const name = normToken(raw)
  if (name.length < 5) return false
  if (DATE_RE.test(name) || isCertToken(name) || isGrade(name) || isClass(name)) return false
  if (/^(ЛПП|BOB|BOS|CAC|ОЧ\.?Х|НЕЯВ)/i.test(name)) return false
  // Reject pure breed-like single ALLCAPS phrases without a second name token… allow 2+ words ALLCAPS
  const words = name.split(/\s+/).filter(Boolean)
  if (words.length < 2) return false
  // Must look like a person: has lowercase somewhere OR (2–4 ALLCAPS words typical for FIO)
  const hasLower = /[a-zа-яё]/.test(name)
  if (hasLower) return /[A-Za-zА-Яа-яЁё]/.test(name)
  if (words.length >= 2 && words.length <= 5 && words.every((w) => /^[А-ЯЁA-Z][А-ЯЁA-Z'’\-]*$/.test(w))) {
    // Filter obvious breed words as first token
    const breedish =
      /ОВЧАРКА|ТЕРЬЕР|РЕТРИВЕР|БУЛЬДОГ|КОРГИ|ШПИЦ|ПУДЕЛЬ|ХАСКИ|ДОБЕРМАН|РОТВЕЙЛЕР|МОПС|БИГЛЬ|КОЛЛИ|ШЕЛТИ|МАЛЬТЕЗЕ|БАСЕНДЖИ|СИБА|ПИНЧЕР|СПАНИЕЛЬ/i
    if (breedish.test(name)) return false
    return true
  }
  return false
}

function joinCellLines(parts: string[]): string {
  const cleaned = parts.map(normToken).filter(Boolean)
  if (cleaned.length === 0) return ''
  let out = cleaned[0]!
  for (let i = 1; i < cleaned.length; i++) {
    const next = cleaned[i]!
    // Soft hyphenation: «ВОСТОЧНОЕВРОПЕЙСКА» + «Я ОВЧАРКА»
    if (!/\s/.test(out) && out.length >= 8) {
      const m = next.match(/^([А-ЯЁA-Z]{1,3})(\s+[\s\S]*)?$/u)
      if (m && /[А-ЯЁA-Za-zа-яё]$/u.test(out)) {
        out = out + m[1] + (m[2] || '')
        continue
      }
    }
    // ФИО: «ВАЛЕНТИНОВН» + «А» → «ВАЛЕНТИНОВНА» (в т.ч. после имени)
    const lastWord = out.includes(' ') ? out.slice(out.lastIndexOf(' ') + 1) : out
    if (/^[А-ЯЁA-Z]{6,}$/u.test(lastWord) && /^[А-ЯЁA-Z]$/u.test(next)) {
      out = out + next
      continue
    }
    // «Неявк» + «а»
    if (/^Неявк$/i.test(out) && /^а$/i.test(next)) {
      out = 'Неявка'
      continue
    }
    if (/^ОЧ\.?$/i.test(out) && /^ХОР$/i.test(next)) {
      out = 'ОЧ. ХОР'
      continue
    }
    out = `${out} ${next}`
  }
  return out.replace(/\s+/g, ' ').trim()
}

type ColBounds = {
  breedEnd: number
  judgeEnd: number
  catalogEnd: number
  nameEnd: number
  birthEnd: number
  pedigreeEnd: number
  classEnd: number
  gradeEnd: number
}

type ColKey =
  | 'breed'
  | 'judge'
  | 'catalog'
  | 'name'
  | 'birth'
  | 'pedigree'
  | 'class'
  | 'grade'
  | 'certs'

function detectColBounds(items: PdfItem[]): ColBounds | null {
  // Prefer the header line that contains both «Порода» and «Судья»
  const poroda = items.filter((it) => /^Порода$/i.test(it.str))
  const sudya = items.filter((it) => /^Судья$/i.test(it.str))
  if (poroda.length === 0 || sudya.length === 0) return null

  // Pick the pair closest in Y
  let best: { p: PdfItem; s: PdfItem; dist: number } | null = null
  for (const p of poroda) {
    for (const s of sudya) {
      if (p.page !== s.page) continue
      const dist = Math.abs(p.y - s.y)
      if (dist > 8) continue
      if (!best || dist < best.dist) best = { p, s, dist }
    }
  }
  if (!best) return null

  const headerY = best.p.y
  const page = best.p.page
  const headerBand = items.filter(
    (it) => it.page === page && Math.abs(it.y - headerY) < 14,
  )

  const xOf = (...preds: RegExp[]): number | null => {
    for (const re of preds) {
      const hit = headerBand.find((it) => re.test(it.str))
      if (hit) return hit.x
    }
    return null
  }

  const breedX = best.p.x
  const judgeX = best.s.x
  const catalogX = xOf(/^ката/i, /^№\s*по/i, /^логу$/i) ?? judgeX + 40
  const nameX = xOf(/^Кличка/i) ?? catalogX + 25
  const birthX = xOf(/рожден/i, /^Дата$/i) ?? nameX + 50
  const pedX = xOf(/родословн/i, /^Номер$/i) ?? birthX + 40
  const classX = xOf(/^Класс$/i) ?? pedX + 40
  const gradeX = xOf(/^Оцен/i) ?? classX + 25
  const certX = xOf(/^CACIB$/i, /^CAC$/i, /^КЧК/i, /^ПК\//i, /^JCAC$/i) ?? gradeX + 30

  const mid = (a: number, b: number) => (a + b) / 2

  return {
    breedEnd: mid(breedX, judgeX),
    judgeEnd: mid(judgeX, catalogX),
    catalogEnd: mid(catalogX, nameX),
    nameEnd: mid(nameX, birthX),
    birthEnd: mid(birthX, pedX),
    pedigreeEnd: mid(pedX, classX),
    classEnd: mid(classX, gradeX),
    gradeEnd: mid(gradeX, certX),
  }
}

function colForX(x: number, str: string, b: ColBounds): ColKey {
  if (x < b.breedEnd) return 'breed'
  if (x < b.judgeEnd) return 'judge'
  // Catalog № and name sit almost on top of each other in Excel exports
  if (x < b.nameEnd) {
    if (/^\d{1,4}$/.test(str)) return 'catalog'
    return 'name'
  }
  if (x < b.birthEnd) return 'birth'
  if (x < b.pedigreeEnd) return 'pedigree'
  if (x < b.classEnd) return 'class'
  if (x < b.gradeEnd) {
    if (isGrade(str) || /^Неявк/i.test(str) || str === 'а') return 'grade'
    if (isClass(str) || /^ЧЕМ/i.test(str) || /^ЩЕ$/i.test(str)) return 'class'
    // Lone «Н» after wrapped «ЩЕ» — keep in class/grade band as class fragment
    if (/^Н$/i.test(str)) return 'class'
    return 'grade'
  }
  if (isGrade(str) || /^Неявк/i.test(str) || str === 'а') return 'grade'
  return 'certs'
}

async function extractItems(pdfPath: string): Promise<{
  items: PdfItem[]
  pageCount: number
  hasMainRing: boolean
}> {
  const data = new Uint8Array(fs.readFileSync(pdfPath))
  const doc = await getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise
  const items: PdfItem[] = []
  let hasMainRing = false
  let stop = false

  for (let p = 1; p <= doc.numPages && !stop; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    type Raw = { str?: string; transform?: number[] }
    const pageItems: PdfItem[] = []
    let mainRingY: number | null = null
    for (const raw of content.items as Raw[]) {
      const str = normToken(raw.str || '')
      if (!str) continue
      const tr = raw.transform || [1, 0, 0, 1, 0, 0]
      const y = tr[5] ?? 0
      if (MAIN_RING_RE.test(str)) {
        hasMainRing = true
        mainRingY = y
        continue
      }
      pageItems.push({ str, x: tr[4] ?? 0, y, page: p })
    }
    if (mainRingY != null) {
      // Keep only content above the main-ring sheet title (higher Y).
      items.push(...pageItems.filter((it) => it.y > mainRingY! + 2))
      stop = true
    } else {
      items.push(...pageItems)
    }
  }

  return { items, pageCount: doc.numPages, hasMainRing }
}

function findCatalogAnchors(items: PdfItem[], bounds: ColBounds): PdfItem[] {
  const anchors: PdfItem[] = []
  for (const it of items) {
    if (!/^\d{1,4}$/.test(it.str)) continue
    const n = Number(it.str)
    if (n < 1 || n > 9000) continue
    if (colForX(it.x, it.str, bounds) !== 'catalog') continue
    const hasDate = items.some(
      (o) =>
        o.page === it.page &&
        Math.abs(o.y - it.y) < 10 &&
        DATE_RE.test(o.str) &&
        colForX(o.x, o.str, bounds) === 'birth',
    )
    if (!hasDate) continue
    anchors.push(it)
  }
  anchors.sort((a, b) => a.page - b.page || b.y - a.y || Number(a.str) - Number(b.str))
  const out: PdfItem[] = []
  for (const a of anchors) {
    const prev = out[out.length - 1]
    if (prev && prev.page === a.page && prev.str === a.str && Math.abs(prev.y - a.y) < 2) continue
    out.push(a)
  }
  return out
}

function normalizeGrade(raw: string): string {
  const t = raw.replace(/\s+/g, ' ').trim()
  const compact = t.toUpperCase().replace(/Ё/g, 'Е').replace(/[\s./\-]/g, '')
  if (
    compact === 'НЯ' ||
    compact === 'НЕЯВКА' ||
    /^НЕЯ[А-ЯA-Z]?ВКА$/.test(compact) ||
    /НЕЯ[А-ЯA-Z]?ВКА$/.test(compact) ||
    /^Неявк/i.test(t) ||
    /ЯВК(?:А)?/.test(compact)
  ) {
    return 'НЯ'
  }
  if (compact === 'БО' || compact === 'БОЦ') return 'БО'
  if (/^ДИСКВ/.test(compact)) return 'ДИСКВАЛ'
  // «ОТ Л» / «ОЧ. ХО Р» — перенос аббревиатуры оценки
  if (/^ОТЛ$/i.test(compact)) return 'ОТЛ'
  if (/^ОЧ\.?ХОР$/i.test(compact) || /^ОЧХОР$/i.test(compact) || /^ОЧХО$/i.test(compact) || /^ХО$/i.test(compact)) {
    return 'ОЧ. ХОР'
  }
  if (/^ХОР$/i.test(compact)) return 'ХОР'
  if (/^ОЧ\.?\s*ХОР$/i.test(t) || /^ОЧХОР$/i.test(t)) return 'ОЧ. ХОР'
  return t
}

/**
 * Узкий PDF переносит класс по слогам: «Ю»+«Н»→ЮН, «ПР»+«М»→ПРМ, «ЧЕ»+«М»→ЧЕМ,
 * «ЩЕ»+«Н»→ЩЕН (оценка между ними — recoverWrappedPuppyClassAndGrade).
 */
export function glueWrappedClassAbbrev(classRaw: string): string {
  const spaced = classRaw.replace(/\s+/g, ' ').trim()
  if (!spaced) return ''
  const compact = spaced.toUpperCase().replace(/Ё/g, 'Е').replace(/\s+/g, '')
  if (/^ЧЕМНКП$/i.test(compact) || /^ЧНКП$/i.test(compact)) return 'ЧЕМ НКП'
  if (/^ПОЧНКП$/i.test(compact)) return 'ПОЧ НКП'
  if (
    /^(БЕБ|Б|ЩЕН|ЮН|ПРМ|ОТК|РАБ|ЧЕМ|ПОЧ|ВЕТ|BABY|PUPPY|JUNIOR|INTERMEDIATE|OPEN|WORKING|CHAMPION|VETERAN)$/i.test(
      compact,
    )
  ) {
    return compact.toUpperCase() === 'Б' ? 'Б' : compact
  }
  return spaced
}

/**
 * Узкий PDF переносит «ЩЕН» как «ЩЕ» + «Н», а оценка стоит между ними по Y.
 * Также: переплетённые класс+оценка «ПР ОТ М Л» → ПРМ + ОТЛ.
 */
export function disentangleClassAndGrade(
  classRaw: string,
  gradeRaw: string,
): { dogClass: string; grade: string } {
  const recovered = recoverWrappedPuppyClassAndGrade(classRaw, gradeRaw)
  if (recovered) {
    return { dogClass: recovered.dogClass, grade: normalizeGrade(recovered.grade) }
  }

  const interleaved = recoverInterleavedClassAndGrade(classRaw, gradeRaw)
  if (interleaved) {
    return {
      dogClass: interleaved.dogClass === 'ЧНКП' ? 'ЧЕМ НКП' : interleaved.dogClass,
      grade: normalizeGrade(interleaved.grade),
    }
  }

  const glued = glueWrappedClassAbbrev(classRaw)
  let dogClass = ''
  if (
    isClass(glued) ||
    /^ЧЕМ(\s+НКП)?$/i.test(glued) ||
    /^ПОЧ(\s+НКП)?$/i.test(glued) ||
    /^ЧНКП$/i.test(glued)
  ) {
    dogClass = glued
  } else {
    for (const part of glued.split(/\s+/)) {
      if (isClass(part)) {
        dogClass = part
        break
      }
    }
  }

  return { dogClass, grade: normalizeGrade(gradeRaw) }
}

function parseDogWindow(
  windowItems: PdfItem[],
  catalog: number,
  bounds: ColBounds,
): ParsedCertDog | null {
  const buckets: Record<ColKey, PdfItem[]> = {
    breed: [],
    judge: [],
    catalog: [],
    name: [],
    birth: [],
    pedigree: [],
    class: [],
    grade: [],
    certs: [],
  }
  for (const it of windowItems) {
    if (isHeaderLabel(it.str)) continue
    if (/^\d{1,4}$/.test(it.str) && Number(it.str) === catalog) continue
    buckets[colForX(it.x, it.str, bounds)].push(it)
  }
  for (const key of Object.keys(buckets) as ColKey[]) {
    buckets[key].sort((a, b) => b.y - a.y || a.x - b.x)
  }

  const breed = joinCellLines(buckets.breed.map((i) => i.str))
  const judge = joinCellLines(buckets.judge.map((i) => i.str))
  let dogName = joinCellLines(buckets.name.map((i) => i.str))
  dogName = dogName.replace(new RegExp(`^${catalog}\\s+`), '').trim()
  const birth = joinCellLines(buckets.birth.map((i) => i.str))
  const birthDate = birth.split(/\s+/).find((t) => DATE_RE.test(t)) || ''
  let pedigree = joinCellLines(buckets.pedigree.map((i) => i.str))
  if (/\bN\/B\b/i.test(dogName)) {
    dogName = dogName.replace(/\s*N\/B\s*/gi, ' ').trim()
    if (!pedigree) pedigree = 'N/B'
  }
  const classRaw = joinCellLines(buckets.class.map((i) => i.str))
  const gradeJoined = joinCellLines(buckets.grade.map((i) => i.str))
  const { dogClass, grade: gradeRaw } = disentangleClassAndGrade(classRaw, gradeJoined)

  const titles: string[] = []
  let bob = false
  let showDate = ''
  const rawCerts = buckets.certs
    .map((i) => i.str)
    .filter((s) => !isHeaderLabel(s) && !/проведения|выставки|^Дата$/i.test(s))
  const titleFrags: string[] = []
  for (const s of rawCerts) {
    if (DATE_RE.test(s)) {
      if (!showDate) showDate = s
      continue
    }
    titleFrags.push(s)
  }
  const certParts = glueWrappedTitleParts(titleFrags)
  for (let i = 0; i < certParts.length; i++) {
    let tok = certParts[i]!
    const next = certParts[i + 1]
    if (/^ОЧ\.?$/i.test(tok) && next && /^ХОР$/i.test(next)) {
      // grade leaked into certs — ignore
      i++
      continue
    }
    if (/^BOB$/i.test(tok) || /^ЛПП/i.test(tok)) {
      bob = true
      if (!titles.some((t) => /BOB|ЛПП/i.test(t))) titles.push('ЛПП')
      continue
    }
    if (isCertToken(tok) || matchShowAwardToken(tok) || matchShowAwardToken(normalizeCertLookalikes(tok))) {
      if (/^КЧК\/\s*КЧП$/i.test(tok)) titles.push('КЧК/КЧП')
      else if (/^ЮКЧК/i.test(tok)) titles.push(tok.includes('ЮКЧП') ? 'ЮКЧК/ЮКЧП' : 'ЮКЧК')
      else if (/^ВКЧК/i.test(tok)) titles.push('ВКЧК')
      else {
        const key = matchShowAwardToken(tok) || matchShowAwardToken(normalizeCertLookalikes(tok))
        if (key && SHOW_AWARD_BADGE[key]) {
          titles.push(SHOW_AWARD_BADGE[key])
        } else {
          const canon = normalizeCertLookalikes(tok)
          titles.push((canon !== tok ? canon : tok).replace(/\s+/g, ''))
        }
      }
      continue
    }
    if (tok === '/' && titles.length) continue
  }

  if (!dogName || catalog < 1) return null
  // Breed may be filled later from a multi-line breed block above/below the row.
  // Require class OR grade (DNS may have Неявка without class? usually has class)
  if (!dogClass && !gradeRaw) return null

  return {
    breed,
    judge,
    catalog_number: catalog,
    dog_name: dogName,
    birth_date: birthDate,
    pedigree,
    class: dogClass || '',
    grade: gradeRaw,
    title: titles.join(', '),
    bob,
    show_date: showDate,
  }
}

const HEADER_LABEL_RE =
  /^(Порода|Судья|Кличка собаки|Класс|Оценка|Оценк|Номер|Дата|рождения|родословной|каталогу|ката-|логу|№ по|проведения|выставки)$/i

function isHeaderLabel(str: string): boolean {
  return HEADER_LABEL_RE.test(str.trim())
}

function parseItemsColumnAware(items: PdfItem[]): ParsedCertDog[] {
  const bounds = detectColBounds(items)
  if (!bounds) return []

  // Drop meta header block above table (keep from Порода header downward)
  const poroda = items.find((it) => /^Порода$/i.test(it.str))
  const tableItems = poroda
    ? items.filter(
        (it) =>
          !isHeaderLabel(it.str) &&
          (it.page > poroda.page || (it.page === poroda.page && it.y < poroda.y - 2)),
      )
    : items.filter((it) => !isHeaderLabel(it.str))

  const anchors = findCatalogAnchors(tableItems, bounds)
  if (anchors.length === 0) return []

  const breedByAnchor = assignBreedBlocksToAnchors(
    collectBreedBlocks(tableItems, bounds),
    anchors,
  )

  const dogs: ParsedCertDog[] = []
  let lastFullBreed = ''
  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i]!
    const prev = anchors[i - 1]
    const next = anchors[i + 1]
    const gapPrev = prev && prev.page === a.page ? prev.y - a.y : null
    const gapNext = next && next.page === a.page ? a.y - next.y : null
    // Cap half-window: dense Excel ~6pt; 4-line FIO (фамилия+имя+отчество+хвост) ~22pt.
    // half = min(gap/2, cap) — на плотных листах gap сам режет окно.
    const halfPrev = gapPrev != null ? Math.min(gapPrev / 2, 24) : 24
    const halfNext = gapNext != null ? Math.min(gapNext / 2, 24) : 24
    const yMax = a.y + halfPrev
    const yMin = a.y - halfNext
    const windowItems = tableItems.filter(
      (it) => it.page === a.page && it.y < yMax && it.y > yMin,
    )
    const dog = parseDogWindow(windowItems, Number(a.str), bounds)
    if (!dog) continue

    const blockBreed = breedByAnchor.get(i)
    if (blockBreed) dog.breed = blockBreed
    if (isBreedFragment(dog.breed) && lastFullBreed) {
      dog.breed = mergeBreedCarry(lastFullBreed, dog.breed)
    }
    if (!dog.breed) continue
    if (!isBreedFragment(dog.breed)) lastFullBreed = dog.breed

    dogs.push(dog)
  }

  dogs.sort((a, b) => a.catalog_number - b.catalog_number)
  return dogs
}

/**
 * Legacy flat-token parser (fixtures / simple Excel one-line rows).
 * Layout: BREED JUDGE CATALOG NAME DOB PEDIGREE CLASS GRADE [certs...] SHOW_DATE
 */
export function parseCertificateTokens(tokens: string[]): ParsedCertDog[] {
  const HEADER_MARKERS = /порода|судья|каталог|кличка|родословн|оценка|проведения/i
  const flat = tokens
    .map(normToken)
    .filter((t) => t && t !== '\n')
    .filter((t) => !HEADER_MARKERS.test(t) || t.length > 40)

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
        merged.push('ЛПП')
        i += 2
        continue
      }
      if (/^ЛПП$/i.test(next)) {
        merged.push('ЛПП')
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
    const nameParts: string[] = []
    while (j < merged.length && !DATE_RE.test(merged[j]!)) {
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
    if (j >= merged.length || !isClass(merged[j]!)) {
      i++
      continue
    }
    const dogClass = merged[j]!
    j++
    let grade = ''
    if (j < merged.length && isGrade(merged[j]!)) {
      grade = normalizeGrade(merged[j]!)
      j++
    }
    const titles: string[] = []
    let bob = false
    let showDate = ''
    const titleBuf: string[] = []
    while (j < merged.length) {
      const tok = merged[j]!
      if (DATE_RE.test(tok)) {
        showDate = tok
        j++
        break
      }
      if (isCertToken(tok) || /^BOB/i.test(tok) || /^ЛПП$/i.test(tok)) {
        if (/BOB/i.test(tok) || tok === 'ЛПП') bob = true
        titleBuf.push(tok)
        j++
        continue
      }
      // Перенос титула: «ЮКЧ» + «К», «ВКЧ» + «П»
      if (/^(ЮКЧ|ВКЧ|КЧ|ЮЧРК|ВЧРК|ЧРК)$/i.test(tok) || /^[КППФ]$/i.test(tok)) {
        titleBuf.push(tok)
        j++
        continue
      }
      if (looksLikeBreed(tok)) break
      break
    }
    for (const tok of glueWrappedTitleParts(titleBuf)) {
      if (/BOB/i.test(tok) || tok === 'ЛПП') bob = true
      titles.push(tok)
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
        title: titles.join(', '),
        bob,
        show_date: showDate,
      })
    }
    i = j
  }
  return dogs
}

export async function parseCertificatePdf(pdfPath: string): Promise<ParseCertificatePdfResult> {
  const { items, pageCount, hasMainRing } = await extractItems(pdfPath)
  let dogs = parseItemsColumnAware(items)
  // Fallback for odd layouts
  if (dogs.length === 0) {
    const tokens = items
      .slice()
      .sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x)
      .map((i) => i.str)
    dogs = parseCertificateTokens(tokens)
  }
  return {
    dogs,
    page_count: pageCount,
    raw_token_count: items.length,
    has_main_ring_sheet: hasMainRing,
  }
}

export type MainRingCompetitionKey =
  | 'BIS'
  | 'BIG'
  | 'BIS_JUNIOR'
  | 'BIS_VETERAN'
  | 'BIS_PUPPY'
  | 'BIS_BABY'
  | 'OTHER'

export interface MainRingRow {
  competition_key: MainRingCompetitionKey
  competition_label: string
  /** FCI group number for BIG, else null */
  group: number | null
  place: number
  breed: string
  catalog_number: number
  dog_name: string
  pedigree: string
  judge: string
  /** Канонический бейдж для place=1 (BIS, BIG, BIS-Ю…), иначе '' */
  award_badge: string
}

async function extractAllItems(pdfPath: string): Promise<{ items: PdfItem[]; pageCount: number }> {
  const data = new Uint8Array(fs.readFileSync(pdfPath))
  const doc = await getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise
  const items: PdfItem[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    type Raw = { str?: string; transform?: number[] }
    for (const raw of content.items as Raw[]) {
      const str = normToken(raw.str || '')
      if (!str) continue
      const tr = raw.transform || [1, 0, 0, 1, 0, 0]
      items.push({ str, x: tr[4] ?? 0, y: tr[5] ?? 0, page: p })
    }
  }
  return { items, pageCount: doc.numPages }
}

function classifyMainRingCompetition(label: string): {
  key: MainRingCompetitionKey
  group: number | null
} {
  const u = label.toUpperCase().replace(/\s+/g, ' ').trim()
  const groupM = u.match(/(\d{1,2})\s*ГРУППА\s*FCI/) || u.match(/BEST\s+IN\s+GROUP\s+(\d{1,2})/)
  if (groupM || /BEST\s+IN\s+GROUP/.test(u) || /ГРУППА\s+FCI/.test(u)) {
    return { key: 'BIG', group: groupM ? Number(groupM[1]) : null }
  }
  // RU shorthand on some type3 sheets: «БЭСТ БЭБИ / ЩЕНКОВ / ЮНИОРОВ / ИН ШОУ»
  if (/БЭСТ\s+БЭБИ|BEST\s+IN\s+SHOW\s+BABY|ЛУЧШИЙ\s+БЕБИ/.test(u)) {
    return { key: 'BIS_BABY', group: null }
  }
  if (/БЭСТ\s+ЩЕНК|BEST\s+IN\s+SHOW\s+PUPPY|ЛУЧШИЙ\s+ЩЕНОК/.test(u)) {
    return { key: 'BIS_PUPPY', group: null }
  }
  if (/БЭСТ\s+ЮНИОР|BEST\s+IN\s+SHOW\s+JUNIOR|ЛУЧШИЙ\s+ЮНИОР/.test(u)) {
    return { key: 'BIS_JUNIOR', group: null }
  }
  if (/БЭСТ\s+ВЕТЕРАН|BEST\s+IN\s+SHOW\s+VETERAN|ЛУЧШИЙ\s+ВЕТЕРАН/.test(u)) {
    return { key: 'BIS_VETERAN', group: null }
  }
  if (
    /БЭСТ\s+ИН\s+ШОУ|ЛУЧШАЯ\s+СОБАКА\s+ВЫСТАВКИ/.test(u) ||
    (/BEST\s+IN\s+SHOW/.test(u) && !/BABY|PUPPY|JUNIOR|VETERAN/.test(u))
  ) {
    return { key: 'BIS', group: null }
  }
  return { key: 'OTHER', group: null }
}

function mainRingAwardBadge(key: MainRingCompetitionKey, place: number): string {
  if (place !== 1) return ''
  switch (key) {
    case 'BIS':
      return SHOW_AWARD_BADGE.BIS
    case 'BIG':
      return SHOW_AWARD_BADGE.BIG
    case 'BIS_JUNIOR':
      return SHOW_AWARD_BADGE.BIS_JUNIOR
    case 'BIS_VETERAN':
      return SHOW_AWARD_BADGE.BIS_VETERAN
    case 'BIS_PUPPY':
      return SHOW_AWARD_BADGE.BIS_PUPPY
    case 'BIS_BABY':
      return SHOW_AWARD_BADGE.BIS_BABY
    default:
      return ''
  }
}

const COMP_HEADER_RE =
  /ЛУЧШ(?:ИЙ|АЯ)\s+(?:БЕБИ|ЩЕНОК|ЮНИОР|ВЕТЕРАН|СОБАКА)|BEST\s+IN\s+SHOW|\d{1,2}\s*Группа\s+FCI|BEST\s+IN\s+GROUP|БЭСТ\s+(?:БЭБИ|ЩЕНК|ЮНИОР|ВЕТЕРАН|ИН\s+ШОУ)/i

/** Column anchors from the type3 header row (layouts drift: place@252 vs @272 vs @297). */
type MainRingCols = {
  placeX: number
  breedMinX: number
  catalogMinX: number
  nameMinX: number
  pedigreeMinX: number
}

function detectMainRingCols(items: PdfItem[]): MainRingCols {
  const byY = new Map<number, PdfItem[]>()
  for (const it of items) {
    const y = Math.round(it.y)
    if (!byY.has(y)) byY.set(y, [])
    byY.get(y)!.push(it)
  }
  let placeX = 254
  let breedX = 300
  let catalogX = 450
  let nameX = 560
  let pedigreeX = 710
  for (const row of byY.values()) {
    const rowSorted = row.slice().sort((a, b) => a.x - b.x)
    const mesto = rowSorted.find((t) => /^МЕСТО$/i.test(t.str))
    const poroda = rowSorted.find((t) => /^ПОРОДА$/i.test(t.str))
    if (!mesto || !poroda) continue
    placeX = mesto.x
    breedX = poroda.x
    const cat =
      rowSorted.find((t) => /КАТАЛОГ/i.test(t.str)) ||
      rowSorted.find((t) => /^ПО$/i.test(t.str) && t.x > poroda.x)
    const name = rowSorted.find((t) => /КЛИЧКА/i.test(t.str))
    const ped = rowSorted.find((t) => /РОДОСЛОВН/i.test(t.str))
    if (cat) catalogX = cat.x
    if (name) nameX = name.x
    if (ped) pedigreeX = ped.x
    break
  }
  // Breed text often starts left of the «ПОРОДА» header glyph (header is centered).
  return {
    placeX,
    breedMinX: placeX + 12,
    catalogMinX: (breedX + catalogX) / 2,
    nameMinX: (catalogX + nameX) / 2,
    pedigreeMinX: (nameX + pedigreeX) / 2,
  }
}

/**
 * Dedicated type3 «Ведомость главного ринга» PDF (column-aware).
 * Does not use type1 extractItems stop-at-main-ring logic.
 */
export async function parseMainRingPdf(pdfPath: string): Promise<MainRingRow[]> {
  const { items } = await extractAllItems(pdfPath)
  if (items.length === 0) return []

  const sorted = items.slice().sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x)
  const cols = detectMainRingCols(sorted)

  type CompMark = { y: number; page: number; label: string; key: MainRingCompetitionKey; group: number | null }
  const comps: CompMark[] = []
  let pendingLabel = ''
  let pendingY = 0
  let pendingPage = 0

  const flushPending = () => {
    if (!pendingLabel) return
    const { key, group } = classifyMainRingCompetition(pendingLabel)
    if (key !== 'OTHER' || COMP_HEADER_RE.test(pendingLabel)) {
      comps.push({
        y: pendingY,
        page: pendingPage,
        label: pendingLabel.replace(/\s+/g, ' ').trim(),
        key: key === 'OTHER' ? 'BIS' : key,
        group,
      })
    }
    pendingLabel = ''
  }

  for (const it of sorted) {
    if (it.x < cols.placeX - 20 && COMP_HEADER_RE.test(it.str)) {
      flushPending()
      pendingLabel = it.str
      pendingY = it.y
      pendingPage = it.page
      continue
    }
    if (
      pendingLabel &&
      it.x < cols.placeX - 20 &&
      it.page === pendingPage &&
      pendingY - it.y < 45 &&
      /^(PUPPY|JUNIOR|BABY|VETERAN|SHOW|IN\s+GROUP\s+\d{1,2}\s*FCI)$/i.test(it.str)
    ) {
      pendingLabel = `${pendingLabel} ${it.str}`
      continue
    }
  }
  flushPending()

  /** Headers often sit on row 1 or 2 of a block (not above all places). Voronoi midpoints. */
  function competitionForRow(page: number, y: number): CompMark | null {
    const pageComps = comps
      .filter((c) => c.page === page)
      .slice()
      .sort((a, b) => b.y - a.y)
    if (pageComps.length === 0) return null
    if (pageComps.length === 1) {
      return Math.abs(pageComps[0].y - y) <= 120 ? pageComps[0] : null
    }
    for (let i = 0; i < pageComps.length; i++) {
      const hi = i === 0 ? Infinity : (pageComps[i - 1].y + pageComps[i].y) / 2
      const lo =
        i === pageComps.length - 1 ? -Infinity : (pageComps[i].y + pageComps[i + 1].y) / 2
      if (y <= hi && y > lo) return pageComps[i]
    }
    return pageComps[pageComps.length - 1]
  }

  const placeAnchors = sorted.filter(
    (it) =>
      /^[1-3]$/.test(it.str) &&
      Math.abs(it.x - cols.placeX) <= 40 &&
      Number(it.str) >= 1 &&
      Number(it.str) <= 3,
  )

  const placeYsByPage = new Map<number, number[]>()
  for (const p of placeAnchors) {
    if (!placeYsByPage.has(p.page)) placeYsByPage.set(p.page, [])
    placeYsByPage.get(p.page)!.push(p.y)
  }
  function rowYTol(page: number, _y: number): number {
    const ys = (placeYsByPage.get(page) || []).slice().sort((a, b) => b - a)
    let minGap = 18
    for (let i = 0; i < ys.length - 1; i++) {
      const gap = ys[i] - ys[i + 1]
      if (gap > 5 && gap < minGap) minGap = gap
    }
    // Names/catalogs often sit 4–7pt above the place digit; keep under half gap.
    return Math.max(6, Math.min(9, minGap * 0.45))
  }

  const rows: MainRingRow[] = []
  const seen = new Set<string>()

  for (const placeItem of placeAnchors) {
    const place = Number(placeItem.str)
    const page = placeItem.page
    const y = placeItem.y
    const yTol = rowYTol(page, y)

    const nearToks = sorted
      .filter((it) => it.page === page && Math.abs(it.y - y) <= yTol && it.x > placeItem.x + 5)
      .sort((a, b) => a.x - b.x || b.y - a.y)

    let catalog_number = 0
    let catalogX = 0
    for (const it of nearToks) {
      if (!/^\d{1,4}$/.test(it.str)) continue
      const n = Number(it.str)
      if (n <= 0) continue
      if (it.x >= cols.catalogMinX - 30 || (catalog_number === 0 && it.x >= cols.breedMinX)) {
        catalog_number = n
        catalogX = it.x
        if (it.x >= cols.catalogMinX - 30) break
      }
    }
    if (catalog_number <= 0) continue

    const breed = nearToks
      .filter((it) => it.x < catalogX - 5 && it.x >= cols.breedMinX - 5 && !/^\d+$/.test(it.str))
      .map((i) => i.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    let dog_name = nearToks
      .filter((it) => it.x > catalogX + 5 && it.x < cols.pedigreeMinX + 20 && !/^\d{5,}$/.test(it.str))
      .map((i) => i.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    dog_name = dog_name
      .replace(/\s+(?:RKF|РКФ|N\/B|BGV|MET\.?|AIZ|VCJ|DAU|VEA|IBV|GTH|KFL|ENF)\s*[\d/]*$/i, '')
      .trim()
    if (dog_name.length < 3) {
      // Wrapped name one line below the place row
      dog_name = sorted
        .filter(
          (it) =>
            it.page === page &&
            y - it.y > yTol &&
            y - it.y < yTol * 2 + 4 &&
            it.x > catalogX &&
            it.x < cols.pedigreeMinX + 40,
        )
        .sort((a, b) => a.x - b.x)
        .map((i) => i.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    }
    if (dog_name.length < 3) continue

    let breedFull = breed
    if (/[,-]$/.test(breed) || /\b(?:И|AND|\/)\s*$/i.test(breed) || breed.length < 4) {
      const breedWrap = sorted
        .filter(
          (it) =>
            it.page === page &&
            y - it.y > yTol &&
            y - it.y < yTol * 2 + 4 &&
            it.x >= cols.breedMinX - 5 &&
            it.x < catalogX &&
            !/^\d+$/.test(it.str),
        )
        .sort((a, b) => a.x - b.x)
        .map((i) => i.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (breedWrap) breedFull = `${breedFull} ${breedWrap}`.replace(/\s+/g, ' ').trim()
    }

    const pedigree = nearToks
      .filter((it) => it.x >= cols.pedigreeMinX - 15)
      .sort((a, b) => a.x - b.x)
      .map((i) => i.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    const comp = competitionForRow(page, y)
    if (!comp) continue

    const dedupe = `${comp.key}|${comp.group}|${place}|${catalog_number}|${dog_name}`
    if (seen.has(dedupe)) continue
    seen.add(dedupe)

    rows.push({
      competition_key: comp.key,
      competition_label: comp.label,
      group: comp.group,
      place,
      breed: breedFull,
      catalog_number,
      dog_name,
      pedigree,
      judge: '',
      award_badge: mainRingAwardBadge(comp.key, place),
    })
  }

  rows.sort((a, b) => {
    if (a.competition_label !== b.competition_label) {
      return a.competition_label.localeCompare(b.competition_label, 'ru')
    }
    return a.place - b.place
  })

  return rows
}

/** @deprecated use parseMainRingPdf */
export async function parseBisPdf(
  pdfPath: string,
): Promise<Array<{ place: number; dog_name: string; raw: string }>> {
  const rows = await parseMainRingPdf(pdfPath)
  return rows
    .filter((r) => r.competition_key === 'BIS')
    .map((r) => ({
      place: r.place,
      dog_name: r.dog_name,
      raw: `${r.competition_label} ${r.place} ${r.dog_name}`,
    }))
}
