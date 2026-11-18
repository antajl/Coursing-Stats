import fs from 'node:fs'
import { canonicalBreed, OFFICIAL_BREEDS_SET } from '../../src/lib/breed-mapping'

const breedsPath = 'data/v1/breeds.json'
const content = JSON.parse(fs.readFileSync(breedsPath, 'utf8'))
const rawList: string[] = content.breeds || []

const cleanSet = new Set<string>()

for (const raw of rawList) {
  // Fix specific known typos in raw sporting breeds
  let fixed = raw
  if (raw === 'ВЕСТ-ХАЙЛЕНЛ-УАЙТ-ТЕРЬЕР') fixed = 'ВЕСТ ХАЙЛЕНД УАЙТ ТЕРЬЕР'
  if (raw === 'ТАКСА Ж/Щ') fixed = 'ТАКСА Ж-Ш'
  if (raw === 'ПАРСОН') fixed = 'ПАРСОН РАССЕЛ ТЕРЬЕР'
  if (raw === 'ПОИНТЕР' || raw === 'ПОЙНТЕР') fixed = 'АНГЛИЙСКИЙ ПОЙНТЕР'
  if (raw === 'СПАНИЕЛЬ') fixed = 'АНГЛИЙСКИЙ КОКЕР СПАНИЕЛЬ'
  if (raw === 'ШНАУЦЕР') fixed = 'МИТТЕЛЬШНАУЦЕР'
  if (raw === 'ХЕРДЕР') fixed = 'ГОЛЛАНДСКАЯ ОВЧАРКА'

  const canon = canonicalBreed(fixed)
  if (canon && OFFICIAL_BREEDS_SET.has(canon) && canon !== 'БЕЗ ПОРОДЫ') {
    cleanSet.add(canon)
  }
}

// Add 'БЕЗ ПОРОДЫ' and 'МЕТИС' if they were in the original list
if (rawList.includes('БЕЗ ПОРОДЫ')) cleanSet.add('БЕЗ ПОРОДЫ')
if (rawList.includes('МЕТИС')) cleanSet.add('МЕТИС')

const cleanList = Array.from(cleanSet).sort((a, b) => a.localeCompare(b, 'ru'))
console.log(`breeds.json: ${rawList.length} -> ${cleanList.length} canonical breeds`)

content.breeds = cleanList
fs.writeFileSync(breedsPath, JSON.stringify(content, null, 2), 'utf8')

// If public breeds.json exists, sync it
if (fs.existsSync('frontend/public/data/v1/breeds.json')) {
  fs.writeFileSync('frontend/public/data/v1/breeds.json', JSON.stringify(content, null, 2), 'utf8')
}
