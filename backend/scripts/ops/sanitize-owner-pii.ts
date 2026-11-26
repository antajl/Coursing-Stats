import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve('.')
const DATA_V1 = path.join(ROOT, 'data/v1')

function cleanJsonFiles(dir: string, cleanFn: (obj: any) => boolean): number {
  if (!fs.existsSync(dir)) return 0
  let updated = 0
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      updated += cleanJsonFiles(full, cleanFn)
    } else if (ent.isFile() && ent.name.endsWith('.json')) {
      try {
        const raw = fs.readFileSync(full, 'utf8')
        const data = JSON.parse(raw)
        if (cleanFn(data)) {
          fs.writeFileSync(full, JSON.stringify(data, null, 2) + '\n', 'utf8')
          updated++
        }
      } catch {
        // skip non-JSON or malformed
      }
    }
  }
  return updated
}

function main() {
  let exUpdated = 0
  const exDir = path.join(DATA_V1, 'shows/exhibitions')
  if (fs.existsSync(exDir)) {
    for (const ent of fs.readdirSync(exDir, { withFileTypes: true })) {
      if (!ent.isFile() || !ent.name.endsWith('.json')) continue
      const full = path.join(exDir, ent.name)
      const data = JSON.parse(fs.readFileSync(full, 'utf8')) as any
      let dirty = false
      for (const arr of [data.results, data.main_ring]) {
        if (!Array.isArray(arr)) continue
        for (const r of arr) {
          if (r && typeof r === 'object' && r.owner && String(r.owner).trim()) {
            r.owner = ''
            dirty = true
          }
        }
      }
      if (dirty) {
        fs.writeFileSync(full, JSON.stringify(data), 'utf8')
        exUpdated++
      }
    }
  }

  const dogsByIdUpdated = cleanJsonFiles(path.join(DATA_V1, 'dogs/by-id'), (d) => {
    if (d && typeof d === 'object' && d.owner != null && String(d.owner).trim() !== '') {
      d.owner = null
      return true
    }
    return false
  })

  const compsUpdated = cleanJsonFiles(path.join(DATA_V1, 'competitions'), (d) => {
    let dirty = false
    if (d && Array.isArray(d.results)) {
      for (const r of d.results) {
        if (r?.owner != null && String(r.owner).trim() !== '') {
          r.owner = null
          dirty = true
        }
        if (r?.dog && r.dog.owner != null && String(r.dog.owner).trim() !== '') {
          r.dog.owner = null
          dirty = true
        }
      }
    }
    return dirty
  })

  let packsUpdated = 0
  const profilesDir = path.join(DATA_V1, 'indexes/dog-profiles')
  if (fs.existsSync(profilesDir)) {
    for (const ent of fs.readdirSync(profilesDir, { withFileTypes: true })) {
      if (!ent.isFile() || !ent.name.endsWith('.json')) continue
      const full = path.join(profilesDir, ent.name)
      const data = JSON.parse(fs.readFileSync(full, 'utf8')) as any
      let dirty = false
      const entries = data.byId ? Object.values(data.byId) : [data]
      for (const entry of entries as any[]) {
        if (entry?.dog?.owner != null && String(entry.dog.owner).trim() !== '') {
          entry.dog.owner = null
          dirty = true
        }
      }
      if (dirty) {
        fs.writeFileSync(full, JSON.stringify(data), 'utf8')
        packsUpdated++
      }
    }
  }

  console.log(
    `[sanitize-owner-pii] exhibitions=${exUpdated}, dogs/by-id=${dogsByIdUpdated}, competitions=${compsUpdated}, dog-profile-packs=${packsUpdated}`,
  )
}

main()
