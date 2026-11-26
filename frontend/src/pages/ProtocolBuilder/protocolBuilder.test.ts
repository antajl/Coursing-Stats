import { describe, expect, it } from 'vitest'
import { ALL_KNOWN_BREEDS, BREED_GROUPS, createSampleCategories } from './constants'
import {
  COURSING_CRITERIA_META,
  calculateRoundSum,
  findDuplicateDogNames,
  getCanonicalScoreValues,
} from './types'
import { parseImportedProtocolJson } from './protocolDraftStorage'
import { computeSafePdfPageSlices } from './protocolPdfExport'
import { CORE_BREED_HUBS } from '../../lib/breed-hubs-data'

describe('ProtocolBuilder domain & utilities', () => {
  it('syncs BREED_GROUPS with all CORE_BREED_HUBS breeds plus open class', () => {
    expect(BREED_GROUPS.length).toBeGreaterThanOrEqual(5)
    for (const hub of CORE_BREED_HUBS) {
      expect(ALL_KNOWN_BREEDS).toContain(hub.nameRu)
    }
    expect(ALL_KNOWN_BREEDS).toContain('Метис')
    expect(ALL_KNOWN_BREEDS).toContain('Без породы')
  })

  it('orders coursing criteria canonically as М, Р, В, П, Э', () => {
    expect(COURSING_CRITERIA_META.map((c) => c.short)).toEqual(['М', 'Р', 'В', 'П', 'Э'])
    const scores = { agility: 19, speed: 18, endurance: 17, intelligence: 16, enthusiasm: 20 }
    expect(getCanonicalScoreValues(scores)).toEqual([19, 18, 17, 16, 20])
    expect(calculateRoundSum(scores)).toBe(90)
  })

  it('parses exported JSON schema back into editable builder state and rejects broken JSON', () => {
    const sample = {
      schema: 'coursing-stats/protocol-builder-v3',
      competition: {
        title: 'Кубок РКФ',
        rank: 'ЧРКФ',
        date: '2026-05-10',
        location: 'Москва',
        club: 'Тест-клуб',
        judges: 'Иванова Е.А.',
      },
      kind: 'coursing',
      categories: [
        {
          category_id: 'cat_1',
          breed: 'Уиппет',
          class: 'Стандартный',
          sex: 'male',
          runs_count: 2,
          dogs: [
            {
              catalog_number: '12',
              dog_name: 'Ветер',
              sex: 'male',
              runs: [
                {
                  heat: '3',
                  blanket: 'blue',
                  status: 'normal',
                  scores: { speed: 18, enthusiasm: 19, intelligence: 17, agility: 18, endurance: 18 },
                },
              ],
              awards: ['CACL'],
            },
          ],
        },
      ],
    }

    const loaded = parseImportedProtocolJson(JSON.stringify(sample))
    expect(loaded).not.toBeNull()
    expect(loaded?.header?.title).toBe('Кубок РКФ')
    expect(loaded?.categories?.[0].className).toBe('Стандартный')
    expect(loaded?.categories?.[0].dogs[0].dogName).toBe('Ветер')
    expect(loaded?.categories?.[0].dogs[0].runs[0].blanket).toBe('blue')
    expect(parseImportedProtocolJson('{bad json')).toBeNull()
  })

  it('detects duplicate dog names across categories', () => {
    const cats = createSampleCategories()
    cats[0].dogs[1].dogName = '  ветер   северных полей '
    const dupes = findDuplicateDogNames(cats)
    expect(dupes.has('ветер северных полей')).toBe(true)
  })

  it('keeps PDF page breaks strictly between [data-pdf-block] row boundaries', () => {
    const blocks = [
      { top: 0, bottom: 120 },
      { top: 120, bottom: 450 },
      { top: 450, bottom: 800 },
      { top: 800, bottom: 1150 },
    ]
    const slices = computeSafePdfPageSlices(1200, 900, blocks)
    expect(slices).toEqual([
      { startY: 0, endY: 800 },
      { startY: 800, endY: 1200 },
    ])
  })
})
