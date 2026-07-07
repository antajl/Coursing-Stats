# Changelog — История изменений

Значимые изменения проекта Coursing Stats.

## [Unreleased]

### 2026-07-07 — UI стандартизация по аудиту
- **Толщина рамок (P4):** стандартизирована по правилу — строки списков/мелкие элементы → `border` (1px), карточки/тулбар → `border` (1px), шапки профилей → `border-2`
- **Nav active-стиль (P6):** унифицирован — mobile теперь использует подчёркивание `scale-x` как desktop
- **Цветовые токены (P1):** сокращённые токены заменены на полные в TSX файлах (`om-` → `old-money-` в Admin компонентах)
- **Файлы:** `frontend/src/lib/toolbar.ts`, `frontend/src/index.css`, `frontend/src/components/Nav.tsx`, `frontend/src/pages/Admin/*.tsx`

### 2026-07-07 — D1, архив данных, SEO, docs
- **Edge cache** (`backend/src/lib/edge-cache.ts`): кэш GET на Cloudflare edge — снижение reads D1 (free tier 5M/день)
- **Local dev:** `npm run dev` → локальная D1; `sync-from-remote`, `dev:remote` для prod-копии
- **Sitemap:** fix API 500 (`judges` из events), sitemap index, URL `/judges/`, `/top`; кэш 24 ч
- **Favicon:** `favicon.ico` + `favicon-48.png` для Google; `npm run generate-favicon`
- **Workflow:** `update-db.yml` 4×/день (как Donino), не только понедельник
- **Архив данных:** `npm run export-archive` → `data/archive/snapshots/`; docs `DATA-ARCHIVE.md`
- **Судьи UI:** таблица заменена на `JudgeCard` (карточки)
- **Guide (`/guide`):** полировка контента, `AbbrTag`, docs `GUIDE.md`
- **Документация:** синхронизация dev/cron/цифр БД по всем docs
- **TESTING.md:** unit + E2E (Playwright); архив планов в `docs/_archive/`; CI `e2e.yml`
- **E2E:** helpers, fixtures из API, home/guide/mobile/dark-theme; исправлены URL `/top`, `/event/:id`

### 2026-07-06 — Рекорды Донино: единая двухколоночная страница
- **`/speed-records`:** одна страница — колонки «Замер» и «Бега 350 м»; переключатель **Записи | Статистика** (`?view=stats`) над `PageToolbar`
- **Записи:** `DoninoRecordsColumns`, `DoninoListRecordRow`, infinite scroll (30), отдельная сортировка по колонкам; фильтр по полу — только «Замер»
- **Статистика:** общая группировка `?groupBy=`; `DoninoStatsSummary` (шапка колонки); свёрнутые графики; карточки групп вместо таблицы; синхронное раскрытие в обеих колонках
- **Excel:** один файл, два листа (`exportDoninoToExcel`)
- Документация: `SPEED-RECORDS.md`, `DEVELOPMENT.md`

### 2026-07-06 — Соревнования: календарь и переключение вкладок
- **Календарь:** фильтры в `PageToolbar` (как рейтинг); URL sync не затирает `?tab=`
- **Рейтинг:** тулбар при загрузке, скелетон только под списком
- **`Competitions.tsx`:** статический import вкладок (без nested Suspense)

### 2026-07-06 — UI plan v2 (мобильный рейтинг, медали, судьи)
- **DogCard:** двухстрочная вёрстка на мобиле, `MedalTally` вместо эмодзи
- **DogProfile / DogTooltip:** `MedalTally`; история Донино сворачивается (5 + «показать все»); `items-start` в grid
- **Competitions:** `ToolbarSegmentControl` вместо вертикальных вкладок
- **Home:** золото первым на мобильном подиуме (`order-first`)
- **judges.ts:** очистка префиксов `2 - ` в именах
- **PageToolbar, Hero, Nav, StatCounter, DogNameLink:** мобильная полировка (см. `docs/_archive/cursor-ui-plan-v2.md`)

### 2026-07-06 (продолжение) — SEO Донино, фон DogProfile
- **DoninoDogProfile:** компонент `<SEO>` (title, description, keywords)
- **Sitemap API:** URL `/donino-dog/:name/:breed` из `speed_records` ∪ `coursing_records`
- **DogProfile:** убран лишний `bg-cream-50` — фон как у DoninoDogProfile

### 2026-07-06 — Главная, тулбары, профили Донино
- **Главная (`Home.tsx`)**: hero-dashboard + ближайшие события; кликабельные счётчики; подиум топ-3 сезона (`ToolbarSegmentControl`: медали / очки / скорость); блок Донино — две колонки (замер | бега 350 м) без вкладок; `PodiumRankMark` (римские I / II / III полосками); медали на подиуме в одну строку (`MedalTally nowrap`)
- **Единый тулбар** (`frontend/src/components/toolbar/`): `PageToolbar`, `ToolbarSegmentControl`, `ToolbarSearch`, `RecordsListToolbar`, `MultiFilterDropdown` — рейтинг, судьи, рекорды Донино, статистика
- **`FilterSelect`**: классы layout только на обёртке; фиксированная ширина селектов (год ~`6.75rem`, порода ~`10.5rem`) — не растягиваются на длинные названия пород
- **Профили Донино** (`DoninoDogProfile.tsx`): визуальный язык как у `DogProfile` — warm-blue (замер), forest (бега 350 м); hero-стат + сетка 2×2; отдельная карточка «История»; история бегов через `expandCoursingTimeline()` (текущий результат + `history` из примечаний таблицы); блок «Процентиль» убран
- **Профиль соревнований** (`DogProfile.tsx`): компактная шапка — титулы горизонтальными чипами под именем; кнопки «назад» и «скачать» в строке с кличкой; блоки Донино на профиле — те же темы; coursing history через `expandCoursingTimeline`
- **Owner marks** (`frontend/src/lib/ownerMarks.ts`, `OwnerCrownName.tsx`): личная метка-корона у кличек владельца (без связи Донино ↔ соревнования в БД): Донино `Тайга`/`Салюки`, соревнования `dog_id: 187` / `ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА`
- **Парсер coursing 350 м**: примечания в колонке «Дата» → `history` JSON; статусы `new`/`improved`; скрипт `analyze-coursing-xlsx.ts`

### 2026-07-06 — Рекорды Донино: UI и синк
- Список замеров скорости и бегов 350 м — карточки вместо HTML-таблицы; клик по карточке → профиль Донино
- Sparkline истории скорости в карточке (`history` + текущий замер); бейджи `new`/`upd` из цветов Google Sheet
- Общий парсер `parse-speed-xlsx.ts` (исправлено чтение цвета колонки «Кличка» в `sync-speed-records.ts`)
- GitHub Actions: синк рекордов скорости 4×/день (08:00, 14:00, 20:00, 23:30 МСК)

### 2026-07-06 — Реорганизация документации
- Плоская структура docs/ (14 файлов в корне вместо вложенных папок)
- Консолидация файлов: GETTING-STARTED.md, AI-GUIDE.md, ARCHITECTURE.md, DEVELOPMENT.md, FUTURE-PLANS.md
- Исправлены все внутренние и внешние ссылки
- Обновлены цифры статистики БД (events: 225, dogs: 1619, results: 2966)

### 2026-07-05 — Ребрендинг Coursing Stats
- Название: ProCoursing Stats → Coursing Stats
- Новые домены: coursing-stats.ru, api.coursing-stats.ru
- GitHub: antajl/Coursing-Stats
- Обновлены логотипы, favicon, скрипты деплоя
- Маршрут `/procoursing` → редирект на `/competitions`

### 2026-07-04 — Админ-интерфейс
- Создан админ-интерфейс для редактирования исторических данных (до 2026)
- Авторизация через ADMIN_API_TOKEN с проверкой через API
- CRUD операции для событий и результатов
- Исправлены все TypeScript ошибки (42 → 0)
- OCR эксперимент (качество недостаточно, решено использовать ручной ввод)

### 2026-07-03 — UI улучшения
- Обновлён дизайн навигации и календаря событий
- Светлая тема по умолчанию (раньше системная)
- Улучшена мобильная адаптация и доступность
- Добавлена статистика Донино (распределение скоростей)

### 2026-06-28 — Рекорды Донино
- Страница "Рекорды Донино" с таблицей и статистикой
- Автоматическое обновление через GitHub Actions (ежедневно)
- Экспорт в Excel (.xlsx)
- История предыдущих результатов при наведении

### 2026-06-27 — Admin API
- POST /api/admin/import-results для пакетной загрузки результатов
- Валидация данных на сервере и логирование ошибок
- ADMIN_TOKEN для авторизации admin endpoints

### 2026-06-26 — Технологические изменения
- React Query для кэширования данных
- Zod для валидации данных
- TypeScript в frontend
- Мобильная адаптация всех страниц
- Оптимизация загрузки (lazy routes, code splitting)

## [Ранее]

- Первоначальная версия проекта
- Парсинг данных с procoursing.ru
- API на Cloudflare Worker
- Фронтенд на Cloudflare Pages
- База данных D1
