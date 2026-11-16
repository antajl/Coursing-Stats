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
| Show Judge Class Scope & Breed List Invariant | В карточке судьи (/shows/judges/:id) список пород и бэйджи количества строго соответствуют срезу («Взрослые», «Щенки», «Все»): щенки показывают точное число щенков (puppy_breeds / puppy_breed_counts) без фантомных взрослых; внутри спойлера породы (ShowJudgeBreedDogsList) работает lazy infinite scroll пачками по 30 собак через IntersectionObserver |
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
- Обогащение судей выставок данными Konura (`konura.info`) и фотомодалки: 1) Фотографии сохраняются и отдаются локально из статического S3 CDN пути `/data/v1/shows/judges/photos/{id}.jpg` (прямая внешняя ссылка на `http://www.konura.info` блокируется браузерами по Mixed Content из-за отсутствия SSL на исходном сайте), город используется как fallback при отсутствии в РКФ. Биографии, описания и судейские ранги Konura в базу НЕ заносятся (ранги и сертификаты — строго РКФ); 2) В профиле судьи (`JudgeDetailHeader.tsx`) слева от ФИО размещается крупный портретный аватар `rounded-2xl` с кнопкой зума; под именем судьи внешние ссылки запрещены; 3) В карточках судей (`ShowJudgeCard.tsx`) при наличии `photo_url` в первой колонке выводится компактный аватар `rounded-xl` (36–40 px); 4) Полноэкранный зум фото судей и собак (`JudgeDetailHeader.tsx`, `DogProfileHeader.tsx`) унифицирован: оверлей strictly оформляется глубоким непрозрачным фоном `bg-black/95 select-none` с `transform: translateZ(0)` (полупрозрачный `backdrop-blur` запрещен из-за просвета границы sticky-шапки сайта и артефактов горизонтальных полос компоновщика Chrome при наведении мыши) и полноэкранной прозрачной кнопкой-подложкой (`button.absolute.inset-0`) для надёжной делегации тапа закрытия на iOS Safari; фотографии судей (базово 200×200 px с konura) масштабируются адаптивно до `w-[min(88vw,320px)] sm:w-[380px] md:w-[440px]` с `h-auto max-h-[72dvh] sm:max-h-[78dvh] object-contain`, исключая эффект мелкой марки на десктопе; подпись под фото оформляется строго в 2 строки по центру: Строка 1 — имя/кличка белым шрифтом, Строка 2 — первоисточник (`Источник фото: konura.info ↗` для судей, `Источник фото: The Breed Archive ↗` для собак) с аккуратной иконкой `ExternalLink`.
- Редизайн профиля судьи и аккордеона пород (`JudgeDetailHeader.tsx`, `JudgeBreedPanel.tsx`): 1) Двухкарточная архитектура: блок профиля судьи разделен на две независимые парящие карточки — верхняя Hero-карточка судьи (фото, имя `<h1>` на самом верху, паспортная строка РКФ/FCI через точку ` · `, плашки строгости со светофором и селектор года `JudgeYearDropdown`) и нижняя карточка сводной статистики и аналитики (4 ключевые плитки KPI, раскладка оценок и шкала строгости); 2) Бейджи строгости стиля экспертизы унифицированы по грамматике и предлогу «к» (`• Лояльный к взрослым`, `• Лояльный к щенкам`, `• Умеренный к взрослым`, `• Умеренный к щенкам`, `• Строгий к взрослым`, `• Строгий к щенкам`; скобки `(взрослые)` и краткие формы запрещены); 3) В карточке аналитики избыточные подписи («Оценки по категориям:», «Фокус: взрослые классы») и внутренние разделительные линии (`border-t`) упразднены; 4) Шкала строгости калибровки скомпонована в компактный трехколоночный верхний ряд (`grid-cols-1 md:grid-cols-[auto_1fr_auto]`: Слева эксперт, по центру сравнительный вердикт против РКФ, справа среднее по РКФ), а нижний отдельный пояснительный абзац удален для экономии места; 5) Дублирующая кнопка «О судействе» внутри профиля упразднена (справка размещается только в тулбаре общего каталога судей); 6) В сегмент-карточках 3 («Взрослые классы») и 4 («Щенки и бэби») активное состояние подсвечивается бейджем `Выбрано` и кольцом `ring-2 ring-camel-400/40`, плитки оценок маркируются `Взр.` / `Щен.` с приглушением неактивных (`opacity-40`), а шкала строгости калибруется контекстно под щенков или взрослых; 7) В аккордеоне пород (`JudgeBreedPanel.tsx`) шеврон `ChevronRight` поворачивается на 90°, количество оценок выводится компактным числовым бейджем без слова «Оценок:», а популярность породы отображается нижней микро-полоской `h-[2px] bg-camel-400/60` без ступенчатых срезов фона.
- Архитектура судей выставок (/shows/?tab=judges) и калибровка строгости: карточки судей выставок синхронизированы с соревнованиями в 3-колоночную сетку (Колонка 1: имя + породы без служебных слов «в рингах», город скрыт из списков; Колонка 2: бейдж строгости + год в первой строке, число оценок во второй строке без канцеляризмов «в каталогах»; Колонка 3: плашки ВЫСТАВОК, СОБАК, ОТЛИЧНО). Шкала строгости откалибрована по реальному распределению РКФ (медиана 80.7%): < 76% — Строгий (~25%), 76–84.9% — Умеренный (~50%), ≥ 85% — Лояльный (~25%), порог достоверности ≥ 30 оценок. Списки оборачиваются в DoninoColumnShell с бесшовной сортировкой DoninoColumnPlaque и кнопкой регламента «(i) О судействе».
- Для полного пересчета снапшота выставок использовать `yarn run rebuild-show-snapshot` (использует memory wrapper на 12 ГБ V8 heap).
- Обогащение базы родословными Breed Archive (`breedarchive.com`): 1) Сетевой транспорт: в Node.js на Windows запросы к API breedarchive.com обязаны принудительно использовать диспетчер IPv4 (`undici.Agent({ connect: { family: 4 } })`) в `backend/lib/breedarchive.ts` для исключения 10-секундных таймаутов на IPv6; 2) Экспоненциальный backoff: HTTP 429 обрабатывается автоматическими паузами (2с, 4с, 8с) с повтором запроса; 3) Атомарные чекпоинты и возобновляемость: процесс `scan-all-breedarchive.ts` поддерживает `--resume` и файл чекпоинта `backend/scripts/breedarchive-checkpoint.json` (в `.gitignore`), сбрасывая шарды каждые 50–100 собак и при SIGINT/SIGTERM, исключая потерю прогресса; 4) Правило нулевых ложных срабатываний: точное сопоставление `exact.length === 1` строго отклоняет однословные имена с коллизиями (несколько разных собак в каталоге); 5) Многоуровневый пайплайн (3 эшелона): Tier 1 — абсолютные чемпионы BIS/BIG, все борзые и спорт; Tier 2 — победители рингов BOB (~25 000 собак); Tier 3 — сплошной прогон остальных собак (`--all-breeds`).

## See also

[01-three-domains](01-three-domains.md) · [02-data-pipeline](02-data-pipeline.md) · ADR-007, ADR-009, [ADR-014](../decisions/014-cdn-packs-vs-turso.md)
