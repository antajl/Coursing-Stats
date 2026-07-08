# Миграция на статические JSON файлы (2026-07)

## Причина миграции

**Проблема:** Онлайн версия сайта не показывала данные в рейтинге собак, судьях и рекордах Донино, хотя локально всё работало.

**Корневая причина:** 
- Локально Vite middleware отдавал данные из `data/v1/` напрямую
- В проде Cloudflare Pages не имел доступа к этим файлам (не были в git)
- Фронтенд пытался загрузить данные из API Worker, который не был деплоин

**Решение:** Полный переход на статические JSON файлы без зависимости от D1 API.

---

## Что было сделано

### 1. Созданы хуки для статических данных

**Файл:** `frontend/src/hooks/useStaticData.ts`

```typescript
// Хуки для загрузки статических JSON файлов
export function useTopPlacement(year: string)
export function useTopScore(year: string)
export function useTopSpeed(year: string)
export function useBreeds()
export function useYears()
export function useJudges(breed: string, discipline: string)
export function useJudgeDetails(judgeId: string, breed: string, discipline: string)
export function useSpeedRecords(breed: string, sex: string, limit: number, search: string, year: string)
export function useCoursingRecords(breed: string, limit: number, search: string, year: string)
```

Все хуки возвращают данные в формате `{ success: true, data: T }` для совместимости с существующим кодом.

### 2. Обновлены компоненты

**TopDogs** (`frontend/src/pages/TopDogs/index.tsx`):
- Заменил импорт с `useApi` на `useStaticData`
- Убрал параметры фильтрации из хуков (теперь фильтрация на клиенте)
- Добавил клиентскую фильтрацию по породе в `filterUtils.ts`

**Judges** (`frontend/src/pages/Judges/index.tsx`):
- Заменил импорт с `useApi` на `useStaticData`
- Изменил логику получения списка пород (теперь из данных судей)

**JudgeDetail** (`frontend/src/pages/Judges/JudgeDetail.tsx`):
- Заменил импорт с `useApi` на `useStaticData`

**SpeedRecords** (`frontend/src/pages/SpeedRecords/useSpeedRecordsPage.ts`):
- Заменил импорт с `useApi` на `useStaticData`
- Изменил логику извлечения данных (`.data.records` вместо `.data`)

### 3. Скрипт копирования данных

**Файл:** `frontend/scripts/copy-data.js`

```javascript
// Копирует data/v1/ в frontend/public/data/v1/ перед билдом
const SOURCE_DIR = path.resolve(ROOT, '../data/v1');
const TARGET_DIR = path.resolve(ROOT, 'public/data/v1');
```

### 4. Обновлён билд-процесс

**Файл:** `frontend/package.json`

```json
{
  "scripts": {
    "build": "node scripts/copy-data.js && vite build"
  }
}
```

Теперь при каждом билде данные автоматически копируются в `public/data/v1/`.

### 5. Данные добавлены в git

Все файлы из `data/v1/` скопированы в `frontend/public/data/v1/` и добавлены в git:
- `indexes/` — топы, судьи, профили собак
- `donino/` — рекорды скорости и курсинга
- `breeds.json`, `years.json`, `manifest.json`

---

## Как это работает

### Локальная разработка

```
npm run dev
→ Vite middleware (vite.config.ts) отдаёт data/v1/ по пути /data/v1/*
→ Фронтенд загружает данные через useStaticData hooks
```

### Продакшн

```
git push main
→ GitHub Actions запускает деплой
→ npm run build копирует data/v1/ в public/data/v1/
→ Cloudflare Pages деплоит фронтенд + public/data/v1/
→ Посетитель загружает данные с CDN по /data/v1/*
```

### Путь к данным

**Все хуки используют путь `/data/v1/`:**
- `/data/v1/indexes/top-placement-2026.json`
- `/data/v1/indexes/judges-summary.json`
- `/data/v1/donino/speed_records.json`
- и т.д.

---

## Обновление данных

### Обновление через админку (локально)

```bash
npm run dev
# Правки через http://localhost:5173/admin
npm run build-all-data  # Пересобрать индексы
git commit && git push
```

### Обновление через скрипты импорта

```bash
# Импорт из D1
npm run export-local-data -- --local
npm run build-all-data
git commit && git push
```

### Обновление Донино (Google Sheets)

```bash
# Автоматически через GitHub Actions (.github/workflows/update-speed-records.yml)
# Или вручную:
npm run fetch-speed-records
npm run build-all-data
git commit && git push
```

---

## Проверка после деплоя

После деплоя проверить:
1. Рейтинг собак (`/top`) — данные отображаются
2. Судьи (`/judges`) — список и детали работают
3. Рекорды Донино (`/speed-records`) — таблица и статистика загружаются
4. Календарь (`/competitions`) — события отображаются

---

## Преимущества миграции

1. **Надёжность:** Данные в git, не зависят от Worker/D1
2. **Простота:** Нет необходимости деплоить Worker
3. **Скорость:** Статические файлы отдаются с CDN
4. **Отказоустойчивость:** Если Worker упадёт, сайт продолжит работать
5. **Прозрачность:** Данные видны в git, легко откатить изменения

---

## Обратная совместимость

- `useApi` хуки оставлены для локальной админки
- D1 база данных используется только для импорта
- Worker может быть запущен локально через `npm run dev:d1` (legacy)
