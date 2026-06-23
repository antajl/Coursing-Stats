# 08. File Splitting Plan — Разбивка больших файлов

## Текущее состояние

На данный момент ни один файл не превышает 2000 строк:

| Файл | Строк | Статус |
|------|-------|--------|
| README.md | 147 | ✅ |
| schema.sql | 104 | ✅ |
| parse-results-coursing.mjs | 167 | ✅ |
| fetch-win1251.mjs | 34 | ✅ |
- scrape-year-index.mjs | 117 | ✅ |
| scripts/parse-results.mjs | 331 | ✅ |
| TECHNICAL_PLAN.md | 151 | ✅ |

## Потенциально растущие файлы

### 1. schema.sql
**Риск роста:** Добавление view, индексов, миграций

**План разбивки при >1500 строк:**
```
db/
  schema/
    01-events.sql
    02-dogs.sql
    03-results.sql
    04-views.sql
    05-indexes.sql
  migrations/
    001-initial.sql
    002-add-views.sql
```

### 2. Парсеры результатов
**Риск роста:** Добавление парсеров для БЗМП и Racing

**Текущая структура:**
- `parse-results-coursing.mjs` (167 строк)
- `scripts/parse-results.mjs` (331 строк) - альтернативный парсер

**План разбивки при >2000 строк:**
```
scripts/parse/
  index.mjs                    # главный экспорт всех парсеров
  coursing/
    index.mjs                  # экспорт parseCoursingResultsPage
    parser.mjs                 # основная логика парсинга
    constants.mjs              # регэкспы, константы
    status-detector.mjs       # определение статусов
  bzmp/
    index.mjs
    parser.mjs
  racing/
    index.mjs
    parser.mjs
```

### 3. Скраперы
**Риск роста:** Добавление детального скрапинга событий

**План разбивки при >2000 строк:**
```
scripts/scrape/
  index.mjs
  year-index.mjs              # scrape-year-index.mjs
  event-details.mjs           # детальная информация о событии
  catalog.mjs                 # скрапинг PDF-каталогов (если понадобится)
```

### 4. Загрузчики в D1
**Риск роста:** Логика нормализации, дедупликации, миграций

**План разбивки при >2000 строк:**
```
scripts/load/
  index.mjs
  events.mjs                  # загрузка событий
  dogs.mjs                    # загрузка собак с дедупликацией
  results.mjs                 # загрузка результатов
  normalize.mjs               # нормализация данных
```

### 5. Frontend (когда начнём)
**Риск роста:** Компоненты React, страницы, хуки

**План разбивки при >2000 строк:**
```
src/
  components/
    DogProfile/
      index.tsx
      Timeline.tsx
      ScoreChart.tsx
    TopTable/
      index.tsx
      Filters.tsx
  pages/
    DogProfile.tsx
    TopPlacement.tsx
    TopScore.tsx
  lib/
    api.ts
    utils.ts
    constants.ts
```

## Правила разбивки

1. **Один файл — одна ответственность**
   - Парсер только для одного типа событий
   - Компонент только для одной UI-части

2. **Выноси константы**
   - Регэкспы → `constants.mjs`
   - Конфигурация → `config.mjs`

3. **Выноси утилиты**
   - Общие функции → `lib/utils.mjs`
   - Специфичные → в соответствующую папку

4. **Используй index.mjs для экспорта**
   - Удобный импорт: `import { parseCoursing } from './scripts/parse/index.mjs'`

5. **Максимальный размер файла: 500-800 строк**
   - После 800 строк сложно читать целиком
   - После 1500 строк — обязательно разбить

## Приоритет разбивки

1. **Высокий приоритет:**
   - schema.sql при >1500 строк (критично для БД)
   - Парсеры при >2000 строк (критично для данных)

2. **Средний приоритет:**
   - Скраперы при >2000 строк
   - Загрузчики при >2000 строк

3. **Низкий приоритет:**
   - Frontend (разбивка по компонентам — естественный процесс)

## Текущие действия

✅ **Ничего разбивать не нужно** — все файлы в пределах нормы

📋 **Мониторить:**
- schema.sql при добавлении view
- Парсеры при добавлении БЗМП/Racing
- Фронтенд при начале разработки
