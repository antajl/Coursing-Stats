import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  detectLegacyFullResultsKind,
  parseLegacyFullResultsRacingHTML,
} from '../parsers/legacy-full-results/racing'

/** 2017-style: Забег | Попона | Бокс | Время × 3 (no distance). */
const FIXTURE_2017_BOX = `<html><body><table>
<tr><td colspan="20">Региональные состязания по бегам борзых, CACL, 13.08.2017 (Московская обл., Михайловское)</td></tr>
<tr><td>№</td><td>Порода</td><td>Класс</td><td>Пол</td><td>Кличка</td>
  <td>Забег 1</td><td>Попона</td><td>Бокс</td><td>Время 1</td>
  <td>Забег 2</td><td>Попона</td><td>Бокс</td><td>Время 2</td>
  <td>Забег 3</td><td>Попона</td><td>Бокс</td><td>Время 3</td>
  <td>Место</td><td>CC</td><td>Титул</td></tr>
<tr align="center" bgcolor="#ffffff">
  <td>2</td><td>Басенджи</td><td>2</td><td>Кобели</td><td>BBVADDIN BONGANI BAHA</td>
  <td>8</td><td bgcolor="#ff0000"><b>1</b></td><td></td><td>25,80</td>
  <td>15</td><td bgcolor="#ffffff"><b>1</b></td><td></td><td>28,37</td>
  <td></td><td></td><td></td><td></td>
  <td>1</td><td>CC</td><td>CACL</td>
</tr>
<tr align="center" bgcolor="#ffffff">
  <td>6</td><td>Левретка</td><td>2</td><td>Суки</td><td>House of Hounds Genivieva</td>
  <td>9</td><td bgcolor="#ff0000"><b>1</b></td><td></td><td>Сход с трассы</td>
  <td></td><td></td><td></td><td></td>
  <td></td><td></td><td></td><td></td>
  <td></td><td></td><td></td>
</tr>
<tr align="center" bgcolor="#c0c0c0">
  <td>5</td><td>Басенджи</td><td>1</td><td>Кобели</td><td>Гезан Гореденна</td>
  <td></td><td></td><td></td><td></td>
  <td></td><td></td><td></td><td></td>
  <td></td><td></td><td></td><td></td>
  <td></td><td></td><td></td>
</tr>
</table></body></html>`

/** 2018+ style: Дистанция | Забег | Попона | Время × 3. */
const FIXTURE_2018_DIST = `<html><body><table>
<tr><td colspan="18">Бега борзых за механическим зайцем ( круг ), 11-12.06.2018 (М.О. "Новый Милет")</td></tr>
<tr><td>№</td><td>Порода</td><td>Класс</td><td>Пол</td><td>Кличка</td><td>Дистанция (м)</td>
  <td>Забег 1</td><td>Попона</td><td>Время 1</td>
  <td>Забег 2</td><td>Попона</td><td>Время 2</td>
  <td>Забег 3</td><td>Попона</td><td>Время 3</td>
  <td>Место</td><td>CC</td><td>Титул</td></tr>
<tr align="center" bgcolor="#ffffff">
  <td>2</td><td>Басенджи</td><td>Стандартный</td><td>Кобели</td><td>AMARETTO S KNJAZHESKOGO DVORA</td><td>360</td>
  <td>2</td><td bgcolor="#ff0000"><b>1</b></td><td>31.40</td>
  <td>22</td><td bgcolor="#ff0000"><b>1</b></td><td>30.81</td>
  <td>40</td><td bgcolor="#ff0000"><b>1</b></td><td>30.99</td>
  <td>1</td><td>CC</td><td>Чемпион России</td>
</tr>
<tr align="center" bgcolor="#ffffff">
  <td>3</td><td>Басенджи</td><td>Стандартный</td><td>Кобели</td><td>ANGAVU MAISHA JASARA</td><td>360</td>
  <td>2</td><td bgcolor="#0000ff"><b>2</b></td><td>33.52</td>
  <td>22</td><td bgcolor="#0000ff"><b>2</b></td><td>32.10</td>
  <td>40</td><td bgcolor="#0000ff"><b>2</b></td><td>Дисквалификация</td>
  <td></td><td></td><td></td>
</tr>
</table></body></html>`

describe('legacy Full_Results racing adapter', () => {
  it('detects racing-time vs coursing-points layouts', () => {
    expect(detectLegacyFullResultsKind(FIXTURE_2017_BOX)).toBe('racing-time')
    expect(detectLegacyFullResultsKind(FIXTURE_2018_DIST)).toBe('racing-time')
    expect(
      detectLegacyFullResultsKind(
        '<table><tr><td>Ман.</td><td>Скор.</td><td>Сумма 1</td></tr></table>',
      ),
    ).toBe('coursing-points')
  })

  it('parses 2017 box layout into racing heats (times, not judges)', () => {
    const parsed = parseLegacyFullResultsRacingHTML(FIXTURE_2017_BOX)
    expect(parsed.date_start).toBe('2017-08-13')
    expect(parsed.results).toHaveLength(3)

    const winner = parsed.results[0]
    expect(winner.name_lat).toMatch(/BBVADDIN/i)
    expect(winner.placement).toBe(1)
    expect(winner.vc).toBe('CC')
    expect(winner.qualification).toBe('CACL')
    expect(winner.status).toBe('finished')
    expect(winner.total_score).toBe(25.8)
    expect(winner.raw_scores_json.format).toBe('racing')
    expect(winner.raw_scores_json.grand_total).toBe(25.8)
    expect(winner.raw_scores_json.heats).toHaveLength(2)
    expect(winner.raw_scores_json.heats[0]).toMatchObject({
      heat_number: 8,
      bib_number: 1,
      bib_color: 'red',
      time: 25.8,
    })
    expect(winner.raw_scores_json.heats[1].time).toBe(28.37)
    expect(winner.raw_scores_json.heats[0].judges).toBeUndefined()

    const dq = parsed.results[1]
    expect(dq.name_lat).toMatch(/Genivieva/i)
    expect(dq.status).toBe('disqualified')
    expect(dq.status_reason).toMatch(/Сход/i)
    expect(dq.total_score).toBeNull()

    const dns = parsed.results[2]
    expect(dns.status).toBe('dns')
    expect(dns.breed_class).toBe('Неприбывшие участники')
  })

  it('parses 2018 distance layout and computes speed_kmh', () => {
    const parsed = parseLegacyFullResultsRacingHTML(FIXTURE_2018_DIST)
    expect(parsed.date_start).toBe('2018-06-11')
    expect(parsed.date_end).toBe('2018-06-12')
    expect(parsed.results).toHaveLength(2)

    const amaretto = parsed.results[0]
    expect(amaretto.total_score).toBe(30.81)
    expect(amaretto.raw_scores_json.heats).toHaveLength(3)
    const h1 = amaretto.raw_scores_json.heats[0]
    expect(h1.time).toBe(31.4)
    // 360m / 31.40s * 3.6 ≈ 41.274
    expect(h1.speed_kmh).toBeCloseTo((360 / 31.4) * 3.6, 1)
    expect(amaretto.qualification).toMatch(/Чемпион/i)

    const dqHeat = parsed.results[1]
    expect(dqHeat.status).toBe('finished') // has timed heats before DQ
    expect(dqHeat.raw_scores_json.heats.some((h) => h.time === 32.1)).toBe(true)
    expect(dqHeat.raw_scores_json.heats.some((h) => h.disqualified)).toBe(true)
  })

  it('parses combined time+speed cells (2020 style)', () => {
    const html = `<html><body><table>
<tr><td colspan="18">Кубок России по бегам борзых, 20.09.2020 (Московская обл.)</td></tr>
<tr><td>Место</td><td>№</td><td>Порода</td><td>Класс</td><td>Пол</td><td>Кличка</td><td>Дистанция (м)</td>
  <td>Забег 1</td><td>Попона</td><td>Время 1</td>
  <td>Забег 2</td><td>Попона</td><td>Время 2</td>
  <td>Забег 3</td><td>Попона</td><td>Время 3</td>
  <td>CC</td><td>Титул</td></tr>
<tr bgcolor="#ffffff">
  <td>1</td><td>7</td><td>Басенджи</td><td>Стандартный</td><td>Кобель</td><td>ЕРЕВАН С КНЯЖЕСКОГО ДВОРА</td><td>350</td>
  <td>1</td><td bgcolor="#000000"><b>4</b></td><td>31,72 c 39,723 км/ч</td>
  <td>19</td><td bgcolor="#ff0000"><b>1</b></td><td>31,25 c 40,320 км/ч</td>
  <td>34</td><td bgcolor="#ff0000"><b>1</b></td><td>31,20 c 40,385 км/ч</td>
  <td>CC</td><td>Победитель Кубка России</td>
</tr>
</table></body></html>`
    const parsed = parseLegacyFullResultsRacingHTML(html)
    expect(parsed.results).toHaveLength(1)
    const row = parsed.results[0]
    expect(row.status).toBe('finished')
    expect(row.total_score).toBe(31.2)
    expect(row.raw_scores_json.heats[0]).toMatchObject({ time: 31.72, speed_kmh: 39.723 })
    expect(row.raw_scores_json.heats).toHaveLength(3)
  })

  it('parses leading-Место layout (2019-09-22 style)', () => {
    const html = `<html><body><table>
<tr><td colspan="18">Национальные состязания по бегам борзых за механическим зайцем CACL, 22.09.2019 (Московская обл., г. Раменское)</td></tr>
<tr><td>Место</td><td>№</td><td>Порода</td><td>Класс</td><td>Пол</td><td>Кличка</td><td>Дистанция (м)</td>
  <td>Забег 1</td><td>Попона</td><td>Время 1</td>
  <td>Забег 2</td><td>Попона</td><td>Время 2</td>
  <td>Забег 3</td><td>Попона</td><td>Время 3</td>
  <td>CC</td><td>Титул</td></tr>
<tr bgcolor="#ffffff">
  <td>1</td><td>4</td><td>Басенджи</td><td>Стандартный</td><td>Сука</td><td>БОННИ</td><td>350</td>
  <td>15</td><td bgcolor="#000000"><b>4</b></td><td>32.46</td>
  <td></td><td></td><td></td>
  <td>23</td><td bgcolor="#ff0000"><b>1</b></td><td>32.25</td>
  <td>CC</td><td>CACL</td>
</tr>
<tr bgcolor="#ffffff">
  <td></td><td>2</td><td>Басенджи</td><td>Стандартный</td><td>Кобель</td><td>AMAGAMMA NAMIB MALAVI</td><td>350</td>
  <td>15</td><td bgcolor="#0000ff"><b>2</b></td><td>Дисквалификация</td>
  <td></td><td></td><td></td>
  <td></td><td></td><td></td>
  <td></td><td></td>
</tr>
</table></body></html>`
    const parsed = parseLegacyFullResultsRacingHTML(html)
    expect(parsed.results).toHaveLength(2)
    const bonni = parsed.results[0]
    expect(bonni.name_lat).toMatch(/БОННИ/i)
    expect(bonni.catalog_no).toBe(4)
    expect(bonni.placement).toBe(1)
    expect(bonni.total_score).toBe(32.25)
    expect(bonni.raw_scores_json.heats[0]).toMatchObject({ heat_number: 15, bib_number: 4, time: 32.46 })
    expect(bonni.raw_scores_json.heats[1].time).toBe(32.25)
    expect(bonni.qualification).toBe('CACL')
    expect(parsed.results[1].status).toBe('disqualified')
  })

  it('parses cached Full_Results_2017_08.html when present', () => {
    const p = 'data/tmp/full-results-archive/Full_Results_2017_08.html'
    if (!fs.existsSync(p)) return
    const html = fs.readFileSync(p, 'utf-8')
    expect(detectLegacyFullResultsKind(html)).toBe('racing-time')
    const parsed = parseLegacyFullResultsRacingHTML(html)
    expect(parsed.results.length).toBeGreaterThan(40)
    const first = parsed.results.find((r) => /BBVADDIN/i.test(r.name_lat))
    expect(first?.raw_scores_json.format).toBe('racing')
    expect(first?.raw_scores_json.heats?.[0]?.time).toBeTruthy()
    expect((first?.raw_scores_json.heats?.[0] as any)?.judges).toBeUndefined()
  })
})
