# Code Patterns — Паттерны кода

> **ИИ:** архитектура — [02-ARCHITECTURE.md](02-ARCHITECTURE.md). Фронтенд — [04-FRONTEND.md](04-FRONTEND.md). Backend — [04-DEVELOPMENT.md](04-DEVELOPMENT.md).

Повторяющиеся паттерны в коде Coursing Stats. Используйте эти паттерны для понимания кода и создания новых компонентов.

---

## Static Data Layer Pattern

### Описание
Фронтенд читает данные из `data/v1/` через единый слой абстракции. Это позволяет легко переключаться между dev (Vite plugin) и prod (CDN).

### Реализация
**Файл:** `frontend/src/lib/staticData.ts`

**Функции:**
- `getEvents()` — Все события с фильтрацией/сортировкой
- `getEvent(id)` — Одно событие по ID
- `getTopPlacement(year, filters)` — Рейтинг по местам
- `getTopScore(year, filters)` — Рейтинг по очкам
- `getTopSpeed(year, filters)` — Рейтинг по скорости
- `getSpeedRecords()` — Все рекорды Донино (скорость)
- `getCoursingRecords()` — Все рекорды Донино (беги 350м)
- `getJudges()` — Все судьи
- `getJudgeDetails(key)` — Детали судьи
- `getDogProfile(id)` — Профиль собаки
- `getDogEvents(dogId)` — История событий собаки

**Особенности:**
- Client-side фильтрация/сортировка/пагинация
- Кэширование в памяти для производительности
- Type-safe с TypeScript интерфейсами
- Используется через useStaticData hook

### Пример использования
```typescript
import { getEvents, getTopPlacement } from '@/lib/staticData';

const events = getEvents();
const top2026 = getTopPlacement(2026, { breed: 'САЛЮКИ' });
```

---

## PageToolbar Pattern

### Описание
Единый паттерн для toolbar на страницах с фильтрами и переключением режимов. С 2026-07-11: **`PageToolbar bare`** — одна строка без framed panel; фильтры в **`ToolbarFiltersDropdown`** с секциями и чекбоксами.

### Компоненты
| Компонент | Роль |
|-----------|------|
| `PageToolbar` | Контейнер; prop `bare` — без `TOOLBAR_PANEL` |
| `ToolbarSearch` | Поиск (`flex-1 max-w-lg`) |
| `ToolbarFiltersDropdown` | Панель «Фильтры» (`#toolbar-filters-panel`) |
| `ToolbarSegmentControl` | Вкладки справа (рейтинг) |
| `ViewToggle` | Записи / Статистика (Донино) |
| `ToolbarActiveFilters` | Чипы под строкой |

Стили секций: `TOOLBAR_FILTER_SECTION_LABEL`, `TOOLBAR_FILTER_CHECKBOX_ROW` в `lib/toolbar.ts`.

### Пример структуры
```tsx
<PageToolbar bare filters={
  <>
    <ToolbarSearch className="!w-auto min-w-[200px] flex-1 max-w-lg" … />
    <ToolbarFiltersDropdown active={hasPanelFilters} onReset={clearPanelFilters}>
      <div>
        <p className={TOOLBAR_FILTER_SECTION_LABEL}>Год</p>
        {/* чекбоксы, max-h-36 overflow-y-auto */}
      </div>
    </ToolbarFiltersDropdown>
    <div className="ml-auto shrink-0">
      <ToolbarSegmentControl … />
    </div>
  </>
} />
```

**Сброс:** `onReset` в dropdown — только панель; `onClearAllFilters` на `PageToolbar` — всё включая поиск.

**Чипы:** `frontend/src/pages/SpeedRecords/toolbarFilters.ts`.

**Рейтинг — год:** checkbox toggle; снятие выбранного года → `filterYear = ''` (индекс `top-*-all`); chip «Все годы»; сброс → `CURRENT_SEASON`.

**Рейтинг — порода:** `useCompetingBreeds()` + `deriveCompetingBreeds()` (`lib/competingBreeds.ts`), источник `indexes/dogs-index.json` (не `breeds.json`).

**Используется на:**
- Рейтинг: `TopDogs/TopDogsFilters.tsx` (`/competitions?tab=ranking`, `/top`)
- Судьи: `Judges/index.tsx`
- Донино: `SpeedRecords/DoninoPageToolbar.tsx`
- Календарь (dev, **без** `bare`): `Events/index.tsx`

---

## Competing Breeds Pattern (фильтр пород в рейтинге)

### Описание
Выпадающий список пород на **рейтинге** показывает только породы, у которых есть реальные результаты соревнований. Не путать с `breeds.json` (полный список из D1, включая мусор).

### Реализация
| Файл | Роль |
|------|------|
| `frontend/src/lib/competingBreeds.ts` | `deriveCompetingBreeds(dogsIndex[])` |
| `frontend/src/hooks/useStaticData.ts` | `useCompetingBreeds()` → fetch `/data/v1/indexes/dogs-index.json` |
| `frontend/src/pages/TopDogs/index.tsx` | `breedValues` из hook |

### Правила фильтрации
```typescript
// competition_count > 0
// breed не пустой
// не /^\d+$/  (ошибки парсера, напр. "18")
```

### Пример
```typescript
const { data } = useCompetingBreeds();
const breedValues = data?.success ? data.data.breeds : [];
```

**Судьи:** породы из `judges-summary` (`unique_breeds`), этот паттерн не используется.

---

## ProcoursingAttribution Pattern

### Описание
Указание источника данных procoursing.ru (договорённость 2026-07-10). Ссылка **кликабельна** в тексте.

**Компонент:** `frontend/src/components/ProcoursingAttribution.tsx`

| Маршрут | Позиция |
|---------|---------|
| `/competitions` | Вверху карточки (`Competitions.tsx`) |
| `/top`, `/judges`, профили | Внизу страницы |
| `/speed-records` | Нет (Google Sheets) |

---

## Admin API Pattern

### Описание
Все admin endpoints защищены X-Admin-Token и работают только локально.

### Реализация
**Backend:** `backend/src/routes/admin.ts`

**Паттерн:**
```typescript
app.post('/api/admin/events', async (c) => {
  const token = c.req.header('X-Admin-Token');
  if (token !== process.env.ADMIN_API_TOKEN) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const data = await c.req.json();
  // Process data
  // Write to SQLite
  // Sync to data/v1/
  
  return c.json({ success: true });
});
```

**Frontend:** `frontend/src/pages/Admin/adminApi.ts`

**Паттерн:**
```typescript
const adminApi = {
  async updateEvent(event: Event) {
    const response = await fetch('/api/admin/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': import.meta.env.VITE_ADMIN_API_TOKEN
      },
      body: JSON.stringify(event)
    });
    return response.json();
  }
};
```

---

## Parser v2 Modular Pattern

### Описание
Модульная структура парсеров для разделения ответственности и легкого тестирования.

### Реализация
**Структура:**
```
parsers/
├── coursing/
│   ├── utils.ts          # Утилиты (extractNumber, normalizeDogName)
│   ├── row-parsers.ts    # Парсинг строк (parseDogRow1Judge, parseDogRow2Judges)
│   ├── header-parsers.ts # Парсинг заголовков (extractJudgeCount)
│   ├── schemas.ts        # Zod схемы для валидации
│   └── index.ts          # Главный парсер с валидацией
├── bzmp/
│   └── (аналогично)
├── racing/
│   └── (аналогично)
└── unique/
    └── (аналогично)
```

**Паттерн:**
```typescript
// utils.ts
export function extractNumber($el: CheerioAPI): number | null {
  // Extract number from element
}

// row-parsers.ts
export function parseDogRow1Judge($row: CheerioAPI, context: Context): DogResult {
  // Parse single row for 1 judge
}

// schemas.ts
export const DogResultSchema = z.object({
  breed_class: z.string(),
  placement: z.number(),
  // ...
});

// index.ts
export function parseCoursingHTML(html: string): CoursingResult {
  const $ = cheerio.load(html);
  const results = [];
  
  // Parse using row-parsers
  // Validate using schemas
  
  return { results, judges, track_schemes };
}
```

---

## Data Build Pipeline Pattern

### Описание
Пайплайн для построения данных из D1 в data/v1/ с валидацией.

### Реализация
**Скрипт:** `backend/scripts/build-all-data.ts`

**Паттерн:**
```typescript
async function buildAllData() {
  // 1. Load from D1
  const db = loadLocalDataSqlite();
  const events = db.prepare('SELECT * FROM events').all();
  
  // 2. Build derived indexes
  const topPlacement = buildTopPlacement(db);
  const judgesSummary = buildJudgesSummary(db);
  
  // 3. Validate
  if (topPlacement.length === 0) {
    throw new Error('top-placement-all is empty');
  }
  
  // 4. Write to data/v1/
  await writeJson('data/v1/indexes/top-placement-all.json', topPlacement);
  await writeJson('data/v1/indexes/judges-summary.json', judgesSummary);
  
  // 5. Update manifest
  await updateManifest();
}
```

**Особенности:**
- Валидация критических индексов
- Fatal error при пустых данных
- Автоматическое обновление manifest.json

---

## Zod Validation Pattern

### Описание
Использование Zod для валидации данных парсеров и API.

### Реализация
**Пример:**
```typescript
import { z } from 'zod';

export const DogResultSchema = z.object({
  breed_class: z.string(),
  placement: z.number().nullable(),
  catalog_no: z.number(),
  breed: z.string(),
  class: z.string(),
  sex: z.string(),
  name: z.string(),
  total_score: z.number().nullable(),
  judge_count: z.number(),
  qualification: z.string().nullable(),
  vc: z.string().nullable(),
  status: z.enum(['finished', 'disqualified', 'withdrawn', 'dns']),
  raw_scores_json: z.string(),
  raw_text: z.string()
});

export function parseCoursingHTMLWithValidation(html: string) {
  const result = parseCoursingHTML(html);
  return DogResultSchema.array().parse(result.results);
}
```

**Используется в:**
- Парсеры (v2)
- API endpoints
- Data build pipeline

---

## Dog Profile Index Pattern

### Описание
Публичный профиль собаки (`/dog/:id`) читает **`data/v1/indexes/dog-profiles/{id}.json`**, не `dogs/by-id/` напрямую. Индекс собирает статистику из `results` (sqlite snapshot) и метаданные собаки.

### Реализация
**Файл:** `backend/scripts/build-derived-indexes.ts` → `buildDogProfiles()`

**Источники:**
| Данные | Откуда |
|--------|--------|
| `coursing_stats`, `racing_stats`, `titles`, `competitions[]` | SQL по `results` + `events` |
| `name_lat`, `name_ru`, `breed`, `pedigree_url`, … | **`dogs/by-id/{id}.json`** (приоритет), fallback — строка `dogs` в sqlite |

**Почему by-id приоритетнее sqlite:** в схеме `UNIQUE(name_lat, breed)` — дубли с разными `id` схлопываются при `load-sqlite.ts` (~1766 строк vs ~2034 файла). Профиль `/dog/5782` должен брать `pedigree_url` из `by-id/5782.json`.

**Список id для профилей:** union ключей `by-id`, `results.dog_id`, sqlite `dogs.id`. После сборки — удаление лишних JSON в `indexes/dog-profiles/`.

### Breed Archive enrich
```bash
npm run enrich-breedarchive-urls   # → dogs/by-id + by-key
npm run build-all-data             # → dog-profiles
```

**Lib:** `backend/lib/breedarchive.ts` — `breedArchiveSubdomain(breed)`, `resolveBreedArchiveUrl(name_lat, breed)`.

### Frontend
```typescript
// hooks/useStaticData.ts
useDogProfile(id) → fetch `/data/v1/indexes/dog-profiles/${id}.json` → data.dog
```

**UI:** `DogProfile.tsx` — chip «Breed Archive» при `dog.pedigree_url`.

---

## React Query Pattern

### Описание
Использование React Query для кэширования и управления данными.

### Реализация
**Пример:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { getDogProfile } from '@/lib/staticData';

function useDogProfile(id: string) {
  return useQuery({
    queryKey: ['dog', id],
    queryFn: () => getDogProfile(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**Особенности:**
- Автоматическое кэширование
- Refetch при фокусе
- Оптимистичные обновления для admin

---

## Component Composition Pattern

### Описание
Композиция компонентов для переиспользования UI элементов.

### Примеры:
- `QualificationBadges` — бейджи титулов (используется в профиле собаки и на странице события)
- `EventCard` — карточка события (используется в календаре и на главной)
- `DogLink` — ссылка на собаку с кличкой и породой

---

## Error Handling Pattern

### Описание
Единый паттерн обработки ошибок в backend и frontend.

### Backend
```typescript
try {
  const result = await processRequest(data);
  return c.json({ success: true, data: result });
} catch (error) {
  console.error('Error:', error);
  return c.json({ 
    success: false, 
    error: error.message 
  }, 500);
}
```

### Frontend
```typescript
try {
  const response = await api.updateEvent(event);
  if (!response.success) {
    throw new Error(response.error);
  }
  toast.success('Event updated');
} catch (error) {
  toast.error(`Failed to update: ${error.message}`);
}
```

---

## См. также

- [02-ARCHITECTURE.md](02-ARCHITECTURE.md) — Архитектура проекта
- [04-DEVELOPMENT.md](04-DEVELOPMENT.md) — Разработка
- [15-PARSING-IMPLEMENTATION.md](15-PARSING-IMPLEMENTATION.md) — Реализация парсеров
