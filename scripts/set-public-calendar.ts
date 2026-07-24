/**
 * Toggle public calendar tabs on production (data/v1/ui-flags.json).
 *
 * Usage:
 *   npx tsx scripts/set-public-calendar.ts competitions on
 *   npx tsx scripts/set-public-calendar.ts shows off
 *   npx tsx scripts/set-public-calendar.ts status
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FLAGS_PATH = path.join(ROOT, 'data/v1/ui-flags.json')

type Kind = 'competitions' | 'shows'

interface UiFlagsFile {
  schema: string
  updated_at: string
  publicCalendars: { competitions: boolean; shows: boolean }
  notes?: string
}

const NOTES =
  'Локально (npm run dev) календари всегда видны. На проде — только если true. Переключение: scripts/show-calendar-*.bat / hide-calendar-*.bat, затем deploy-to-github.bat. Протоколы /event и /shows/exhibition этим флагом не открываются.'

function readFlags(): UiFlagsFile {
  if (!fs.existsSync(FLAGS_PATH)) {
    return {
      schema: 'coursing-stats/ui-flags-v1',
      updated_at: new Date().toISOString().slice(0, 10),
      publicCalendars: { competitions: false, shows: false },
      notes: NOTES,
    }
  }
  const raw = JSON.parse(fs.readFileSync(FLAGS_PATH, 'utf-8')) as Partial<UiFlagsFile>
  return {
    schema: raw.schema ?? 'coursing-stats/ui-flags-v1',
    updated_at: raw.updated_at ?? new Date().toISOString().slice(0, 10),
    publicCalendars: {
      competitions: raw.publicCalendars?.competitions === true,
      shows: raw.publicCalendars?.shows === true,
    },
    notes: raw.notes ?? NOTES,
  }
}

function writeFlags(flags: UiFlagsFile) {
  flags.updated_at = new Date().toISOString().slice(0, 10)
  flags.notes = NOTES
  fs.writeFileSync(FLAGS_PATH, `${JSON.stringify(flags, null, 2)}\n`, 'utf-8')
}

function printStatus(flags: UiFlagsFile) {
  const c = flags.publicCalendars.competitions ? 'ON (прод)' : 'OFF (только локалка)'
  const s = flags.publicCalendars.shows ? 'ON (прод)' : 'OFF (только локалка)'
  console.log(`  competitions calendar: ${c}`)
  console.log(`  shows calendar:        ${s}`)
  console.log(`  file: ${FLAGS_PATH}`)
}

function usage(): never {
  console.error(`Usage:
  npx tsx scripts/set-public-calendar.ts status
  npx tsx scripts/set-public-calendar.ts competitions on|off
  npx tsx scripts/set-public-calendar.ts shows on|off`)
  process.exit(1)
}

const [kindArg, valueArg] = process.argv.slice(2)
if (!kindArg || kindArg === 'status' || kindArg === '--help' || kindArg === '-h') {
  if (kindArg && kindArg !== 'status' && kindArg !== '--help' && kindArg !== '-h') usage()
  console.log('Public calendar flags:')
  printStatus(readFlags())
  process.exit(0)
}

if (kindArg !== 'competitions' && kindArg !== 'shows') usage()
if (valueArg !== 'on' && valueArg !== 'off' && valueArg !== 'true' && valueArg !== 'false') usage()

const kind = kindArg as Kind
const visible = valueArg === 'on' || valueArg === 'true'
const flags = readFlags()
const prev = flags.publicCalendars[kind]
flags.publicCalendars[kind] = visible
writeFlags(flags)

const label = kind === 'competitions' ? 'Соревнования' : 'Выставки'
console.log(`\n${label} — календарь на проде: ${prev ? 'ON' : 'OFF'} → ${visible ? 'ON' : 'OFF'}`)
printStatus(flags)
console.log(`
Дальше на прод:
  scripts\\deploy-to-github.bat "ui: ${visible ? 'show' : 'hide'} ${kind} calendar"

Локально календари и так видны при npm run dev.
`)
