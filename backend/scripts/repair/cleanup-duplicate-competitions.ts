import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeJson } from '../export/d1-export-utils'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const V1 = path.join(ROOT, 'data/v1')
const COMPS = path.join(V1, 'competitions')
const CAL = path.join(V1, 'calendar')
const DOGS_DIR = path.join(V1, 'dogs/by-id')

const DELETED_DUPLICATES = [
  'competitions/2024/04-апрель/1224-чемпионат-ркф-по-бегам-за-механическои-приманкои.json',
  'competitions/2024/05-май/1227-чемпионат-ркф-по-бегам-за-механическои-приманкои.json',
  'competitions/2024/06-июнь/1233-чемпионат-ркф-по-бегам-за-механическои-приманкои.json',
  'competitions/2024/06-июнь/1455-монопородные-чемпионаты-ркф-по-бегам-борзых-в-по.json',
  'competitions/2024/06-июнь/1456-чемпионат-ркф-cacl-по-бегам-борзых-за-механическ.json',
  'competitions/2024/08-август/1238-чемпионат-ркф-по-бегам-за-механическои-приманкои.json',
  'competitions/2024/09-сентябрь/1245-чемпионат-ркф-по-бегам-за-механическои-приманкои.json',
  'competitions/2024/09-сентябрь/1466-чемпионат-россии-cacl-по-бегам-борзых.json',
  'competitions/2024/10-октябрь/1249-кубок-россии-по-бегам-за-механическои-приманкои.json',
]

export function runCleanup() {
  console.log('1. Deleting obsolete duplicate competition files...')
  for (const rel of DELETED_DUPLICATES) {
    const full = path.join(V1, rel)
    if (fs.existsSync(full)) {
      fs.unlinkSync(full)
      console.log(`  Deleted ${rel}`)
    }
  }

  console.log('2. Updating metadata and event_type in remaining competitions...')
  const updates: Array<{ rel: string; patch: (event: any) => void }> = [
    {
      rel: 'competitions/2024/09-сентябрь/20240908--08092024-.json',
      patch: (e) => {
        e.event_type = 'racing'
        e.discipline_code = 'racing'
        e.competition_kind = 'Чемпионат России'
        e.competition_type = ''
        e.title = 'ЧР - CACL по рейсингу'
        e.full_title = 'Чемпионат России по бегам борзых'
        e.catalog_url = 'http://procoursing.ru/Catalog_2024-09-08.pdf'
        e.judges = 'Иванова Г.С., Гольдинова Л.М., Орлова М.О.'
      },
    },
    {
      rel: 'competitions/2024/06-июнь/20240615--cacl-15062024-.json',
      patch: (e) => {
        e.event_type = 'racing'
        e.discipline_code = 'racing'
        e.competition_kind = 'CACL'
        e.competition_type = ''
        e.judges = 'Полякова Г.Б., Куликова Г.В., Крылова Е.В., Богаченко В.В.'
      },
    },
    {
      rel: 'competitions/2024/06-июнь/20240609--09062024-.json',
      patch: (e) => {
        e.event_type = 'racing'
        e.discipline_code = 'racing'
        e.title = 'Монопородные чемпионаты РКФ по рейсингу'
        e.full_title = 'Монопородные чемпионаты РКФ по бегам борзых - ПЧРКФ'
        e.competition_type = ''
        e.judges = 'Крылова Е.В., Вронская О.В., Карелина Н.В.'
      },
    },
    {
      rel: 'competitions/2024/09-сентябрь/20240921--21092024-.json',
      patch: (e) => {
        e.event_type = 'racing'
        e.discipline_code = 'racing'
        e.competition_type = ''
        e.judges = 'Серова Т.Г., Крылова Е.В., Богаченко В.В.'
      },
    },
    {
      rel: 'competitions/2023/06-июнь/1432-чемпионат-ркф-cacl-по-бегам-борзых.json',
      patch: (e) => {
        e.event_type = 'racing'
        e.discipline_code = 'racing'
      },
    },
    {
      rel: 'competitions/2023/08-август/1436-чемпионат-ркф-cacl-по-бегам-борзых.json',
      patch: (e) => {
        e.event_type = 'racing'
        e.discipline_code = 'racing'
      },
    },
    {
      rel: 'competitions/2023/04-апрель/1428-национальные-монопородные-состязания.json',
      patch: (e) => {
        e.event_type = 'coursing'
        e.discipline_code = 'coursing'
      },
    },
    {
      rel: 'competitions/2023/09-сентябрь/1216-кубок-россии-по-бегам-за-механическои-приманкои.json',
      patch: (e) => {
        e.event_type = 'bzmp'
        e.discipline_code = 'bzmp'
      },
    },
  ]

  for (const { rel, patch } of updates) {
    const full = path.join(V1, rel)
    if (fs.existsSync(full)) {
      const doc = JSON.parse(fs.readFileSync(full, 'utf-8'))
      if (!doc.event) doc.event = {}
      patch(doc.event)
      writeJson(full, doc)
      console.log(`  Updated ${rel}`)
    }
  }

  console.log('3. Updating calendar/2024.json...')
  const cal2024Path = path.join(CAL, '2024.json')
  const cal2024 = JSON.parse(fs.readFileSync(cal2024Path, 'utf-8'))
  const events2024 = cal2024.events || []

  const newEvents2024 = [
    {
      id: 20240609,
      year: 2024,
      month: '06-июнь',
      date_start: '2024-06-09',
      date_end: null,
      title: 'Монопородные чемпионаты РКФ по рейсингу',
      full_title: 'Монопородные чемпионаты РКФ по бегам борзых - ПЧРКФ',
      rank_label: 'ПЧРКФ',
      rank_code: 'ПЧРКФ',
      discipline_code: 'racing',
      event_type: 'racing',
      competition_kind: '',
      competition_type: '',
      host_club: '',
      region: null,
      location: 'М.О., д. Михайловское',
      results_url: null,
      catalog_url: 'http://procoursing.ru/Catalog_2024-06-09.pdf',
      confirmed: 0,
      judges: 'Крылова Е.В., Вронская О.В., Карелина Н.В.',
      has_results: true,
      results_file: '20240609--09062024-.json',
      result_count: 39,
      participants_count: 39,
    },
    {
      id: 20240615,
      year: 2024,
      month: '06-июнь',
      date_start: '2024-06-15',
      date_end: null,
      title: 'ЧРКФ - CACL по рейсингу за механическим зайцем',
      full_title: 'ЧРКФ - CACL по рейсингу за механическим зайцем',
      rank_label: 'ЧРКФ - CACL по рейсингу за механическим зайцем',
      rank_code: 'ЧРКФ',
      discipline_code: 'racing',
      event_type: 'racing',
      competition_kind: 'CACL',
      competition_type: '',
      host_club: '',
      region: null,
      location: 'Московская область, Раменский район, д. Донино',
      results_url: null,
      catalog_url: 'http://procoursing.ru/Catalog_2024-06-15_R.pdf',
      confirmed: 0,
      judges: 'Полякова Г.Б., Куликова Г.В., Крылова Е.В., Богаченко В.В.',
      has_results: true,
      results_file: '20240615--cacl-15062024-.json',
      result_count: 66,
      participants_count: 66,
    },
    {
      id: 20240908,
      year: 2024,
      month: '09-сентябрь',
      date_start: '2024-09-08',
      date_end: null,
      title: 'ЧР - CACL по рейсингу',
      full_title: 'Чемпионат России по бегам борзых',
      rank_label: 'ЧР - CACL по рейсингу',
      rank_code: 'ЧР',
      discipline_code: 'racing',
      event_type: 'racing',
      competition_kind: 'Чемпионат России',
      competition_type: '',
      host_club: '',
      region: null,
      location: 'Московская обл., д. Михайловское',
      results_url: null,
      catalog_url: 'http://procoursing.ru/Catalog_2024-09-08.pdf',
      confirmed: 0,
      judges: 'Иванова Г.С., Гольдинова Л.М., Орлова М.О.',
      has_results: true,
      results_file: '20240908--08092024-.json',
      result_count: 88,
      participants_count: 88,
    },
    {
      id: 20240921,
      year: 2024,
      month: '09-сентябрь',
      date_start: '2024-09-21',
      date_end: null,
      title: 'ПЧРКФ по рейсингу',
      full_title: 'ПЧРКФ по рейсингу',
      rank_label: 'ПЧРКФ по рейсингу',
      rank_code: 'ПЧРКФ',
      discipline_code: 'racing',
      event_type: 'racing',
      competition_kind: '',
      competition_type: '',
      host_club: '',
      region: null,
      location: 'Московская область, Раменский район, д. Донино',
      results_url: null,
      catalog_url: 'http://procoursing.ru/Catalog_2024-09-21.pdf',
      confirmed: 0,
      judges: 'Серова Т.Г., Крылова Е.В., Богаченко В.В.',
      has_results: true,
      results_file: '20240921--21092024-.json',
      result_count: 39,
      participants_count: 39,
    },
  ]

  for (const ne of newEvents2024) {
    if (!events2024.some((e: any) => e.id === ne.id)) {
      events2024.push(ne)
      console.log(`  Added event ${ne.id} (${ne.title}) to calendar/2024.json`)
    }
  }

  events2024.sort((a: any, b: any) => String(a.date_start).localeCompare(String(b.date_start)))
  cal2024.events = events2024
  cal2024.event_count = events2024.length
  cal2024.with_results = events2024.filter((e: any) => e.has_results).length
  writeJson(cal2024Path, cal2024)

  console.log('4. Updating calendar/2023.json...')
  const cal2023Path = path.join(CAL, '2023.json')
  const cal2023 = JSON.parse(fs.readFileSync(cal2023Path, 'utf-8'))
  const events2023 = cal2023.events || []

  // Fix 3 broken results_file paths in 2023
  for (const e of events2023) {
    if (e.id === 20230416) {
      e.results_file = 'competitions/2023/04-апрель/1202-чемпионат-ркф-по-бегам-за-механическои-приманкои.json'
      e.result_count = 29
      e.participants_count = 29
    } else if (e.id === 20230502) {
      e.results_file = 'competitions/2023/05-май/1204-чемпионат-ркф-по-бегам-за-механическои-приманкои.json'
      e.result_count = 13
      e.participants_count = 13
    } else if (e.id === 20230528) {
      e.results_file = 'competitions/2023/05-май/1206-чемпионат-ркф-по-бегам-за-механическои-приманкои.json'
      e.result_count = 3
      e.participants_count = 3
    }
  }

  // Add 5 missing 2023 events
  const newEvents2023 = [
    {
      id: 1428,
      year: 2023,
      month: '04-апрель',
      date_start: '2023-04-22',
      date_end: null,
      title: 'ПЧРКФ',
      full_title: 'Национальные монопородные состязания - ПЧРКФ',
      rank_label: 'ПЧРКФ',
      rank_code: 'ПЧРКФ',
      discipline_code: 'coursing',
      event_type: 'coursing',
      competition_kind: '',
      competition_type: 'Курсинг борзых',
      host_club: '',
      region: null,
      location: 'Московская область, Балашихинский район',
      results_url: null,
      catalog_url: 'http://procoursing.ru/Catalog_2023-04-22.pdf',
      confirmed: 0,
      judges: 'Гольдинова Л.М., Полякова Г.Б., Гуриненко А.В.',
      has_results: true,
      results_file: 'competitions/2023/04-апрель/1428-национальные-монопородные-состязания.json',
      result_count: 40,
      participants_count: 40,
    },
    {
      id: 1432,
      year: 2023,
      month: '06-июнь',
      date_start: '2023-06-10',
      date_end: null,
      title: 'ЧРКФ - CACL по рейсингу',
      full_title: 'Чемпионат РКФ - CACL по бегам борзых',
      rank_label: 'ЧРКФ - CACL по рейсингу',
      rank_code: 'ЧРКФ',
      discipline_code: 'racing',
      event_type: 'racing',
      competition_kind: 'CACL',
      competition_type: '',
      host_club: '',
      region: null,
      location: 'Московская область, деревня Михайловское',
      results_url: null,
      catalog_url: 'http://procoursing.ru/Catalog_2023-06-10.pdf',
      confirmed: 0,
      judges: 'Иванова Г.С.',
      has_results: true,
      results_file: 'competitions/2023/06-июнь/1432-чемпионат-ркф-cacl-по-бегам-борзых.json',
      result_count: 65,
      participants_count: 65,
    },
    {
      id: 1436,
      year: 2023,
      month: '08-август',
      date_start: '2023-08-05',
      date_end: null,
      title: 'ЧРКФ - CACL по рейсингу',
      full_title: 'Чемпионат РКФ - CACL по бегам борзых',
      rank_label: 'ЧРКФ - CACL по рейсингу',
      rank_code: 'ЧРКФ',
      discipline_code: 'racing',
      event_type: 'racing',
      competition_kind: 'CACL',
      competition_type: '',
      host_club: '',
      region: null,
      location: 'Московская область, Новый Милет',
      results_url: null,
      catalog_url: 'http://procoursing.ru/Catalog_2023-08-05.pdf',
      confirmed: 0,
      judges: 'Куликова Г.В., Яковлева Т.С.',
      has_results: true,
      results_file: 'competitions/2023/08-август/1436-чемпионат-ркф-cacl-по-бегам-борзых.json',
      result_count: 66,
      participants_count: 66,
    },
    {
      id: 1216,
      year: 2023,
      month: '09-сентябрь',
      date_start: '2023-09-17',
      date_end: null,
      title: 'КР по БЗМП',
      full_title: 'Кубок России по бегам за механической приманкой',
      rank_label: 'КР по БЗМП',
      rank_code: 'КР',
      discipline_code: 'bzmp',
      event_type: 'bzmp',
      competition_kind: 'Кубок России',
      competition_type: '',
      host_club: '',
      region: null,
      location: 'Московская обл., Ленинский р-н, д. Суханово',
      results_url: null,
      catalog_url: null,
      confirmed: 0,
      judges: 'Козлова И.В., Крылова Е.В.',
      has_results: true,
      results_file: 'competitions/2023/09-сентябрь/1216-кубок-россии-по-бегам-за-механическои-приманкои.json',
      result_count: 23,
      participants_count: 23,
    },
    {
      id: 1217,
      year: 2023,
      month: '09-сентябрь',
      date_start: '2023-09-23',
      date_end: null,
      title: 'КР - CACL по рейсингу за механическим зайцем',
      full_title: 'Кубок России - CACL по бегам борзых за механическим зайцем',
      rank_label: 'КР - CACL по рейсингу за механическим зайцем',
      rank_code: 'КР',
      discipline_code: 'racing',
      event_type: 'racing',
      competition_kind: 'CACL',
      competition_type: '',
      host_club: '',
      region: null,
      location: 'Московская область, Раменский район, д. Донино',
      results_url: null,
      catalog_url: null,
      confirmed: 0,
      judges: 'Куликова Г.В.',
      has_results: true,
      results_file: 'competitions/2023/09-сентябрь/1217-кубок-россии-cacl-по-бегам-борзых-за-механически.json',
      result_count: 72,
      participants_count: 72,
    },
  ]

  for (const ne of newEvents2023) {
    if (!events2023.some((e: any) => e.id === ne.id)) {
      events2023.push(ne)
      console.log(`  Added event ${ne.id} (${ne.title}) to calendar/2023.json`)
    }
  }

  events2023.sort((a: any, b: any) => String(a.date_start).localeCompare(String(b.date_start)))
  cal2023.events = events2023
  cal2023.event_count = events2023.length
  cal2023.with_results = events2023.filter((e: any) => e.has_results).length
  writeJson(cal2023Path, cal2023)

  console.log('5. Cleaning dead competition references in data/v1/dogs/by-id/*.json...')
  const dogFiles = fs.readdirSync(DOGS_DIR)
  let cleanedDogsCount = 0

  // Map replaced duplicate files to canonical
  const FILE_REPLACEMENTS: Record<string, string> = {
    'competitions/2024/04-апрель/1224-чемпионат-ркф-по-бегам-за-механическои-приманкои.json': 'competitions/2024/04-апрель/20240408--07042024-.json',
    'competitions/2024/05-май/1227-чемпионат-ркф-по-бегам-за-механическои-приманкои.json': 'competitions/2024/05-май/20240512--11052024-.json',
    'competitions/2024/06-июнь/1233-чемпионат-ркф-по-бегам-за-механическои-приманкои.json': 'competitions/2024/06-июнь/20240617--16062024-.json',
    'competitions/2024/06-июнь/1455-монопородные-чемпионаты-ркф-по-бегам-борзых-в-по.json': 'competitions/2024/06-июнь/20240609--09062024-.json',
    'competitions/2024/06-июнь/1456-чемпионат-ркф-cacl-по-бегам-борзых-за-механическ.json': 'competitions/2024/06-июнь/20240615--cacl-15062024-.json',
    'competitions/2024/08-август/1238-чемпионат-ркф-по-бегам-за-механическои-приманкои.json': 'competitions/2024/08-август/20240825--24082024-.json',
    'competitions/2024/09-сентябрь/1245-чемпионат-ркф-по-бегам-за-механическои-приманкои.json': 'competitions/2024/09-сентябрь/20240923--22092024-.json',
    'competitions/2024/09-сентябрь/1466-чемпионат-россии-cacl-по-бегам-борзых.json': 'competitions/2024/09-сентябрь/20240908--08092024-.json',
    'competitions/2024/10-октябрь/1249-кубок-россии-по-бегам-за-механическои-приманкои.json': 'competitions/2024/10-октябрь/20241028--27102024-.json',
    'competitions/2024/08-август/1464-кубок-россии-cacl-по-бегам-борзых.json': 'competitions/2024/08-август/20240833--31082024-.json',
  }

  for (const f of dogFiles) {
    const full = path.join(DOGS_DIR, f)
    const d = JSON.parse(fs.readFileSync(full, 'utf-8'))
    let changed = false

    if (Array.isArray(d.competition_files)) {
      const newFiles: string[] = []
      for (const cf of d.competition_files) {
        const canonical = FILE_REPLACEMENTS[cf] ?? cf
        const checkPath = path.join(V1, canonical)
        if (fs.existsSync(checkPath)) {
          if (!newFiles.includes(canonical)) newFiles.push(canonical)
        } else {
          changed = true
        }
      }
      if (newFiles.length !== d.competition_files.length || newFiles.some((x, i) => x !== d.competition_files[i])) {
        d.competition_files = newFiles
        changed = true
      }
    }

    if (Array.isArray(d.competition_ids)) {
      // Map IDs if needed
      const ID_MAP: Record<number, number> = {
        1224: 20240408,
        1227: 20240512,
        1233: 20240617,
        1455: 20240609,
        1456: 20240615,
        1238: 20240825,
        1245: 20240923,
        1466: 20240908,
        1249: 20241028,
        1464: 20240833,
      }
      const newIds = [...new Set(d.competition_ids.map((id: number) => ID_MAP[id] ?? id))]
      if (newIds.length !== d.competition_ids.length || newIds.some((x, i) => x !== d.competition_ids[i])) {
        d.competition_ids = newIds
        changed = true
      }
    }

    if (changed) {
      writeJson(full, d)
      cleanedDogsCount++
    }
  }
  console.log(`  Cleaned references in ${cleanedDogsCount} dog profile files.`)
}

runCleanup()
console.log('Cleanup finished successfully!')
