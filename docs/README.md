# CoursingStats Documentation

> База знаний и техническая документация проекта **CoursingStats** — независимого архива соревнований по беговым дисциплинам борзых (курсинг, БЗМП, рейсинг), сертификатных выставок РКФ, замеров Донино и Telegram-бота.

---

## Навигация (куда смотреть)

| Документ | Назначение |
|----------|------------|
| **[MAP.md](MAP.md)** | **Главный навигатор (роутер):** таблица «Задача → 1 файл». Начните отсюда |
| **[ROADMAP.md](ROADMAP.md)** | Стратегический план развития и 4 ветки рефакторинга |
| **[invariants/](invariants/)** | Каталоги технических инвариантов по 7 доменам (UI, спорт, выставки, Донино, судьи, собаки, ops) |
| **[GLOSSARY.md](GLOSSARY.md)** | Термины, акронимы и ключевые цинологические понятия («Законы проекта») |
| **[COMMUNITY_CHRONICLE_2026.md](COMMUNITY_CHRONICLE_2026.md)** | Хроника сообщества, ProCoursing, обращения владельцев и правовой статус |
| **[AGENTS.md](../AGENTS.md)** | Точка входа для AI-агентов, системные факты и протокол «лёрн и коммит» |

---

## Каталоги инвариантов (`docs/invariants/`)

Жесткие технические правила и ограничения по каждому направлению разработки:

- **[ui-design.md](invariants/ui-design.md)** — Old Money дизайн, цвета, типографика, FLIP-анимации, 120 FPS карусели, touch targets ≥ 44px
- **[competitions-racing.md](invariants/competitions-racing.md)** — курсинг, рейсинг, попоны (bibs), забеги (не старты), медали, зачет сезона vs CS-v2
- **[shows-rkf.md](invariants/shows-rkf.md)** — 56k статических протоколов, Главный ринг (Main Ring), парсинг PDF, нормализация судей
- **[donino.md](invariants/donino.md)** — замеры скорости km/h vs 350m, чемпионаты, синхронизация Google Sheets, домен runningdog.ru
- **[judges.md](invariants/judges.md)** — профили судей, Proper Case фамилий, расчет строгости, ленивая отрисовка списков (chunking 25–30)
- **[dogs-identity.md](invariants/dogs-identity.md)** — связи спорт↔выставки (`competition-links.json`), двуязычные клички, фильтрация собак без результатов
- **[ops-deploy.md](invariants/ops-deploy.md)** — S3 CDN, двухуровневый пререндер, gzip сжатие, Vite dev стриминг, запрет живых HTTP в тестах

---

## Шпаргалки по разделам (`docs/sheets/`)

Архитектурное устройство компонентов и модулей:

- **[00 — Overview](sheets/00-overview.md)** — архитектура, стек, ограничения
- **[01 — Three Domains](sheets/01-three-domains.md)** — границы Соревнований, Выставок и Донино
- **[02 — Data Pipeline](sheets/02-data-pipeline.md)** — сборка `data/v1`, индексы, CDN packs, publish-gates
- **[03 — Competitions](sheets/03-competitions.md)** — курсинг, БЗМП, рейсинг, медали ≠ очки CS, профили `/dog/:id`
- **[04 — Shows](sheets/04-shows.md)** — выставки РКФ, протоколы S3 CDN, судьи
- **[05 — Donino](sheets/05-donino.md)** — замеры скорости (км/ч) и круговой трек 350м (секунды)
- **[06 — Parsers](sheets/06-parsers.md)** — парсеры procoursing.ru (windows-1251) и PDF РКФ
- **[07 — Frontend](sheets/07-frontend.md)** — React, Vite, Tailwind CSS, маршруты, React Query
- **[08 — Bot](sheets/08-bot.md)** — Telegram-бот `@coursing_stats_bot` (Cloudflare Workers + Grammy + KV)
- **[09 — Ops & Deployment](sheets/09-ops-deploy.md)** — CI/CD в GitHub Actions, деплой на Yandex Object Storage
- **[10 — Security](sheets/10-security.md)** — секреты, правила публикации, защита персональных данных
- **[11 — Testing](sheets/11-testing.md)** — запуск тестов, проверка фикстур, валидация данных
- **[12 — Agent Skills](sheets/12-agent-skills.md)** — правила и навыки для автономных AI-ассистентов
- **[13 — Racing Standards](sheets/13-racing-standards.md)** — стандарты бегов по кругу: пол, ростовые классы, кворумы
- **[14 — Design System](sheets/14-design-system.md)** — дизайн-система Old Money: цвета, типографика, Lucide, FHD/2K адаптив, запрет эмодзи
- **[15 — SEO & Analytics](sheets/15-seo-analytics.md)** — Search Console, Яндекс.Вебмастер, поведение мобильных пользователей
- **[16 — Protocol Template](sheets/16-protocol-template.md)** — стандарт вёрстки и оцифровки официальных протоколов (HTML / PDF)

---

## Архитектурные решения (`docs/decisions/`)

История ключевых технических выборов (ADRs):

- **[ADR-001](decisions/001-cloudflare-pages-hosting.md)** — Эволюция хостинга: Cloudflare Pages → Yandex Object Storage
- **[ADR-002](decisions/002-react-query-data-fetching.md)** — React Query для клиентских запросов
- **[ADR-003](decisions/003-sqlite-json-indexes.md)** — Сборка JSON-индексов через SQLite в памяти
- **[ADR-004](decisions/004-home-page-refactoring.md)** — Рефакторинг главной страницы
- **[ADR-005](decisions/005-telegram-bot-integration.md)** — Интеграция Telegram-бота
- **[ADR-006](decisions/006-pdf-processing-optimization.md)** — Оптимизация обработки PDF выставок
- **[ADR-007](decisions/007-exhibitions-rkf-sqlite-migration.md)** — *[Superseded]* Миграция каталогов РКФ в SQLite (заменено на статический S3 CDN)
- **[ADR-008](decisions/008-unified-event-structure.md)** — *[Deprecated]* Унификация структуры событий
- **[ADR-009](decisions/009-turso-migration.md)** — *[Superseded]* Хранение протоколов выставок в Turso libSQL (Turso полностью удален, заменен на S3 CDN)
- **[ADR-010](decisions/010-automatic-rkf-monitoring.md)** — *[Deprecated]* Автомониторинг календаря РКФ
- **[ADR-012](decisions/012-typescript-strict-and-structured-logging.md)** — Строгий TypeScript и структурированное логирование
- **[ADR-013](decisions/013-ai-readable-documentation-architecture.md)** — Архитектура документации (MAP + sheets)
- **[ADR-014](decisions/014-cdn-packs-vs-turso.md)** — Шардированные CDN packs против базы данных для публичной статики
- **[ADR-015](decisions/015-legacy-code-cleanup.md)** — Удаление устаревшего кода и исторических артефактов (Archive, Turso, Elo)
