import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export interface KonuraJudge {
  id: number
  name: string
  country: string
  city: string
  photo_url: string | null
  konura_url: string
}

let cachedJudges: KonuraJudge[] | null = null
let exactMap: Map<string, KonuraJudge> | null = null
let threePartsMap: Map<string, KonuraJudge> | null = null
let twoPartsMap: Map<string, KonuraJudge> | null = null

export function normalizeJudgeFio(fio: string): string {
  return (fio || '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/ия\b/g, 'ья')
    .replace(/[^a-zа-я0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function loadKonuraJudges(): KonuraJudge[] {
  if (cachedJudges) return cachedJudges

  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const jsonPath = path.resolve(currentDir, './konura-judges.json')

  try {
    if (fs.existsSync(jsonPath)) {
      cachedJudges = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as KonuraJudge[]
      return cachedJudges
    }
  } catch (err) {
    console.error('Failed to load konura-judges.json:', err)
  }

  cachedJudges = []
  return cachedJudges
}

function parseForeignCombo(rawName: string): { first: string; last: string; combo: string } {
  const clean = rawName.replace(/\([^)]*\)/g, '').trim()
  if (clean.includes(',')) {
    const [last, first] = clean.split(',').map((s) => s.trim())
    return { first, last, combo: `${first} ${last}`.trim() }
  }
  const parts = clean.split(/\s+/)
  if (parts.length === 2) {
    return { first: parts[0], last: parts[1], combo: clean }
  }
  return { first: '', last: '', combo: clean }
}

function initMaps(): void {
  if (exactMap) return

  exactMap = new Map()
  threePartsMap = new Map()
  twoPartsMap = new Map()

  const judges = loadKonuraJudges()
  for (const j of judges) {
    const norm = normalizeJudgeFio(j.name)
    exactMap.set(norm, j)

    const foreign = parseForeignCombo(j.name)
    if (foreign.combo) {
      const foreignNorm = normalizeJudgeFio(foreign.combo)
      exactMap.set(foreignNorm, j)
      if (foreign.first && foreign.last) {
        const revNorm = normalizeJudgeFio(`${foreign.last} ${foreign.first}`)
        exactMap.set(revNorm, j)
      }
    }

    const parts = norm.split(' ').filter(Boolean)
    if (parts.length === 3) {
      // Last + First + Patronymic
      const key = `${parts[0]}|${parts[1]}|${parts[2]}`
      threePartsMap.set(key, j)
      // Inverted: First + Patronymic + Last -> key by sorted or canonical
      const invKey = `${parts[2]}|${parts[0]}|${parts[1]}`
      threePartsMap.set(invKey, j)
    } else if (parts.length === 2) {
      const key1 = `${parts[0]}|${parts[1]}`
      const key2 = `${parts[1]}|${parts[0]}`
      twoPartsMap.set(key1, j)
      twoPartsMap.set(key2, j)
    }
  }
}

export function matchKonuraJudge(rawName: string): KonuraJudge | null {
  initMaps()
  if (!rawName) return null

  const norm = normalizeJudgeFio(rawName)

  // 1. Exact match
  if (exactMap!.has(norm)) {
    return exactMap!.get(norm)!
  }

  const parts = norm.split(' ').filter(Boolean)
  // 2. 3 parts
  if (parts.length === 3) {
    const key = `${parts[0]}|${parts[1]}|${parts[2]}`
    if (threePartsMap!.has(key)) {
      return threePartsMap!.get(key)!
    }
  }

  // 3. 2 parts
  if (parts.length === 2) {
    const key = `${parts[0]}|${parts[1]}`
    if (twoPartsMap!.has(key)) {
      return twoPartsMap!.get(key)!
    }
  }

  return null
}
