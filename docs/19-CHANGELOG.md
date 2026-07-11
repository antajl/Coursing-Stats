# Changelog — История изменений

Хронология **что изменилось** (фичи, UI, данные). Архитектурные решения «почему» — в [`19-HISTORY.md`](19-HISTORY.md).

---

## 2026-07-12 — Индекс CS (рейтинг «по очкам»)

- **Сортировка** курсинг/БЗМП «по очкам» — по полю `rating_score` в `indexes/top-score-*.json`, не по сумме протокола.
- **Формула:** сглаженная `avg_judge_score` + бонус пика + бонус стартов (`backend/lib/rating/coursing-rating-score.ts`).
- **UI:** двухколоночный рейтинг (курсинг | рейсинг); карточка — средняя / лучш. оценка / сумма протокола; ⓘ у «очки»; фильтр «Мин. индекс CS».
- **Справка:** `/guide` → «О сайте» — описание индекса.
- **Тест:** `backend/tests/coursing-rating-score.test.ts`.
- **Документация:** prior=85 — округление (~68-й перцентиль, не p75); CS v1 — фиксированные prior/k; курсинг и БЗМП — одна протокольная шкала; тултип ⓘ и `/guide` синхронизированы с актуальными цифрами (ИНГРИД CS=89,28).

Канон: [`03-DATA.md`](03-DATA.md) → «top-score» · [`19-HISTORY.md`](19-HISTORY.md) → 2026-07-12

---

## 2026-07-11 — Фильтры рейтинга: породы и «все годы»

- **Породы:** `useCompetingBreeds()` → `dogs-index`, без `breeds.json` и числового мусора (`18`). Файлы: `competingBreeds.ts`, `TopDogs/index.tsx`, `TopDogsFilters.tsx`.
- **Год:** снятие галки → `filterYear = ''` → `top-*-all.json`, chip «Все годы». `buildTopDogsActiveFilterChips(..., defaultYear)`.

Канон: [`03-DATA.md`](03-DATA.md) → «Породы в UI» · [`18-CODE-PATTERNS.md`](18-CODE-PATTERNS.md)

---

## 2026-07-11 — UI главной страницы

- **Hero:** убрана кнопка «Судьи»; «Курсинг Донино» → «Рекорды Донино»; H1 без «в одном месте».
- **HomeEventRow:** в compact — месяц вместо дня недели.
- **Home.tsx:** две волны анимации вместо per-section hooks; обёртка `home-below-fold`.

Файлы: `Hero.tsx`, `HomeEventRow.tsx`, `Home.tsx`

---

## 2026-07-11 — Единый тулбар и атрибуция procoursing.ru

- `PageToolbar bare`, `ToolbarFiltersDropdown`, секции с чекбоксами (рейтинг, судьи, Донино).
- `ProcoursingAttribution` на `/competitions` — вверху карточки.
- Отступы `App.tsx`, hub-карточек.

Канон UI: [`04-FRONTEND.md`](04-FRONTEND.md) → PageToolbar · [`06-DESIGN-SYSTEM.md`](06-DESIGN-SYSTEM.md)

---

## 2026-07-11 — Breed Archive (`pedigree_url`)

- Enrich: `npm run enrich-breedarchive-urls` → `dogs/by-id/`, sync `by-key`.
- UI: chip «Breed Archive» в `DogProfile.tsx` при `dog.pedigree_url`.
- Индексы: `buildDogProfiles()` читает метаданные из `dogs/by-id/` (обход дублей sqlite).

**Канон (процедуры, API, ограничения):** [`03-DATA.md`](03-DATA.md) → «Breed Archive и pedigree_url»  
**Runbook:** [`20-OPERATIONS.md`](20-OPERATIONS.md) → Breed Archive

---

## 2026-07-10 — Вариант A: публичный сайт без календаря

См. ADR: [`19-HISTORY.md`](19-HISTORY.md) → 2026-07-10

Кратко: prod — только рейтинг/судьи/профили; календарь и протоколы — dev `/admin/*` или procoursing.ru.

---

## 2026-07-09 — Реорганизация документации

- Плоская структура `docs/` с префиксами 00–19
- `DECISIONS-LOG` + `CHANGELOG` → `19-HISTORY` (+ с 2026-07-11 отдельный `19-CHANGELOG.md`)
- Архив: [`archive/`](archive/)

---

## 2026-07-08 — Web Archive (2022–2024)

49 событий, 2689 результатов из web.archive.org. Скрипты: `backend/scripts/web-archive/`.

---

## 2026-07-07 — Статика CDN, `data/v1/`, UI судей

- Публичный прод без Worker; данные с `/data/v1/`
- Судьи: карточки вместо таблицы
- Cron Donino 4×/день; `update-db` только manual

ADR: [`19-HISTORY.md`](19-HISTORY.md)

---

## 2026-07-06 — Рекорды Донино, PageToolbar, главная

- `/speed-records`: две колонки, Записи | Статистика
- Единый `PageToolbar` на рейтинге, судьях, Донино, главной
- Hero, подиум, две колонки Донино на главной
- Owner marks во фронтенде (`ownerMarks.ts`)

---

## 2026-07-05 — RKF Guide, ребрендинг

- Верификация `/guide` против источников РКФ — [`10-GUIDE.md`](10-GUIDE.md)
- ProCoursing Stats → Coursing Stats; coursing-stats.ru

---

## 2026-07-04 — Админ-интерфейс

CRUD событий/результатов, `ADMIN_API_TOKEN`, OCR эксперимент (отложен).

---

## 2026-07-03 — UI

Навигация, календарь, светлая тема по умолчанию, мобильная адаптация, статистика Донино.

---

## 2026-06-28 — Рекорды Донино

Страница `/speed-records`, GitHub Actions, Excel export.

---

## 2026-06-27 — Admin API

`POST /api/admin/import-results`, валидация, `ADMIN_API_TOKEN`.

---

## 2026-06-26 — Технологии

React Query, Zod, TypeScript, lazy routes, code splitting.

---

## Ранее

Первоначальный парсинг procoursing.ru, Worker API, Pages, D1.
