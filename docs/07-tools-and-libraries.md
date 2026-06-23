# 07. Tools and Libraries — Инструменты и библиотеки

## Зависимости (package.json)

```json
{
  "dependencies": {
    "cheerio": "^1.0.0",
    "iconv-lite": "^0.6.3"
  }
}
```

## Библиотеки

### cheerio
- **Назначение:** Парсинг HTML (jQuery-like API)
- **Использование:** Извлечение данных из DOM-структуры страниц
- **Пример:**
  ```javascript
  import * as cheerio from "cheerio";
  const $ = cheerio.load(html);
  const text = $("table tr td").text();
  ```

### iconv-lite
- **Назначение:** Декодирование windows-1251 → UTF-8
- **Критично:** Сайт procoursing.ru не отдаёт charset в заголовках
- **Использование:** В `fetch-win1251.mjs`
- **Пример:**
  ```javascript
  import iconv from "iconv-lite";
  const ab = await res.arrayBuffer();
  const buf = iconv.Buffer.from(ab);
  return iconv.decode(buf, "win1251");
  ```

## Встроенные модули Node.js

- `fs` / `fs/promises` — работа с файлами
- `node:fs/promises` — промис-версия fs
- `path` — работа с путями файлов

## Инструменты для разработки

### Тестирование парсера
```bash
node scripts/test-parser.mjs
```

### Запуск парсера на одной странице
```bash
node parse-results-coursing.mjs <url>
```

### Скрапинг индекса года
```bash
node scrape-year-index.mjs
```

## Планируемые зависимости

### Для Cloudflare Worker
- `@cloudflare/workers-types` — TypeScript типы
- `wrangler` — CLI для деплоя

### Для фронтенда (Pages)
- React + Vite
- TailwindCSS
- shadcn/ui
- Lucide (иконки)

### Для D1
- Cloudflare D1 REST API (через fetch)

## Инструменты отладки

- `console.log(JSON.stringify(data, null, 2))` — красивый вывод JSON
- `console.table()` — табличный вывод массивов
- Сохранение промежуточных результатов в файлы для инспекции
