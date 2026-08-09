---
title: Competitions
verified: 2026-08-09
---

# 03 — Competitions (спорт)

## Purpose

Курсинг / БЗМП / бега с procoursing.ru: рейтинги, календарь, протоколы, судьи, профили.

## Truth table

| Факт | |
|------|--|
| UI список курсинг/БЗМП | **Зачёт сезона** (`standingScore`) — не Elo-sort |
| Медали (данные) | `indexes/top-placement-*.json` |
| Очки CS (данные) | `indexes/top-score-*.json` (`rating_score`, version **cs-v1**) |
| Elo (данные) | `indexes/top-elo-*.json` — на карточке, **не** в sort |
| Мерджить в одно число | **Запрещено** (каскад: standing → CS → starts) |
| `standingScore` | `(3×🥇+1×🥈+0.5×🥉) / (starts+4)` — при равных медалях выше меньше участий |
| `total_starts` | finished **и** disqualified (участвовали); **не** dns/неявка |
| `total_score` | = grand_total протокола; **не** делить на судей; в формулу CS **не** входит напрямую |
| CS formula | `backend/lib/rating/coursing-rating-score.ts` (Bayesian avg + peak + starts) |
| CS / Elo copy (UI) | CS — ср. оценки + пик + опыт, тай-брейк; Elo — сила через соперников, не место |
| Calendar prod | `ui-flags.publicCalendars.competitions: true` |
| Профиль собаки | CDN `indexes/dog-profiles/pack-XXX.json` (`byId`) — не per-id, не `dogs/by-id` |
| Судьи | `indexes/judges-summary.json`, `judge-details/{key}.json` — **не** show judges |
| API local | `/api/competitions` (не `/api/events`) |

## Key files / routes

| Route | |
|-------|--|
| `/competitions` | Hub рейтинг + судьи + календарь |
| `/event/:id` | Протокол |
| `/dog/:id` | Unified profile |
| `/judges/:judgeId` | Судья спорта |
| Legacy `/top` | → competitions ranking |

- `frontend/src/pages/` (Competitions, TopDogs, Judges, Event…)
- `frontend/src/pages/Admin/` — локальный редактор (`/admin`, `/admin/event/:id`); Save → `data/v1/competitions/*.json` + ensure-dogs; `build-all-data` — вручную
- Spec: `docs/superpowers/specs/2026-08-08-competition-admin-editor-design.md`
- `frontend/src/lib/eloRank.ts` — `medalStrength` / `standingScore`
- `frontend/src/pages/TopDogs/mergeCombinedRanking.ts` — merge + sort
- `frontend/src/pages/TopDogs/CoursingRatingHint.tsx` — ⓘ текст
- `frontend/src/pages/Guide/components/RatingTab.tsx` — Справочник
- `data/v1/calendar/` + `indexes/events-by-id.json` — список календаря; `/event/:calendarId` через `results_file`
- `data/v1/competitions/`, `data/v1/indexes/` (в т.ч. `dog-profiles/pack-*.json`)
- Procoursing links: `ProcoursingEventLink`, attribution components

## Workflows

После парса/правки результатов → при необходимости `sync-archive-comps-to-calendar` → `yarn run build-all-data`.  
Reparse по id из URL `/event/:id`: `npx tsx backend/scripts/import/reparse-calendar-event-ids.ts [--archive] <id>…`  
Парсеры: см. [06-parsers](06-parsers.md).  
Локальная правка: `yarn run dev` → `/admin/event/:id` → Save → `build-all-data` перед продом.

## Pitfalls

- Не сортировать зачёт по Elo; не смешивать медали и CS в одно взвешенное число.
- «Чаще в призах» = выше КПД (меньше участий при том же наборе медалей), не «больше участий».
- Пустой топ на CDN → [02-data-pipeline](02-data-pipeline.md) diagnostics.
- Не путать с выставочным рейтингом на `/shows`.
- Id календаря (`20150314`) ≠ id файла соревнования (`1552`); клик в UI идёт по calendar id.
- Импорт только в `competitions/` без sync в `calendar/` → в табе календаря протокол «не виден».
- Колонка судей в списке календаря читает `calendar.*.judges` (не протокол). Если в протоколе судьи есть, а справа пусто — поле в calendar null; после reparse можно дописать из `competition.event.judges`.
- Один numeric id может быть и у архивного протокола, и у будущего события 2026. `rebuild-calendar-index` предпочитает запись с `has_results` / `results_file` и дополнительно алиасит id из имени файла `competitions/…/{id}-….json`, чтобы `/event/1567` открывал протокол, а не пустой календарный слот.
- Страницы `procoursing.ru/results/…` с одним JPG (дружественные, «Тройка», часть «по баллам») — **не** HTML-протоколы; текущие парсеры их не читают (нужен OCR или ручной ввод).

## See also

[01-three-domains](01-three-domains.md) · [02-data-pipeline](02-data-pipeline.md) · [06-parsers](06-parsers.md) · [07-frontend](07-frontend.md) · ADR-014  
План зачёта: `docs/superpowers/plans/2026-08-06-season-standing-ranking-b.md`
