# Выставки (Shows)

Раздел для отображения результатов выставок РКФ, рейтинга выставочных собак, судей и календаря выставок.

## Архитектура

### Источник данных

**lc.rkfshow.ru** (выставочный портал РКФ)
- URL: https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionsView
- Список выставок: ~100 выставок (2019-2026)
- Проблема: использует Telerik Data Grid с AJAX, возвращает HTML/JavaScript шаблоны

### Текущий статус (2026-07-12)

**Скрапинг lc.rkfshow.ru реализован:**
- Playwright с locale 'ru-RU' для корректного получения русских названий пород и групп FCI
- Параллельные запросы для ускорения (~5 минут на выставку)
- Pipeline: ExhibitionResultListView → breed_catalog → BreedView × N пород → attachCatalogToResults
- ~90 выставок спарсены (2025-2026), ~174,487 собак в рейтинге

**Реализовано:**
- Скрипты скрапинга `backend/parsers/shows/` и `backend/scripts/enrich-show-*.ts`
- Frontend компоненты (ShowRanking, ShowJudges, ShowCalendar, ShowDogProfile)
- Структура данных в `data/v1/shows/`
- Индексы рейтинга по годам (dog-ranking-{year}.json)
- Документация

**Проблемы:**
- **Профиль собаки в выставках (ShowDogProfile.tsx) пишет "Собака не найдена"** - требуется исправление
- Профиль в соревнованиях (DogProfile.tsx) работает корректно
- Требуется унификация дизайна профиля выставок под профиль соревнований

### Структура данных

```
data/v1/shows/
├── exhibitions/{year}/{month}-{id}-{slug}.json
│   ├── schema: "coursing-stats/show-exhibition-v1"
│   ├── event: { id, date, title, location, rank, type, club, judges }
│   ├── results: [{ breed, class, placement, title, dog_name, owner, judge }]
│   └── raw_text: string
├── calendar/{year}.json
│   └── exhibitions: [{ id, date, title, location, has_results }]
└── indexes/
    ├── show-ranking-{year}.json
    ├── show-judges-summary.json
    └── show-dog-profiles/{id}.json
```

### Frontend компоненты

- **Shows.tsx** - Hub страница с табами
- **Shows/ShowRanking.tsx** - Рейтинг выставочных собак
- **Shows/ShowJudges.tsx** - Судьи выставок
- **Shows/ShowCalendar.tsx** - Календарь выставок

### Маршрутизация

- `/shows` - hub страница
- `/shows?tab=ranking` - рейтинг
- `/shows?tab=judges` - судьи
- `/shows?tab=calendar` - календарь
- `/shows?tab=champions` - чемпионы (в разработке)

## Справочник на сайте

Пользовательская расшифровка титулов и сертификатов выставок — **не здесь**, а на странице справочника:

- **`/guide?tab=shows`** — иерархия CAC → BOB/BIS → чемпионские титулы, ранги выставок, приоритет наград, сокращения.
- Источники: Положение о сертификатных выставках РКФ (ред. 18.12.2024), Положение о титулах, FCI EXP-REG.

### Индекс рейтинга собак

- **CDN:** `dog-ranking-{year}.json` (compact); UI по умолчанию — текущий год; «все года» — склейка шардов в `getShowDogRanking('')`
- **Не на CDN:** `dog-ranking.json` all-time (>25 MB лимит Pages) — исключён из git/`copy-data.js`
- **Календарь UI:** `shows/calendar/{year}.json` (лёгкий список); полный протокол — `exhibitions/*.json` на странице выставки
- **Сборка:** `npx tsx backend/scripts/build-show-indexes.ts` (из `build-all-data`)
- **Логика:** `backend/lib/show-award-ranking.ts` — веса BIS (10k) → BOB (2k) → CACIB (500) → CAC (100)
- **Тест:** `backend/tests/show-award-ranking.test.ts`

Канон размеров и фронта: [`03-DATA.md`](03-DATA.md) → «Выставки».

### Пайплайн парсера (канон)

**Обязательно:** Playwright `locale: 'ru-RU'` — иначе группы FCI, породы и классы приходят на английском.

| Шаг | Источник | Что сохраняем |
|-----|----------|---------------|
| 1 | `ExhibitionResultListView` + перехват POST `ExhibitionResultListViewRefresh` | JSON каталога + `h2.titlelight` (группы FCI) + `.groupcontainer` (дата/название) |
| 2 | `buildBreedCatalog()` | `breed_catalog[]`: русские породы, `breed_en`, группы, судьи Specialty |
| 3 | `BreedView?dogBreedId=` × N пород → `scrapeBreedViewDom()` | `results[]`: пол, класс (с протяжкой), оценка, награды; `breed_catalog[].titles` |
| 4 | `attachCatalogToResults()` | Слияние каталога с результатами → `data/v1/shows/exhibitions/*.json` |

**Код:** `backend/parsers/shows/{exhibition-catalog,parse-breed-view,scrape-show-results}.ts`

**Обогащение одной выставки (рекомендуется):**

```bash
cd backend
npx tsx scripts/enrich-show-exhibition.ts 106
```

По шагам (если нужен частичный прогон):

```bash
npx tsx scripts/enrich-show-catalog.ts 106      # каталог + русское название/дата
npx tsx scripts/enrich-show-breed-results.ts 106  # строки BreedView
npx tsx scripts/enrich-show-breed-titles.ts 106   # блок «Титулы»
```

**Полный скрап с нуля:** `npx tsx parsers/shows/scrape-show-results.ts show <id>`

Подробнее про группы FCI: [`SHOWS-RKF-BREED-GROUPS.md`](SHOWS-RKF-BREED-GROUPS.md).

### Скрипт скрапинга (legacy entry)

`backend/parsers/shows/scrape-show-results.ts`

```bash
# Скрапинг lista выставок
cd backend
npx tsx parsers/shows/scrape-show-results.ts index

# Скрапинг одной выставки
npx tsx parsers/shows/scrape-show-results.ts show <id>
```

### Проблемы скрапинга

lc.rkfshow.ru использует:
1. **Telerik Data Grid** - сложный компонент с AJAX
2. **API endpoint**: `/RKF/ExhibitionResults/ExhibitionResultListViewRefresh?exhibitionId=X`
3. **Возвращает**: HTML/JavaScript шаблоны, а не чистый JSON
4. **Требует**: выбор породы для загрузки результатов

### Альтернативные подходы

1. **Ручной ввод данных** - создать админ-интерфейс для ввода
2. **Другой источник данных** - найти другой источник выставочных данных
3. **Углубленный анализ Telerik** - разобраться в структуре AJAX ответов
4. **API РКФ** - проверить доступность официального API

## Build Pipeline

**Скрипт:** `backend/scripts/build-show-indexes.ts`

```bash
cd backend && npx tsx scripts/build-show-indexes.ts
```

**Что делает:**
- Строит индекс `data/v1/shows/indexes/dog-ranking.json` из всех выставок
- Строит индекс `data/v1/shows/indexes/judges.json` (судьи)
- Используется после добавления новых выставок

**Интеграция:** Интегрирован в `npm run build-all-data` — запускается автоматически при сборке.
