import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

export type SeoStateMap = Record<string, string>

export function parseCliValue(argv: string[], flag: string): string | undefined {
  const prefix = `${flag}=`
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith(prefix)) return arg.slice(prefix.length)
    if (arg === flag && i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
      return argv[i + 1]
    }
  }
  return undefined
}

export function loadSeoState(filePath?: string): { map: SeoStateMap; existed: boolean } {
  if (!filePath || !fs.existsSync(filePath)) return { map: {}, existed: false }
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { map: parsed as SeoStateMap, existed: true }
    }
  } catch {
    console.warn(`[prerender-seo] Invalid SEO state file at ${filePath}, rebuilding full baseline`)
  }
  return { map: {}, existed: false }
}

export function saveSeoState(filePath: string, state: SeoStateMap): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(state), 'utf8')
}

export function writeLineList(filePath: string, lines: string[]): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, lines.length ? `${lines.join('\n')}\n` : '', 'utf8')
}

export function hashHtmlContent(html: string): string {
  return crypto.createHash('sha256').update(html, 'utf8').digest('hex').slice(0, 16)
}

export type TrackerOptions = {
  prevState?: SeoStateMap
  forceAll?: boolean
  skipUnchangedDiskWrites?: boolean
}

/**
 * Tracks rendered entity HTML paths and their content hashes across runs so CI
 * writes and uploads only created/changed pages plus removals.
 */
export class EntityWriteTracker {
  readonly seen = new Set<string>()
  readonly nextState: SeoStateMap = {}
  readonly deltaPaths: string[] = []
  private readonly prevState: SeoStateMap
  private readonly forceAll: boolean
  private readonly skipUnchangedDiskWrites: boolean
  unchangedCount = 0

  constructor(options: TrackerOptions = {}) {
    this.prevState = options.prevState ?? {}
    this.forceAll = Boolean(options.forceAll)
    this.skipUnchangedDiskWrites = Boolean(options.skipUnchangedDiskWrites)
  }

  has(relPath: string): boolean {
    return this.seen.has(relPath)
  }

  recordAndMaybeWrite(
    relPath: string,
    html: string,
    outFile: string,
    isSafePath: boolean,
  ): boolean {
    if (!isSafePath) return false
    const normalized = relPath.replace(/\\/g, '/')
    const hash = hashHtmlContent(html)
    this.seen.add(normalized)
    this.nextState[normalized] = hash

    const isChanged = this.forceAll || this.prevState[normalized] !== hash
    if (isChanged) {
      this.deltaPaths.push(normalized)
    } else {
      this.unchangedCount++
    }

    if (isChanged || !this.skipUnchangedDiskWrites) {
      fs.mkdirSync(path.dirname(outFile), { recursive: true })
      fs.writeFileSync(outFile, html, 'utf8')
    }
    return isChanged
  }

  getDeletedPaths(): string[] {
    return Object.keys(this.prevState).filter((k) => !this.seen.has(k))
  }
}
