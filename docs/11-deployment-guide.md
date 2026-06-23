# 11. Руководство по развертыванию

## Шаг 1: GitHub

### 1.1 Создать репозиторий
1. Зайди на https://github.com/new
2. Название: `procoursing-stats` (или любое другое)
3. Сделай публичным или приватным (по желанию)
4. Не инициализируй README, .gitignore, license (у нас уже есть)
5. Нажми "Create repository"

### 1.2 Залить файлы
```bash
git init
git add .
git commit -m "Initial commit: parsers and documentation"
git branch -M main
git remote add origin https://github.com/ТВОЙ_ЮЗЕР/procoursing-stats.git
git push -u origin main
```

---

## Шаг 2: Cloudflare D1

### 2.1 Установить Wrangler (если не установлен)
```bash
npm install -g wrangler
```

### 2.2 Авторизоваться в Cloudflare
```bash
wrangler login
```

### 2.3 Создать D1 базу данных
```bash
wrangler d1 create procoursing-db
```

Скопируй `database_id` из вывода — он понадобится в `wrangler.toml`.

### 2.4 Создать wrangler.toml
Создай файл `wrangler.toml` в корне проекта:

```toml
name = "procoursing-stats"
main = "src/worker.js"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "procoursing-db"
database_id = "ВАШ_DATABASE_ID_ОТСЮДА"
```

### 2.5 Создать таблицы в D1
```bash
# Локально (для тестирования)
wrangler d1 execute procoursing-db --local --file=./schema.sql

# Продакшн
wrangler d1 execute procoursing-db --file=./schema.sql
```

---

## Шаг 3: Загрузка данных

### 3.1 Скрапинг индекса событий
```bash
npm run scrape-index
```
Создаст `events.json` со списком всех событий.

### 3.2 Генерация SQL для загрузки событий
```bash
npm run load-events
```
Создаст `load-events.sql` с INSERT-запросами.

### 3.3 Загрузка событий в D1
```bash
# Локально
wrangler d1 execute procoursing-db --local --file=./load-events.sql

# Продакшн
wrangler d1 execute procoursing-db --file=./load-events.sql
```

### 3.4 Загрузка результатов (это займёт время!)
```bash
npm run load-results
```
- Скрипт пройдёт по всем событиям с results_url
- Парсит каждую страницу (с паузой 1 сек между запросами)
- Создаст `load-results.sql` с INSERT-запросами для dogs и results

**Внимание:** Это может занять 10-30 минут в зависимости от количества событий.

### 3.5 Загрузка результатов в D1
```bash
# Локально
wrangler d1 execute procoursing-db --local --file=./load-results.sql

# Продакшн
wrangler d1 execute procoursing-db --file=./load-results.sql
```

---

## Шаг 4: Cloudflare Worker API

### 4.1 Создать файл worker.js
Создай папку `src` и файл `src/worker.js`:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // API эндпоинты
    if (path.startsWith('/api/')) {
      return handleAPI(request, env, url);
    }
    
    return new Response('Not found', { status: 404 });
  }
};

async function handleAPI(request, env, url) {
  const path = url.pathname;
  const db = env.DB;
  
  // GET /api/top/placement?breed=&year=&minStarts=
  if (path === '/api/top/placement') {
    const breed = url.searchParams.get('breed') || '';
    const year = url.searchParams.get('year') || '';
    const minStarts = url.searchParams.get('minStarts') || '0';
    
    let query = `
      SELECT * FROM v_top_by_placement
      WHERE total_starts >= ?
    `;
    const params = [minStarts];
    
    if (breed) {
      query += ' AND breed = ?';
      params.push(breed);
    }
    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }
    
    const { results } = await db.prepare(query).bind(...params).all();
    return Response.json(results);
  }
  
  // GET /api/top/score?breed=&year=&minStarts=
  if (path === '/api/top/score') {
    const breed = url.searchParams.get('breed') || '';
    const year = url.searchParams.get('year') || '';
    const minStarts = url.searchParams.get('minStarts') || '0';
    
    let query = `
      SELECT * FROM v_top_by_score
      WHERE total_starts >= ?
    `;
    const params = [minStarts];
    
    if (breed) {
      query += ' AND breed = ?';
      params.push(breed);
    }
    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }
    
    const { results } = await db.prepare(query).bind(...params).all();
    return Response.json(results);
  }
  
  // GET /api/dogs/:id
  if (path.startsWith('/api/dogs/')) {
    const dogId = path.split('/')[3];
    const query = `
      SELECT d.*, r.*, e.*
      FROM dogs d
      JOIN results r ON d.id = r.dog_id
      JOIN events e ON r.event_id = e.id
      WHERE d.id = ?
      ORDER BY e.date_start DESC
    `;
    const { results } = await db.prepare(query).bind(dogId).all();
    return Response.json(results);
  }
  
  // GET /api/breeds
  if (path === '/api/breeds') {
    const { results } = await db.prepare('SELECT DISTINCT breed FROM dogs ORDER BY breed').all();
    return Response.json(results);
  }
  
  // GET /api/years
  if (path === '/api/years') {
    const { results } = await db.prepare('SELECT DISTINCT year FROM events ORDER BY year DESC').all();
    return Response.json(results);
  }
  
  return new Response('API endpoint not found', { status: 404 });
}
```

### 4.2 Деплой Worker
```bash
wrangler deploy
```

---

## Шаг 5: Cloudflare Pages (фронтенд)

### 5.1 Подключить GitHub к Cloudflare Pages
1. Зайди в Cloudflare Dashboard → Pages
2. Нажми "Create a project"
3. Выбери "Connect to Git"
4. Выбери свой репозиторий `procoursing-stats`
5. Настройки билда:
   - Build command: `npm run build` (пока нет, оставь пустым)
   - Build output directory: `dist` (пока нет, оставь пустым)
6. Нажми "Save and Deploy"

**Примечание:** Фронтенд ещё не создан — это следующий этап.

---

## Локальное тестирование

### SQLite (без Cloudflare)
Если хочешь тестировать локально без Cloudflare:

```bash
# Установить better-sqlite3
npm install better-sqlite3

# Создать базу
sqlite3 procoursing.db < schema.sql

# Загрузить данные
sqlite3 procoursing.db < load-events.sql
sqlite3 procoursing.db < load-results.sql

# Проверить
sqlite3 procoursing.db "SELECT COUNT(*) FROM events;"
sqlite3 procoursing.db "SELECT COUNT(*) FROM dogs;"
sqlite3 procoursing.db "SELECT COUNT(*) FROM results;"
```

---

## Проверка после загрузки

```bash
# Проверить количество событий
wrangler d1 execute procoursing-db --command="SELECT COUNT(*) FROM events"

# Проверить количество собак
wrangler d1 execute procoursing-db --command="SELECT COUNT(*) FROM dogs"

# Проверить количество результатов
wrangler d1 execute procoursing-db --command="SELECT COUNT(*) FROM results"

# Проверить топ по местам
wrangler d1 execute procoursing-db --command="SELECT * FROM v_top_by_placement LIMIT 10"
```

---

## Что нужно от тебя сейчас

1. **Создать GitHub репозиторий** и залить файлы
2. **Создать D1 базу в Cloudflare** и выполнить `schema.sql`
3. **Запустить `npm run load-events`** и загрузить события в D1
4. **Запустить `npm run load-results`** (это займёт время) и загрузить результаты в D1

После этого данные будут в базе, и можно будет создавать Worker API и фронтенд.
