# History — История изменений и решений

История важных архитектурных решений и изменений проекта Coursing Stats.

---

## 2026-07-10 — Вариант A: публичный сайт без календаря и протоколов (договорённость с procoursing.ru)

### Контекст
Переписка с владельцем procoursing.ru (Андрей): убрать публичное дублирование первичных протоколов, оставить агрегаты (рейтинг, судьи, профили собак), указать источник данных, разрешить встраивание coursing-stats.ru в iframe на procoursing.ru.

### Решение (вариант A)
| Область | Прод (coursing-stats.ru) | Локально (`npm run dev`) |
|---------|--------------------------|---------------------------|
| Раздел «Статистика» (`/competitions`) | Только **Рейтинг** и **Судьи** | То же |
| Календарь | **Убран** с публичного UI | `/admin/calendar` |
| Протоколы `/event/:id` | **Редирект** → `/competitions?tab=ranking` | `/admin/event/:id` |
| Ссылки на протоколы в профилях | **procoursing.ru** (`results_url`) | `/admin/event/:id` |
| Данные `data/v1/` | Без изменений — рейтинг/судьи строятся из `competitions/*.json` → CI `indexes/` | То же |

Рейтинг и судьи **не зависят** от публичных страниц календаря/протоколов — только от файлов данных и индексов.

### Изменения во фронтенде
- **Навигация:** «Соревнования» → **«Статистика»** (`Nav.tsx`)
- **`Competitions.tsx`:** вкладка «Календарь» удалена; default `tab=ranking`; legacy `?tab=calendar` открывает рейтинг
- **`AppRoutes.tsx`:** `/event/:id` → redirect; dev-only `/admin/calendar`, `/admin/event/:id` (`import.meta.env.DEV`)
- **`AdminCalendar.tsx`**, ссылка в админке на календарь (локально)
- **`ProcoursingEventLink`**, **`procoursingLinks.ts`** — ссылки на протоколы: prod → procoursing.ru, dev → admin
- **`HomeEventRow`**, **`Hero`**, **`StatsStrip`**, **`Home`** — без внутренних ссылок на календарь/протоколы
- **`ProcoursingAttribution`** — «Расчёты на основе данных procoursing.ru» на страницах расчётов (рейтинг, судьи, профили собак, главная)
- **`frontend/public/_headers`:** `Content-Security-Policy: frame-ancestors` для встраивания с procoursing.ru / www.procoursing.ru
- **E2E:** `competitions.spec.ts`, `event-results.spec.ts` обновлены под новые маршруты

### Изменения в данных / SEO
- **`build-derived-indexes.ts`**, **`sitemap.ts`:** URL `/event/*` **исключены** из sitemap (после следующего `build-all-data`)

### Админка
- **`EventEdit.tsx`:** ссылки проверки → `/admin/calendar`, `/admin/event/:id`

### Не сделано (отдельные задачи)
- Скрипт **аудита турниров** (`audit-events`) — локальная проверка `calendar/*.json` и `competitions/*.json` на `result_count: 0`, много `total_score: null` и т.п. (идея из обсуждения, скрипта пока нет)

### Урок
После снятия публичных протоколов контроль качества данных — через **локальный** календарь (`/admin/calendar`), админку (`/admin/events/:id`, «Проверить с оригиналом») и будущий audit-скрипт; по одному рейтингу сломанный турнир не виден.

---

## 2026-07-09 — Реорганизация документации (AI-focused)

### Изменения
- **Структура:** плоская структура docs/ (15 основных файлов в корне, без подпапок)
- **Цифровые префиксы:** файлы переименованы с цифровыми префиксами для порядка чтения (01-15)
- **Консолидация файлов:**
  - `CONTRIBUTING.md` → объединён в `01-GETTING-STARTED.md`
  - `REPOSITORY-STRUCTURE.md` → объединён в `02-ARCHITECTURE.md`
  - `DATA-ARCHIVE.md` → объединён в `03-DATA.md`
  - `SCRIPTS.md` → объединён в `04-DEVELOPMENT.md`
  - `RANK-DISCIPLINE-CODES.md` → объединён в `14-PARSING-RULES.md`
- **Новые файлы для ИИ:**
  - `12-DATABASE-SCHEMA.md` — схема D1 (из DATABASE.md)
  - `13-DATABASE-WORKFLOW.md` — workflow D1 (из DATABASE.md)
  - `14-PARSING-RULES.md` — правила парсинга (из PARSING.md)
  - `15-PARSING-IMPLEMENTATION.md` — детали парсеров (из PARSING.md)
  - `16-TROUBLESHOOTING.md` — решение проблем
  - `17-ADMIN-WORKFLOW.md` — работа с админкой
  - `18-CODE-PATTERNS.md` — паттерны кода
- **Объединение:** `DECISIONS-LOG.md` + `CHANGELOG.md` → `HISTORY.md`
- **Перемещены в `docs/archive/`:** `MIGRATION-TO-STATIC-DATA.md`, `FUTURE-PLANS-COMPLETED.md` (исторические документы)
- **Архив:** файлы в `archive/` переименованы с цифровыми префиксами (01-02)
- **Обновлены ссылки:** во всех документах обновлены пути на новые названия файлов
- **Исправления документации:**
  - `03-DATA.md` — обновлены счётчики данных на актуальные значения
  - `04-DEVELOPMENT.md` — добавлено описание исправления `package-pages-snapshot.ts` (рекурсивное копирование)

---

## 2026-07-09 — Пустые индексы на проде (CI затирал `indexes/`)

### Симптом
Локально рейтинг, судьи и данные в `data/v1/indexes/` полные; на **coursing-stats.ru** — пустые списки. CDN отдавал `200` и JSON вида `"count": 0`, `"judges": []`.

### Причина
`npm run build-all-data` в CI:
1. `build-data-snapshot` → `loadLocalDataSqlite()` собирал sqlite из JSON
2. В `load-sqlite.ts` функция `loadCompetitions()` **не загружала** `results[]` из `competitions/*.json` (временный skip)
3. `build-derived-indexes` строил топы/судей из пустой таблицы `results`
4. `package-pages-snapshot` деплоил пустые `indexes/` поверх хороших файлов из git

Локальный dev не страдал: Vite читает `data/v1/` с диска, часто с уже собранными индексами.

### Решение
- **`load-sqlite.ts`:** загрузка `results` из `competitions/`; `event_id` из файла; `dog` из вложенного объекта; `PRAGMA foreign_keys = OFF` при сборке snapshot
- **`build-all-data.ts`:** fatal, если `top-placement-all` или `judges-summary` пустые после пересборки
- **CI:** `vitest run backend/tests/static-indexes.test.ts` после `build-all-data`
- **Документация:** `docs/03-DATA.md` → «Диагностика: локально есть данные, на проде пусто»

### Урок
После перехода на статику CDN **индексы = runtime** для рейтинга и судей. Любое изменение `load-sqlite` / `build-derived-indexes` проверять через `build-all-data` + `static-indexes.test.ts`, не только `npm run dev`.

---

## 2026-07-08 — Web Archive Integration (исторические данные 2022–2024)

### Изменения
- **Интеграция данных из web.archive.org:** восстановлены результаты 2022–2024 годов
- **Добавленные данные:** 49 событий, 2689 результатов (2022: 1 событие/33 результата, 2023: 22 события/1233 результата, 2024: 26 событий/1423 результата)
- **Процесс:** скачаны календари и страницы результатов, очищены от баннеров web.archive.org, протестированы существующие парсеры, распарсены и интегрированы в `data/v1/`
- **Скрипты интеграции:** `backend/scripts/web-archive/extract-results-urls.ts`, `download-results.ts`, `clean-web-archive-html.ts`, `test-parsers-on-web-archive.ts`, `parse-and-export.ts`, `cleanup-2024-calendar.ts`, `add-missing-2024-events.ts`, `clean-calendar-html.ts`
- **Индексы:** пересобраны calendar-index (277 событий), top-placement/score/speed, dog-profiles (2034 файла), sitemap.xml

---

## 2026-07-07 — Публичный прод без Worker (статика CDN)

### Решение
- **Публичный сайт** не вызывает `api.coursing-stats.ru` — React читает precomputed JSON с `/data/v1/` (Pages CDN)
- **Worker не деплоится** в CI (`.github/workflows/deploy-frontend.yml`)
- Тяжёлые агрегации (топы, судьи, профили собак) — в CI: `build-derived-indexes.ts` → `data/v1/indexes/`
- **Админка** только локально: `npm run dev` → `local-dev-server.ts` `:8787`

### Причина
Cold start Worker + sql.js давал пустые экраны и таймауты у посетителей. Данные уже лежали на Pages — Worker был лишней прокладкой.

### Реализация
- `frontend/src/lib/staticData.ts` + порты `breedMapping.ts`, `judgeStats.ts`
- Vite `serveDataV1` plugin для dev-паритета с продом
- `indexes/dog-profiles/{id}.json`, `judge-details/`, `sitemap.xml`

---

## 2026-07-07 — Переход runtime на файлы `data/v1/` (без R2)

### Решение
- **Dev и импорт** работают с файлами, не с D1 в runtime публичного сайта
- Канонический каталог: `data/v1/` (JSON)
- **R2 отклонён** — данные на `coursing-stats.ru/data/v1/`
- D1 (`pc-db`) остаётся для **импорта**: парсеры, `export-local-data`, cron

### Реализация
- `backend/lib/local-data/` — JSON → SQLite (better-sqlite3 dev admin)
- `local-dev-server.ts` — `npm run dev` без D1
- `build-all-data` + CI копирует в `frontend/public/data/v1/`
- Админка: persist локально → `sync-sqlite-to-v1` → git push

---

## 2026-07-07 — Edge cache, файловый архив, workflow, SEO

### Edge cache API (legacy Worker / dev:d1)
- **Решение:** Cache API на Worker с TTL по endpoint (`edge-cache.ts`)
- **Статус:** не используется публичным продом с 2026-07-07 (сайт на CDN)
- **Причина:** D1 Free tier — лимит 5M rows read/день; sitemap и judges давали пики
- Sitemap 24 ч, judges 6 ч, top/events/dogs — 1 ч и др.

### Локальная разработка
- `npm run dev` → **data/v1/** на диске (не D1)
- `npm run dev:d1` / `dev:remote` — legacy Worker + D1
- `npm run sync-from-remote` + `export-local-data` — свежий импорт из D1

### Файловый архив
- `npm run export-archive` → `data/archive/snapshots/`
- Независимость от procoursing.ru; будущая миграция на схему v1 (`data/archive/_schema/v1/`)

### GitHub Actions
- `update-db.yml`: **только workflow_dispatch** (ручной запуск)
- `update-speed-records.yml`: **4×/день** (05:00, 11:00, 17:00, 20:30 UTC ≈ 08:00, 14:00, 20:00, 23:30 МСК)

### UI судей
- Таблица заменена на **карточки** (`JudgeCard.tsx`, grid на `/judges`)

### SEO / Yandex
- Sitemap index на Pages + dynamic API sitemap (~2096 URL)
- `favicon.ico` для краулеров
- Регион «Нет региона» в Вебмастере — нормально для всероссийского агрегатора

---

## 2026-07-06 — Рекорды Донино: единая двухколоночная страница

### Изменения
- **`/speed-records`:** одна страница — колонки «Замер» и «Бега 350 м»; переключатель **Записи | Статистика** (`?view=stats`) над `PageToolbar`
- **Записи:** `DoninoRecordsColumns`, `DoninoListRecordRow`, infinite scroll (30), отдельная сортировка по колонкам; фильтр по полу — только «Замер»
- **Статистика:** общая группировка `?groupBy=`; `DoninoStatsSummary` (шапка колонки); свёрнутые графики; карточки групп вместо таблицы; синхронное раскрытие в обеих колонках
- **Excel:** один файл, два листа (`exportDoninoToExcel`)

---

## 2026-07-06 — Главная, PageToolbar, профили Донино, owner marks

### Единый PageToolbar
- Фильтры и сегменты вынесены в `frontend/src/components/toolbar/` + `lib/toolbar.ts`
- Применено: рейтинг, судьи, рекорды Донино (таблица и статистика), главная (сегменты топа)
- `FilterSelect`: ширина задаётся обёрткой; `MultiFilterDropdown`: `w-fit shrink-0`

### Главная
- Hero + ближайшие события, кликабельные счётчики, подиум топ-3, две колонки Донино (замер | 350 м)
- Стили частично в `index.css` (`.hero-dashboard`, `.donino-home-columns`, …)

### Профили Донино
- `DoninoDogProfile` и блоки на `DogProfile`: warm-blue (замер), forest (бега 350 м)
- История бегов: `expandCoursingTimeline()` — текущая строка + `history` из примечаний Google Sheet
- Процентиль убран из UI (API поле остаётся; отображение было некорректным)

### Owner marks (личная метка)
- **Решение:** список кличек только во фронтенде (`ownerMarks.ts`), без связи в D1 между Донино и соревнованиями
- Отдельные наборы: Донино (`Тайга`, `Салюки`) и соревнования (`dog_id: 187` / имя `ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА`)
- Редактировать только по явной просьбе владельца сайта

---

## 2026-07-05 — Верификация RKF правил и титулов
- Проверена информация в `frontend/src/pages/Guide/constants.ts` против официальных источников РКФ
- Источники: Правила проведения состязаний по бегам борзых и курсингу (PDF), Положение РКФ о присвоении титулов (help.rkf.online)
- Подтверждено:
  - 7 вариантов получения ЧР РК по курсингу (п. 4.3.5)
  - 5 критериев оценки курсинга (п. 7.4.x): Маневренность, Скорость, Выносливость, Преследование, Энтузиазм
  - Квалификационная норма: не менее 2/3 от максимального количества баллов
  - Правило 50% для второго круга
  - Сертификаты: CACIL, CACL, CACLBr
  - Титулы мероприятий и кумулятивные титулы
- Расхождений не обнаружено

---

## 2026-07-05 — Ребрендинг
- Название: ProCoursing Stats → Coursing Stats
- Новые домены: coursing-stats.ru, api.coursing-stats.ru
- GitHub: antajl/Coursing-Stats
- Маршрут `/procoursing` → редирект на `/competitions`

---

## 2026-07-04 — Админ-интерфейс
- Создан админ-интерфейс для редактирования исторических данных (до 2026)
- Авторизация через ADMIN_API_TOKEN с проверкой через API
- CRUD операции для событий и результатов
- OCR эксперимент (качество недостаточно, решено использовать ручной ввод)

---

## 2026-07-03 — UI улучшения
- Обновлён дизайн навигации и календаря событий
- Светлая тема по умолчанию (раньше системная)
- Улучшена мобильная адаптация и доступность
- Добавлена статистика Донино (распределение скоростей)

---

## 2026-06-28 — Рекорды Донино
- Страница "Рекорды Донино" с таблицей и статистикой
- Автоматическое обновление через GitHub Actions (ежедневно)
- Экспорт в Excel (.xlsx)

---

## 2026-06-27 — Admin API
- POST /api/admin/import-results для пакетной загрузки результатов
- Валидация данных на сервере и логирование ошибок
- ADMIN_API_TOKEN для локальной админки (`npm run dev`)

---

## 2026-06-26 — Технологические изменения
- React Query для кэширования данных
- Zod для валидации данных
- TypeScript в frontend
- Мобильная адаптация всех страниц
- Оптимизация загрузки (lazy routes, code splitting)

---

## Ранее

- Первоначальная версия проекта
- Парсинг данных с procoursing.ru
- API на Cloudflare Worker
- Фронтенд на Cloudflare Pages
- База данных D1
