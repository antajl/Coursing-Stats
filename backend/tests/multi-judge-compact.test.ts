import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import { parseBzmpHTML } from '../parsers/bzmp/index'
import { parseCoursingHTML } from '../parsers/coursing/index'

describe('multi-judge compact archive 2023', () => {
  it('event 1202 BZMP: 2 judges, bib colors, heat 2 bib 18', async () => {
    const html = fs.readFileSync('data/archive/results/2023/Complete_Results_2023-04-15_B.html', 'utf-8')
    const parsed = await parseBzmpHTML(html)
    const dog = parsed.results.find((r) => String(r.name).includes('BIFLINT'))
    expect(dog).toBeTruthy()
    expect(dog?.judge_count).toBe(2)
    expect(dog?.total_score).toBe(345)
    const heats = JSON.parse(dog!.raw_scores_json as string).heats
    expect(heats[0].bib_number).toBe(1)
    expect(heats[0].bib_color).toBe('red')
    expect(heats[0].judges).toHaveLength(2)
    expect(heats[1].bib_number).toBe(18)
    expect(heats[1].bib_color).toBe('red')
    expect(heats[1].judges).toHaveLength(2)
    expect(heats[1].judges[0].scores.filter((s: number | null) => s !== null)).toHaveLength(5)
  })

  it('event 1428 coursing: 3 judges per heat', async () => {
    const html = fs.readFileSync('data/archive/results/2023/Complete_Results_2023-04-22.html', 'utf-8')
    const parsed = await parseCoursingHTML(html)
    const dog = parsed.results.find((r) => String(r.name_lat || r.name).includes('OBEREG RUSI AGAT'))
    expect(dog).toBeTruthy()
    expect(dog?.judge_count).toBe(3)
    const heats = JSON.parse(dog!.raw_scores_json as string).heats
    expect(heats[0].judges).toHaveLength(3)
    expect(heats[1].judges).toHaveLength(3)
    expect(heats[1].bib_number).toBe(24)
  })
})
