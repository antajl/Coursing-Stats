# Development — Разработка

## Страница "Рекорды Донино"

### Обзор
Страница отображает личные рекорды скорости собак из Google Sheets с расширенными возможностями фильтрации, сортировки и статистики.

### Техническая реализация

**Фронтенд:**
- `frontend/src/pages/SpeedRecords.jsx` — основная страница с таблицей
- `frontend/src/pages/SpeedRecordsStats.jsx` — страница статистики
- `frontend/src/services/api.js` — API сервис для получения данных

**Бэкенд:**
- `backend/scripts/fetch-speed-records.mjs` — скрипт загрузки данных из Google Sheets
- API endpoint: `GET /api/speed-records`

**База данных:**
- Таблица `speed_records` в D1
- Поля: breed, sex, name, speed_km_h, date, screenshot_url, history, status, updated_at

### Функционал

**Вкладка "Таблица":**
- Фильтрация по году, породе и полу (dropdown menus)
- Поиск по кличке, породе, полу (с алиасами), скорости и дате
- Сортировка по всем колонкам с правильными стрелками
- Статусы: "new" (новый результат), "upd" (улучшение рекорда)
- История предыдущих результатов при наведении на кличку
- Экспорт в Excel (.xlsx) с библиотекой xlsx
- Скачивание скриншотов карточек с html-to-image

**Вкладка "Статистика":**
- Фильтры по году, породе, полу и диапазону скорости
- Общая статистика: количество записей, средняя/лучшая/минимальная скорость
- Интерактивная статистика по породам: клик показывает клички
- Интерактивная статистика по полу: клик показывает клички
- Интерактивная статистика по годам: клик на количество показывает клички
- Все данные пересчитываются динамически при применении фильтров

### Автоматическое обновление

**GitHub Actions:**
- Скрипт `backend/scripts/fetch-speed-records.mjs` запускается ежедневно
- Читает CSV из Google Sheets
- Обновляет таблицу `speed_records` в D1
- Определяет статусы "new" и "improved" на основе истории

### Алиасы для поиска по полу

Для удобства поиска реализованы алиасы:
- "сука", "сук", "самка", "самки" → 'С'
- "кабель", "кобель", "каб", "самец", "самцы" → 'К'

### Разработка и тестирование

```bash
# Локальная разработка
cd frontend
npm run dev

# Тестирование загрузки данных
cd backend
node scripts/fetch-speed-records.mjs
```

### Источник данных

Google Sheets: https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/edit?gid=1787526009#gid=1787526009

CSV экспорт: https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/export?format=csv&gid=1787526009 и данные

## File Structure

### Корневые файлы
- `README.md` — Основная спецификация проекта
- `package.json` — Зависимости Node.js
- `wrangler.toml` — Конфигурация Cloudflare Worker
- `start-local.bat` — Скрипт запуска серверов

### Backend
- `src/worker.js` — Тонкий диспетчер запросов (~60 строк), делегирует в src/routes/
- `src/routes/` — Модули обработки API маршрутов
  - `events.js` — Обработка /api/events endpoints
  - `dogs.js` — Обработка /api/dogs и /api/breeds endpoints
  - `top.js` — Обработка /api/top и /api/years endpoints
  - `admin.js` — Обработка admin endpoints
- `schema.sql` — Схема БД D1
- `parsers/` — Парсеры результатов событий
  - `parse-results-coursing.mjs` — Парсер результатов курсинга
  - `parse-results-bzmp.mjs` — Парсер результатов БЗМП
  - `parse-results-racing.mjs` — Парсер результатов бега
- `lib/` — Общие модули
  - `fetch-win1251.mjs` — Загрузка страниц с декодированием windows-1251
  - `dog-lookup.mjs` — Нормализация и поиск собак
- `scripts/` — Скрипты загрузки данных
  - `scrape-year-index.mjs` — Скрапер индекса событий по годам
  - `load-events.mjs` — Загрузка событий в D1
  - `load-results.mjs` — Загрузка результатов в D1
  - `sync-local-to-remote.mjs` — Синк локальной D1 → remote
  - `ci-update-db.mjs` — Пайплайн для GitHub Actions
  - `migrate-normalize-dog-names.mjs` — Миграция кличек
  - `merge-dogs.mjs` — Слияние дубликатов
  - `test-parser.mjs` — Тест парсера
  - `backfill-*.mjs` — Скрипты бэкафилла по годам
  - `fetch-speed-records.mjs` — Загрузка рекордов скорости из Google Sheets

### Frontend
- `src/` — React приложение
- `src/constants.js` — Константы приложения (цвета дисциплин, статусы)
- `src/components/` — React компоненты
  - `DogStatsTable.jsx` — Таблица статистики собак
  - `DogTooltip.jsx` — Tooltip с информацией о собаке
  - `DogSilhouettes.jsx` — SVG силуэты пород
- `src/pages/` — Страницы приложения
  - `DogProfile.jsx` — Профиль собаки
  - `Events.jsx` — Календарь событий
  - `EventResults.jsx` — Результаты события
  - `TopDogs.jsx` — Рейтинги собак
- `src/services/` — API сервисы
  - `api.js` — API клиент
- `src/data/` — Данные для разработки
  - `mockData.js` — Мок данные

### Data
- `migrate-remote-schema.sql` — Миграция схемы remote D1
- `migrate-normalize-dogs.sql` — SQL нормализации кличек
- `sync-*.sql` — Экспорт для remote
- `load-*.sql` — SQL загрузки
- `events-*.json` — Индексы событий

## Data Import

### Current Data State (Updated 2026-06-25)
- **Local D1 = Remote D1** (синхронизировано)
- **2023–2026:** 4639 results на production
- **2015–2022:** NOT IMPORTABLE (images, OCR required)

### Sync Local → Remote
```bash
# Генерация SQL
node backend/scripts/sync-local-to-remote.mjs

# Применить на remote
npm run sync-to-remote
```

### Auto-update (GitHub Actions)
- Workflow: `.github/workflows/update-db.yml`
- Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- Ручной запуск: Actions → Update D1 Database → Run workflow
- Локально: `npm run ci-update-db`

### Import Process

#### For Specific Years (2023-2026)
```bash
# For 2023 year
node scripts/backfill-2023.mjs
node scripts/load-events.mjs events-2023.json
npx wrangler d1 execute pc-db --local --file=./load-events.sql
node scripts/load-results.mjs events-2023.json
npx wrangler d1 execute pc-db --local --file=./load-results.sql
```

#### For Historical Data (2015-2022)
```bash
# DO NOT USE - Data stored as images, requires OCR
# node scripts/backfill-historical.mjs
```

### HTML Format Variations by Year
- **2015-2022:** Results stored as images (JPG) - NOT parseable without OCR
- **2023-2024:** Simplified HTML tables (23 cells), catalog numbers as plain text
- **2025-2026:** Detailed HTML tables (25 cells), catalog numbers in `<i>` tags

### Parser Adaptation Strategy
1. **Cell count detection:** Checks if table has 25 cells (2025-2026) or 23 cells (2023-2024)
2. **Catalog number extraction:** Handles both `<i>` tags and plain text numbers
3. **Score row filtering:** Filters out rows where name/breed are just numbers (summary rows)
4. **Simplified format handling:** For 2023-2024, extracts only total_score without detailed heat scores

### Date Filtering
Both `backfill-2026.mjs` and `load-events.mjs` filter events by date:
- Only events with `date_start <= current_date` are imported
- Prevents importing future/planned events

### Deduplication
The database uses `ON CONFLICT(results_url) DO UPDATE` to prevent duplicates:
- Events are uniquely identified by `results_url`
- Duplicate events update existing records instead of creating new ones

## Data Update Strategy

**Гибридная стратегия:**
- **Исторические годы (2015-2025):** Полный бэкафилл один раз, без обновлений
- **Текущий год (2026):** Инкрементальные обновления через GitHub Actions

### Преимущества
1. **Эффективность:** Исторические данные не меняются, нет смысла их перепроверять
2. **Актуальность:** Текущий год всегда содержит свежие данные
3. **Производительность:** Минимум запросов к сайту-источнику
4. **Простота:** Разные стратегии для разных типов данных

### Скрипт бэкафилла исторических годов
```bash
node scripts/backfill-historical.mjs
node scripts/load-events.mjs events-historical.json
npx wrangler d1 execute pc-db --local --file=./load-events.sql
```

### Скрипт инкрементального обновления текущего года
```bash
node scripts/update-current-year.mjs
node scripts/load-events.mjs events-current.json
node scripts/load-results.mjs
npx wrangler d1 execute pc-db --local --file=./load-events.sql
```

### GitHub Actions (реализовано)
- Workflow: `.github/workflows/update-db.yml`
- Скрипт: `backend/scripts/ci-update-db.mjs`
- Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- Расписание: понедельник 03:00 UTC + `workflow_dispatch`

## Coursing Results Parsing

### Source Data
- **URL:** http://procoursing.ru/2026/[date]_Complete_Results_Coursing.html
- **Кодировка:** Windows-1251 (используется fetchWin1251 для корректного декодирования)

### HTML Structure

#### Заголовок страницы
```html
<title>Чемпионат РКФ-CACL по курсингу борзых, 04.04.2026 (Ярославская область, Большесельский район): Полные результаты состязания</title>
```

**Извлекаемые данные:**
- `full_title`: часть до запятой с датой
- `event_date`: дата в формате DD.MM.YYYY
- `protocol_location`: локация в скобках

#### Таблица результатов

**Заголовки групп пород:**
```html
<tr><td colspan=25 bgcolor="#c0c0c0"><b>Порода - Класс - Пол</b></td></tr>
```

**Строки собак (формат с двумя строками на собаку):**
- Ячейка 0: место
- Ячейка 1: каталожный номер (в `<i>`)
- Ячейка 2: порода
- Ячейка 3: класс
- Ячейка 4: пол
- Ячейка 5: кличка (с `<br>` между рус/лат)
- Ячейка 6: номер забега 1 (с цветом фона)
- Ячейки 7-11: судья 1, забег 1 (5 категорий оценок)
- Ячейка 12: сумма судьи 1, забег 1
- Ячейка 13: сумма 1 (rowspan=2)
- Ячейка 14: номер забега 2 (с цветом фона)
- Ячейки 15-19: судья 1, забег 2 (5 категорий оценок)
- Ячейка 20: сумма судьи 1, забег 2
- Ячейка 21: сумма 2 (rowspan=2)
- Ячейка 22: общая сумма (rowspan=2)
- Ячейка 23: ВС
- Ячейка 24: титул

**Категории оценок:**
1. Маневренность
2. Резвость
3. Выносливость
4. Преследование
5. Энтузиазм

**Цвета попон (bib colors):**
- `red` или `#FF0000`: красный
- `white` или `#FFFFFF`: белый
- `blue` или `#0000FF`: синий
- другие: серый

**Статусы собак:**
- `finished`: финишировал
- `disqualified`: дисквалифицирован (отстранение)
- `dns`: неявка
- `withdrawn`: снят
- `dnf`: не финишировал

### Data Structure

```javascript
{
  results: [
    {
      breed_class: "Порода - Класс - Пол",
      placement: 1,
      catalog_no: 12345,
      breed: "САЛЮКИ",
      class: "Стандартная",
      sex: "Сука",
      name: "СОБАКА / DOG",
      total_score: 95.5,
      judge_count: 2,
      qualification: "CACL, RegCACL",
      vc: "+",
      status: "finished",
      raw_scores_json: JSON.stringify({
        heats: [
          {
            heat_number: 1,
            bib_number: 30,
            bib_color: "red",
            judges: [...],
            total: 185
          },
          {
            heat_number: 2,
            bib_number: 50,
            bib_color: "blue",
            judges: [...],
            total: 188
          }
        ],
        grand_total: 373
      }),
      raw_text: "<html>..."
    }
  ],
  full_title: "Чемпионат РКФ-CACL по курсингу борзых",
  event_date: "04.04.2026",
  protocol_location: "Ярославская область, Большесельский район",
  judges: "Главный судья - Лукина Д.М., судья - Гродинская Т.Л.",
  track_schemes: [...]
}
```

### Key Parser Functions

- `extractBibColor($cell)` — Извлекает цвет попоны из атрибутов bgcolor или style
- `extractItalicNumber($el)` — Извлекает число из тега `<i>` (для каталожных номеров)
- `extractBoldNumber($el)` — Извлекает число из тега `<b>` (для сумм)
- `normalizeDogName(name)` — Нормализует имя собаки: uppercase, удаление спецсимволов, замена Ё на Е
- `normalizeBreed(breed)` — Нормализует породу: uppercase, удаление спецсимволов, замена Ё на Е
- `detectStatusFromText(text, hasScore)` — Определяет статус собаки на основе текста

## Racing и BZMP Structure

### Racing (Бега)

**Особенности формата:**
- Метрики: Время и скорость (не судейские оценки как в курсинге)
- Забеги: До 3 забегов на собаку
- Дистанция: Указывается в метрах (например, 360 м)
- Попоны: Цвета попон (но часто не указаны, "-")

**Структура таблицы (18 колонок):**
1. Место
2. № каталожный (italic)
3. Порода
4. Класс
5. Пол
6. Кличка
7. Дистанция (м)
8. Забег 1 (номер)
9. Попона 1
10. Время 1 / Скорость (формат: "21.88 с<br>16.45 м/с<br>59.232 км/ч")
11. Забег 2 (номер)
12. Попона 2
13. Время 2 / Скорость
14. Забег 3 (номер)
15. Попона 3
16. Время 3 / Скорость
17. ВС (+ или пусто)
18. Титул(ы)

**Особенности:**
- Нет rowspan=2 — каждая строка самодостаточна
- Лучшее время может быть выделено цветом (bgcolor=#ffd700)
- Формат времени: "21.88 с<br>16.45 м/с<br>59.232 км/ч"

### BZMP (БЗМП - Беги за механической приманкой)

**Особенности формата:**
- Метрики: Судейские оценки (как в курсинге)
- Забеги: 2 забега
- Статусы: "Отстранение (Сход с трассы)" и другие

**Структура таблицы (25 колонок, как в курсинге):**
1. Место (rowspan=2)
2. № (rowspan=2, italic)
3. Порода (rowspan=2)
4. Класс (rowspan=2)
5. Пол (rowspan=2)
6. Кличка (rowspan=2)
7. Забег 1 VC (rowspan=2, italic)
8-13. Судьи забега 1 (Ман, Резв, Вын, Прес, Энт, Сум)
14. Сумма 1 (rowspan=2, bold)
15. Забег 2 VC (rowspan=2, italic)
16-21. Судьи забега 2 (Ман, Резв, Вын, Прес, Энт, Сум)
22. Сумма 2 (rowspan=2, bold)
23. Общая сумма (rowspan=2, bold)
24. ВС (rowspan=2)
25. Титул (rowspan=2)

**Особенности:**
- rowspan=2 как в курсинге
- Статус "Отстранение (Сход с трассы)" с colspan=6 вместо судейских оценок
- bgcolor=#ff0000 для VC при отстранении

### Сравнение форматов

| Характеристика | Coursing | BZMP | Racing |
|---------------|----------|------|--------|
| Колонок | 25 | 25 | 18 |
| rowspan | Да (2) | Да (2) | Нет |
| Метрики | Судейские оценки | Судейские оценки | Время/скорость |
| Забеги | 2 | 2 | До 3 |
| Дистанция | Нет | Нет | Да |
| Попоны | Нет | Нет | Да |

## Coursing Scoring System

### Normalization
- `total_score` рассчитывается как среднее от баллов всех судей
- Учитываются оба забега (heat1 + heat2)
- При статусе во втором забеге учитывается только первый

### Status Handling
- Функция `detectStatusFromText` в `parse-results-coursing.mjs`
- Маркеры: неявка, дисквалификац, снят, сошел, отстран, ветеринар
- raw_text сохраняется всегда для отладки

## Coursing Titles Hierarchy

### Иерархия титулов и сертификатов

**Высший уровень (Золотой акцент):**
- Чемпион РКФ по рабочим качествам собак — национальный чемпион
- International Race Champion (C.I.C.) — интернациональный чемпион по бегам/курсингу
- International Beauty & Performance Champion — интернациональный чемпион по красоте и курсингу

**Средний уровень (Old-money акцент):**
- CACL — кандидат в национальные чемпионы по бегам/курсингу
- Присваивается на национальных сертификатных состязаниях

**Региональный уровень (Серый акцент):**
- RegCACL — региональный CACL
- Присваивается на региональных состязаниях

**Базовый уровень (Нейтральный):**
- Прочие рабочие сертификаты
- Сертификаты участия

### Visual Display in UI

В компоненте EventResults.jsx бейджи титулов отображаются с разным стилем в зависимости от уровня:
- isChampion: `bg-gold-100 text-gold-700 border border-gold-400` (Золотой)
- isCACL: `bg-old-money-100 text-old-money-700 border border-old-money-300` (Old-money)
- isReg: `bg-gray-100 text-gray-600 border border-gray-300` (Серый)
- default: `bg-gray-50 text-gray-500 border border-gray-200` (Нейтральный)

## NPM Scripts

| Команда | Назначение |
|---------|------------|
| `npm run scrape-index` | Скрапинг индекса событий |
| `npm run load-events` | Загрузка событий в D1 |
| `npm run load-results` | Загрузка результатов в D1 |
| `npm run ci-update-db` | Инкремент текущего года → remote D1 |
| `npm run sync-to-remote` | Полный синк локальной D1 → remote |
| `npm run migrate-dog-names` | Нормализация кличек в локальной D1 |

## Local Development

### Запуск серверов
```bash
# Backend (Worker)
cd backend
npx wrangler dev
# Запускается на http://127.0.0.1:8787

# Frontend (Vite)
cd frontend  
npm run dev
# Запускается на http://localhost:5173
```

**ВАЖНО:** Серверы МОЖНО запускать командами. Это разрешено и рекомендуется для разработки.

### Testing Parser
```bash
node scripts/test-parser.mjs
```

### Parser CLI Mode
```bash
node parse-results-coursing.mjs <url>
node parse-results-bzmp.mjs <url>
node parse-results-racing.mjs <url>
```

## Speed Records (Рекорды Донино)

### Google Sheets

**Spreadsheet ID:** `1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE`

**Листы документа:**
- **2026** (gid=1787526009) — есть цвета ✓
- **2025** (gid=0) — есть цвета ✓
- **2025 по породам** (gid=1620065603) — без цветов
- **Абсолютный зачёт** (gid=1812358334) — без цветов
- **старые личные рекорды** (gid=1775097609) — есть цвета ✓

**PDF экспорт URL (пример для 2026):**
```
https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/export?format=pdf&gid=1787526009
```

**Рабочее решение:**
PDF экспорт с парсингом через PyMuPDF. Google рендерит условное форматирование в PDF, а PyMuPDF извлекает цвета и текст по координатам.

**Статусы определяются по цвету:**
- `#B6D7A8` (зелёный) → status = 'new'
- `#9FC5E8` (синий) → status = 'improved'
- Чёрный/без цвета → status = 'normal'

**Структура данных:**
- Порода, Пол, Кличка, Лучшая скорость (км/ч), Дата, Скриншот

**Логика сопоставления:**
- Сопоставление по кличке и породе собаки
- Если есть несколько результатов с разной датой — отображать новую дату, при наведении показывать старую дату и результат скорости
- Если есть две одинаковые собаки с одинаковой породой, скоростью и датой — писать только один результат

**Скрипт загрузки (Python):**
```bash
# Генерация SQL
python backend/scripts/fetch-speed-records-pdf.py

# Загрузка в remote D1 (через GitHub Actions)
```

**Зависимости:**
```bash
pip install pymupdf requests
```

**GitHub Actions:**
- Workflow: `.github/workflows/update-speed-records.yml`
- Расписание: ежедневно в 04:00 UTC
- Ручной запуск: Actions → Update Speed Records → Run workflow
