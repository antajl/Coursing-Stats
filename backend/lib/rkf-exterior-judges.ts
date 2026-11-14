import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export interface RkfExteriorJudge {
  cert_number: number
  last_name: string
  first_name: string
  second_name: string
  last_name_lat?: string
  first_name_lat?: string
  city_name: string
  ranks?: string
}

let cachedJudges: RkfExteriorJudge[] | null = null
let cachedJudgesMap: Map<string, RkfExteriorJudge> | null = null

export function normalizeJudgeFio(fio: string): string {
  return (fio || '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[\u00a0\s]+/g, ' ')
}

export function loadRkfExteriorJudges(): RkfExteriorJudge[] {
  if (cachedJudges) return cachedJudges

  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const jsonPath = path.resolve(currentDir, './rkf-exterior-judges.json')

  try {
    if (fs.existsSync(jsonPath)) {
      cachedJudges = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as RkfExteriorJudge[]
      return cachedJudges
    }
  } catch (err) {
    console.error('Failed to load rkf-exterior-judges.json:', err)
  }

  cachedJudges = []
  return cachedJudges
}

export function getRkfExteriorJudgesMap(): Map<string, RkfExteriorJudge> {
  if (cachedJudgesMap) return cachedJudgesMap

  const list = loadRkfExteriorJudges()
  const map = new Map<string, RkfExteriorJudge>()

  for (const item of list) {
    const full = `${item.last_name} ${item.first_name} ${item.second_name}`
    const key = normalizeJudgeFio(full)
    map.set(key, item)
  }

  cachedJudgesMap = map
  return cachedJudgesMap
}

export function matchRkfExteriorJudge(name: string): RkfExteriorJudge | null {
  if (!name) return null
  const map = getRkfExteriorJudgesMap()
  const key = normalizeJudgeFio(name)
  return map.get(key) || null
}
