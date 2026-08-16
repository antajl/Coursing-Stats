# Coursing Stats

Агрегатор статистики по собакам, участвовавшим в состязаниях [procoursing.ru](http://procoursing.ru)
(курсинг, БЗМП, бега/трасса) за все годы (2015–2026) и выставках РКФ (2019–2026).

## Статистика данных

**Соревнования (курсинг, БЗМП, бега):**
- 200+ соревнований (2015–2026)
- 150+ с результатами
- 1,500+ собак
- 3,700+ результатов
- 256 dog-profiles pack файлов

**Выставки РКФ:**
- 60,000+ выставок
- 1,500,000+ собак в рейтинге
- ~18M записей на ринге
- 50,000+ выставок с PDF отчётом (85%+)

**Донино (замеры скорости):**
- 200+ замеров скорости
- 100+ замеров курсинга (350 м)

## Документация

- **Агенты:** [`AGENTS.md`](AGENTS.md) → [`docs/MAP.md`](docs/MAP.md) → [`docs/sheets/`](docs/sheets/)
- **Hub:** [`docs/README.md`](docs/README.md)
- **ADRs:** [`docs/decisions/`](docs/decisions/)
- **llms.txt:** [`docs/llms.txt`](docs/llms.txt)
- **План улучшений:** [`docs/superpowers/plans/2025-01-15-comprehensive-design-improvement.md`](docs/superpowers/plans/2025-01-15-comprehensive-design-improvement.md) (Phases 1-7 completed)

| Тема | Шпаргалка |
|------|-----------|
| Три домена | [docs/sheets/01-three-domains.md](docs/sheets/01-three-domains.md) |
| Данные / indexes | [docs/sheets/02-data-pipeline.md](docs/sheets/02-data-pipeline.md) |
| Соревнования | [docs/sheets/03-competitions.md](docs/sheets/03-competitions.md) |
| Выставки / Turso | [docs/sheets/04-shows.md](docs/sheets/04-shows.md) |
| Донино | [docs/sheets/05-donino.md](docs/sheets/05-donino.md) |
| Парсеры | [docs/sheets/06-parsers.md](docs/sheets/06-parsers.md) |
| Frontend | [docs/sheets/07-frontend.md](docs/sheets/07-frontend.md) |
| Bot | [docs/sheets/08-bot.md](docs/sheets/08-bot.md) |
| Deploy / ops | [docs/sheets/09-ops-deploy.md](docs/sheets/09-ops-deploy.md) |
| Security | [docs/sheets/10-security.md](docs/sheets/10-security.md) |

## Быстрый старт

```bash
yarn install
yarn run dev          # Vite :5173 + admin :8787 (data/v1/ на диске)
yarn run test-parser
yarn run test-parser-fixtures
```

## Продакшн

| | |
|--|--|
| **Сайт** | https://coursing-stats.ru |
| **Данные** | https://coursing-stats.ru/data/v1/ |
| **GitHub** | https://github.com/antajl/Coursing-Stats |

Подробности: [docs/MAP.md](docs/MAP.md), [docs/sheets/00-overview.md](docs/sheets/00-overview.md)

## Лицензия

MIT
