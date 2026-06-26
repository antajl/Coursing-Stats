# ProCoursing Stats

Агрегатор статистики по собакам, участвовавшим в состязаниях procoursing.ru
(курсинг, БЗМП, бега/трасса) за все годы (2015–2026).

## Документация

Полная документация проекта находится в папке `docs/`:

- **[docs/00-OVERVIEW.md](docs/00-OVERVIEW.md)** — Обзор проекта, стек, текущее состояние, деплой
- **[docs/01-AI-GUIDELINES.md](docs/01-AI-GUIDELINES.md)** — Правила для ИИ-агента
- **[docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md)** — Архитектура, БД, API, деплой
- **[docs/03-DEVELOPMENT.md](docs/03-DEVELOPMENT.md)** — Разработка, данные, парсинг

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Локальная разработка
npm run dev

# Тестирование парсера
npm run test-parser
```

## Деплой

- **Фронтенд:** https://procoursing.pages.dev (Cloudflare Pages)
- **API:** https://procoursing-stats.antajltube.workers.dev (Cloudflare Worker)
- **GitHub:** https://github.com/antajl/ProCoursing

## Лицензия

MIT
