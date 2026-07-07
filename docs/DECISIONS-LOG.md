# Decision Log — Лог архитектурных решений

История важных архитектурных решений и экспериментов проекта Coursing Stats.

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

Документация: `docs/LOCAL-DATA.md`, `docs/ARCHITECTURE.md`

---

## 2026-07-07 — Переход runtime на файлы `data/v1/` (без R2)

### Решение
- **Dev и импорт** работают с файлами, не с D1 в runtime публичного сайта
- Канонический каталог: `data/v1/` (JSON)
- **R2 отклонён** — данные на `coursing-stats.ru/data/v1/`
- D1 (`pc-db`) остаётся для **импорта**: парсеры, `export-local-data`, cron

> **Примечание (вечер 2026-07-07):** prod Worker + sql.js заменён статикой CDN — см. запись выше.

### Реализация
- `backend/lib/local-data/` — JSON → SQLite (better-sqlite3 dev admin)
- `local-dev-server.ts` — `npm run dev` без D1
- `build-all-data` + CI копирует в `frontend/public/data/v1/`
- Админка: persist локально → `sync-sqlite-to-v1` → git push

### Обновление прода
`export-local-data` / правка JSON → `build-all-data` → git push → deploy Pages

Документация: `docs/LOCAL-DATA.md`

---

## 2026-07-07 — Edge cache, файловый архив, workflow, SEO

### Edge cache API
- **Решение:** Cache API на Worker с TTL по endpoint (`edge-cache.ts`)
- **Причина:** D1 Free tier — лимит 5M rows read/день; sitemap и judges давали пики
- Sitemap 24 ч, judges 6 ч, top/events/dogs — 1 ч и др.

### Локальная разработка
- `npm run dev` → **локальная D1** (не жрёт remote quota)
- `npm run sync-from-remote` — копия prod перед работой
- `npm run dev:remote` — только когда нужны live-данные

### Файловый архив
- `npm run export-archive` → `data/archive/snapshots/`
- Независимость от procoursing.ru; будущая миграция на схему v1 (`data/archive/_schema/v1/`)

### GitHub Actions
- `update-db.yml`: **4×/день** (05:00, 11:00, 17:00, 20:30 UTC), не только понедельник

### UI судей
- Таблица заменена на **карточки** (`JudgeCard.tsx`, grid на `/judges`)

### SEO / Yandex
- Sitemap index на Pages + dynamic API sitemap (~2096 URL)
- `favicon.ico` для краулеров
- Регион «Нет региона» в Вебмастере — нормально для всероссийского агрегатора

### Справочник `/guide`
- Аудит правил РКФ в `Guide/constants.ts`; документация в `GUIDE.md`

---

### Донино hub (`/speed-records`)
- **Решение:** одна страница, две колонки (Замер | Бега 350 м) вместо вкладок дисциплин
- Режимы: **Записи** (список + infinite scroll) и **Статистика** (`?view=stats`) — переключатель над тулбаром
- Статистика: **одна** группировка `?groupBy=` на обе колонки; карточки групп вместо таблицы «Срезы»
- Фильтр **пола** — только колонка «Замер»; km/ч и сек — по колонкам (подписи в UI)
- `speed_records` и `coursing_records` по-прежнему **не смешиваются** в метриках (см. `SPEED-RECORDS.md`)

### Соревнования
- Календарь (`Events/index.tsx`) переведён на `PageToolbar` — визуальная согласованность с рейтингом
- Синхронизация URL календаря: `setSearchParams(prev => …)` — не затирать `?tab=` hub

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
- ADMIN_TOKEN для авторизации admin endpoints

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
