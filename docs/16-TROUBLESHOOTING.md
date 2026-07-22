# Troubleshooting — Решение проблем

> **ИИ:** правила парсинга — [14-PARSING-RULES.md](14-PARSING-RULES.md). Workflow D1 — [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md). Runtime данные — [03-DATA.md](03-DATA.md).

Типичные проблемы и их решения при работе с Coursing Stats.

---

## Пустой рейтинг/судьи на проде

### Симптом
Локально рейтинг и судьи полные; на **coursing-stats.ru** — пустые списки (`"count": 0`).

### Что делать

1. **Runbook:** [`20-OPERATIONS.md`](20-OPERATIONS.md) → «Пустой рейтинг / судьи на проде»
2. **Канон и причины:** [`03-DATA.md`](03-DATA.md) → «Диагностика: локально есть данные, на проде пусто»
3. **ADR:** [`19-HISTORY.md`](19-HISTORY.md) → 2026-07-09

```bash
npm run build-data-snapshot    # results > 0
npm run build-all-data
npx vitest run backend/tests/static-indexes.test.ts
```

---

## Белый экран после деплоя (JS MIME / chunk error)

### Симптом
Консоль: `Expected a JavaScript module… MIME type of "text/html"` или `Failed to fetch dynamically imported module` → белый экран.

### Причина
1. Во время деплоя `/assets/*.js` ещё нет → SPA `_redirects` отдавал `index.html` с **200**.
2. `_headers` ставил на `/assets/*` **immutable** на год → браузер кэшировал HTML как «JS».
3. Раньше чанки без хэша в имени (`MedalTally.js`) смешивались между деплоями.

### Защита (с 2026-07-22, уточнено)

- Vite: `assets/[name]-[hash].js` + build-stamp banner (новые имена после каждого CI)
- `_redirects`: только `/* /index.html 200` — **без** корневого `404.html` (иначе Pages отключает SPA и `/competitions` = 404)
- Не использовать `/assets/* → 404` в `_redirects` (на Pages rewrite со статусом 404 не поддерживается)
- HTML: `no-cache`; авто-reload при ошибке чанка

Если кэш уже отравлен: после деплоя с новым stamp хэши vendor-чанков сменятся сами; при залипании — инкогнито один раз.

Канон: [`20-OPERATIONS.md`](20-OPERATIONS.md) → «Кэш фронта», [`04-DEVELOPMENT.md`](04-DEVELOPMENT.md) → SPA / Vite.

---

## Донино: локально новые собаки, на проде старые

### Симптом
После `scripts/update-donino.bat` / `npm run export-donino` на `localhost` видны свежие записи, на **coursing-stats.ru** — прежние.

### Причина
Экспорт пишет только в **локальный** `data/v1/donino/*.json`. Прод читает **CDN** с последнего успешного **Pages deploy** (push в `main` → CI). Пока JSON не в git и не задеплоен — прод не меняется.

Дополнительно:
- Cron `update-speed-records.yml` обновляет **только** `speed_records.json` (замер), **не** `coursing_records.json` (350 м).
- React Query / вкладка браузера может держать старый JSON несколько минут.

### Решение
```bash
scripts\update-donino.bat          # обе таблицы
# проверить data/v1/donino/speed_records.json и coursing_records.json
scripts\deploy-to-github.bat       # commit + pull --rebase + push → CI Pages
```

Сверить: `count` в локальном файле vs `https://coursing-stats.ru/data/v1/donino/speed_records.json`.

Канон: [`09-SPEED-RECORDS.md`](09-SPEED-RECORDS.md) → «Локальное обновление», [`20-OPERATIONS.md`](20-OPERATIONS.md).

---

## Выставки: пустой рейтинг / чемпионы на проде, календарь тормозит

### Причина
- All-time `dog-ranking.json` > **25 MB** — лимит файла Cloudflare Pages; на CDN его нет (SPA HTML). UI по умолчанию грузит **год**, «все года» — склейка `dog-ranking-{year}.json`.
- Старый календарь последовательно качал ~90 полных `exhibitions/*.json` — медленно на CDN. Сейчас — лёгкие `shows/calendar/{year}.json`.

Канон: [`03-DATA.md`](03-DATA.md) → «Выставки», [`SHOWS.md`](SHOWS.md).

---

## Нет кнопки «Breed Archive» в профиле собаки

### Симптом
В `dogs/by-id/{id}.json` есть `pedigree_url`, на `/dog/{id}` chip не показывается.

### Причина (типичная)
Публичный UI читает **`indexes/dog-profiles/{id}.json`**, не `dogs/by-id/` напрямую. Индекс мог быть устаревшим или собран только из sqlite (где дубли `UNIQUE(name_lat, breed)` «съедают» часть id).

### Решение
```bash
npm run build-all-data
# проверка
node -e "console.log(JSON.parse(require('fs').readFileSync('data/v1/indexes/dog-profiles/5782.json')).dog.pedigree_url)"
```

Если в `by-id` ссылки нет — сначала enrich:
```bash
npm run enrich-breedarchive-urls -- --dog-id 5782
npm run build-all-data
```

Подробнее: `docs/03-DATA.md` → «Breed Archive и pedigree_url».

---

## В списке пород рейтинга «18» или лишние породы

### Симптом
В фильтре **Порода** на рейтинге есть `18`, дубли написания или породы без собак в таблице.

### Причина
Старый UI читал **`breeds.json`** (все `breed` из D1). Значение **`18`** — не порода, а ошибка парсера (номер каталога в поле `breed` у собаки id 602).

### Решение (с 2026-07-11)
Рейтинг использует **`useCompetingBreeds()`** → `indexes/dogs-index.json`, `deriveCompetingBreeds()` — только `competition_count > 0`, без `/^\d+$/`, список **отсортирован по числу собак в породе**.

Если на проде всё ещё старый список — не задеплоен фронт. `breeds.json` в git можно не трогать; он для legacy API.

Подробнее: `docs/03-DATA.md` → «Породы в UI».

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
2. Убедиться, что в репозитории есть `data/v1/` (после clone) или выполнить `npm run build-all-data`
3. Увеличить таймауты в playwright.config.ts

---

## См. также

- [20-OPERATIONS.md](20-OPERATIONS.md) — Runbook деплоя и диагностики
- [03-DATA.md](03-DATA.md) — Диагностика данных (канон)
- [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md) — Workflow D1
- [14-PARSING-RULES.md](14-PARSING-RULES.md) — Правила парсинга
- [08-TESTING.md](08-TESTING.md) — Тестирование
