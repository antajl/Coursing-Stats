---
title: Competitions
verified: 2026-10-01
---

# 03 — Competitions (спорт)

## Purpose

Курсинг / БЗМП / бега с procoursing.ru: рейтинги, календарь, протоколы, судьи, профили.

## Truth table

| Факт | |
|------|--|
| UI список курсинг/БЗМП | **Зачёт сезона** (`standingScore`) — медали + CS тай-брейк |
| Медали (данные) | `indexes/top-placement-*.json` |
| Очки CS (данные) | `indexes/top-score-*.json` (`rating_score`, version **cs-v2**) |
| Терминология | Участия в спорте называть **забеги** (заб.), не «старты» |
| Elo | **Удалён** из UI и пайплайна |
| Мерджить в одно число | **Запрещено** (каскад: standing → CS → забеги) |
| `standingScore` | `(3×1м + 1×2м + 0.5×3м) / (забегов + 4)` — при равных медалях выше меньше забегов |
| `total_starts` | finished **и** disqualified (участвовали); **не** dns/неявка |
| `total_score` | = grand_total протокола; **не** делить на судей; в формулу CS **не** входит напрямую |
| CS formula | `backend/lib/rating/coursing-rating-score.ts` (CS v2: внутрипородный базис + Bayesian avg + peak + starts − stability penalty) |
| Calendar prod | `ui-flags.publicCalendars.competitions: true` |
| Профиль собаки | CDN `indexes/dog-profiles/pack-XXX.json` (`byId`) — не per-id, не `dogs/by-id` |
| Судьи | `indexes/judges-summary.json`, `judge-details/{key}.json` — **не** show judges |

## Key files / routes

| Route | |
|-------|--|
| `/competitions` | Hub рейтинг + судьи + календарь |
| `/event/:id` | Протокол |
| `/dog/:id` | Unified profile |
| `/judges/:judgeId` | Судья спорта |
| Legacy `/top` | → competitions ranking |

- `frontend/src/pages/` (Competitions, TopDogs, Judges, Event…)
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
Правка данных: прямое редактирование JSON в `data/v1/competitions/` или `data/v1/calendar/` → `build-all-data`. Автоматизированное добавление: см. [ROADMAP](../ROADMAP.md) (Ветка 1 `yarn ingest-competition`). Оцифровка исходных протоколов в векторный PDF: `yarn export-protocol <id>` (см. [16-protocol-template](16-protocol-template.md)).

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
- **Целостность соревнований и судей:** 100% состязаний обязаны быть привязаны к календарю без дубликатов (контролируется `backend/tests/competition-integrity.test.ts`). Статистика судей спорта в сводке `judges-summary.json` обязана строго совпадать с детальными файлами `judge-details/{key}.json` (контролируется `backend/tests/judge-integrity.test.ts` и гейтом `judge_integrity`).
- **Суммы судей и сходы:** у каждого судьи в забеге обязана быть его личная сумма `judge.sum = sum(scores)`, а общая сумма забега фиксируется в `heat.total`. Собака, сошедшая или снятая во 2-м круге, обязана фиксироваться со вторым забегом `disqualified: true` и причиной схода, а не отбрасываться.
- **Многоэтапные турниры одного дня:** марафоны и двоеборья оформляются одной записью в календаре с переключателем раундов в UI и единым векторным протоколом.
- **Неделимость спортивных протоколов:** Результаты официальных состязаний являются фактом кинологической истории и не подлежат выборочному удалению по индивидуальным запросам владельцев (иначе разрушаются турнирные таблицы для других участников). По обоснованным обращениям отключаются сторонние ссылки (`pedigree_url: null`) и исключаются замеры скорости из рейтингов. В UI архива и рейтингов выводятся дисклеймеры о возможной неполноте и неточностях ранних баз данных. Полная хроника и прецеденты: [COMMUNITY_CHRONICLE_2026.md](../COMMUNITY_CHRONICLE_2026.md).

## Хранилище документов турниров (каталоги, регламенты, протоколы)

- **Локальный каталог документов:** `C:\Users\Antal\Documents\Google.Disk\Competitions\{YYYY}/{event_folder}/`  
  Папки создаются автоматически при создании/импорте каждого турнира по схеме `YYYY-MM-DD - Ранг (Дисциплина) [Место] [ID]`. Google Drive for Desktop синхронизирует их с Google Диском.
- **Обработка файлов:**
  - При поступлении файлов турнира (каталог, регламент, протоколы) перемещать их в соответствующую папку на Google Диске.
  - Если протоколы представлены серией фото (`1.png`, `2.png`...) — объединять их в единый многостраничный **`protocol.pdf`** с естественной сортировкой номеров страниц.
  - Извлекать ссылки Google Диска из локальной базы DriveFS (`mirror_metadata_sqlite.db`) и прописывать их в поля соревнования и календаря.
- **Ссылки в данных (`data/v1/competitions/`, `data/v1/calendar/`):**
  - `catalog_url` — ссылка на PDF/DOCX каталога на Google Диске (просмотр/скачивание).
  - `rules_url` — ссылка на DOCX/PDF регламента на Google Диске.
  - `results_pdf_url` — ссылка на `protocol.pdf` на Google Диске.
- **Отказ от Яндекс Диска:** Все новые ссылки и замена старых ссылок делаются на **Google Диск** (`disk.yandex.ru` запрещён для новых файлов).

## See also

[01-three-domains](01-three-domains.md) · [02-data-pipeline](02-data-pipeline.md) · [06-parsers](06-parsers.md) · [07-frontend](07-frontend.md) · [ROADMAP](../ROADMAP.md) · [COMMUNITY_CHRONICLE_2026.md](../COMMUNITY_CHRONICLE_2026.md) · ADR-014
