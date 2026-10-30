/**
 * One-shot: archive Full_Results imports used per-file result ids 1..N,
 * which collide under load-sqlite INSERT OR REPLACE and wipe history from rankings/profiles.
 * Reassign globally unique result.id across comps 1551–1585.
 */
import fs from 'node:fs'
import path from 'node:path'

const V1 = path.join(process.cwd(), 'data/v1/competitions')
const ARCHIVE_RE = /^(155[1-9]|15[6-7]\d|158[0-5])-/

function walk(dir: string, out: string[] = []): string[] {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(full, out)
    else if (ent.name.endsWith('.json')) out.push(full)
  }
  return out
}

function maxResultId(files: string[]): number {
  let max = 0
  for (const file of files) {
    const doc = JSON.parse(fs.readFileSync(file, 'utf8')) as {
      results?: Array<{ id?: number | null }>
    }
    for (const r of doc.results ?? []) {
      const id = Number(r.id)
      if (Number.isFinite(id)) max = Math.max(max, id)
    }
  }
  return max
}

const all = walk(V1)
const archive = all.filter((f) => ARCHIVE_RE.test(path.basename(f))).sort()
const nonArchive = all.filter((f) => !ARCHIVE_RE.test(path.basename(f)))
let next = maxResultId(nonArchive) + 1
console.log(`Start next result id = ${next} (max non-archive)`)
console.log(`Archive files: ${archive.length}`)

let rewritten = 0
let rows = 0
for (const file of archive) {
  const doc = JSON.parse(fs.readFileSync(file, 'utf8')) as {
    results?: Array<{ id?: number | null }>
    result_count?: number
  }
  if (!doc.results?.length) continue
  for (const r of doc.results) {
    r.id = next++
    rows++
  }
  doc.result_count = doc.results.length
  fs.writeFileSync(file, JSON.stringify(doc, null, 2) + '\n', 'utf8')
  rewritten++
  console.log(`OK ${path.basename(file)} → ids …${doc.results[doc.results.length - 1].id}`)
}

console.log(`Rewrote ${rewritten} files, ${rows} result rows. Next free id = ${next}`)
