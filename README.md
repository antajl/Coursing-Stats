# ProCoursing Stats

Агрегатор статистики по собакам, участвовавшим в состязаниях procoursing.ru
(курсинг, БЗМП, бега/трасса) за все годы (2015–2026).

## Документация

Полная документация в папке **[docs/](docs/README.md)**:

| Раздел | Файл |
|--------|------|
| Статус проекта | [docs/00-PROJECT-STATUS.md](docs/00-PROJECT-STATUS.md) |
| Быстрый старт | [docs/01-QUICK-START.md](docs/01-QUICK-START.md) |
| ИИ-агент | [docs/ai/GUIDELINES.md](docs/ai/GUIDELINES.md), [docs/ai/MEMORY-SETUP.md](docs/ai/MEMORY-SETUP.md) |
| Архитектура | [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md), [API](docs/architecture/API-REFERENCE.md) |
| Данные | [docs/data/PARSING.md](docs/data/PARSING.md), [docs/data/DATABASE.md](docs/data/DATABASE.md) |
| Разработка | [docs/development/DEVELOPMENT.md](docs/development/DEVELOPMENT.md), [FRONTEND-MAP](docs/development/FRONTEND-MAP.md) |
| Планы | [docs/plans/FUTURE-PLANS.md](docs/plans/FUTURE-PLANS.md) |

Оглавление: **[docs/README.md](docs/README.md)**

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Локальная разработка (использует remote D1)
npm run dev

# Тестирование парсеров
npm run test-parser
npm run test-parser-fixtures
```

## Деплой

- **Фронтенд:** https://procoursing.antajl.ru (Cloudflare Pages)
- **API:** https://procoursing-stats.antajltube.workers.dev (Cloudflare Worker)
- **GitHub:** https://github.com/antajl/ProCoursing

## Новые функции (июль 2026)

### Админ-интерфейс для исторических данных
- **URL:** `/admin` - требует авторизацию через `ADMIN_API_TOKEN`
- **Функции:**
  - Просмотр и редактирование всех событий до 2026 года
  - Inline-редактирование результатов (место, очки, квалификация, статус)
  - CRUD операции для результатов
  - Фильтр по году для быстрого поиска
  - Изменения сохраняются сразу в D1 базу данных
- **API endpoints:** `/api/admin/events`, `/api/admin/events/:id/results`, `/api/admin/results/:id`
- **Авторизация:** Токен проверяется через API перед входом, хранится в localStorage
- **Документация:** [docs/CHANGES-2026-07-04.md](docs/CHANGES-2026-07-04.md)

### Новые функции (июнь 2026)

### Страница "Рекорды Донино"
- Две подвкладки: "Таблица" и "Статистика"
- **Два источника Google Sheets:** замер скорости (км/ч) и бега борзых 350 м (время, сек) — см. [docs/data/SPEED_RECORDS.md](docs/data/SPEED_RECORDS.md)
- **Вкладка "Таблица":**
  - Подвкладки «Замер скорости» и «Бега борзых» — разные листы и таблицы D1
  - Фильтрация по году, породе и полу (для скорости)
  - Поиск по кличке, породе, полу (с алиасами: сука/кабель/самка/самец), скорости и дате
  - Сортировка по всем колонкам с правильными стрелками (↓ для descending, ↑ для ascending)
  - Статусы: "новый результат" (new), "улучшение личного рекорда" (upd)
  - История предыдущих результатов при наведении на кличку
  - Экспорт в Excel (.xlsx) с разделением по ячейкам
- **Вкладка "Статистика":**
  - **Обзор** — замеры скорости (км/ч), гистограмма распределения
  - **Порода / Пол / Год** — зачёты бегов 350 м из листа курсинга (реальное время в сек, скорость = 1260/время)
  - Фильтры по году, породе, полу и диапазону скорости
  - Поиск собаки — статистика по курсингу 350 м
  - Все данные пересчитываются динамически при применении фильтров
- Автоматическое обновление speed через GitHub Actions (ежедневно); coursing — `fetch-coursing-records.ts --remote`

### Обновлённая навигация
- Минималистичный дизайн с анимированными подчёркиваниями
- Две основные вкладки: "Procoursing" и "Рекорды Донино"
- Вкладка "Procoursing" содержит подвкладки: "Календарь событий" и "Рейтинг собак"
- Old money цветовая палитра (cream, camel, charcoal, forest)

### Новый домен
- Фронтенд: https://procoursing.antajl.ru
- API: https://procoursing-stats.antajltube.workers.dev (временно, custom domain требует платного плана)

## Лицензия

MIT
