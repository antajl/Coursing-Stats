import fs from 'node:fs'
import { parseBzmpHTML } from '../../../parsers/bzmp/index'
import { parseCoursingHTML } from '../../../parsers/coursing/index'
import { parseRacingHTML } from '../../../parsers/racing/index'

const html = fs.readFileSync('data/archive/results/2024/Complete_Results_2024-06-15.html', 'utf8')
for (const [name, fn] of [
  ['racing', parseRacingHTML],
  ['bzmp', parseBzmpHTML],
  ['coursing', parseCoursingHTML],
] as const) {
  const p = await fn(html)
  console.log(name, p.results.length, p.judges?.slice(0, 50))
}
