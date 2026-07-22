import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCoursingHTML } from '../parsers/coursing/index'
import { parseBzmpHTML } from '../parsers/bzmp/index'
import { parseRacingHTML } from '../parsers/racing/index'

const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')

function readFixture(...parts: string[]) {
  return fs.readFileSync(path.join(FIXTURES, ...parts), 'utf8')
}

describe('parser golden fixtures', () => {
  it('coursing Complete_Results_2025-03-08', async () => {
    const result = await parseCoursingHTML(readFixture('coursing', 'Complete_Results_2025-03-08.html'))
    expect(result.results).toHaveLength(41)
    expect(result.judges).toBe('Табуева Т.А., Минина С.В.')
    expect(result.results[0]).toMatchObject({
      name_ru: 'ХАРИЗМАШОУ ГРИФОН',
      breed: 'АФГАНСКАЯ БОРЗАЯ',
      status: 'finished',
      total_score: 376,
    })
  })

  it('coursing Complete_Results_2025-04-05_C', async () => {
    const result = await parseCoursingHTML(readFixture('coursing', 'Complete_Results_2025-04-05_C.html'))
    expect(result.results).toHaveLength(86)
    expect(result.judges).toBe('Гольдинова Л.М., Карелина Н.В.')
    expect(result.results[0]).toMatchObject({
      name_lat: 'HOUSE THE RAINBOW UZOCHI ZIKIMO',
      breed: 'БАСЕНДЖИ',
      status: 'finished',
      total_score: 170,
    })
  })

  it('coursing Complete_Results_2025-04-06_C', async () => {
    const result = await parseCoursingHTML(readFixture('coursing', 'Complete_Results_2025-04-06_C.html'))
    expect(result.results).toHaveLength(13)
    expect(result.judges).toBe('Иванова Г.С.')
    expect(result.results[0]).toMatchObject({
      name_ru: 'ШАНТАЛЬ С КНЯЖЕСКОГО ДВОРА',
      breed: 'БАСЕНДЖИ',
      status: 'finished',
      total_score: 185,
    })
  })

  it('bzmp Complete_Results_2025-03-08', async () => {
    const result = await parseBzmpHTML(readFixture('bzmp', 'Complete_Results_2025-03-08.html'))
    expect(result.results).toHaveLength(41)
    expect(result.judges).toBe('Табуева Т.А., Минина С.В.')
    expect(result.results[0]).toMatchObject({
      name_lat: 'ХАРИЗМАШОУ ГРИФОН',
      breed: 'АФГАНСКАЯ БОРЗАЯ',
      status: 'finished',
      total_score: 376,
    })
  })

  it('bzmp Complete_Results_2025-04-05_B', async () => {
    const result = await parseBzmpHTML(readFixture('bzmp', 'Complete_Results_2025-04-05_B.html'))
    expect(result.results).toHaveLength(15)
    expect(result.results[0]).toMatchObject({
      breed: 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
      status: 'finished',
      total_score: 342,
    })
  })

  it('bzmp Complete_Results_2025-04-06_B', async () => {
    const result = await parseBzmpHTML(readFixture('bzmp', 'Complete_Results_2025-04-06_B.html'))
    expect(result.results).toHaveLength(15)
    expect(result.results[0]).toMatchObject({
      name_lat: 'ZHE TEM KASPER',
      breed: 'БЕЛАЯ ШВЕЙЦАРСКАЯ ОВЧАРКА',
      status: 'finished',
      total_score: 177,
    })
  })

  it('racing 2026-05-16_Complete_Results_Racing', async () => {
    const result = await parseRacingHTML(readFixture('racing', '2026-05-16_Complete_Results_Racing.html'))
    expect(result.results).toHaveLength(35)
    expect(result.judges).toBe('Минина С.В., Табуева Т.А.')
    expect(result.results[0]).toMatchObject({
      name_lat: 'ДЕРЖАВА',
      breed: 'ГРЕЙХАУНД',
      status: 'finished',
      total_score: 21.83,
    })
  })

  it('racing Complete_Results_2025-cc-sample', async () => {
    const result = await parseRacingHTML(readFixture('racing', 'Complete_Results_2025-cc-sample.html'))
    expect(result.results).toHaveLength(2)
    expect(result.results[0]).toMatchObject({
      breed: 'АФГАНСКАЯ БОРЗАЯ',
      status: 'finished',
      total_score: 29.59,
    })
  })
})
