/**
 * Copy data/local/shows/exhibitions-rkf → frontend/public/data/v1/shows/exhibitions-rkf
 * so Vite DEV can open /shows/exhibition/:rkfId.
 *
 * Usage: npm run sync-local-show-protocols
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const SRC = path.join(ROOT, 'data/local/shows/exhibitions-rkf')
const DEST = path.join(ROOT, 'frontend/public/data/v1/shows/exhibitions-rkf')

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

const count = copyRecursive(SRC, DEST)
console.log(`Synced ${count} files → ${DEST}`)
