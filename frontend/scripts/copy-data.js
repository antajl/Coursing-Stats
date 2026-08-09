import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SOURCE_DIR = path.resolve(ROOT, '../data/v1')
const TARGET_DIR = path.resolve(ROOT, 'public/data/v1')

const { shouldExcludePublishPath } = await import(
  pathToFileURL(path.resolve(ROOT, '../backend/scripts/publish/publish-exclude.js')).href
)

function rmrf(dir) {
  if (!fs.existsSync(dir)) return
  fs.rmSync(dir, { recursive: true, force: true })
}

function copyDirectory(src, dest, relativePath = '') {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    const entryRelativePath = path.join(relativePath, entry.name)
    const normalizedRel = entryRelativePath.replace(/\\/g, '/')

    if (shouldExcludePublishPath(normalizedRel)) {
      if (!normalizedRel.includes('/')) {
        console.log(`  Excluding: ${normalizedRel}`)
      } else if (
        normalizedRel === 'dogs/by-id' ||
        normalizedRel === 'shows/exhibitions' ||
        normalizedRel.endsWith('/year-data')
      ) {
        console.log(`  Excluding: ${normalizedRel}/`)
      }
      continue
    }

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, entryRelativePath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

/** Copy only exhibition JSON files referenced by shows/index.json (LC / CDN allowlist). */
function copyIndexedExhibitions() {
  const indexPath = path.join(SOURCE_DIR, 'shows', 'index.json')
  if (!fs.existsSync(indexPath)) {
    console.warn('  No shows/index.json — skipping LC exhibition allowlist copy')
    return { copied: 0, missing: 0 }
  }

  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  let copied = 0
  let missing = 0

  for (const rel of Object.values(index)) {
    if (typeof rel !== 'string' || !rel.startsWith('exhibitions/')) continue
    const srcPath = path.join(SOURCE_DIR, 'shows', rel)
    const destPath = path.join(TARGET_DIR, 'shows', rel)
    if (!fs.existsSync(srcPath)) {
      missing++
      continue
    }
    fs.mkdirSync(path.dirname(destPath), { recursive: true })
    fs.copyFileSync(srcPath, destPath)
    copied++
  }

  console.log(`  LC/index exhibitions copied: ${copied} (missing on disk: ${missing})`)
  return { copied, missing }
}

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0
  let n = 0
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) n += countFiles(p)
    else n++
  }
  return n
}

console.log('Copying data/v1 to public/data (clean sync)…')
rmrf(TARGET_DIR)
copyDirectory(SOURCE_DIR, TARGET_DIR)
copyIndexedExhibitions()
const total = countFiles(TARGET_DIR)
const exh = countFiles(path.join(TARGET_DIR, 'shows', 'exhibitions'))
const byId = fs.existsSync(path.join(TARGET_DIR, 'dogs', 'by-id'))
console.log(`Data copied successfully! public/data/v1 files=${total}, exhibitions=${exh}, dogs/by-id=${byId}`)
