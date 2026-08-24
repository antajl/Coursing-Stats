---
name: competitions-domain
description: >
  Соревнования CoursingStats — календарь, протоколы, медали/очки CS/Elo, судьи, профили собак /dog/:id.
  Используй для курсинга, BZMP, гонок, рейтингов top-placement/top-score, парсеров procoursing, build-all-data для индексов спорта.
  CoursingStats competitions — calendar, protocols, medals/CS/Elo rankings, judges, /dog/:id sport profiles.
  Use for coursing, BZMP, racing, top-placement, top-score, procoursing parsers, build-all-data for sport indexes.
---

# Competitions Domain

## Scope

Calendar, event protocols, dog rankings (medals, CS, Elo, racing speed), judge stats, unified dog profiles for sport dogs.

## Routes & pages

| Route | Component |
|-------|-----------|
| `/competitions?tab=ranking` | `Competitions.tsx` → `TopDogs/` |
| `/competitions?tab=judges` | `Judges/` |
| `/competitions?tab=calendar` | `Events/` |
| `/dog/:id` | `DogProfile/` via `UnifiedDogProfile.tsx` |
| `/event/:id` | `Events/EventResults/` (loads via `indexes/events-by-id.json` → `results_file`) |
| `/judges/:judgeId` | `Judges/JudgeDetail.tsx` |
| `/admin`, `/admin/event/:id` | Local-only (`isLocalDev`) competition editor — `frontend/src/pages/Admin/` |

## Data (CDN only)

```
data/v1/calendar/{year}.json              ← UI calendar list; has_results + results_file
data/v1/competitions/{year}/{month}/{id}-{slug}.json  ← results[] inside
data/v1/indexes/events-by-id.json         ← calendar id → results_file
data/v1/indexes/calendar-index.json
data/v1/indexes/years.json
data/v1/indexes/top-placement-*, top-score-*, top-elo-*, top-speed-*
data/v1/indexes/judges-summary.json, judges/{id}.json
data/v1/indexes/dog-profiles/{id}.json
```

Frontend: `frontend/src/lib/staticData/{competitions,rankings,dogs,judges}.ts`

**Calendar ≠ competition file id:** calendar often uses `YYYYMMDD` ids; competition JSON may use sequential ids (e.g. 1551). UI `/event/:calendarId` works when calendar row has `results_file` pointing at the competition JSON. After importing protocols, run `sync-archive-comps-to-calendar` (or set `results_file` / `has_results`) then rebuild calendar indexes.

## Two ratings — never merge into one number

- **Зачёт сезона (единый список):** `standingScore = medalStrength/(starts+4)` → CS → starts. Elo display-only.
- **Медали в данных:** `top-placement-*`
- **CS:** `top-score-*` (`cs-v1`) — tie-break in standing, muted on card
- **Elo:** `top-elo-*` — shown on card, does **not** sort the list
- **Рейсинг:** `top-speed-*` — separate column by km/h

Never: `0.4*Elo + 0.3*CS + …`

## Parsers

Three separate v2 parsers: `backend/parsers/{coursing,bzmp,racing}/`  
Legacy archive `Full_Results_*.html`: thin coursing-family adapter (`backend/parsers/legacy-full-results/`) + `import-full-results-archive.ts` (`--overwrite` to refresh heats). Not a third discipline parser — same `raw_scores_json.heats` as coursing/BZMP.  
Link into calendar: `backend/scripts/import/sync-archive-comps-to-calendar.ts`

Before changes: `yarn run test-parser-fixtures`

Skill: `coursing-stats-parsers`

## Local admin

- `yarn run dev` → `/admin` (list/create) + `/admin/event/:id` (edit) + API `:8787`
- Save writes competition JSON + ensure-dogs for that event; does **not** run `build-all-data`
- Spec: `docs/superpowers/specs/2026-08-08-competition-admin-editor-design.md`

## Build pipeline

After editing `competitions/`, `dogs/`, or `calendar/`:

```bash
yarn run build-data-snapshot   # results > 0
yarn run build-all-data        # includes rebuild-calendar-index
```

## WIP / gaps

- Elo indexes generation in progress
- Sport↔show linkage on unified profile incomplete
- Detail heat/judge editor in admin = phase 2

## Docs

- `docs/sheets/06-parsers.md`
- `docs/sheets/02-data-pipeline.md`
- `docs/sheets/03-competitions.md`
