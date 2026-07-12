import { describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  attachCatalogToResults,
  buildBreedCatalog,
  catalogByBreedId,
  parseSpecialtyJudgeLine,
  type ExhibitionCatalogResponse,
} from '../parsers/shows/exhibition-catalog'

const fixtureDir = path.dirname(fileURLToPath(import.meta.url))
const enFixturePath = path.join(fixtureDir, '../fixtures/show-106-refresh-captured.json')
const ruFixturePath = path.join(fixtureDir, '../fixtures/show-106-ru-probe.json')

describe('exhibition-catalog', () => {
  it('parses Specialty judge from localization line', () => {
    expect(parseSpecialtyJudgeLine('АВСТРАЛИЙСКАЯ ОВЧАРКА (Specialty) Andrei Kisliakov')).toEqual({
      breedLabel: 'АВСТРАЛИЙСКАЯ ОВЧАРКА',
      judge: 'Andrei Kisliakov',
    })
  })

  it('builds Russian catalog from ru-RU fixture', () => {
    const raw = JSON.parse(fs.readFileSync(ruFixturePath, 'utf-8')) as {
      catalogSample: ExhibitionCatalogResponse
    }
    const catalog = buildBreedCatalog(raw.catalogSample)
    expect(catalog.length).toBeGreaterThan(50)

    const cattle = catalogByBreedId(catalog).get(9)
    expect(cattle).toMatchObject({
      dog_breed_id: 9,
      breed: 'АВСТРАЛИЙСКАЯ ПАСТУШЬЯ СОБАКА',
      breed_en: 'AUSTRALIAN CATTLE DOG',
      breed_group: 'Пастушьи и скотогонные собаки, кроме швейцарских скотогонных собак',
      breed_judge: 'Andrei Kisliakov',
      breed_count: 12,
    })
  })

  it('maps English result rows to Russian catalog entries', () => {
    const raw = JSON.parse(fs.readFileSync(ruFixturePath, 'utf-8')) as {
      catalogSample: ExhibitionCatalogResponse
    }
    const catalog = buildBreedCatalog(raw.catalogSample)
    const updated = attachCatalogToResults(
      [{ breed: 'AUSTRALIAN CATTLE DOG', class: '5 Open class', placement: 1 } as const],
      catalog
    )
    expect(updated[0].breed).toBe('АВСТРАЛИЙСКАЯ ПАСТУШЬЯ СОБАКА')
    expect(updated[0].breed_group).toContain('Пастушьи')
  })

  it('builds catalog from en fixture with dom group names', () => {
    const raw = JSON.parse(fs.readFileSync(enFixturePath, 'utf-8')) as ExhibitionCatalogResponse
    const ruProbe = JSON.parse(fs.readFileSync(ruFixturePath, 'utf-8')) as {
      dom: { groups: string[] }
    }
    const catalog = buildBreedCatalog(raw, { groupNamesRu: ruProbe.dom.groups })
    const cattle = catalogByBreedId(catalog).get(9)
    expect(cattle?.breed_group).toBe('Пастушьи и скотогонные собаки, кроме швейцарских скотогонных собак')
  })
})
