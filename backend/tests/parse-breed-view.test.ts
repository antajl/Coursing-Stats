import { describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  formatBreedTitleLine,
  parseBreedTitleFromCols,
} from '../parsers/shows/parse-breed-view'

const fixturePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../fixtures/show-106-breed-1-titles-probe.json'
)

describe('parse-breed-view titles', () => {
  it('parses title columns', () => {
    expect(parseBreedTitleFromCols('ЛБ', '(2) ПОЛЭР НАЙТ ФЭВОРИТ', 'А.Полевая')).toEqual({
      title_code: 'ЛБ',
      ring_number: 2,
      dog_name: 'ПОЛЭР НАЙТ ФЭВОРИТ',
      owner: 'А.Полевая',
    })
  })

  it('formats title line like RKF site', () => {
    const row = parseBreedTitleFromCols(
      'ЛПП (BOB)',
      "(23) DREAM MEADOW'S SPELLBOUND",
      'A.Ploshko & B.Weikert'
    )!
    expect(formatBreedTitleLine(row)).toBe(
      "ЛПП (BOB)(23) DREAM MEADOW'S SPELLBOUNDA.Ploshko & B.Weikert"
    )
  })

  it('matches probe fixture title lines', () => {
    const probe = JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as {
      titleNodes: Array<{ text: string }>
    }
    for (const node of probe.titleNodes) {
      const html = node.text
      expect(html.length).toBeGreaterThan(5)
    }
    expect(probe.titleNodes).toHaveLength(6)
  })
})
