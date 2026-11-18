import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { canonicalBreed, sanitizeBreedName, matchesBreedSearch, OFFICIAL_BREEDS_SET } from '../src/lib/breed-mapping'

describe('RKF Breed Sanitization & Normalization Invariants', () => {
  it('correctly cleans bizarre glued papillon and phalene variations from PDF reports', () => {
    const papillonBizarre = [
      'Кавалер фален) папийон',
      'Собака фален) папийон',
      'Хохлатая фален) папийон',
      'Льный той спаниель (папийон)',
      'ЬНЫЙ ТОЙ СПАНИЕЛЬ (ПАПИЙОН)',
      'Спаниель-папийон',
      'Фален) папийон',
      'Кинг континентальный той спаниель (папийон -',
      'Чихуахуа фален) папийон',
      'Континентальный той спаниель (папийон - фален) папийон',
      'КОНТИНЕНТАЛЬНЫЙТОЙ СПАНИЕЛЬ (ПАПИЙОН - ФАЛЕН)',
      'КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ - ПАПИЙОН',
      'КОНТИНЕНТАЛЬНЫЙ ТОЙ- СПАНИЕЛЬ ПАПИЙОН',
      'ЧАРЛЬЗ КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ (ПАПИЙОН -',
      'КИТАЙСКАЯ КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ (ПАПИЙОН -',
      'БИВЕР КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ (ПАПИЙОН -',
      'ПУДЕЛЬ ФАЛЕН) ПАПИЙОН',
      'Папийон',
    ]

    for (const raw of papillonBizarre) {
      expect(canonicalBreed(raw)).toBe('КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ ПАПИЙОН')
    }
  })

  it('correctly handles phalene varieties without confusing with papillon', () => {
    const phaleneBizarre = [
      'КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ ФАЛЕН',
      'Континентальный той спаниель-фален',
      'КОНТИНЕНТАЛЬНЫЙТОЙ СПАНИЕЛЬ -ФАЛЕН',
      'КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ (ФАЛЕН)',
      'ЛЬНЫЙ ТОЙ СПАНИЕЛЬ (ФАЛЕН)',
      'СОБАКА ФАЛЕН)',
      'КАВАЛЕР ФАЛЕН)',
      'СОБАКА ФАЛЕН) ФАЛЕН',
      'ФАЛЕН',
    ]

    for (const raw of phaleneBizarre) {
      expect(canonicalBreed(raw)).toBe('КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ ФАЛЕН')
    }
  })

  it('correctly untangles Xoloitzcuintli glued with Basenji, Laika, or truncated English labels', () => {
    expect(canonicalBreed('БАСЕНДЖИ КСОЛОИТЦКУИНТЛИ (МЕКСИКАНСКАЯ ГОЛАЯ')).toBe('КСОЛОИТЦКУИНТЛИ (СТАНДАРТНЫЙ)')
    expect(canonicalBreed('ЛАЙКА КСОЛОИТСКУИНТЛИ (МЕКСИКАНСКАЯ ГОЛАЯ')).toBe('КСОЛОИТЦКУИНТЛИ (СТАНДАРТНЫЙ)')
    expect(canonicalBreed('МЕКСИКАНСКАЯ ГОЛАЯ СОБАКА СТАНДАРТНАЯ')).toBe('КСОЛОИТЦКУИНТЛИ (СТАНДАРТНЫЙ)')
    expect(canonicalBreed('МЕКСИКАНСКАЯ ГОЛАЯ СОБАКА (МИНИ)')).toBe('КСОЛОИТЦКУИНТЛИ (МИНИАТЮРНЫЙ)')
    expect(canonicalBreed('СОБАКА) СТАНДАРТНАЯ / XOLOITZCUINTLE')).toBe('КСОЛОИТЦКУИНТЛИ (СТАНДАРТНЫЙ)')
  })

  it('correctly cleans Scotch Terrier glued with Norwich Terrier or truncated labels', () => {
    expect(canonicalBreed('НОРВИЧ СКОТЧ ТЕРЬЕР (ШОТЛАНДСКИЙ')).toBe('ШОТЛАНДСКИЙ ТЕРЬЕР')
    expect(canonicalBreed('ОХОТНИЧИЙ СКОТЧ ТЕРЬЕР (ШОТЛАНДСКИЙ')).toBe('ШОТЛАНДСКИЙ ТЕРЬЕР')
    expect(canonicalBreed('СКОТЧ ТЕРЬЕР')).toBe('ШОТЛАНДСКИЙ ТЕРЬЕР')
    expect(canonicalBreed('ШОТЛАНДСКИЙ ТЕРЬЕР (СКОТЧ ТЕРЬЕР)')).toBe('ШОТЛАНДСКИЙ ТЕРЬЕР')
  })

  it('restores truncated breeds from bilingual tail when Russian prefix was lost', () => {
    expect(canonicalBreed('ХОХЛАТАЯ СОБАКА / CHINESE CRESTED')).toBe('КИТАЙСКАЯ ХОХЛАТАЯ СОБАКА')
    expect(canonicalBreed('СОБАКА / CHINESE')).toBe('КИТАЙСКАЯ ХОХЛАТАЯ СОБАКА')
    expect(canonicalBreed('СОБАКА / PYRENEAN')).toBe('ПИРЕНЕЙСКАЯ ГОРНАЯ СОБАКА')
    expect(canonicalBreed('СОБАКА / LITTLE LION')).toBe('МАЛАЯ ЛЬВИНАЯ СОБАКА')
    expect(canonicalBreed('МОНГОЛЬСКАЯ СОБАКА) / HOTOSHO (BURYAT-')).toBe('ХОТОШО (БУРЯТСКАЯ СОБАКА)')
  })

  it('ensures official RKF breed registry exists and contains 500+ standard breeds', () => {
    const registryPath = path.join(process.cwd(), 'data/v1/shows/indexes/rkf-breeds.json')
    expect(fs.existsSync(registryPath)).toBe(true)
    const data = JSON.parse(fs.readFileSync(registryPath, 'utf-8'))
    expect(data.schema).toBe('coursing-stats/rkf-breeds-v1')
    expect(data.count).toBeGreaterThanOrEqual(500)
    expect(data.breeds.length).toBeGreaterThanOrEqual(500)

    const papillon = data.breeds.find((b: any) => b.canonicalRu === 'КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ ПАПИЙОН')
    expect(papillon).toBeDefined()
    expect(papillon.fciStandard).toBe(77)
    expect(papillon.aliases).toContain('ПАПИЙОН')

    const phalene = data.breeds.find((b: any) => b.canonicalRu === 'КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ ФАЛЕН')
    expect(phalene).toBeDefined()
    expect(phalene.fciStandard).toBe(77)
  })

  it('verifies that show ranking files contain ZERO corrupted papillon/phalene strings', () => {
    const showIdxDir = path.join(process.cwd(), 'data/v1/shows/indexes')
    const sampleFiles = [
      'dog-ranking-2026-page0.json',
      'dog-ranking-2025-page0.json',
      'dog-ranking-all-time-page0.json',
      'dog-ranking-2026.json',
    ]
    
    for (const file of sampleFiles) {
      const p = path.join(showIdxDir, file)
      if (!fs.existsSync(p)) continue
      const raw = JSON.parse(fs.readFileSync(p, 'utf-8'))
      const dogs = Array.isArray(raw) ? raw : (raw.dogs || [])
      for (const d of dogs) {
        // Assert no corrupt artifacts remain
        expect(d.breed).not.toMatch(/кавалер.*фален/i)
        expect(d.breed).not.toMatch(/собака.*фален/i)
        expect(d.breed).not.toMatch(/хохлат.*фален/i)
        expect(d.breed).not.toMatch(/(?:^|\s)льный той спаниель/i)
        expect(d.breed).not.toMatch(/спаниель-папий/i)
        expect(d.breed).not.toMatch(/фален\) папий/i)
        expect(d.breed).not.toMatch(/кинг континентальный/i)
        expect(d.breed).not.toMatch(/басенджи ксоло/i)
        expect(d.breed).not.toMatch(/норвич скотч/i)
        expect(d.breed).not.toMatch(/bordeaux\s+бульдог/i)
        expect(d.breed).not.toMatch(/dogue\s+de\s+bordeaux\s+бульдог/i)
        expect(d.breed).not.toMatch(/^xl$/i)
        expect(d.breed).not.toMatch(/^xl\s+бульдог/i)
        expect(d.breed).not.toMatch(/deutscher\s+boxer/i)
        expect(d.breed).not.toMatch(/^fox\s+terrier$/i)
        expect(d.breed).not.toMatch(/^sussex\s+spaniel$/i)
        expect(d.breed).not.toMatch(/[a-zA-Z]/)
      }
    }
  }, 30000)

  it('correctly maps English breed names and cynological abbreviations to canonical Russian', () => {
    expect(canonicalBreed('DEUTSCHER BOXER')).toBe('НЕМЕЦКИЙ БОКСЕР')
    expect(canonicalBreed('DOGUE DE BORDEAUX')).toBe('БОРДОСКИЙ ДОГ')
    expect(canonicalBreed('Bordeaux бульдог')).toBe('БОРДОСКИЙ ДОГ')
    expect(canonicalBreed('Dogue de bordeaux бульдог')).toBe('БОРДОСКИЙ ДОГ')
    expect(canonicalBreed('SUSSEX SPANIEL')).toBe('СУССЕКС СПАНИЕЛЬ')
    expect(canonicalBreed('Sussex spaniel')).toBe('СУССЕКС СПАНИЕЛЬ')
    expect(canonicalBreed('Fox terrier')).toBe('ФОКСТЕРЬЕР Г-Ш')
    expect(canonicalBreed('Toy fox terrier')).toBe('ТОЙ ФОКСТЕРЬЕР')
    expect(canonicalBreed('XL')).toBe('АМЕРИКАНСКИЙ БУЛЛИ')
    expect(canonicalBreed('Американский булли xl')).toBe('АМЕРИКАНСКИЙ БУЛЛИ')
    expect(canonicalBreed('American bully xl')).toBe('АМЕРИКАНСКИЙ БУЛЛИ')
    expect(canonicalBreed('XL бульдог')).toBe('АМЕРИКАНСКИЙ БУЛЛИ')
    expect(canonicalBreed('РПБ')).toBe('РУССКАЯ ПСОВАЯ БОРЗАЯ')
    expect(canonicalBreed('ВЕО')).toBe('ВОСТОЧНОЕВРОПЕЙСКАЯ ОВЧАРКА')
    expect(canonicalBreed('САО')).toBe('СРЕДНЕАЗИАТСКАЯ ОВЧАРКА')
    expect(canonicalBreed('КО')).toBe('КАВКАЗСКАЯ ОВЧАРКА')
    expect(canonicalBreed('НО')).toBe('НЕМЕЦКАЯ ОВЧАРКА')
    expect(canonicalBreed('АСТ')).toBe('АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР')
    expect(canonicalBreed('АБТ')).toBe('АМЕРИКАНСКИЙ БУЛЛИ')
    expect(canonicalBreed('CHIHUAHUA SMOOTH')).toBe('ЧИХУАХУА К-Ш')
    expect(canonicalBreed('CHIHUAHUA LONG')).toBe('ЧИХУАХУА Д-Ш')
    expect(canonicalBreed('GERMAN SHEPHERD DOG')).toBe('НЕМЕЦКАЯ ОВЧАРКА')
    expect(canonicalBreed('LABRADOR RETRIEVER')).toBe('ЛАБРАДОР РЕТРИВЕР')
    expect(canonicalBreed('Ш')).toBe('')
    expect(canonicalBreed('ТНАЯ')).toBe('')
    expect(canonicalBreed('ИВЕР')).toBe('')
    expect(canonicalBreed('Южно-африканский бурбуль')).toBe('ЮЖНОАФРИКАНСКИЙ БУРБУЛЬ')
    expect(canonicalBreed('Южноаф')).toBe('ЮЖНОАФРИКАНСКИЙ БУРБУЛЬ')
    expect(canonicalBreed('Южноафр')).toBe('ЮЖНОАФРИКАНСКИЙ БУРБУЛЬ')
    expect(canonicalBreed('Южнорусс')).toBe('ЮЖНОРУССКАЯ ОВЧАРКА')
    expect(canonicalBreed('Южнорусская бразильский')).toBe('ЮЖНОРУССКАЯ ОВЧАРКА')
    expect(canonicalBreed('Южнорусская фландрский')).toBe('ЮЖНОРУССКАЯ ОВЧАРКА')
    expect(canonicalBreed('Эпаньоль короткошерстная')).toBe('БРЕТОНСКИЙ ЭПАНЬОЛЬ')
    expect(canonicalBreed('Эрдель американский')).toBe('ЭРДЕЛЬТЕРЬЕР')
    expect(canonicalBreed('Эрдель терьер такса, мини...')).toBe('ЭРДЕЛЬТЕРЬЕР')
    expect(canonicalBreed('Эрдельте')).toBe('ЭРДЕЛЬТЕРЬЕР')
    expect(canonicalBreed('Эрдельтерьер миниатюрная')).toBe('ЭРДЕЛЬТЕРЬЕР')
    expect(canonicalBreed('Эрдельтерьер немецкий')).toBe('ЭРДЕЛЬТЕРЬЕР')
    expect(canonicalBreed('Ый ретривер')).toBe('ЗОЛОТИСТЫЙ РЕТРИВЕР')
    expect(canonicalBreed('Ый, с плащом, с подпалом, ...')).toBe('')
    expect(canonicalBreed('Ь палевый (рыжий)')).toBe('')
    expect(canonicalBreed('Ьный малый')).toBe('')
    expect(canonicalBreed('Ьтерье')).toBe('')
    expect(canonicalBreed('Ья')).toBe('')
    expect(canonicalBreed('Ья собака')).toBe('')
  })

  it('verifies that judges.json and breed-calendar indexes contain ZERO corrupt / truncated breed strings', () => {
    const judgesPath = path.join(process.cwd(), 'data/v1/shows/indexes/judges.json')
    expect(fs.existsSync(judgesPath)).toBe(true)
    const judges = JSON.parse(fs.readFileSync(judgesPath, 'utf-8'))
    const badRegex = /^[ЬЫ]|фален\)|папий.*фален|кавалер.*папий|собака.*фален|хохлат.*фален|^xl$|bordeaux\s+бульдог|deutscher\s+boxer|fox\s+terrier|sussex\s+spaniel|южноаф$|южноафр$|южнорусс$|бразильский.*южнорусская|фландрский.*южнорусская|эрдельте$|эрдель\s+американский/i

    for (const j of judges) {
      for (const b of (j.breeds || [])) {
        expect(b).not.toMatch(badRegex)
        expect(b).not.toMatch(/[a-zA-Z]/)
      }
    }

    const calPath = path.join(process.cwd(), 'data/v1/shows/indexes/breed-calendar/2026.json')
    if (fs.existsSync(calPath)) {
      const cal = JSON.parse(fs.readFileSync(calPath, 'utf-8'))
      for (const breed of Object.keys(cal)) {
        expect(breed).not.toMatch(badRegex)
        expect(breed).not.toMatch(/[a-zA-Z]/)
      }
    }
  })

  it('verifies matchesBreedSearch supports Russian, English FCI names and abbreviations', () => {
    // English searches
    expect(matchesBreedSearch('РУССКАЯ ПСОВАЯ БОРЗАЯ', 'borzoi')).toBe(true)
    expect(matchesBreedSearch('НЕМЕЦКИЙ БОКСЕР', 'boxer')).toBe(true)
    expect(matchesBreedSearch('КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ ПАПИЙОН', 'papillon')).toBe(true)
    expect(matchesBreedSearch('КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ ФАЛЕН', 'phalene')).toBe(true)
    expect(matchesBreedSearch('ЭРДЕЛЬТЕРЬЕР', 'airedale')).toBe(true)
    expect(matchesBreedSearch('ЮЖНОАФРИКАНСКИЙ БУРБУЛЬ', 'boerboel')).toBe(true)
    expect(matchesBreedSearch('СУССЕКС СПАНИЕЛЬ', 'sussex spaniel')).toBe(true)
    expect(matchesBreedSearch('ФОКСТЕРЬЕР Г-Ш', 'fox terrier')).toBe(true)
    expect(matchesBreedSearch('АМЕРИКАНСКИЙ БУЛЛИ', 'xl')).toBe(true)

    // Russian abbreviations
    expect(matchesBreedSearch('РУССКАЯ ПСОВАЯ БОРЗАЯ', 'рпб')).toBe(true)
    expect(matchesBreedSearch('ВОСТОЧНОЕВРОПЕЙСКАЯ ОВЧАРКА', 'вео')).toBe(true)
    expect(matchesBreedSearch('СРЕДНЕАЗИАТСКАЯ ОВЧАРКА', 'сао')).toBe(true)
    expect(matchesBreedSearch('КАВКАЗСКАЯ ОВЧАРКА', 'ко')).toBe(true)
    expect(matchesBreedSearch('НЕМЕЦКАЯ ОВЧАРКА', 'но')).toBe(true)
    expect(matchesBreedSearch('АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР', 'аст')).toBe(true)
    expect(matchesBreedSearch('ДЖЕК РАССЕЛ ТЕРЬЕР', 'дрт')).toBe(true)
    expect(matchesBreedSearch('ПАРСОН РАССЕЛ ТЕРЬЕР', 'прт')).toBe(true)
    expect(matchesBreedSearch('КАВАЛЕР КИНГ ЧАРЛЬЗ СПАНИЕЛЬ', 'ккчс')).toBe(true)
    expect(matchesBreedSearch('РУССКИЙ ЧЁРНЫЙ ТЕРЬЕР', 'рчт')).toBe(true)

    // Russian partial stems
    expect(matchesBreedSearch('КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ ПАПИЙОН', 'папий')).toBe(true)
    expect(matchesBreedSearch('ВЕНГЕРСКАЯ ВЫЖЛА К-Ш', 'выжла')).toBe(true)
  })

  it('verifies that judge-details packs contain ZERO corrupt breed strings and ZERO Latin', () => {
    const packsDir = path.join(process.cwd(), 'data/v1/shows/indexes/judge-details')
    if (!fs.existsSync(packsDir)) return

    const packFiles = fs.readdirSync(packsDir).filter((f) => f.startsWith('pack-') && f.endsWith('.json')).slice(0, 20)
    const badRegex = /^[ЬЫ]|фален\)|папий.*фален|кавалер.*папий|собака.*фален|хохлат.*фален|^xl$|bordeaux\s+бульдог|deutscher\s+boxer|fox\s+terrier|sussex\s+spaniel|южноаф$|южноафр$|южнорусс$|бразильский.*южнорусская|фландрский.*южнорусская|эрдельте$|эрдель\s+американский/i

    for (const f of packFiles) {
      const data = JSON.parse(fs.readFileSync(path.join(packsDir, f), 'utf-8'))
      const byKey = data.byKey || {}
      for (const judge of Object.values<any>(byKey)) {
        for (const b of (judge.breeds || [])) {
          const name = b.breed
          expect(name).not.toMatch(badRegex)
          expect(name).not.toMatch(/[a-zA-Z]/)
          expect(OFFICIAL_BREEDS_SET.has(name)).toBe(true)
        }
      }
    }
  })

  it('verifies that data/v1/breeds.json contains ONLY clean canonical breeds with ZERO duplicates', () => {
    const breedsPath = path.join(process.cwd(), 'data/v1/breeds.json')
    expect(fs.existsSync(breedsPath)).toBe(true)
    const data = JSON.parse(fs.readFileSync(breedsPath, 'utf-8'))
    const breeds: string[] = data.breeds || []

    const seen = new Set<string>()
    for (const b of breeds) {
      expect(b).not.toMatch(/[a-zA-Z]/)
      expect(b).not.toMatch(/^[ЬЫ]/)
      expect(b).not.toMatch(/ВЕСТ-ХАЙЛЕНЛ/)
      expect(seen.has(b)).toBe(false)
      expect(OFFICIAL_BREEDS_SET.has(b)).toBe(true)
      seen.add(b)
    }
  })
})
