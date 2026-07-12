# Выставки (Shows)

Раздел для отображения результатов выставок РКФ, рейтинга выставочных собак, судей и календаря выставок.

## Архитектура

### Источник данных

**lc.rkfshow.ru** (выставочный портал РКФ)
- URL: https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionsView
- Список выставок: ~100 выставок (2019-2026)
- Проблема: использует Telerik Data Grid с AJAX, возвращает HTML/JavaScript шаблоны

### Текущий статус

**Скрапинг lc.rkfshow.ru сложен из-за:**
1. Использует Telerik Data Grid с AJAX загрузкой
2. API возвращает HTML/JavaScript шаблоны, а не чистый JSON
3. Требует выбора породы для просмотра результатов
4. Динамический контент с сложной структурой

**Реализовано:**
- Скрипт скрапинга `backend/parsers/shows/scrape-show-results.ts`
- Frontend компоненты (ShowRanking, ShowJudges, ShowCalendar)
- Структура данных в `data/v1/shows/`
- Документация

**Требуется:**
- Дополнительная настройка скрапера для работы с Telerik Data Grid
- Анализ структуры AJAX ответов
- Возможная альтернатива: ручной ввод данных или другой источник

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

- **Файл:** `data/v1/shows/indexes/dog-ranking.json`
- **Сборка:** `cd backend && npx tsx scripts/build-show-indexes.ts`
- **Логика:** `backend/lib/show-award-ranking.ts` — веса BIS (10k) → BOB (2k) → CACIB (500) → CAC (100), `best_award`, исправленный парсинг CAC/CACIB
- **UI:** `ShowDogCard.tsx` — номер места, крупные бейджи наград, подпись «лучшая: BOB»
- **Тест:** `backend/tests/show-award-ranking.test.ts`

Канон весов и иерархии: [`10-GUIDE.md`](10-GUIDE.md).

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
