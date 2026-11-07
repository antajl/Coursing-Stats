import { describe, expect, it } from 'vitest'
import {
  cleanMainRingLabel,
  extractGroupNumber,
  groupMainRing,
  mainRingTabShortLabel,
} from './exhibitionDetailUtils'
import type { MainRingRow } from './types'

describe('cleanMainRingLabel', () => {
  it('strips leading slash and produces canonical BIS BABY title', () => {
    expect(cleanMainRingLabel('/ BEST IN SHOW BABY', 'BIS_BABY', null)).toBe(
      'ЛУЧШИЙ БЕБИ / BEST IN SHOW BABY',
    )
  })

  it('strips trailing slash and produces canonical BIG 1 title', () => {
    expect(cleanMainRingLabel('1 ГРУППА FCI /', 'BIG', 1)).toBe(
      '1 ГРУППА FCI / BEST IN GROUP 1',
    )
  })

  it('extracts group number from label when group is null', () => {
    expect(extractGroupNumber('1 ГРУППА FCI /')).toBe(1)
    expect(extractGroupNumber('BEST IN GROUP 9')).toBe(9)
    expect(extractGroupNumber('10 FCI')).toBe(10)
    expect(cleanMainRingLabel('1 ГРУППА FCI /', 'BIG', null)).toBe(
      '1 ГРУППА FCI / BEST IN GROUP 1',
    )
  })

  it('cleans arbitrary competition in OTHER without leading/trailing slashes', () => {
    expect(cleanMainRingLabel('/ КОНКУРС ПАР /', 'OTHER', null)).toBe(
      'КОНКУРС ПАР',
    )
    expect(cleanMainRingLabel('— КОНКУРС ПИТОМНИКОВ —', 'OTHER', null)).toBe(
      'КОНКУРС ПИТОМНИКОВ',
    )
  })
})

describe('groupMainRing — merging split fragments and deduplication', () => {
  it('merges split Russian and English headers into a single clean tab', () => {
    const rawRows: MainRingRow[] = [
      {
        competition_key: 'BIS_BABY',
        competition_label: '/ BEST IN SHOW BABY',
        group: null,
        place: 1,
        catalog_number: 1,
        dog_name: 'DOG A',
        breed: 'Breed A',
        pedigree: '',
        judge: '',
        award_badge: '',
      },
      {
        competition_key: 'BIS_BABY',
        competition_label: 'ЛУЧШИЙ БЕБИ',
        group: null,
        place: 1,
        catalog_number: 1,
        dog_name: 'DOG A', // duplicate from split Voronoi
        breed: 'Breed A',
        pedigree: '',
        judge: '',
        award_badge: '',
      },
      {
        competition_key: 'BIS_BABY',
        competition_label: '/ BEST IN SHOW BABY',
        group: null,
        place: 2,
        catalog_number: 2,
        dog_name: 'DOG B',
        breed: 'Breed B',
        pedigree: '',
        judge: '',
        award_badge: '',
      },
      {
        competition_key: 'BIG',
        competition_label: '1 ГРУППА FCI /',
        group: 1,
        place: 1,
        catalog_number: 10,
        dog_name: 'DOG C',
        breed: 'German Shepherd',
        pedigree: '',
        judge: '',
        award_badge: '',
      },
    ]

    const tabs = groupMainRing(rawRows)
    expect(tabs).toHaveLength(2)

    const bisBabyTab = tabs.find((t) => t.id === 'BIS_BABY:')
    expect(bisBabyTab).toBeDefined()
    expect(bisBabyTab?.label).toBe('ЛУЧШИЙ БЕБИ / BEST IN SHOW BABY')
    expect(bisBabyTab?.shortLabel).toBe('BIS-Б')
    // Deduplicated DOG A
    expect(bisBabyTab?.rows).toHaveLength(2)
    expect(bisBabyTab?.rows.map((r) => r.place)).toEqual([1, 2])

    const bigTab = tabs.find((t) => t.id === 'BIG:1')
    expect(bigTab).toBeDefined()
    expect(bigTab?.label).toBe('1 ГРУППА FCI / BEST IN GROUP 1')
    expect(bigTab?.shortLabel).toBe('BIG 1')
  })
})
