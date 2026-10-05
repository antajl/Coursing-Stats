---
title: CoursingStats Glossary
description: Core project terminology, concepts, acronyms, and invariants
verified: 2026-10-05
---

# Глоссарий CoursingStats

Единый справочник терминов, сокращений и архитектурных понятий проекта для людей и AI-агентов.

---

## 1. Домены и данные

| Термин | Определение | См. также |
|--------|-------------|-----------|
| **Competitions (Соревнования)** | Спортивные мероприятия по беговым дисциплинам борзых (курсинг, БЗМП, бега по кругу/рейсинг) из архивов ProCoursing и секретариатов. | [sheets/03-competitions.md](sheets/03-competitions.md) |
| **Exhibitions / Shows (Выставки)** | Выставки собак РКФ (ранги ЧРКФ, ЧФ, КЧФ, САС, монопородные). Протоколы строятся на базе каталогов и отчетов РКФ. Субдомен полностью изолирован от спорта. | [sheets/04-shows.md](sheets/04-shows.md), [sheets/01-three-domains.md](sheets/01-three-domains.md) |
| **Donino (Донино)** | Отдельный домен замеров: беговые рекорды скорости (км/ч) и круговой трек 350м (секунды). Замеры не смешиваются с официальными состязаниями. | [sheets/05-donino.md](sheets/05-donino.md) |
| **RKF (РКФ)** | Российская кинологическая федерация. Источник официальных каталогов и отчетов выставок. | [sheets/04-shows.md](sheets/04-shows.md) |
| **ProCoursing** | Исторический первоисточник беговых протоколов 2015–2024 гг. При его неактивности проект выступает независимым общественным архивом. | [COMMUNITY_CHRONICLE_2026.md](COMMUNITY_CHRONICLE_2026.md) |
| **CS rating** | Балльный рейтинг (`cs-v1`), рассчитываемый по спортивным коэффициентам соревнований. Категорически отделен от медального зачета. | [sheets/03-competitions.md](sheets/03-competitions.md) |
| **Judges (Судьи)** | Спортивные судьи курсинга/рейсинга и судьи выставок РКФ ведутся в **раздельных** реестрах и имеют разные профили. | [sheets/01-three-domains.md](sheets/01-three-domains.md) |

---

## 2. Архитектура и инфраструктура

| Термин | Определение | См. также |
|--------|-------------|-----------|
| **CDN-only** | Архитектурный принцип публичного сайта: фронтенд читает только статичный JSON по пути `/data/v1/`. На проде сайта нет активного бекенда, D1 или серверного runtime. | [sheets/00-overview.md](sheets/00-overview.md), [sheets/02-data-pipeline.md](sheets/02-data-pipeline.md) |
| **Yandex Object Storage** | Текущий постоянный хостинг фронтенда и статических данных CDN (`https://storage.yandexcloud.net`). Деплоится автоматически через GitHub Actions (`deploy.yml`). | [sheets/09-ops-deploy.md](sheets/09-ops-deploy.md), [ADR-001](decisions/001-cloudflare-pages-hosting.md) |
| **Cloudflare Pages** | Предыдущий хостинг статики (заменен на Yandex Object Storage для стабильной доступности в РФ без VPN). | [ADR-001](decisions/001-cloudflare-pages-hosting.md) |
| **Cloudflare Workers** | Среда исполнения Telegram-бота (`@coursing_stats_bot`). В веб-части сайта не используется. | [sheets/08-bot.md](sheets/08-bot.md) |
| **CDN Pack** | Шардированные JSON-паки (`pack-000.json` … `pack-255.json`), содержащие профили собак (`dog-profiles`) и судей выставок. Позволяют обойти лимиты числа файлов при деплое. | [ADR-014](decisions/014-cdn-packs-vs-turso.md), `backend/lib/cdn-packs.ts` |
| **Turso (libSQL)** | Облачная база данных libSQL, используемая **исключительно** как fallback для отдачи тяжелых протоколов выставок РКФ (`getShowExhibition`). Все рейтинги остаются на CDN. | [sheets/04-shows.md](sheets/04-shows.md), [ADR-009](decisions/009-turso-migration.md) |
| **JSON Indexes** | Производные индексные файлы в `data/v1/indexes/` и `shows/indexes/`, собираемые скриптом `yarn build-all-data`. | [sheets/02-data-pipeline.md](sheets/02-data-pipeline.md) |
| **publish-exclude** | Список путей и паттернов (`backend/scripts/publish/publish-exclude.js`), исключаемых из публикации на CDN (например, сырые `dogs/by-id`, громоздкие протоколы). | [sheets/02-data-pipeline.md](sheets/02-data-pipeline.md) |
| **React Query** | Библиотека кэширования и запросов на клиенте для динамической загрузки протоколов выставок, календарей и шардов. | [sheets/07-frontend.md](sheets/07-frontend.md), [ADR-002](decisions/002-react-query-data-fetching.md) |
| **Old Money Design** | Дизайн-система проекта: строгая эстетика, бежево-карамельная палитра (camel, sand, cream), типографика serif/sans, векторные Lucide иконки, **полный запрет эмодзи**. | [sheets/14-design-system.md](sheets/14-design-system.md), [.agents/skills/old-money-design](../.agents/skills/old-money-design/SKILL.md) |

---

## 3. Акронимы

| Акроним | Расшифровка |
|---------|-------------|
| **ADR** | Architecture Decision Record (архитектурные решения в `docs/decisions/`) |
| **БЗМП** | Бег за механической приманкой (синоним/разновидность курсинга) |
| **РКФ / RKF** | Российская кинологическая федерация |
| **CDN** | Content Delivery Network |
| **CS** | Coursing Stats (балльный рейтинг очков `cs-v1`) |
| **KV** | Workers Key-Value хранилище (кэш в Cloudflare для Telegram-бота) |
| **MCP** | Model Context Protocol |

---

## 4. Ключевые инварианты («Законы проекта»)

1. **`medals ≠ points`**: Медальный зачет (подиумы/места) и балльный рейтинг CS — две разные спортивные метрики. Их объединение в единый показатель запрещено.
2. **Неизменность спортивного архива**: Результаты официальных сертификатных соревнований и выставок являются открытыми публичными фактами. Выборочное удаление результатов по запросу владельцев запрещено, так как это нарушает объективность спортивной статистики.
3. **Строгая независимость трёх доменов**: Данные соревнований, выставок РКФ и замеров Донино хранятся независимо, идентификаторы не смешиваются.
4. **Безопасный импорт**: Добавление новых соревнований выполняется через `yarn run ingest-competition`, что исключает появление собак-сирот и фантомных дубликатов.
