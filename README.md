# Coursing Stats

Агрегатор статистики по собакам, участвовавшим в состязаниях [procoursing.ru](http://procoursing.ru)
(курсинг, БЗМП, бега/трасса) за все годы (2015–2026).

## Документация

⚠️ **Для ИИ-агентов:** Сначала прочитайте [.devin/rules/](.devin/rules/) и [.devin/skills/](.devin/skills/), затем docs/. См. [.devin/README.md](.devin/README.md).

Полная документация в папке **[docs/](docs/README.md)**:

| Раздел | Файл |
|--------|------|
| Быстрый старт | [docs/01-GETTING-STARTED.md](docs/01-GETTING-STARTED.md) |
| ИИ-агент | [.devin/README.md](.devin/README.md) → [docs/00-AI-GUIDE.md](docs/00-AI-GUIDE.md) |
| Архитектура | [docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md), [docs/05-API-REFERENCE.md](docs/05-API-REFERENCE.md) |
| Данные | [docs/03-DATA.md](docs/03-DATA.md), [docs/12-DATABASE-SCHEMA.md](docs/12-DATABASE-SCHEMA.md), [docs/14-PARSING-RULES.md](docs/14-PARSING-RULES.md) |
| Разработка | [docs/04-DEVELOPMENT.md](docs/04-DEVELOPMENT.md) |
| Дизайн | [docs/06-DESIGN-SYSTEM.md](docs/06-DESIGN-SYSTEM.md) |
| История | [docs/19-HISTORY.md](docs/19-HISTORY.md) |
| Планы | [docs/11-FUTURE-PLANS.md](docs/11-FUTURE-PLANS.md) |

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
