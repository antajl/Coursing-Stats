---
title: Shows (RKF)
verified: 2026-11-08
---

# 04 — Shows (выставки)

## Purpose

Выставки РКФ: рейтинг, календарь, судьи, протоколы PDF, статические протоколы S3/CDN (gzip).

## Truth table

| Что | Откуда |
|-----|--------|
| Ranking / calendar / judges / home-top | **CDN** `data/v1/shows/indexes/*`, calendar JSON |
| Протокол `/shows/exhibition/:id` | Прямой fetch с S3 CDN `shows/protocols/${id}.json` (gzip); fallback: `shows/index.json` (LC allowlist) |
| Bulk протоколы выставок | Все 51 429 протоколов (2019–2026) на S3 CDN (`shows/protocols/*.json`) в gzip |
| ShowRanking / ShowCalendar | React Query → **CDN**, не Turso |
| ShowCalendar URL & Prefetch | Дефолтный год не пишется в URL (?tab=archive); активный месяц по умолчанию — последний с протоколами (findLatestMonthWithProtocols); навигация вперед/назад и доступные месяцы в тулбаре ограничены месяцами с протоколами (getMonthsWithProtocols); при открытии пустого месяца сохраняется шапка с кнопкой возврата назад; префетч отложен на 2.5с / по наведению onHoverTab |
| ShowCalendar Freshness & Hint | Кнопка в тулбаре оформляется единым шрифтом `Об архиве · 16 нояб.` (`text-xs font-semibold`); статус внутри карточки выводится строго в две сбалансированные строки без двойных дат: «В базу внесены все данные РКФ, / опубликованные к {date}», устраняя путаницу между датой сверки и задержкой РКФ; заголовок «Архив выставок РКФ» упразднен |
| Ingestion & SQLite Archive | `data/local/exhibitions-rkf-archive.sqlite` локальная (не в git); облачный воркфлоу `.github/workflows/update-rkf-shows.yml` удалён; парсинг выполняется локально через `monitor-new-rkf-protocols.ts` с обогащением `enrich-show-dog-details.ts` |
| All-time `dog-ranking-all-time.json` | ~17.6 MB (~2.2 MB gzip) — Top-100 overall + Top-100 per breed, публикуется на CDN |
| All-time `dog-ranking-all-time-page0.json` | ~32 KB — Top-100 overall first-paint slice (<20 ms) |
| ShowRanking all-time filter | При выборе «Все года» (`filterYear = ''`) загружаются `dog-ranking-all-time-page0.json` и `dog-ranking-all-time.json`; без текстового поиска результат строго срезается до Топ-100 (`slice(0, 100)`); fallback на текущий сезон запрещён |
| Raw all-time `dog-ranking.json` (>220 MB) | Исключён из CDN (`publish-exclude.js`) во избежание превышения лимитов |
| Lookup | `show-dog-lookup/{0-f}.json` шарды (~обход 25 MB) |
| Show dog card | `shows/indexes/dog-details/{000-255}.json` (уже паки) |
| History date sort | Даты `DD.MM.YYYY` обязаны сортироваться через ISO `toShowDateIso` / `sortShowHistory` (`show-dates.ts`); прямой `localeCompare` запрещен во избежание сортировки по дню месяца |
| Show judge detail | `shows/indexes/judge-details/pack-*.json` (`byKey`) |
| Identity | show dog id **≠** competition `dog_id` |
| Calendar prod | `ui-flags.publicCalendars.shows: true` |
| Env | Не требуются для рантайма сайта (Turso полностью удален; протоколы на S3) |

### PDF pipeline (кратко)

`ingest-rkf-calendar` → `download-rkf-reports` → `parse-rkf-reports` → sync → `rebuild-show-year` / `build-show-indexes`.  
Type1 = итоговый отчёт; type3 = главный ринг (BIS/BIG) — scope 2025–2026.  
Skill: `shows-pdf-pipeline`.

Нявка (НЯ) не в рейтинг; дисквал учитывается.

## Key files

- `frontend/src/lib/staticData/shows.ts` — barrel → `shows/{calendar,ranking,judges,home}.ts`
- `frontend/src/pages/Shows/*` — page shells + folders `ShowExhibitionDetail/`, `ShowCalendar/`, `ShowJudgeDetail/`
- `frontend/src/pages/Shows/showMetaTooltips.ts` — расшифровка метаданных выставок (клубы ЕГРЮЛ, ранги РКФ, федерации)
- `backend/lib/show-award-ranking.ts` — barrel → `show-awards/{order,normalize,match,score}.ts`
- `backend/lib/cdn-packs.ts` — общий шардер паков
- `backend/parsers/shows/parse-rkf-certificate-pdf.ts` — barrel → `rkf-cert/*`
- `backend/scripts/shows/*`, `backend/lib/show-dog-dedupe.ts`
- `backend/scripts/repair/repair-2026-shows.ts` — ремонт пород, судей, кличек и результатов в JSON-протоколах выставок
- `backend/scripts/repair/repair-sqlite-2026.ts` — ремонт базы `exhibitions-rkf-archive.sqlite`
- `backend/tests/parse-rkf-certificate-pdf.test.ts`

## Workflows

```bash
yarn run ingest-rkf-calendar
yarn run download-rkf-reports
yarn run parse-rkf-reports
yarn run rebuild-show-year
yarn run build-show-breed-calendar
# Выгрузка протоколов на Яндекс S3 (gzip):
npx tsx backend/scripts/shows/export-protocols-to-s3.ts --all
# Ремонт данных 2026:
npx tsx backend/scripts/repair/repair-2026-shows.ts
npx tsx backend/scripts/repair/repair-sqlite-2026.ts
```

Local без `data/local/shows/exhibitions-rkf`: **не** форсить полный show rebuild в CI-пути.

## Pitfalls

- Мобильная панель фильтров ShowRanking: запрещены растягивающие обёртки вокруг кнопки поиска (ToolbarSearch) и flex-wrap; все контролы (Поиск, Год, Пол, Порода, Сброс, Hint) обязаны компоноваться строго в один ряд высотой 32px (overflow-x-auto no-scrollbar py-0.5), а ShowRatingHint на мобильных вызывается с compact (капсула 32×32px без текстового ярлыка).
- Старые docs «ShowRanking читает Turso» — **ложно**.
- Не мерджить show judges со sport judges.
- Lean ranking без history; history в `dog-details/` при необходимости.
- Протоколы выставок на S3 CDN: все 56 225 протоколов (2019–2026) отдаются в gzip из `/data/v1/shows/protocols/{id}.json`. Turso полностью удалён из проекта. В `deploy.yml` команда полного синка данных обязательно защищена через `--exclude "shows/protocols/*"`.
- Числовой шум парсинга в породе (каталожные номера, возраст, e.g. `'18'`) отсекается как артефакт; `'БЕЗ ПОРОДЫ'` допустимо только если в оригинале явно указано «БЕЗ ПОРОДЫ» или «МЕТИС».
- Сортировка пород в фильтрах выставок: строго по убыванию количества собак с аккуратным алфавитным вторичным ключом.
- Фильтрация пород в календаре/судьях: выпадающие списки пород (`ShowCalendarToolbar`, `ShowJudgesToolbar`) фильтруются по официальному `indexes/breed-aliases.json`, санируют OCR-артефакты PDF и несклеенные окрасы кокеров (`breedMapping.ts`), а счетчики передаются через проп `dogIndex` во избежание `ReferenceError`.
- Судьи выставок и аккредитация РКФ: сопоставление с официальным реестром судей РКФ (`backend/lib/rkf-exterior-judges.json`) выполняется строго по полному 3-составному ФИО (Фамилия Имя Отчество с нормализацией регистра, пробелов и букв `ё↔е`, 427 подтверждённых судей). Бинарное правило 100% достоверности: при отсутствии точного совпадения поля `city`, `cert_number` и `ranks` не заполняются (нулевой домысел). Судейский номер удостоверения («РКФ № ...») выводится строго в шапке профиля судьи (`JudgeDetailHeader.tsx`), сохраняя лаконичность карточек списков.
- Обогащение судей выставок данными Konura (`konura.info`): 1) Фотографии сохраняются и отдаются локально из статического S3 CDN пути `/data/v1/shows/judges/photos/{id}.jpg` (прямая внешняя ссылка на `http://www.konura.info` блокируется браузерами по Mixed Content из-за отсутствия SSL на исходном сайте), город используется как fallback при отсутствии в РКФ. Биографии, описания и судейские ранги Konura в базу НЕ заносятся (ранги и сертификаты — строго РКФ); 2) В профиле судьи (`JudgeDetailHeader.tsx`) слева от ФИО размещается крупный портретный аватар `rounded-2xl` с кнопкой зума, открывающий полноразмерное фото в модальном окне через Portal (с кнопкой закрытия $\ge 44$ px и внешней ссылкой на первоисточник «Источник фото: konura.info ↗»); в основном профиле внешние ссылки не дублируются; 3) В карточках судей (`ShowJudgeCard.tsx`) при наличии `photo_url` в первой колонке выводится компактный аватар `rounded-xl` (36–40 px).
- Архитектура судей выставок (/shows/?tab=judges) и калибровка строгости: карточки судей выставок синхронизированы с соревнованиями в 3-колоночную сетку (Колонка 1: имя + породы без служебных слов «в рингах», город скрыт из списков; Колонка 2: бейдж строгости + год в первой строке, число оценок во второй строке без канцеляризмов «в каталогах»; Колонка 3: плашки ВЫСТАВОК, СОБАК, ОТЛИЧНО). Шкала строгости откалибрована по реальному распределению РКФ (медиана 80.7%): < 76% — Строгий (~25%), 76–84.9% — Умеренный (~50%), ≥ 85% — Лояльный (~25%), порог достоверности ≥ 30 оценок. Списки оборачиваются в DoninoColumnShell с бесшовной сортировкой DoninoColumnPlaque и кнопкой регламента «(i) О судействе».
- Для полного пересчета снапшота выставок использовать `yarn run rebuild-show-snapshot` (использует memory wrapper на 12 ГБ V8 heap).

## See also

[01-three-domains](01-three-domains.md) · [02-data-pipeline](02-data-pipeline.md) · ADR-007, ADR-009, [ADR-014](../decisions/014-cdn-packs-vs-turso.md)
