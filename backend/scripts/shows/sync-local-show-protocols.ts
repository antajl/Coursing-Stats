/**
 * Copy data/local/shows/exhibitions-rkf → data/v1/shows/exhibitions-rkf
 * so Vite DEV (`serveDataV1` → repo data/v1) can open /shows/exhibition/:rkfId.
 *
 * Also mirrors to frontend/public for completeness (Pages must NOT ship this —
 * path is gitignored).
 *
 * Usage: npm run sync-local-show-protocols
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const SRC = path.join(ROOT, 'data/local/shows/exhibitions-rkf')
const DEST_V1 = path.join(ROOT, 'data/v1/shows/exhibitions-rkf')
const DEST_PUBLIC = path.join(ROOT, 'frontend/public/data/v1/shows/exhibitions-rkf')

function copyRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return 0
  fs.mkdirSync(dest, { recursive: true })
  let n = 0
  for (const name of fs.readdirSync(src)) {
    const from = path.join(src, name)
    const to = path.join(dest, name)
    if (fs.statSync(from).isDirectory()) {
      n += copyRecursive(from, to)
    } else {
      fs.copyFileSync(from, to)
      n++
    }
  }
  return n
}

if (!fs.existsSync(SRC)) {
  console.error(`Nothing to sync: ${SRC} missing. Run parse-rkf-reports first.`)
  process.exit(1)
}

const n1 = copyRecursive(SRC, DEST_V1)
const n2 = copyRecursive(SRC, DEST_PUBLIC)
console.log(`Synced ${n1} files → ${DEST_V1}`)
console.log(`Synced ${n2} files → ${DEST_PUBLIC}`)
console.log('Restart or refresh npm run dev, then open a 2026 show with «Отчёт» from the calendar.')
