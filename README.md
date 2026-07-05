# Coursing Stats

Агрегатор статистики по собакам, участвовавшим в состязаниях [procoursing.ru](http://procoursing.ru)
(курсинг, БЗМП, бега/трасса) за все годы (2015–2026).

## Документация

Полная документация в папке **[docs/](docs/README.md)**:

| Раздел | Файл |
|--------|------|
| Быстрый старт | [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) |
| ИИ-агент | [docs/AI-GUIDE.md](docs/AI-GUIDE.md) |
| Архитектура | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/API-REFERENCE.md](docs/API-REFERENCE.md) |
| Данные | [docs/PARSING.md](docs/PARSING.md), [docs/DATABASE.md](docs/DATABASE.md), [docs/SPEED-RECORDS.md](docs/SPEED-RECORDS.md) |
| Разработка | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| Дизайн | [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) |
| История | [docs/DECISIONS-LOG.md](docs/DECISIONS-LOG.md) |
| Планы | [docs/FUTURE-PLANS.md](docs/FUTURE-PLANS.md) |

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

Подробности: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Лицензия

MIT
