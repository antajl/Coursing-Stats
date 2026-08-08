---
title: Parsers
verified: 2026-08-08
---

# 06 — Parsers (procoursing)

## Purpose

Парсинг HTML с procoursing.ru в JSON соревнований.

## Two families (не три)

| Семья | Что |
|-------|-----|
| **Coursing + BZMP** | Одинаковая модель оценок: `heats[].judges[].scores` (5 критериев). Код: `parsers/coursing/`, `parsers/bzmp/`, shared `parsers/shared/coursing-scores.ts` |
| **Racing** | Время/скорость — отдельная модель (`parsers/racing/`) |

`Full_Results_*.html` (архив Wayback) — **адаптер входного HTML** для coursing-family (`parsers/legacy-full-results/`), не отдельная дисциплина и не долгоживущий третий парсер.

## Truth table

| Правило | |
|---------|--|
| Encoding | windows-1251 **без** charset → только `backend/lib/fetch-win1251.ts` |
| Запрет | `fetch().text()` для procoursing → битая кириллица |
| Coursing ≈ BZMP | Общий score shape; racing отдельно |
| Legacy Full_Results_* | Адаптер → тот же `raw_scores_json.heats` что у modern coursing |
| Sex / Микс | Раздельные кобели/суки только если в **породе+классе** ≥3 собак этого пола; иначе `breed_class` → `… - Микс` (`parsers/shared/breed-class-mix.ts`) |
| `total_score` | = `grand_total` **как есть**; не делить на число судей |
| raw | Сохранять `raw_text` / scores JSON при парсе |
| Calendar | одна строка таблицы = одно событие; `event_type` из суффикса `_C_`/`_B_`/`_R_`; `rank_label` с `\n` |
| API | `/api/competitions`, не `/api/events` |
| Fixtures | `backend/tests/fixtures/{coursing,bzmp,racing,calendar}/` |

Также есть парсеры `unique/`, calendar helpers, shows PDF (это [04-shows](04-shows.md)).

## Key files

- `backend/lib/fetch-win1251.ts`
- `backend/parsers/coursing|bzmp|racing/` — coursing rows: `row-parsers.ts` router + `row-parsers-1judge.ts` / `row-parsers-2judges.ts`
- `backend/parsers/shared/coursing-scores.ts` — общий heat/judge builder
- `backend/parsers/legacy-full-results/` — Full_Results HTML → coursing-family shape
- `backend/scripts/import/import-full-results-archive.ts` — `--only 2015_03 --overwrite` для перепарса
- `backend/scripts/import/sync-archive-comps-to-calendar.ts` — `results_file` / `has_results` в `calendar/`
- `backend/parsers/shows/parse-rkf-certificate-pdf.ts` — barrel; impl в `rkf-cert/`
- `backend/scripts/test/test-parsers-fixtures.ts`
- Skill: `.cursor/skills/coursing-stats-parsers/`

## Workflows

```bash
yarn run test-parser
yarn run test-parser-fixtures   # перед изменением парсера
yarn run parse-coursing         # и bzmp / racing
yarn run reparse-2026-coursing  # и т.п.

# Archive Full_Results (Wayback) — coursing-family adapter
npx tsx backend/scripts/import/import-full-results-archive.ts
npx tsx backend/scripts/import/import-full-results-archive.ts --only 2015_03 --overwrite
npx tsx backend/scripts/import/sync-archive-comps-to-calendar.ts
```

После успешного парса → запись в `data/v1` → sync calendar при необходимости → `yarn run build-all-data` (для рейтингов/индексов).

## Pitfalls

- `Complete_Results_*` ≠ `Full_Results_*` — разные layout; modern Complete parsers на Full_Results дают 0 строк → используй legacy adapter.
- Wayback: качать `…/web/{timestamp}id_/http://procoursing.ru/…`, decode win1251.
- Не нормализовать total через деление на судей (историческая ловушка).
- Календарь: не разбивать мультидисциплинарную строку на несколько событий вручную неправильно.
- UI title часто из `rank_label`, не из `title`.
- Без `--overwrite` импорт не перезапишет competition, у которого уже есть results.

## See also

[03-competitions](03-competitions.md) · [11-testing](11-testing.md)
