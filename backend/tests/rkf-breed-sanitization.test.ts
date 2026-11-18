import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { canonicalBreed, sanitizeBreedName } from '../src/lib/breed-mapping'

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
      }
    }
  }, 30000)
})
