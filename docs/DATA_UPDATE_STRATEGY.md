# Стратегия обновления данных ProCoursing Stats

## Оптимальный подход

**Гибридная стратегия:**
- **Исторические годы (2015-2025):** Полный бэкафилл один раз, без обновлений
- **Текущий год (2026):** Инкрементальные обновления через Cron Trigger

---

## Почему это лучший подход

### Преимущества:
1. **Эффективность:** Исторические данные не меняются, нет смысла их перепроверять
2. **Актуальность:** Текущий год всегда содержит свежие данные
3. **Производительность:** Минимум запросов к сайту-источнику
4. **Простота:** Разные стратегии для разных типов данных

### Альтернативы и почему они хуже:

**Вариант 1: Полный бэкафилл всех годов регулярно**
- ❌ Неэффективно - исторические данные не меняются
- ❌ Большая нагрузка на сайт-источник
- ❌ Долгое время выполнения

**Вариант 2: Инкрементальные обновления для всех годов**
- ❌ Сложнее в реализации
- ❌ Лишняя сложность для статических исторических данных
- ❌ Все равно нужен начальный бэкафилл

---

## Реализация

### 1. Скрипт бэкафилла исторических годов (один раз)

**Файл:** `scripts/backfill-historical.mjs`

**Функционал:**
- Скрапинг данных за 2015-2025 годы
- Полная загрузка всех событий и результатов
- Запись в базу данных
- Логирование прогресса

**Запуск:**
```bash
node scripts/backfill-historical.mjs
```

**Вывод:**
- Создает `events-historical.json` с данными за все исторические годы
- Показывает прогресс по каждому году
- Вежливые паузы между запросами (2 секунды)

**Далее:**
```bash
node scripts/load-events.mjs events-historical.json
node scripts/load-results.mjs
npx wrangler d1 execute pc-db --local --file=./load-events.sql
npx wrangler d1 execute pc-db --local --file=./load-results.sql
```

---

### 2. Скрипт инкрементального обновления текущего года

**Файл:** `scripts/update-current-year.mjs`

**Функционал:**
- Скрапинг только текущего года
- Проверка изменений через HTTP HEAD запросы и Last-Modified
- Загрузка только изменившихся страниц
- Обновление базы данных

**Запуск:**
```bash
node scripts/update-current-year.mjs
```

**Вывод:**
- Создает `events-current.json` с данными за текущий год
- Проверяет Last-Modified для каждого события с результатами
- Показывает какие страницы изменились
- Вежливые паузы между запросами (0.5 секунды)

**Далее:**
```bash
node scripts/load-events.mjs events-current.json
node scripts/load-results.mjs
npx wrangler d1 execute pc-db --local --file=./load-events.sql
npx wrangler d1 execute pc-db --local --file=./load-results.sql
```

---

### 3. Cron Trigger для автоматического обновления

**Файл:** `src/worker.js`

**Настройка:**
```javascript
async scheduled(event, env, ctx) {
  console.log('Scheduled event triggered:', event.cron);
  // TODO: Implement data update logic here
}
```

**wrangler.toml:**
```toml
[triggers]
crons = ["0 2 * * 1"]  # Каждый понедельник в 2 AM UTC
```

**Текущее состояние:**
- Cron Trigger настроен на еженедельное выполнение (понедельник, 2 AM UTC)
- Логика обновления пока не реализована в Worker
- Для автоматического обновления нужно:
  1. Вызывать внешний API для запуска скрипта
  2. Или реализовать логику скрапинга в Worker
  3. Или использовать webhook для запуска на отдельном сервере

---

## План действий

### Этап 1: Бэкафилл исторических годов (один раз)
1. ✅ Создать `scripts/backfill-historical.mjs`
2. ✅ Запустить для годов 2015-2025
3. ⏳ Проверить корректность данных
4. ⏳ Сохранить в базу данных

### Этап 2: Инкрементальные обновления текущего года
1. ✅ Создать `scripts/update-current-year.mjs`
2. ✅ Реализовать проверку Last-Modified
3. ✅ Добавить Cron Trigger в worker.js
4. ✅ Настроить расписание (раз в неделю)
5. ⏳ Реализовать автоматическое обновление через Cron

### Этап 3: Мониторинг
1. ⏳ Логирование обновлений
2. ⏳ Оповещения об ошибках
3. ⏳ Проверка целостности данных

---

## Технические детали

### Проверка изменений через HEAD запросы

**Функция:**
```javascript
async function checkLastModified(url) {
  const response = await fetch(url, { method: 'HEAD' });
  const lastModified = response.headers.get('Last-Modified');
  return lastModified ? new Date(lastModified) : null;
}
```

**Хранение в БД:**
```sql
ALTER TABLE events ADD COLUMN last_modified TEXT;
```

**Использование:**
- Скрипт проверяет Last-Modified для каждого события с результатами
- Сохраняет дату в поле `last_modified`
- При следующем запуске сравнивает с сохраненной датой
- Обновляет только если дата изменилась

---

## Использование скриптов

### Для исторических годов (один раз)

```bash
# 1. Запуск скрипта бэкафилла
node scripts/backfill-historical.mjs

# 2. Загрузка событий в базу
node scripts/load-events.mjs events-historical.json

# 3. Загрузка результатов
node scripts/load-results.mjs

# 4. Применение SQL скриптов к базе
npx wrangler d1 execute pc-db --local --file=./load-events.sql
npx wrangler d1 execute pc-db --local --file=./load-results.sql
```

### Для текущего года (регулярно)

```bash
# 1. Запуск скрипта обновления
node scripts/update-current-year.mjs

# 2. Загрузка событий в базу
node scripts/load-events.mjs events-current.json

# 3. Загрузка результатов
node scripts/load-results.mjs

# 4. Применение SQL скриптов к базе
npx wrangler d1 execute pc-db --local --file=./load-events.sql
npx wrangler d1 execute pc-db --local --file=./load-results.sql
```

### Для автоматического обновления (через Cron)

**Вариант 1: Внешний сервер**
- Настроить webhook на внешнем сервере
- Cron Trigger вызывает webhook
- Webhook запускает `node scripts/update-current-year.mjs`

**Вариант 2: Реализация в Worker**
- Перенести логику скрапинга в Worker
- Cron Trigger запускает обновление напрямую
- Сложнее из-за ограничений Worker

**Вариант 3: GitHub Actions** ✅ Реализовано
- Workflow: `.github/workflows/update-db.yml`
- Скрипт: `backend/scripts/ci-update-db.mjs`
- Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- Расписание: понедельник 03:00 UTC + `workflow_dispatch`

---

## Резюме

**Рекомендуемая стратегия:**
- Исторические года (2015-2025): Полный бэкафилл один раз
- Текущий год (2026): Инкрементальные обновления через Cron Trigger

**Преимущества:**
- ✅ Минимальная нагрузка на сайт-источник
- ✅ Всегда актуальные данные за текущий год
- ✅ Стабильные исторические данные
- ✅ Простота реализации и поддержки

**Статус реализации:**
- ✅ Скрипт бэкафилла исторических годов создан
- ✅ Скрипт инкрементального обновления создан
- ✅ Колонка `last_modified` добавлена в БД
- ✅ Cron Trigger настроен в worker.js (логирование)
- ✅ GitHub Actions для автоматического обновления
- ✅ Полный синк local → remote (`sync-local-to-remote.mjs`)
