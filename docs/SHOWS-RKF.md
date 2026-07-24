# RKF Exhibition Data Scraping (LC rkfshow.ru)

> **Канон выставок для агента:** [`SHOWS.md`](SHOWS.md) (PDF RKF, CDN indexes, UI).  
> Этот файл — **детали LC-скрапа** (`lc.rkfshow.ru` / Playwright), не дублировать сюда PDF-пайплайн.

## Overview
RKF (Российская Кинологическая Федерация) exhibition data is available at https://lc.rkfshow.ru

## Current Pipeline (2026-07-12)

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

## Группы пород и судьи Specialty (каталог AJAX)

**Источник:** AJAX `ExhibitionResultListViewRefresh` (POST, перехват через Playwright при загрузке списка пород). BreedView — только построчные результаты; группы FCI и судья Specialty **не** на BreedView.

| Поле JSON | Наше поле |
|-----------|-----------|
| `GroupName` | `breed_group` (на RKF — `h2.titlelight`) |
| `Items[].Name` | `breed` |
| `Items[].Count` | `breed_count` |
| `Items[].LocalizationParameters` (ru-RU) `"BREED (Specialty) Judge"` | `breed_judge` |
| `Items[].DogBreedId` | `dog_breed_id` |

**Код:** `exhibition-catalog.ts`, `parse-breed-view.ts`, `scrape-show-results.ts`; обогащение — `enrich-show-exhibition.ts`.

```bash
cd backend && npx tsx scripts/enrich-show-exhibition.ts 106
```

**BreedView (ru-RU):** секции после `h2.titlelight` (Титулы / Кобели / Суки), протяжка класса, отдельно `grade` и `title`. Фикстура: `backend/fixtures/show-106-refresh-captured.json`.

## Data Structure

### Exhibition Index Page
- URL: `https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionsView`
- Lists all exhibitions with links to individual results
- Each link contains `exhibitionId` parameter

### Exhibition Results Page
- URL: `https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionResultListView?exhibitionId={id}`
- Uses Telerik Data Grid for displaying results
- Data is loaded via AJAX to `ExhibitionResultListViewRefresh` endpoint

### API Response Structure
The `ExhibitionResultListViewRefresh` endpoint returns JSON with grouped data:

```json
{
  "data": [
    {
      "GroupId": 1,
      "GroupWeight": 0,
      "GroupName": "Sheepdogs and Cattledogs (except Swiss Cattledogs)",
      "Items": [
        {
          "DogBreedId": 9,
          "Count": 12,
          "Name": "AUSTRALIAN CATTLE DOG",
          "LocalizationParameters": [
            {
              "Name": "АВСТРАЛИЙСКАЯ ОВЧАРКА (Specialty) Andrei Kisliakov",
              "Localization": "ru-RU"
            }
          ]
        }
      ]
    }
  ]
}
```

### Breed View Page
- URL: `https://lc.rkfshow.ru/RKF/ExhibitionResults/BreedView?exhibitionId={id}&dogBreedId={breedId}`
- Contains individual dog results for a specific breed
- Data rendered in div structure (not tables)

## Scraping History

### Attempt 1: HTML Table Scraping (FAILED)
- **Approach**: Parse HTML tables on BreedView pages
- **Result**: 0 results - tables are empty
- **Finding**: Data is rendered in div structure, not tables

### Attempt 2: Div Structure Scraping (SUCCESS)
- **Approach**: Parse div-based layout with classes `.col-2`, `.col-5`, `.col-1`, `.col-3`
- **Result**: Successfully extracted 661 results for exhibition 106
- **Performance**: ~30 minutes per exhibition (100+ breeds, sequential requests)
- **Data Structure**:
  - `.col-2`: Class (e.g., "5 Open class")
  - `.col-5`: Dog name with ID (e.g., "(4172) ZIRA")
  - `.col-1`: Placement (e.g., "1")
  - `.col-3`: Rating and title (e.g., "Очень хорошо (very good)", "CW, CAC")

### Attempt 3: Direct API Endpoint Search (FAILED)
- **Approach**: Intercept all network requests on BreedView pages
- **Result**: No AJAX endpoint found for breed results
- **Finding**: Only one AJAX call: `ExhibitionResultListViewRefresh` returns grouped breed counts, not individual results
- **Conclusion**: No direct API for all results - must scrape each breed page separately

### Attempt 4: Parallel Requests (SUCCESS)
- **Approach**: Use multiple browser contexts/pages for concurrent BreedView requests with batch processing
- **Implementation**: 
  - Process breeds in batches of 5 (PARALLEL_LIMIT)
  - Each breed gets its own page context
  - Promise.all for concurrent requests within batch
  - Pages closed after each request to free resources
- **Result**: 4262 results for exhibition 106 in ~5 minutes (vs 30 minutes sequential)
- **Performance**: ~6x speed improvement
- **Issues**: One timeout (Labrador Retriever), but processing continued successfully
- **Configuration**: PARALLEL_LIMIT = 5 (can be adjusted for rate limits)

### Attempt 5: Catalog + BreedView Pipeline (CURRENT)
- **Approach**: Extract breed catalog from AJAX, then scrape BreedView for each breed
- **Result**: Full data with FCI groups, breed judges, titles, and results
- **Performance**: ~5 minutes per exhibition with parallel requests
- **Data**: Russian breed names, FCI groups, specialty judges, class propagation, grade/title separation

## Data Fields

### Exhibition Metadata
- `id`: Exhibition ID
- `date`: Date of exhibition
- `title`: Exhibition name
- `location`: City/venue
- `rank`: Exhibition rank (CACIB, CAC, etc.)
- `type`: Type (International, National, etc.)
- `club`: Organizing club
- `judges`: List of judges
- `breed_catalog`: Array of breed catalog entries

### Breed Catalog Entry
- `dog_breed_id`: Breed ID from RKF
- `breed`: Russian breed name
- `breed_en`: English breed name
- `breed_group`: FCI group name (Russian)
- `breed_group_en`: FCI group name (English)
- `breed_judge`: Specialty judge for this breed
- `breed_count`: Number of dogs in this breed
- `group_id`: FCI group ID
- `titles`: Array of title winners (optional)

### Result Fields
- `breed`: Dog breed name (Russian)
- `breed_en`: English breed name
- `breed_group`: FCI group name
- `breed_judge`: Specialty judge
- `breed_count`: Number of dogs in breed
- `class`: Exhibition class (Junior, Intermediate, Open, etc.)
- `placement`: Placement/ranking
- `grade`: Evaluation grade (e.g., "Отлично")
- `title`: Title awarded (CAC, CACIB, etc.)
- `dog_name`: Dog's registered name
- `owner`: Owner's name
- `sex`: Dog sex (M/F)
- `ring_number`: Ring number
- `points`: Points (if applicable)

## Frontend Integration

### Data Storage
- **Location**: `data/v1/shows/`
- **Structure**:
  - `exhibitions/`: Individual exhibition JSON files
  - `indexes/`: Computed indexes (dog ranking, judges)
  - `source-index.json`: Exhibition ID to file path mapping
  - `calendar/{year}.json`: Calendar data by year

### Data Loading
- **Frontend functions** (`frontend/src/lib/staticData.ts`):
  - `getShowCalendar()`: Loads all exhibitions from index
  - `getShowExhibition(id)`: Loads specific exhibition details
  - `getShowDogRanking()`: Loads dog ranking with titles
  - `getShowJudges()`: Loads judges list

### Components
- **ShowCalendar**: Calendar view with exhibition list
  - Displays date, title, location, result count
  - Clickable rows link to exhibition details
  - Year filter support
  - External link to RKF source

- **ShowRanking**: Dog ranking with lazy loading
  - Uses `useInfiniteScroll` hook for performance
  - Toolbar with search and filters (year, breed)
  - Card-based layout (ShowDogCard component)
  - Displays: shows count, best award, titles (CAC, CACIB, BOB, BIS)
  - Sorted by rank_score (BIS → BOB → CACIB → CAC)

- **ShowJudges**: Judges list
  - Displays judge statistics and exhibitions

- **ShowExhibitionDetail**: Exhibition detail page
  - Route: `/shows/exhibition/:id`
  - Displays exhibition metadata, judges, and results
  - Results grouped by breed with placement, title, owner
  - External link to RKF source

### Index Generation
- **Script**: `backend/scripts/build-show-indexes.ts`
- **Run**: `cd backend && npx tsx scripts/build-show-indexes.ts`
- **Outputs**:
  - `data/v1/shows/indexes/dog-ranking.json`: All dogs with aggregated statistics
  - `data/v1/shows/indexes/judges.json`: Unique judges list

### Current Data Status
- **Exhibitions scraped**: ~90 (2025-2026)
- **Total results**: ~50,000+
- **Dogs in ranking**: 11,897
- **Years covered**: 2025-2026

### Performance
- **Scraping**: ~5 minutes per exhibition with parallel requests (6x improvement)
- **Frontend**: Lazy loading (30 items per page) for large datasets

## Mass Scraping

**Script:** `backend/scripts/scrape-all-shows.ts`

```bash
# Index only
cd backend && npx tsx scripts/scrape-all-shows.ts --index-only

# Skip existing
cd backend && npx tsx scripts/scrape-all-shows.ts --skip-existing

# Specific IDs
cd backend && npx tsx scripts/scrape-all-shows.ts --limit 2 --ids 105,108
```

Progress tracked in `data/v1/shows/scrape-progress.json`.

---

## Парсинг лог (2026-07-12)

**Парсинг завершён за ~2,5 часа.**

**Результат:**
- 89 из 90 выставок в очереди успешно спарсены и сохранены в data/v1/shows/exhibitions/
- 1 ошибка: id 37 («СОЧИ», 23.09.2018) — scrapeShowResults returned null (вероятно, пустая или недоступная страница на RKF)
- 105 и 106 пропущены (--skip-existing) — остались старые файлы

**Индексы пересобраны:**
- 88 уникальных выставок
- 174 487 собак в рейтинге
- 329 судей

**Повторить только 37:**
```bash
cd backend
npx tsx scripts/scrape-all-shows.ts --force --ids 37
```

**Проверить 105 и 106:**
```bash
cd backend
npx tsx scripts/enrich-show-exhibition.ts 105
npx tsx scripts/enrich-show-exhibition.ts 106
```
