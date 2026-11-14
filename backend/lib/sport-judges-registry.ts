import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export interface SportJudgeInfo {
  fullName: string
  city?: string
  role?: string
  categories?: string[]
  aliases?: string[]
  notes?: string
  verified: boolean
}

interface SportJudgesRegistryJson {
  schema: string
  updatedAt: string
  judges: Record<string, SportJudgeInfo>
}

let cachedRegistry: Record<string, SportJudgeInfo> | null = null

export function getSportJudgesRegistry(): Record<string, SportJudgeInfo> {
  if (cachedRegistry) return cachedRegistry

  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const registryPath = path.resolve(currentDir, './sport-judges-registry.json')

  try {
    if (fs.existsSync(registryPath)) {
      const parsed = JSON.parse(fs.readFileSync(registryPath, 'utf-8')) as SportJudgesRegistryJson
      cachedRegistry = parsed.judges || {}
      return cachedRegistry
    }
  } catch (err) {
    console.error('Failed to load sport-judges-registry.json:', err)
  }

  cachedRegistry = {}
  return cachedRegistry
}

export function getSportJudgeInfo(shortName: string): SportJudgeInfo | null {
  if (!shortName) return null
  const registry = getSportJudgesRegistry()
  const trimmed = shortName.trim()
  return registry[trimmed] || null
}
