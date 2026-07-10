# Troubleshooting — Решение проблем

> **ИИ:** правила парсинга — [14-PARSING-RULES.md](14-PARSING-RULES.md). Workflow D1 — [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md). Runtime данные — [03-DATA.md](03-DATA.md).

Типичные проблемы и их решения при работе с Coursing Stats.

---

## Пустой рейтинг/судьи на проде

### Симптом
Локально рейтинг, судьи и данные в `data/v1/indexes/` полные; на **coursing-stats.ru** — пустые списки. CDN отдавал `200` и JSON вида `"count": 0`, `"judges": []`.

### Причина
`npm run build-all-data` в CI:
1. `build-data-snapshot` → `loadLocalDataSqlite()` собирал sqlite из JSON
2. В `load-sqlite.ts` функция `loadCompetitions()` **не загружала** `results[]` из `competitions/*.json` (временный skip)
3. `build-derived-indexes` строил топы/судей из пустой таблицы `results`
4. `package-pages-snapshot` деплоил пустые `indexes/` поверх хороших файлов из git

### Решение
- **`load-sqlite.ts`:** загрузка `results` из `competitions/`; `event_id` из файла; `dog` из вложенного объекта; `PRAGMA foreign_keys = OFF` при сборке snapshot
- **`build-all-data.ts`:** fatal, если `top-placement-all` или `judges-summary` пустые после пересборки
- **CI:** `vitest run backend/tests/static-indexes.test.ts` после `build-all-data`
- **Документация:** `docs/03-DATA.md` → «Диагностика: локально есть данные, на проде пусто»

### Диагностика
```bash
# Проверить локальные индексы
cat data/v1/indexes/top-placement-all.json
cat data/v1/indexes/judges-summary.json

# Пересобрать индексы
npm run build-all-data

# Проверить после пересборки
cat data/v1/indexes/top-placement-all.json
```

---

## Ошибка парсинга windows-1251

### Симптом
Битая кириллица при парсинге procoursing.ru

### Причина
Сайт procoursing.ru использует windows-1251 без charset в заголовках. `fetch().text()` не декодирует правильно.

### Решение
Использовать `iconv-lite` для декодирования из байт:
```typescript
import iconv from 'iconv-lite';
import fetch from 'node-fetch';

const response = await fetch(url);
const buffer = await response.buffer();
const html = iconv.decode(buffer, 'win1251');
```

Реализация: `backend/lib/fetch-win1251.ts`

---

## Ошибка `D1_RESET_DO` при заливке на remote

### Симптом
```
X [ERROR] {"D1_RESET_DO":true}
```

### Причина
Durable Object, хранящий D1, **перезапустился** во время bulk import. Типичные причины:
1. Слишком большой файл (~6 MB reparse)
2. Нарушение UNIQUE / FOREIGN KEY
3. Зависший import endpoint

### Решение
Разбить SQL на батчи:
```bash
npx tsx backend/scripts/load/split-sql-batches.ts data/updates/reparse-2025.sql
npx wrangler d1 execute pc-db --remote --file=./data/updates/reparse-2025-batches/batch-01.sql
```

---

## Проблемы с sync-to-remote

### Симптом
Синхронизация local D1 → remote D1 не работает

### Причины
1. Разные event_id после изменения `results_url`
2. FOREIGN KEY constraint failed
3. Сетевые проблемы

### Решение
1. Генерировать reparse **после** load-events и **с той же БД**
2. Проверить event_id в SQL
3. Перегенерировать reparse с `--remote`

---

## Ошибки в CI/CD

### Симптом
GitHub Actions workflow failing

### Типичные проблемы
1. Отсутствие секретов (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
2. Превышение лимитов D1 (5M rows read в сутки)
3. Пустые индексы после build-all-data

### Решение
1. Проверить secrets в GitHub Settings
2. Использовать `npm run dev` вместо `dev:d1` для снижения нагрузки
3. Добавить тест `static-indexes.test.ts` в CI

---

## Проблемы с админкой

### Симптом
Админка не сохраняет данные

### Причины
1. Отсутствие ADMIN_API_TOKEN
2. Неверный X-Admin-Token header
3. Проблемы с sync-sqlite-to-v1

### Решение
1. Установить ADMIN_API_TOKEN в .env.local
2. Проверить header в запросе
3. Запустить `npm run sync-sqlite-to-v1`

---

## Проблемы с парсерами

### Симптом
Парсер возвращает 0 записей или ошибки

### Типичные проблемы
1. Изменение формата HTML на procoursing.ru
2. Неправильное определение event_type
3. Проблемы с декодированием windows-1251

### Решение
1. Скачать новые фикстуры: `npx tsx backend/scripts/test/download-fixtures.ts`
2. Запустить тесты: `npm run test-parser-fixtures`
3. Проверить формат HTML в фикстурах
4. Обновить парсер при необходимости

---

## Проблемы с деплоем Cloudflare Pages

### Симптом
Сайт не обновляется после push

### Причины
1. CI workflow не запустился
2. Ошибка в build-all-data
3. Проблемы с Cloudflare API

### Решение
1. Проверить GitHub Actions logs
2. Запустить локально: `npm run build-all-data`
3. Проверить секреты Cloudflare

---

## Проблемы с E2E тестами

### Симптом
Playwright тесты failing

### Типичные проблемы
1. Dev сервер не запустился
2. Отсутствие данных в `data/v1/`
3. Таймауты

### Решение
1. Проверить `npm run dev` запускается
2. Запустить `npm run export-local-data -- --local`
3. Увеличить таймауты в playwright.config.ts

---

## См. также

- [03-DATA.md](03-DATA.md) — Диагностика данных
- [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md) — Workflow D1
- [14-PARSING-RULES.md](14-PARSING-RULES.md) — Правила парсинга
- [08-TESTING.md](08-TESTING.md) — Тестирование
