import type { PdfItem } from './types'
import type { ColBounds } from './columns'
import { colForX, isHeaderLabel } from './columns'
import { normToken } from './tokens'

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

export function joinCellLines(parts: string[]): string {
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

export function mergeBreedCarry(prevFull: string, fragment: string): string {
  const frag = normToken(fragment)
  const base = breedBaseForCarry(prevFull)
  if (!frag) return prevFull
  if (frag.toUpperCase().startsWith(base.toUpperCase())) return frag
  return joinCellLines([base, frag])
}

type BreedBlock = { page: number; yMax: number; yMin: number; parts: string[] }

export function collectBreedBlocks(tableItems: PdfItem[], bounds: ColBounds): BreedBlock[] {
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

export function assignBreedBlocksToAnchors(
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
