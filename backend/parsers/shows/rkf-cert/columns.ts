import fs from 'node:fs'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { PdfItem } from './types'
import { DATE_RE, MAIN_RING_RE, isClass, isGrade, normToken } from './tokens'

export type ColBounds = {
  breedEnd: number
  judgeEnd: number
  catalogEnd: number
  nameEnd: number
  birthEnd: number
  pedigreeEnd: number
  classEnd: number
  gradeEnd: number
}

export type ColKey =
  | 'breed'
  | 'judge'
  | 'catalog'
  | 'name'
  | 'birth'
  | 'pedigree'
  | 'class'
  | 'grade'
  | 'certs'

const HEADER_LABEL_RE =
  /^(Порода|Судья|Кличка собаки|Класс|Оценка|Оценк|Номер|Дата|рождения|родословной|каталогу|ката-|логу|№ по|проведения|выставки)$/i

export function isHeaderLabel(str: string): boolean {
  return HEADER_LABEL_RE.test(str.trim())
}

export function detectColBounds(items: PdfItem[]): ColBounds | null {
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

export function colForX(x: number, str: string, b: ColBounds): ColKey {
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

export async function extractItems(pdfPath: string): Promise<{
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

export function findCatalogAnchors(items: PdfItem[], bounds: ColBounds): PdfItem[] {
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
