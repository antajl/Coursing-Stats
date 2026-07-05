# Coursing Stats

Агрегатор статистики по собакам, участвовавшим в состязаниях [procoursing.ru](http://procoursing.ru)
(курсинг, БЗМП, бега/трасса) за все годы (2015–2026).

## Документация

Полная документация в папке **[docs/](docs/README.md)**:

| Раздел | Файл |
|--------|------|
| Статус проекта | [docs/00-PROJECT-STATUS.md](docs/00-PROJECT-STATUS.md) |
| Бренд и инфраструктура | [docs/BRANDING-INFRA.md](docs/BRANDING-INFRA.md) |
| Быстрый старт | [docs/01-QUICK-START.md](docs/01-QUICK-START.md) |
| ИИ-агент | [docs/ai/GUIDELINES.md](docs/ai/GUIDELINES.md), [docs/ai/MEMORY-SETUP.md](docs/ai/MEMORY-SETUP.md) |
| Архитектура | [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md), [API](docs/architecture/API-REFERENCE.md) |
| Данные | [docs/data/PARSING.md](docs/data/PARSING.md), [docs/data/DATABASE.md](docs/data/DATABASE.md) |
| Разработка | [docs/development/DEVELOPMENT.md](docs/development/DEVELOPMENT.md), [FRONTEND-MAP](docs/development/FRONTEND-MAP.md) |
| Планы | [docs/plans/FUTURE-PLANS.md](docs/plans/FUTURE-PLANS.md) |

Оглавление: **[docs/README.md](docs/README.md)**

## Быстрый старт

```bash
npm install
npm run dev          # Worker :8787 + Vite :5173, remote D1
npm run test-parser
npm run test-parser-fixtures
```

## Продакшн

| | |
|--|--|
| **Сайт** | https://coursing-stats.ru |
| **API** | https://api.coursing-stats.ru |
| **GitHub** | https://github.com/antajl/Coursing-Stats |

Подробности: [docs/BRANDING-INFRA.md](docs/BRANDING-INFRA.md)

## Лицензия

MIT
