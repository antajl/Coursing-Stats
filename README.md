# Coursing Stats

Агрегатор статистики по собакам, участвовавшим в состязаниях [procoursing.ru](http://procoursing.ru)
(курсинг, БЗМП, бега/трасса) за все годы (2015–2026).

## Документация

⚠️ **Для ИИ-агентов:** rules/skills своей среды (`.devin/` или `.cursor/`), затем [docs/00-AI-GUIDE.md](docs/00-AI-GUIDE.md) и [docs/README.md](docs/README.md).

Полная документация в папке **[docs/](docs/README.md)**:

| Раздел | Файл |
|--------|------|
| Быстрый старт / runbook | [docs/01-GETTING-STARTED.md](docs/01-GETTING-STARTED.md), [docs/20-OPERATIONS.md](docs/20-OPERATIONS.md) |
| ИИ-агент | [docs/00-AI-GUIDE.md](docs/00-AI-GUIDE.md) (`.devin/` или `.cursor/`) |
| Архитектура | [docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md) |
| Данные | [docs/03-DATA.md](docs/03-DATA.md), [docs/03a-DATA-DIAGNOSTICS.md](docs/03a-DATA-DIAGNOSTICS.md) |
| Backend / локальная разработка | [docs/04-DEVELOPMENT.md](docs/04-DEVELOPMENT.md) |
| Фронтенд | [docs/04-FRONTEND.md](docs/04-FRONTEND.md) |
| SEO | [docs/07-SEO.md](docs/07-SEO.md) |
| Донино | [docs/09-SPEED-RECORDS.md](docs/09-SPEED-RECORDS.md), [docs/09a-DONINO-PIPELINE.md](docs/09a-DONINO-PIPELINE.md) |

Оглавление: **[docs/README.md](docs/README.md)**

## Быстрый старт

```bash
npm install
npm run dev          # Vite :5173 + admin :8787 (data/v1/ на диске)
npm run test-parser
npm run test-parser-fixtures
```

## Продакшн

| | |
|--|--|
| **Сайт** | https://coursing-stats.ru |
| **Данные** | https://coursing-stats.ru/data/v1/ |
| **GitHub** | https://github.com/antajl/Coursing-Stats |

Подробности: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Лицензия

MIT
