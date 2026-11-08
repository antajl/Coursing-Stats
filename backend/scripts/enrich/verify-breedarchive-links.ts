import fs from 'fs'
import path from 'path'
import { breedArchiveSubdomain, cleanAlphanumeric } from '../../lib/breedarchive'
import { transliterateRuToLat } from '../../lib/text-normalization'

interface DogRecord {
  source: 'sport' | 'show'
  id: string | number
  name_ru?: string | null
  name_lat?: string | null
  breed?: string | null
  pedigree_url: string
  competition_dog_id?: number | null
}

const allDogsWithUrl: DogRecord[] = []

// 1. Sport dogs
const sportDir = path.join(process.cwd(), 'data', 'v1', 'dogs', 'by-id')
if (fs.existsSync(sportDir)) {
  for (const file of fs.readdirSync(sportDir)) {
    if (!file.endsWith('.json')) continue
    const dog = JSON.parse(fs.readFileSync(path.join(sportDir, file), 'utf8'))
    if (dog.pedigree_url) {
      allDogsWithUrl.push({
        source: 'sport',
        id: dog.id,
        name_ru: dog.name_ru,
        name_lat: dog.name_lat,
        breed: dog.breed,
        pedigree_url: dog.pedigree_url,
      })
    }
  }
}

// 2. Show dogs
const detailsDir = path.join(process.cwd(), 'data', 'v1', 'shows', 'indexes', 'dog-details')
if (fs.existsSync(detailsDir)) {
  for (const shard of fs.readdirSync(detailsDir)) {
    if (!shard.endsWith('.json')) continue
    const map = JSON.parse(fs.readFileSync(path.join(detailsDir, shard), 'utf8'))
    for (const [id, dog] of Object.entries(map) as [string, any][]) {
      if (dog.pedigree_url) {
        allDogsWithUrl.push({
          source: 'show',
          id,
          name_ru: dog.name_ru,
          name_lat: dog.name_lat,
          breed: dog.breed,
          pedigree_url: dog.pedigree_url,
          competition_dog_id: dog.competition_dog_id,
        })
      }
    }
  }
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const d: number[][] = []
  for (let i = 0; i <= m; i++) d[i] = [i]
  for (let j = 0; j <= n; j++) d[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
    }
  }
  return d[m][n]
}

function getCandidateStrings(dog: DogRecord): string[] {
  const rawList = [dog.name_lat, dog.name_ru].filter((s): s is string => Boolean(s && s.trim()))
  const out = new Set<string>()
  for (const raw of rawList) {
    const cleanRaw = cleanAlphanumeric(raw)
    if (cleanRaw) out.add(cleanRaw)
    const translit = cleanAlphanumeric(transliterateRuToLat(raw))
    if (translit) out.add(translit)
  }
  return Array.from(out)
}

const suspiciousLinks: { dog: DogRecord; slug: string; bestTarget: string; score: number }[] = []

for (const d of allDogsWithUrl) {
  const match = d.pedigree_url.match(/\/animal\/view\/([a-z0-9-]+?)(?:-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?$/i)
  if (!match) continue
  let slug = match[1].toLowerCase()
  slug = slug.replace(/^(ch-|cib-|cie-|gch-|jch-|int-ch-|rus-ch-|rkf-ch-)+/, '')
  const cleanSlug = cleanAlphanumeric(slug)
  if (!cleanSlug) continue

  const targets = getCandidateStrings(d)

  let bestSim = 0
  let bestTarget = ''
  for (const t of targets) {
    if (t === cleanSlug) {
      bestSim = 1.0
      bestTarget = t
      break
    }
    if (t.includes(cleanSlug) || cleanSlug.includes(t)) {
      const sim = Math.min(t.length, cleanSlug.length) / Math.max(t.length, cleanSlug.length)
      if (sim > bestSim) {
        bestSim = sim
        bestTarget = t
      }
    } else {
      const dist = levenshtein(t, cleanSlug)
      const maxLen = Math.max(t.length, cleanSlug.length)
      const sim = 1 - dist / maxLen
      if (sim > bestSim) {
        bestSim = sim
        bestTarget = t
      }
    }
  }

  if (bestSim < 0.999) {
    suspiciousLinks.push({ dog: d, slug, bestTarget, score: bestSim })
  }
}

console.log(`Checked ${allDogsWithUrl.length} links. Found ${suspiciousLinks.length} links with similarity < 100% (non-identical):\n`)
suspiciousLinks.sort((a, b) => a.score - b.score)
for (const s of suspiciousLinks.slice(0, 30)) {
  console.log(`[Score: ${(s.score * 100).toFixed(0)}%] Dog ${s.dog.source}#${s.dog.id}: "${s.dog.name_ru || ''}" / "${s.dog.name_lat || ''}" (${s.dog.breed})`)
  console.log(`  Slug: "${s.slug}" vs Target: "${s.bestTarget}"`)
  console.log(`  URL:  ${s.dog.pedigree_url}\n`)
}
