---
name: coursing-stats-parsers
description: >
  Парсеры procoursing.ru для CoursingStats — windows-1251, курсинг/BZMP/гонки v2, fixtures,
  total_score=grand_total. Используй при изменении парсеров, репарсе, event_type календаря,
  или сломанной кириллице при fetch.
  procoursing.ru parsers for CoursingStats — windows-1251, coursing/BZMP/racing v2, fixtures,
  total_score=grand_total. Use when changing parsers, reparse, calendar event_type, or broken Cyrillic from fetch.
---

# CoursingStats Parsers

## Two parser families (not three)

| Family | Paths | Notes |
|--------|-------|-------|
| **Coursing + BZMP** | `backend/parsers/coursing/`, `backend/parsers/bzmp/`, shared `backend/parsers/shared/coursing-scores.ts` + `multi-judge-compact.ts` | Same heat/judge criteria shape (Ман/Скор/Вын/Энт/Инт × judges × heats). BZMP reuses coursing utils/header helpers. |
| **Racing** | `backend/parsers/racing/` | Time/speed heats — separate model. |

**Full_Results archive HTML** (`Full_Results_*.html` on Wayback) is an **input-format adapter**, not a third discipline:

- `backend/parsers/legacy-full-results/` → coursing-family `heats[].judges[].scores` (Ман/Скор/…)
- `backend/parsers/legacy-full-results/racing.ts` → racing `format:'racing'` heats with `time`/`speed_kmh` when header has «Время 1» (never feed those through the coursing adapter)
- Import: `npx tsx backend/scripts/import/import-full-results-archive.ts` (`--only 2015_03`, `--overwrite` to refresh existing comps)
- Then `sync-archive-comps-to-calendar.ts` if calendar link missing; `build-all-data` only when ratings/indexes need refresh

Modern protocols: `Complete_Results_*` → `parse-coursing` / `parse-bzmp` / `parse-racing`.

Reparse modern: `yarn run reparse-coursing`, `reparse-bzmp`, `reparse-racing`, or `reparse-2026-coursing` etc.

Reparse by `/event/:id` (calendar or competition file id):  
`npx tsx backend/scripts/import/reparse-calendar-event-ids.ts [--archive] <id>…`  
Falls back to `competitions/**/{id}-*.json` when calendar id collides with a future empty slot.

**Not parseable as HTML:** `procoursing.ru/results/…` pages that only embed a JPG (friendly runs, team «Тройка», some points screenshots).

## Critical rules (NEVER violate)

1. **Encoding:** procoursing.ru = windows-1251 without charset → ONLY `backend/lib/fetch-win1251.ts` (iconv-lite). Archive: decode win1251 from Wayback `id_` URL. NEVER `fetch().text()`.
2. **total_score** = `grand_total` as-is — do NOT divide by number of judges.
3. **raw_text:** always save when parsing.
4. **API:** `/api/competitions`, not `/api/events`.
5. **Calendar:** one table row = one event; `event_type` from results_url suffix (`_C_`/`_B_`/`_R_`). UI list comes from `calendar/*.json` + `results_file`, not from competition ids alone.

## Before changing any parser

```bash
yarn run test-parser
yarn run test-parser-fixtures
```

Fixtures: `backend/tests/fixtures/{coursing,bzmp,racing}/`  
Legacy adapter unit: `backend/tests/legacy-full-results.test.ts`

## Self-correction loop

1. Generate parse output
2. Validate (fixtures + schema checks)
3. Reflect on failures
4. Retry until pass

## Coursing-family scoring

- 1–3 judges; 5 categories × 0–20 each
- Max: 200 (1 judge), 400 (2), 600 (3)
- Judge count from protocol header
- UI: `EventResults/ScoringDetail` reads `raw_scores_json.heats`
- Full_Results grey row (`bgcolor=#c0c0c0`) = неявка → `status: dns` (UI «Неявка»)

## Sex classes → Микс

In one **breed + size class** (Стандарт / Юниоры / Ветераны / …):

- Separate `Кобели` / `Суки` only if that sex has **≥3** dogs
- If both sexes present and either has &lt;3, or a lone sex has &lt;3 → rewrite `breed_class` to `… - Микс` (нераздельный зачёт)
- Dog catalog sex stays; only grouping label changes
- Helper: `backend/parsers/shared/breed-class-mix.ts` (wired into coursing, BZMP, and Full_Results adapter)

## Docs

- Rules: `docs/sheets/06-parsers.md`
- Competitions/calendar link: `docs/sheets/03-competitions.md`
