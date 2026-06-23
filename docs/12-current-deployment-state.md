# 12. Текущее состояние развертывания

## GitHub
- **Репозиторий:** https://github.com/antajl/ProCoursing
- **Ветка:** main
- **Статус:** Активный, файлы загружены

## Cloudflare Pages
- **Название проекта:** procoursing
- **URL:** https://procoursing.pages.dev
- **Статус:** Создан, но фронтенд ещё не разработан
- **Подключение:** Подключён к GitHub репозиторию antajl/ProCoursing

## Cloudflare Worker API
- **URL:** https://procoursing-stats.antajltube.workers.dev
- **Статус:** Активен, эндпоинты работают
- **Эндпоинты:**
  - `GET /api/top/placement?breed=&year=&minStarts=`
  - `GET /api/top/score?breed=&year=&minStarts=`
  - `GET /api/dogs/:id`
  - `GET /api/breeds`
  - `GET /api/years`
  - `GET /api/events`

## Cloudflare D1
- **Название базы данных:** pc-db
- **Database ID:** a5d6d4ad-7fc5-41b4-a33b-05f4daa382d4
- **Статус:** Активен, данные загружены
- **Размер:** 3.42 MB

## Текущие данные в D1
- **События (events):** 225 записей
- **Собаки (dogs):** 460 записей
- **Результаты (results):** 811 записей

### Детали данных
- **Период:** 2015-2026 (все годы)
- **Типы событий:** Coursing, BZMP, Racing
- **Загружено:** Только события с results_url (16 событий из 225 имеют результаты)
- **Примечание:** Это только 2026 год. Для полного бэкафилла 2015-2025 нужно запустить скрапер на все годы.

## Файлы конфигурации

### wrangler.toml
```toml
name = "procoursing-stats"
main = "src/worker.js"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "pc-db"
database_id = "a5d6d4ad-7fc5-41b4-a33b-05f4daa382d4"
```

### package.json
- **Зависимости:** cheerio, iconv-lite
- **Скрипты:**
  - `scrape-index` — скрапинг индекса событий
  - `parse-coursing` — парсинг результатов курсинга
  - `parse-bzmp` — парсинг результатов БЗМП
  - `parse-racing` — парсинг результатов бега
  - `load-events` — генерация SQL для загрузки событий
  - `load-results` — генерация SQL для загрузки результатов

## Следующие шаги

### 1. ✅ Cloudflare Worker API
- Создать файл `src/worker.js` с API эндпоинтами
- Деплой: `wrangler deploy`
- Статус: Завершено

### 2. Фронтенд
- Создать React приложение с TailwindCSS
- Компоненты:
  - Профиль собаки (история, график баллов, титулы)
  - Топ по местам (медальный зачёт)
  - Топ по очкам (лучший результат, средний, старты)
  - Фильтры (порода, год, минимум стартов)
- Деплой в Cloudflare Pages

### 3. Бэкафилл истории 2015-2025
- Запустить скрапер на все годы
- Загрузить результаты в D1
- Это может занять несколько часов

## Команды для работы

### Обновление данных
```bash
# Скрапинг индекса событий
npm run scrape-index

# Загрузка событий в D1
npm run load-events
wrangler d1 execute pc-db --remote --file=./load-events.sql

# Загрузка результатов в D1 (займёт время)
npm run load-results
wrangler d1 execute pc-db --remote --file=./load-results.sql
```

### Проверка данных
```bash
# Количество событий
wrangler d1 execute pc-db --remote --command="SELECT COUNT(*) FROM events"

# Количество собак
wrangler d1 execute pc-db --remote --command="SELECT COUNT(*) FROM dogs"

# Количество результатов
wrangler d1 execute pc-db --remote --command="SELECT COUNT(*) FROM results"

# Топ по местам
wrangler d1 execute pc-db --remote --command="SELECT * FROM v_top_by_placement LIMIT 10"

# Топ по очкам
wrangler d1 execute pc-db --remote --command="SELECT * FROM v_top_by_score LIMIT 10"
```

### Деплой Worker
```bash
# Создать src/worker.js
wrangler deploy
```

## Важные примечания

1. **Кодировка сайта:** procoursing.ru использует windows-1251, декодируется через iconv-lite
2. **Вежливость к сайту:** Пауза 1 сек между запросами при скрапинге
3. **Статусы собак:** Используется эвристика (нет bold-итога = нестандартный статус), raw_text сохраняется всегда
4. **Родословные:** Ссылка на https://saluki.breedarchive.com/ (пока не реализовано)
5. **Два рейтинга:** По местам (медальный зачёт) и по очкам — не сводить в одну формулу

## Проблемы и решения

### Исправленные проблемы
1. ✅ Кодировка windows-1251 — исправлено через iconv-lite
2. ✅ Парсер для markdown вместо HTML — переписан для cheerio
3. ✅ NULL constraint для event_type — определяется из results_url
4. ✅ Отсутствие колонки vc в results — добавлена в schema.sql

### Известные ограничения
- Загружены только события 2026 года с результатами
- Для полного архива 2015-2025 нужен бэкафилл
- Фронтенд ещё не создан
