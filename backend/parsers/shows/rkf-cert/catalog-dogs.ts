import {
  matchShowAwardToken,
  normalizeCertLookalikes,
  glueWrappedTitleParts,
  SHOW_AWARD_BADGE,
} from '../../../lib/show-award-ranking'
import type { ParsedCertDog, ParseCertificatePdfResult, PdfItem } from './types'
import {
  DATE_RE,
  isCertToken,
  isClass,
  isGrade,
  looksLikeBreed,
  normToken,
} from './tokens'
import { disentangleClassAndGrade, normalizeGrade } from './class-grade'
import {
  type ColBounds,
  type ColKey,
  colForX,
  detectColBounds,
  extractItems,
  findCatalogAnchors,
  isHeaderLabel,
} from './columns'
import {
  assignBreedBlocksToAnchors,
  collectBreedBlocks,
  isBreedFragment,
  joinCellLines,
  mergeBreedCarry,
} from './breed-carry'

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
