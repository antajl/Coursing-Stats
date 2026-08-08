import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseLegacyFullResultsHTML, parseRuDateRange } from '../parsers/legacy-full-results/index'

/** Minimal Full_Results snippet (Amber Yuff + Angel Congo) — same column layout as archive HTML. */
const FIXTURE_SNIPPET = `<html><body><table>
<tr><td colspan="23">Соревнования по курсингу "Мартовский заяц", 14-15.03.2015 (М.О., деревня Левково)</td></tr>
<tr>
  <td rowspan="2">1</td><td rowspan="2">Афганская борзая</td><td rowspan="2">Стандарт</td><td rowspan="2">Кобели</td>
  <td rowspan="2">Amber Yuff</td>
  <td rowspan="2" bgcolor="#ff0000">37</td>
  <td>16</td><td>18</td><td>18</td><td>17</td><td>17</td>
  <td rowspan="2">172</td>
  <td rowspan="2" bgcolor="#ff0000">37</td>
  <td></td><td></td><td></td><td></td><td></td>
  <td rowspan="2"></td>
  <td rowspan="2">172</td><td rowspan="2">1</td><td rowspan="2">CC</td><td rowspan="2">CACL</td>
</tr>
<tr>
  <td>17</td><td>18</td><td>18</td><td>16</td><td>17</td>
  <td></td><td></td><td></td><td></td><td></td>
</tr>
<tr>
  <td rowspan="2">6</td><td rowspan="2">Басенджи</td><td rowspan="2">Стандарт</td><td rowspan="2">Кобели</td>
  <td rowspan="2">Angel Congo Iffat Isimo to Evonti</td>
  <td rowspan="2" bgcolor="#ff0000">3</td>
  <td>18</td><td>18</td><td>17</td><td>17</td><td>17</td>
  <td rowspan="2">175</td>
  <td rowspan="2" bgcolor="#ff0000">18</td>
  <td>18</td><td>18</td><td>18</td><td>18</td><td>18</td>
  <td rowspan="2">180</td>
  <td rowspan="2">355</td><td rowspan="2">1</td><td rowspan="2">CC</td><td rowspan="2">CACL</td>
</tr>
<tr>
  <td>18</td><td>17</td><td>18</td><td>18</td><td>17</td>
  <td>18</td><td>19</td><td>18</td><td>18</td><td>17</td>
</tr>
</table></body></html>`

describe('parseLegacyFullResultsHTML (coursing-family adapter)', () => {
  it('parses heat/judge criteria into modern heats shape (Amber Yuff)', () => {
    const parsed = parseLegacyFullResultsHTML(FIXTURE_SNIPPET)
    expect(parsed.date_start).toBe('2015-03-14')
    expect(parsed.date_end).toBe('2015-03-15')
    expect(parsed.results.length).toBe(2)

    const amber = parsed.results[0]
    expect(amber.name_lat).toMatch(/Amber Yuff/i)
    expect(amber.total_score).toBe(172)
    expect(amber.placement).toBe(1)
    // HTML: CC | Титул → vc (scoreboard) | qualification (by name)
    expect(amber.vc).toBe('CC')
    expect(amber.qualification).toBe('CACL')
    expect(amber.raw_scores_json.grand_total).toBe(172)

    const h1 = amber.raw_scores_json.heats[0]
    expect(h1.heat_number).toBe(1)
    expect(h1.bib_number).toBe(37)
    expect(h1.bib_color).toBe('red')
    expect(h1.total).toBe(172)
    expect(h1.judges).toHaveLength(2)
    expect(h1.judges[0].scores).toEqual([16, 18, 18, 17, 17])
    expect(h1.judges[0].sum).toBe(86)
    expect(h1.judges[1].scores).toEqual([17, 18, 18, 16, 17])
    expect(h1.judges[1].sum).toBe(86)
    // heat totals are grand totals for the heat — never divide by judges
    expect(h1.judges[0].sum! + h1.judges[1].sum!).toBe(172)
  })

  it('parses two heats × two judges (Angel Congo)', () => {
    const parsed = parseLegacyFullResultsHTML(FIXTURE_SNIPPET)
    const angel = parsed.results[1]
    expect(angel.name_lat).toMatch(/Angel Congo/i)
    expect(angel.total_score).toBe(355)
    expect(angel.raw_scores_json.heats).toHaveLength(2)

    const [h1, h2] = angel.raw_scores_json.heats
    expect(h1.total).toBe(175)
    expect(h1.judges[0].scores).toEqual([18, 18, 17, 17, 17])
    expect(h1.judges[1].scores).toEqual([18, 17, 18, 18, 17])
    expect(h1.judges[0].sum! + h1.judges[1].sum!).toBe(175)

    expect(h2.total).toBe(180)
    expect(h2.judges[0].scores).toEqual([18, 18, 18, 18, 18])
    expect(h2.judges[1].scores).toEqual([18, 19, 18, 18, 17])
    expect(h2.judges[0].sum! + h2.judges[1].sum!).toBe(180)
  })

  it('parses 2015 Full_Results sample file when present', () => {
    const samplePath = 'data/tmp/full-results-archive/sample-2015-08.html'
    if (!fs.existsSync(samplePath)) return
    const html = fs.readFileSync(samplePath, 'utf-8')
    const parsed = parseLegacyFullResultsHTML(html)
    expect(parsed.date_start).toBe('2015-08-08')
    expect(parsed.date_end).toBe('2015-08-09')
    expect(parsed.results.length).toBeGreaterThan(10)
    const first = parsed.results[0]
    expect(first.name_lat.toLowerCase()).toContain('angel')
    expect(first.total_score).toBe(330)
    expect(first.placement).toBe(1)
    expect(first.raw_scores_json.heats[0].judges.length).toBe(2)
    expect(first.raw_scores_json.heats[0].judges[0].scores).toEqual([15, 16, 16, 16, 16])
    expect(first.raw_scores_json.heats[0].total).toBe(166)
  })

  it('marks grey bgcolor rows as dns (неявка), e.g. VICTORI SPRINT', () => {
    const html = `<html><body><table>
<tr><td colspan="23">Тест, 14.03.2015 (Левково)</td></tr>
<tr bgcolor="#c0c0c0">
  <td rowspan="2">28</td><td rowspan="2">Грейхаунд</td><td rowspan="2">Стандарт</td><td rowspan="2">Суки</td>
  <td rowspan="2">VICTORI SPRINT JAROSLAVA SELENA</td>
  <td rowspan="2"></td>
  <td colspan="5"></td>
  <td rowspan="2"></td>
  <td rowspan="2"></td>
  <td colspan="5"></td>
  <td rowspan="2"></td>
  <td rowspan="2"></td><td rowspan="2"></td><td rowspan="2"></td><td rowspan="2"></td>
</tr>
<tr bgcolor="#c0c0c0">
  <td colspan="5"></td>
  <td colspan="5"></td>
</tr>
</table></body></html>`
    const parsed = parseLegacyFullResultsHTML(html)
    expect(parsed.results).toHaveLength(1)
    const row = parsed.results[0]
    expect(row.name_lat).toMatch(/VICTORI SPRINT/i)
    expect(row.status).toBe('dns')
    expect(row.status_reason).toBe('Неявка')
    expect(row.breed_class).toBe('Неприбывшие участники')
    expect(row.total_score).toBeNull()
  })

  it('parses date ranges', () => {
    expect(parseRuDateRange('foo 08-09.08.2015 bar').start).toBe('2015-08-08')
    expect(parseRuDateRange('18.04.2021').start).toBe('2021-04-18')
  })
})
