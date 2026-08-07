import fs from 'node:fs'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { SHOW_AWARD_BADGE } from '../../../lib/show-award-ranking'
import type { PdfItem } from './types'
import { normToken } from './tokens'

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
