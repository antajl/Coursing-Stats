# Выставки (Shows)

Раздел для отображения результатов выставок РКФ, рейтинга выставочных собак, судей и календаря выставок.

## Архитектура

### Источник данных

**lc.rkfshow.ru** (выставочный портал РКФ)
- URL: https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionsView
- Список выставок: ~100 выставок (2019-2026)
- Проблема: использует Telerik Data Grid с AJAX, возвращает HTML/JavaScript шаблоны

### Текущий статус (2026-07-23)

**Основной источник рейтинга 2026 — PDF «Итоговый отчет» с rkf.online** (не LC scrape):

| | 2026 |
|--|------|
| Каталог `calendar-rkf` | ~9723 выставки |
| С type1 PDF (`reports_link`) | ~4007 |
| Скачано / распарсено type1 | **3973** OK, ~162k строк собак |
| Судьи в `judges.json` | **730** (FIO; мусор вроде «ЛПП /» отфильтрован) |
| `dog-ranking-2026.json` | ~110k собак, **~24 MB lean** (без history; titles только ненулевые) |

**Парсер PDF** (`parse-rkf-certificate-pdf.ts`):
- Column-aware по X (порода / судья / каталог / кличка…) — wrapped Appendix №5 и Excel-отчёты
- Многострочная **ячейка породы** (ПУДЕЛЬ + МИНИАТЮРНЫЙ + окрасы) собирается блоками; soft-hyphen («ВОСТОЧНОЕВРОПЕЙСКА»+«Я ОВЧАРКА»); ALLCAPS+запятая = новый заголовок породы (не continuation)
- Перенос класса щенков «ЩЕ»+«Н» вокруг оценки (`ЩЕ ОП Н`) → `recoverWrappedPuppyClassAndGrade` / `disentangleClassAndGrade`; разорванная «Неявка» (`Нея вка`) → `normalizeSplitNeyavka` (UI + парсер)
- Остановка перед «ВЕДОМОСТЬ ГЛАВНОГО РИНГА» в type1 (`has_main_ring_sheet`)
- **Type3** (`bis_reports_link`): `parseMainRingPdf` → `main_ring[]` в JSON; place=1 → бейджи `BIS` / `BIG` / `BIS-Ю` / `BIS-Щ` / `BIS-Б` / `BIS-В` в `results.title`. Парсим type3 **только для 2025–2026**. Не путать BIS-Ю с ЛЮ породы и с ЮЧР (JCAC).
- UI DEV `/shows/exhibition/:id`: блок «Главный ринг» (вкладки BIS/возраст/BIG) над каталогом пород; клички → `/dog/{stableId}`; шапка — StatPill + одна мета-строка `клуб · ранг · тип`; оценки/неявки через `formatShowGradeDisplay`; награды — чипы с прокруткой при hover
- Тесты: `backend/tests/parse-rkf-certificate-pdf.test.ts`, `backend/tests/show-grades.test.ts` (фикстуры + PDF 100397, 100404, 94395, 100051, 89105, 100552, 90943)

**UI (рейтинг / судьи / главная):**
- «Сезон YYYY» **включён по умолчанию** (соревнования и выставки); снять кнопку — весь срез; бейджик года в ActiveFilters **не** дублирует дефолтный сезон
- На главной в колонке «Выставки» метрика — **причина места** (`BOB ×18 · VCAC ×27`), не голый `best_award`; данные в `indexes/home-top-{year}.json` (+ `titles`)
- Протокол `/shows/exhibition/:id` — **только DEV**

**Ещё не идеально / долги:**
- `dog-ranking-2026` ранее ~72 MB — **lean ~24 MB** (см. `dog-details/` для history)
- **Дубли одной клички с разными породами** (сбой колонки породы в PDF): при сборке индексов `linkShowDogsByUniqueName` + `collapseShowDogsByExactName` / `collapseShowDogsByNamePrefix` (`backend/lib/show-dog-dedupe.ts`). Найти оставшиеся: `npx tsx backend/scripts/shows/scan-show-dog-duplicates.ts --year=2026`
- **Неявка (НЯ):** не входит в рейтинг и историю профиля (`isShowAbsenceGrade`) — заявка без старта; дисквал по-прежнему учитывается
- Парсер PDF: wrap «…ИТАЛЬЯНСКАЯ»+«БОРЗАЯ (ЛЕВРЕТКА)» + порода↔каталог по Y; после правки — повторный `parse-rkf-reports` (PDF на диске)
- **Главный ринг / type3 (2025–2026):** `parseMainRingPdf` якорит колонки по заголовкам (`МЕСТО`/`ПОРОДА`/…) — layouts с place≈252 / ≈272 / ≈297; конкурсы режет Voronoi-полосами (заголовок часто на 1–2-й строке блока, не выше всех мест). После фикса (2026-07) нужна **batch-перепарсировка** type3, иначе в JSON останутся старые `main_ring=[]`. Ориентир до перепарса: ~851 пустых при ссылке (2025), ~274 (2026). Type1 с встроенной ведомостью без type3 — ещё не извлекаем. Type3 до 2024 — вне скоупа
- После правок парсера class/grade wrap — нужен **batch reparse** (или UI-слой `normalizeShowResults` уже чинит отображение старых JSON)
- LC scrape (~90 выставок) остаётся как legacy-источник рядом с PDF

**Другие годы (2019–2025):** пайплайн тот же (`--year=YYYY`), идти **с 2026 вниз**. На каждый год: download → parse → sync → `build-show-indexes`. Объём PDF см. таблицу ниже (~74k файлов суммарно). Полный 2025 ≫ частичный 2026 по объёму отчётов; lean ranking режется на шарды автоматически при > ~24 MB.

---

### Legacy: LC scrape (кратко)

**lc.rkfshow.ru** — ~90 выставок с полным HTML-протоколом (2019–2026). Playwright `locale: 'ru-RU'`. Не заменяет PDF-покрытие 2026.

### Связь с профилем соревнований (важно)

**RKF show `id` ≠ procoursing dog `id`.** Числовые совпадения случайны (пример: show id `24` = DREAM MEADOW'S SPELLBOUND, competition id `24` = АТРЕЙО СИЛЬВЕР СВИФТ).

**URL профиля:**
- `/dog/{id}` — единый канонический профиль.
  - Связь с procoursing → `id = competition_dog_id` (как раньше, напр. `/dog/5711`).
  - Только выставки → стабильный hash **≥ 1 000 000** (напр. `/dog/1004829173`), без породы в URL.
- Legacy `/shows/dog/{catalog}/{breed}` → редирект на `/dog/{id}`.
- История на проде → rkf.online / PDF (`history.url`, `reports_link`), не внутренний протокол.

Правила (см. `backend/lib/dog-identity-match.ts`, `show-dog-profile-id.ts`, сборка `build-show-indexes.ts`):

1. **Никогда** не сопоставлять по числовому id между системами (RKF catalog ≠ procoursing).
2. **Номер в каталоге выставки `(5538)` — не id собаки:** на разных выставках один номер бывает у разных псов. Агрегация рейтинга только по **полной кличке + породе**. Поле `catalog_id` — только для legacy URL.
3. Совпадение shows↔competitions только по **кличке** (части RU/EN через `/`) **и породе** (RU↔EN через `breed_catalog` / `breed-aliases.json`).
4. При неоднозначности — не линкуем.
5. После линка: `id` в индексе = `competition_dog_id` или `stableShowProfileId(name, breed)` (≥1e6).
**Поиск в `/shows?tab=ranking`:** по умолчанию **текущий сезон** (кнопка «Сезон YYYY» нажата); снять — все годы. При поиске по кличке грузятся все годы (фильтр сезона для поиска не режет выдачу).

---

### Структура данных

```
data/v1/shows/
├── exhibitions/{year}/{month}-{id}-{slug}.json
│   ├── schema: "coursing-stats/show-exhibition-v1"
│   ├── event: { id, date, title, location, rank, type, club, judges }
│   ├── results: [{ breed, class, placement, title, dog_name, owner, judge }]
│   └── raw_text: string
├── calendar/{year}.json
│   └── exhibitions: [{ id, date, title, location, has_results }]  # LC scraped (~90)
├── calendar-rkf/{year}.json + manifest.json
│   └── schema: coursing-stats/show-calendar-rkf-v1
│   └── exhibitions: [{ id, date, title, city, club, ranks,
│                       national_breed_club_name, breeds, url,
│                       has_report_link, reports_link, has_lc_protocol,
│                       lc_exhibition_id, lc_url }]
└── indexes/
    ├── dog-ranking-{year}.json
    ├── judges.json          # [{ name, total_judged, breeds[] }]
    └── breed-aliases.json
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
- `/shows?tab=calendar` — календарь (локально всегда; на проде — `ui-flags.json` → `publicCalendars.shows`, скрипты `scripts/show-calendar-shows.bat` / `hide-calendar-shows.bat`)
- `/shows/exhibition/:id` — протокол выставки (**только DEV**; на проде → `/shows`)
- `/shows?tab=champions` и `/shows/champions` → редирект на рейтинг (вкладка снята: дублировала рейтинг)

Gate календаря: `usePublicCalendarVisible` ← `data/v1/ui-flags.json` (+ всегда `isLocalDev`). Протоколы: `isLocalDev` only. Sitemap не включает calendar/exhibition URL.

**Временный календарь выставок на проде:** пока procoursing.ru недоступен, `publicCalendars.shows` может быть `true`. На `/shows?tab=calendar` под шапкой — закрываемая плашка `TemporaryShowsCalendarBanner` (dismiss → `localStorage` ключ `cs-dismiss-shows-calendar-temp-notice`).

**Прод vs локально (выставки):** на проде — рейтинг + профили из `indexes/`; история собаки → `rkf.online/exhibitions/{id}` и PDF (`reports_link`), не наш `/shows/exhibition/...`. Полные протоколы `/shows/exhibition/...` — **только DEV**. Календарь на проде — по флагу `ui-flags.json`. PDF и `exhibitions-rkf` в git/CDN **не** кладём (`data/local/`, gitignore).

### Объём PDF (по `calendar-rkf`, type1+type3)

Считается локально без API: `reports_link` + `bis_reports_link`. Ориентир на ~2026-07:

| Год | Выставок | PDF файлов |
|-----|----------|------------|
| 2019 | 3710 | ~2630 |
| 2020 | 6728 | ~8690 |
| 2021–2025 | ~8–9k/год | ~10.5–12.5k/год |
| 2026 | 9723 | ~5050 (год ещё идёт — меньше отчётов) |
| **Итого 2019–2026** | **~62k** | **~74.5k PDF** |

Пайплайн: `download-rkf-reports` → `parse-rkf-reports` → `sync-local-show-protocols` → `build-show-indexes`. Годы с 2026 вниз.
## Справочник на сайте

Пользовательская расшифровка титулов и сертификатов выставок — **не здесь**, а на странице справочника:

- **`/guide?tab=shows`** — иерархия CAC → BOB/BIS → чемпионские титулы, ранги выставок, приоритет наград, сокращения.
- Источники: Положение о сертификатных выставках РКФ (ред. 18.12.2024), Положение о титулах, FCI EXP-REG.

### Индекс рейтинга собак (CDN / лимит 25 MB)

**Проблема:** all-time `dog-ranking.json` (~60–70+ MB) превышает лимит Cloudflare Pages **25 MB** на файл.

| Файл | На CDN? | Описание |
|------|---------|----------|
| `indexes/dog-ranking-{year}.json` | да* | lean список **или** manifest `{ shards: [...] }`, если год > ~24 MB |
| `indexes/dog-ranking-{year}-a.json`… | да* | куски по месту в рейтинге (только толстые годы, напр. полный 2025) |
| `indexes/dog-details/{000–255}.json` | да | подробности + history; профиль грузит один шард по id |
| `indexes/show-dog-lookup.json` | да | competition id / кличка+порода → show id |
| `indexes/home-top-{year}.json` | да | топ-3 для главной (+ компактные `titles`) |
| `indexes/judges.json` | да | судьи выставок |
| `indexes/dog-ranking-unknown.json` | да* | lean, выставки без даты |
| `indexes/dog-ranking.json` | **нет** | all-time полный; только локально/сборка |
| `calendar/{year}.json` | да | лёгкий LC scraped список (~90) |
| `calendar-rkf/{year}.json` | да* | каталог rkf.online CategoryId=1 (~3–3.5 MB/год); UI только DEV |

- **UI:** `getShowDogRanking(year)` → lean файл или manifest+шарды `dog-ranking-{year}-a.json…` (склейка по порядку рейтинга); без года → склейка шардов годов; **по умолчанию — текущий сезон**
- Полный календарный год (2025 и т.п.) после PDF-парса почти наверняка больше частичного 2026: lean + **авто-нарезка** в `build-show-indexes`, если файл > ~24 MB (куски ~18 MB).
- **Календарь UI:** `getShowCalendar()` предпочитает `shows/calendar-rkf/{year}.json` (каталог rkf.online CategoryId=1); fallback — `shows/calendar/{year}.json` (LC scraped). Полный протокол — `exhibitions/*.json` (LC) или `exhibitions-rkf` (PDF) на `/shows/exhibition/:id` (**только DEV**)
- **Ингест rkf.online:** `npm run ingest-rkf-calendar` → `backend/scripts/shows/ingest-rkf-calendar.ts` (метаданные, без PDF). Lean-поля: `ranks`, `national_breed_club_name`, `breeds`, `reports_link` (PDF type 1 «Итоговый отчет»), `bis_reports_link` (PDF type 3 BIS). LC-подсветка: `reports_links` с `exhibitionId` на lc.rkfshow.ru|rkfshow.ru, id ∈ `source-index.json`
- **Сборка индексов:** `npx tsx backend/scripts/build-show-indexes.ts` — читает LC `exhibitions/` **и** локальные `data/local/shows/exhibitions-rkf/` → `indexes/dog-ranking-*.json`, `home-top-*.json`, `dog-details/`, `judges.json`. Переписывает `calendar/{year}.json`, **не** трогает `calendar-rkf/`. Хвост append sitemap может долго висеть — индексы к тому моменту уже записаны
- **`build-all-data` / CI:** пересобирает show-индексы **только если** есть `data/local/shows/exhibitions-rkf/` (gitignore). Иначе оставляет committed `data/v1/shows/indexes/*` и проверяет, что в `dog-ranking-2026` есть BIS (≥50). Без этого CI затирал рейтинг до ~LC-only (макс. ЛПП/BOB, без BIS/BIG).
- **Прод:** только рейтинг + профили из индексов. История собаки ведёт на `url` (rkf.online / LC) и при наличии на `reports_link` (PDF). Полные протоколы и PDF **не** на CDN.
- **Логика:** `backend/lib/show-award-ranking.ts` — полный реестр токенов протокола (BIS…СС), веса `rank_score`, алиасы ЛПП/ЛППП → BOB/BOS; `formatShowRankingReason` / `compactShowTitles` для главной
- В UI протокола: блок титулов породы разделён (код / № / кличка / **судья**); награды в таблице — чипы по категориям; Specialty-список судей в шапке скрыт
- Рейтинг собак: **одна колонка на всю ширину**; `#место` внутри карточки (справа сверху) — место в полном рейтинге среза по порядку сортировки (не `id` кольца: он не уникален у RKF); бейджи с разделителями категорий (`awardChipRender`)
- **Тест:** `backend/tests/show-award-ranking.test.ts`, `backend/tests/parse-rkf-certificate-pdf.test.ts`

### Локальные PDF-протоколы (не в git / не на CDN)

| Путь | Назначение |
|------|------------|
| `data/local/rkf-reports/{year}/{id}-type{1\|3}.pdf` | Кэш PDF (gitignore) |
| `data/local/shows/exhibitions-rkf/{year}/{id}.json` | Распарсенные lean-протоколы |
| `data/local/shows/exhibitions-rkf/index.json` | id → относительный путь |
| `frontend/public/data/v1/shows/exhibitions-rkf/` | DEV-копия (`npm run sync-local-show-protocols`) |

Пайплайн по годам (с 2026 вниз):

```bash
npm run ingest-rkf-calendar
npm run download-rkf-reports -- --year=2026
npm run parse-rkf-reports -- --year=2026
npm run sync-local-show-protocols
npx tsx backend/scripts/build-show-indexes.ts
# затем при необходимости build-all-data; в git — только indexes + calendar-rkf
```

Инкремент: повторный `download-rkf-reports` пропускает файлы с тем же размером/sha256 в `download-manifest.json`.

Парсер: `backend/parsers/shows/parse-rkf-certificate-pdf.ts` — column-aware итоговый отчёт; блоки пород; stop before главный ринг; `isPlausibleJudgeName` / `isBreedFragment` для индексов. Type3 BIS — best-effort отдельно.

Краткий указатель в дереве данных: [`03-DATA.md`](03-DATA.md) → «Выставки».

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
4. **API РКФ** — публичный каталог: `GET https://rkf.online/api/Exhibitions/exhibition/public?CategoryId=1&DateFrom=&DateTo=&sortType=4&StartElement=&ElementCount=` (до 1000/страница)

### Календарь rkf.online (метаданные)

```bash
npm run ingest-rkf-calendar
# опционально:
npx tsx backend/scripts/shows/ingest-rkf-calendar.ts --from=2025-01-01 --to=2025-12-31
```

Пишет `data/v1/shows/calendar-rkf/{year}.json` + `manifest.json`. Пагинация по **годовым окнам** (API отдаёт HTTP 500 при `StartElement ≥ 10000`). UI календаря (только `isLocalDev`) подсвечивает строки с `has_lc_protocol` (warm-blue), ссылка на rkf.online **`/exhibitions/{id}`** (мн. число; `/exhibition/{id}` — client 404); при наличии LC — вторичная ссылка на протокол / локальный `/shows/exhibition/:lcId`.

**Группировка mono в UI** (`ShowCalendar.tsx` + `showCalendarGroup.ts`): варианты с одним `date+title+ranks+city+club` и разными НКП схлопываются в одну строку (аккордеон); счётчик месяца считает **группы**, не сырые карточки. «КЧК» и «КЧК в каждом классе» не сливаются (ranks в ключе).

## Build Pipeline

**Скрипт:** `backend/scripts/build-show-indexes.ts`

```bash
cd backend && npx tsx scripts/build-show-indexes.ts
```

**Что делает:**
- Строит lean `dog-ranking-{year}.json`; если lean > ~24 MB — manifest + куски `dog-ranking-{year}-a.json…` (фронт склеивает). Подробности — `dog-details/`. All-time `dog-ranking.json` локально, не на CDN.
- Строит `judges.json`, `breed-aliases.json`
- **Post-processing пород** (`backend/lib/show-breed-judge-clean.ts`): при пустом `breed_judge` отрезает судью, вклеенного в `breed` (напр. «БЕЛАЯ ШВЕЙЦАРСКАЯ ОВЧАРКА Горан ГЛАДИЧ») — по списку судей выставок + повторяющимся person-like хвостам; recovered judge → `breed_judge`. Сырые `exhibitions/*.json` **не** переписываются; идеальный фикс — в HTML-парсере. После чистки polluted breed+judge в индексах → 0
- Используется после добавления новых выставок

**Тест чистки:** `backend/tests/show-breed-judge-clean.test.ts`

**Отображение пород в UI:** sentence case / `displayBreed` (чип `primary`; полное имя в tooltip) / «тип не указан» для выжлы и НО без маркера шерсти — [`03-DATA.md`](03-DATA.md) → «Канон и отображение». Guide: `/guide?tab=shows`.

**Интеграция:** часть `npm run build-all-data`.
