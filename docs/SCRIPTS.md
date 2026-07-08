# Backend Scripts

## Оркестрация и утилиты (корень `backend/scripts/`)

### `build-events-by-id-index.ts`
**Назначение:** Построение индекса `data/v1/indexes/events-by-id.json` для быстрого поиска результатов событий по ID.

**Использование:**
```bash
npx tsx backend/scripts/build-events-by-id-index.ts
```

**Что делает:**
- Сканирует все файлы календаря `data/v1/calendar/{year}.json`
- Извлекает события с результатами (`has_results: true`)
- Строит индекс вида `{ "eventId": { "results_file": "...", "date_start": "...", "title": "...", "has_results": true } }`
- Используется фронтендом для загрузки результатов через `staticData.getEventResults(eventId)`

**Когда запускать:**
- После добавления новых событий с результатами в календарь
- После изменения структуры файлов результатов
- После ручного исправления путей к файлам результатов

---

### `fix-event-{eventId}.ts`
**Назначение:** Точечное исправление конкретного события без перепарсинга всех данных.

**Использование:**
```bash
npx tsx backend/scripts/fix-event-20230528.ts
```

**Что делает:**
- Читает существующий JSON файл события
- Добавляет недостающие результаты вручную (безопасно для других событий)
- Обновляет счётчик результатов
- Сохраняет файл с обновлённой датой экспорта

**Когда использовать:**
- Когда парсер пропустил часть данных в конкретном событии
- Когда нужно быстро исправить ошибку без риска повредить другие данные
- Для тестирования изменений структуры данных

**Пример:**
Скрипт `fix-event-20230528.ts` добавил 8 недостающих результатов (американский стаффордширский терьер, ирландский терьер) к событию, где были только метис и цвергпинчер.

---

### `free-dev-port.ts`
**Назначение:** Освобождение занятых портов перед запуском dev-серверов.

**Использование:**
Автоматически запускается перед `npm run dev`.

**Что делает:**
- Проверяет и освобождает порты 5173, 5174, 8787
- Убивает процессы, занимающие эти порты
- Позволяет избежать ошибок "port already in use"

---

### `generate-favicon.ts`
**Назначение:** Генерация favicon для сайта.

**Использование:**
```bash
npx tsx backend/scripts/generate-favicon.ts
```

**Что делает:**
- Генерирует favicon из исходного изображения
- Создаёт различные размеры и форматы
- Сохраняет в `frontend/public/`

---

### `build-data-snapshot.ts`
**Назначение:** Создание снимка данных для быстрой загрузки.

**Использование:**
```bash
npx tsx backend/scripts/build-data-snapshot.ts
```

**Что делает:**
- Создаёт сжатый снимок данных `data/v1/`
- Используется для оптимизации загрузки в dev-режиме

---

## Web Archive скрипты (`backend/scripts/web-archive/`)

### `parse-calendar-{year}.ts`
**Назначение:** Парсинг календаря конкретного года из web.archive.org.

**Использование:**
```bash
npx tsx backend/scripts/web-archive/parse-calendar-2023.ts
```

**Что делает:**
- Читает HTML файл календаря из `WebArchiveResults/calendars/calendar-{year}.html`
- Извлекает события, даты, названия, места проведения
- Сохраняет в `data/v1/calendar/{year}.json`

**Когда запускать:**
- При добавлении нового года в календарь
- При исправлении ошибок парсинга календаря

### `add-missing-{year}-events.ts`
**Назначение:** Добавление недостающих событий из web.archive.org в календарь.

**Использование:**
```bash
npx tsx backend/scripts/web-archive/add-missing-2023-events.ts
```

**Что делает:**
- Сравнивает календарь в `data/v1/` с web.archive.org
- Добавляет пропущенные события
- Обновляет существующие события новыми данными

### `update-competition-rank-discipline.ts`
**Назначение:** Обновление полей `rank_code`, `discipline_code` и нормализация названий в файлах соревнований.

**Использование:**
```bash
npx tsx backend/scripts/web-archive/update-competition-rank-discipline.ts
```

**Что делает:**
- Сканирует все файлы `data/v1/competitions/**/*.json`
- Добавляет `rank_code` и `discipline_code` на основе названий
- Применяет `normalizeTitle()` для стандартизации названий
- Использует `backend/lib/rank-discipline-mapping.ts`

**Когда запускать:**
- После изменения логики маппинга рангов/дисциплин
- После обновления правил нормализации названий

---

## Миграции (`backend/scripts/migrate/`)

### `dedupe-calendar-v1.ts`
**Назначение:** Удаление дубликатов событий из календаря.

**Использование:**
```bash
npx tsx backend/scripts/migrate/dedupe-calendar-v1.ts
```

**Что делает:**
- Находит дубликаты событий по ключу идентификации
- Удаляет дубликаты, оставляя один экземпляр
- Создаёт отчёт о удалённых событиях

### `remove-archive-extra-ids.ts`
**Назначение:** Удаление лишних ID из архива.

**Использование:**
```bash
npx tsx backend/scripts/migrate/remove-archive-extra-ids.ts
```

**Что делает:**
- Находит и удаляет события с некорректными ID
- Исправляет проблемы импорта из архива

---

## Индексы (`backend/scripts/` корень)

### `build-derived-indexes.ts`
**Назначение:** Построение всех производных индексов.

**Использование:**
```bash
npx tsx backend/scripts/build-derived-indexes.ts
```

**Что делает:**
- `indexes/years.json` - список годов
- `indexes/top-placement-*.json` - топ по местам
- `indexes/top-score-*.json` - топ по очкам
- `indexes/top-speed-*.json` - топ по скорости
- `indexes/judges-summary.json` - сводка по судьям
- `indexes/judges-raw-rows.json` - сырые данные судей
- `indexes/judge-details/{key}.json` - детальная информация по судьям
- `indexes/dog-profiles/{id}.json` - профили собак
- `frontend/public/sitemap.xml` - карта сайта

**Когда запускать:**
- **Обязательно** после любых изменений в `data/v1/competitions/` или `data/v1/dogs/`
- После изменения логики расчёта рейтингов
- Перед деплоем в прод

**Откуда берёт данные:** sqlite из `data/v1/pc-db.sqlite` (см. `build-data-snapshot`). Таблица `results` должна заполняться из `competitions/*.json` в `load-sqlite.ts` — иначе индексы на проде будут пустыми.

### `build-data-snapshot.ts`
**Назначение:** Собрать `data/v1/pc-db.sqlite` из JSON (`backend/lib/local-data/load-sqlite.ts`).

```bash
npm run build-data-snapshot
```

**Проверка:** в логе `results` должен быть **> 0**. Если `results: 0` — не деплоить.

### `build-all-data.ts`
**Назначение:** Полный CI-пайплайн: calendar-index → snapshot → derived indexes → package Pages.

```bash
npm run build-all-data
```

Валидирует непустые `top-placement-all` и `judges-summary`. В CI: `static-indexes.test.ts`.

### `rebuild-calendar-index.ts`
**Назначение:** Перестройка индекса календаря.

**Использование:**
```bash
npx tsx backend/scripts/rebuild-calendar-index.ts
```

**Что делает:**
- Объединяет все файлы `calendar/{year}.json` в один индекс
- Создаёт `indexes/calendar-index.json`

**Когда запускать:**
- После изменения структуры файлов календаря
- После добавления/удаления годов

---

## Скрипты Донино (`backend/scripts/speed/`)

### `fetch-speed-records.ts`
**Назначение:** Загрузка записей скорости из Google Sheets.

**Использование:**
```bash
npx tsx backend/scripts/speed/fetch-speed-records.ts
```

**Что делает:**
- Подключается к Google Sheets API
- Загружает данные о замерах скорости
- Сохраняет в `data/v1/donino/speed_records.json`

### `fetch-coursing-records.ts`
**Назначение:** Загрузка записей бега 350м из Google Sheets.

**Использование:**
```bash
npx tsx backend/scripts/speed/fetch-coursing-records.ts
```

**Что делает:**
- Загружает данные о бегах 350м
- Сохраняет в `data/v1/donino/coursing_records.json`

---

## CI скрипты (`backend/scripts/ci/`)

### `package-pages-snapshot.ts`
**Назначение:** Подготовка данных для деплоя на Cloudflare Pages.

**Использование:**
Запускается автоматически в GitHub Actions.

**Что делает:**
- Копирует `data/v1/` в `frontend/public/data/v1/`
- Создаёт сжатую версию для быстрой загрузки
- Подготавливает данные для CDN

---

## Тестовые скрипты (`backend/scripts/test/`)

### `test-parser.ts`
**Назначение:** Тестирование парсеров на эталонных HTML.

**Использование:**
```bash
npx tsx backend/scripts/test/test-parser.ts
```

**Что делает:**
- Загружает эталонные HTML из `backend/tests/fixtures/`
- Запускает парсер
- Сравнивает результат с ожидаемым

### `smoke-api.ts`
**Назначение:** Быстрая проверка API.

**Использование:**
```bash
npx tsx backend/scripts/test/smoke-api.ts
```

**Что делает:**
- Делает запросы к основным эндпоинтам
- Проверяет валидность ответов
- Сообщает об ошибках

---

## Общие рекомендации

1. **После правок данных** всегда запускайте `npm run build-all-data`
2. **Перед деплоем** проверяйте все индексы
3. **Для точечных исправлений** используйте `fix-event-*.ts` вместо полного перепарсинга
4. **После миграций** сохраняйте отчёты для аудита
5. **Тестируйте парсеры** на эталонных данных перед применением к реальным данным
