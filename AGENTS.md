# AGENTS.md — AI Agent Entry Point & Invariant Router

> Read this first, then **[docs/MAP.md](docs/MAP.md)** for task → cheatsheet routing.  
> Detailed domain invariants live in **[docs/invariants/](docs/invariants/)**. Code is source of truth for implementation details.

---

## Quick Start (30 seconds)

1. **[docs/ROADMAP.md](docs/ROADMAP.md)** — План развития и 4 ветки рефакторинга (читать обязательно)
2. **[docs/MAP.md](docs/MAP.md)** — Куда смотреть (detailed task → file router)
3. **[docs/invariants/](docs/invariants/)** — Специализированные каталоги инвариантов по 7 доменам
4. **[docs/GLOSSARY.md](docs/GLOSSARY.md)** — Глоссарий, термины и понятия
5. **[docs/sheets/](docs/sheets/)** — Шпаргалки 00–16
6. **[docs/decisions/](docs/decisions/)** — Почему приняты решения (ADRs)
7. **Skills:** `.agents/skills/*/SKILL.md` — Domain-specific skills (включая `competition-ingest`, `old-money-design`, `smart-commit-and-learn`)

---

## Core Principles & Skills

### Guiding Principles (соблюдать всегда):
- **ponytail** — самое простое рабочее решение (YAGNI, stdlib first, минимум кода и зависимостей).
- **unslop** — постоянная защита интерфейса от «AI-мусора» (vibecoded slop): строго запрещены фиолетовые/неоновые градиенты, цветные размытия (glow/blob), случайные отступы, кричащий капс и шаблонные бейджи. Только осознанный, выверенный крафт, где хром спокоен, а акцент держит контент.
- **verification-before-completion** — обязательная проверка тестами и сборкой ПЕРЕД тем, как заявить о готовности.
- **incremental-implementation** — разработка тонкими вертикальными слоями с верификацией каждого шага.
- **file-budget (< 300 строк)** — размер одного файла в коде (компонент, страница, утилита) не должен превышать 250–300 строк. При приближении к лимиту сразу декомпозировать: выносить подкомпоненты, хуки (`use*`), утилиты и типы в отдельные файлы. Запрещено плодить «файлы-мамонты».

### Automatic Domain Skills (.agents/skills/*):
- **old-money-design** — правила эстетики Old Money (строго zero эмодзи, палитра camel, Lucide icons, touch targets ≥ 44px).
- **unslop** — очистка и превращение AI-кода в авторский интерфейс продукта (`.agents/skills/unslop/SKILL.md`).
- **smart-commit-and-learn** — фиксация инвариантов и атомарные Conventional Commits на английском языке по запросу.
- **competition-ingest** — пайплайн безопасного ввода протоколов и соревнований.

---

## Project Overview

CoursingStats — статистика соревнований (procoursing), выставок РКФ, замеров Донино + Telegram bot.

**Прод:** https://coursing-stats.ru · **CDN:** `/data/v1/` · **GitHub:** antajl/Coursing-Stats  
**Стратегия:** см. [`docs/ROADMAP.md`](docs/ROADMAP.md) (4 ветки разработки).

---

## Fundamental Architecture Facts (The 10 Immutable Truths)

| Факт | Описание |
|------|----------|
| **Public site** | Чистый статический JSON с CDN — **никаких** Worker/D1 рантаймов и БД в проде |
| **Hosting** | **Yandex Object Storage** (`deploy.yml` CI sync) |
| **S3 Cache policy** | `/assets/*` 1y immutable, HTML no-cache, `/data/v1/` 1h ([sheet 09](docs/sheets/09-ops-deploy.md)) |
| **Data Truth** | `data/v1/` в git является источником правды |
| **Zero Turso** | Turso полностью удален. Все 56 225 протоколов выставок отдаются статически из Яндекс S3 CDN gzip (`/data/v1/shows/protocols/{id}.json`) |
| **CDN packs** | Профили собак в паках `dog-profiles/pack-*`, судьи выставок в `judge-details/pack-*` ([ADR-014](docs/decisions/014-cdn-packs-vs-turso.md)) |
| **Incremental SEO** | Хабы (~180 стр.) заливаются на каждый деплой, а ~25k entity HTML (`dog/`, `event/`, `exhibitions/`, `judges/`, `donino-dog/`) отвязаны от чанк-хэшей через `/assets/loader.js` и обновляются дельтой по `_seo-state.json.gz` |
| **Asset Compression** | Хэшированные JS/CSS в `/assets/*` предварительно сжимаются gzip level 9 (`yarn compress-assets`) |
| **Package manager** | Строго **yarn@1.22.22** (не npm, не Yarn v4 PnP) |
| **Calendars** | Включены в `data/v1/ui-flags.json` (competitions + shows) |

---

## Domain Invariants Router (Куда обращаться за правилами)

Все детальные правила и инварианты, накопленные в проекте, структурированы по 7 доменным каталогам. При решении задач в конкретной области агент обязан изучать соответствующий файл:

| Домен | Файл инвариантов | Что содержит |
|-------|------------------|--------------|
| **UI, верстка, дизайн** | [docs/invariants/ui-design.md](docs/invariants/ui-design.md) | Old Money стиль, палитра, типографика, FLIP-анимации QuickBreedBar, 120 FPS карусели, скролл, touch targets ≥ 44px, карточки |
| **Соревнования и бега** | [docs/invariants/competitions-racing.md](docs/invariants/competitions-racing.md) | Протоколы курсинга/рейсинга, попоны (bibs), забеги (не старты), медали, зачет сезона vs CS-v2, титулы |
| **Выставки РКФ** | [docs/invariants/shows-rkf.md](docs/invariants/shows-rkf.md) | 56k протоколов, Главный ринг (Main Ring), парсинг PDF, нормализация судей, топ-100 всех времен |
| **Донино** | [docs/invariants/donino.md](docs/invariants/donino.md) | Замеры скорости km/h vs 350m, чемпионаты, синхронизация Google Sheets, домен runningdog.ru |
| **Судьи (спорт и выставки)** | [docs/invariants/judges.md](docs/invariants/judges.md) | Профили судей, Proper Case фамилий, расчет строгости, ленивая отрисовка спойлеров (chunking 25-30) |
| **Идентичность собак** | [docs/invariants/dogs-identity.md](docs/invariants/dogs-identity.md) | Связи спорт↔выставки (`competition-links.json`), двуязычные клички, дедупликация, фильтрация собак без результатов |
| **Ops, деплой, тесты** | [docs/invariants/ops-deploy.md](docs/invariants/ops-deploy.md) | S3 деплой, кэширование, пререндер, Vite dev стриминг, запрет живых HTTP-запросов в юнит-тестах |

---

## Universal Forbidden Rules (Строгие глобальные запреты)

- **Строго ZERO эмодзи** в интерфейсе, коде, коммитах, документации и PR (эстетика Old Money).
- **Строгий запрет на автоматический git push:** по триггеру «лёрн и коммит» выполняются исключительно локальное извлечение инвариантов и атомарные коммиты. Команда `git push origin main` выполняется **строго** при отдельном прямом запросе пользователя («пуш», «запушь», «git push»). Для данных и сайта (`data/v1/`, `frontend/`) действует **правило ежемесячного пакета (1 раз в ~28–30 дней)** для экономии биллинга Яндекс S3: новые соревнования, выставки и пересборки индексов копятся локально. Перед пушем в S3 агент **обязан** проверить дату последнего деплоя в `origin/main` и предупредить пользователя, если прошло `< 28` дней. Изменения ботов и трекера (`bot/**`, `rkf-tracker/**`) игнорируются Яндекс S3 (`paths-ignore`) и деплоятся в Cloudflare Workers бесплатно без ограничений по частоте.
- **Запрещено внедрять серверные БД (Turso, D1, Postgres)** в публичный рантайм сайта (только статический CDN).
- **Запрещены неизолированные живые HTTP-запросы** в юнит-тестах без оффлайн-фикстур или моков.
- **Запрещено создавать собак и протоколы вручную в обход** `yarn ingest-competition`.
- **Запрещено использовать Co-Authored-By**, бот-авторство или коммитить от имени сторонних бот-аккаунтов.
- **Запрещено смешивать домены:** результаты Донино никогда не попадают в спорт или выставки.
- **Запрещено использовать эпитет «официальный»** применительно к проекту CoursingStats, боту или сайту.

---

## Critical Commands

```bash
yarn dev                      # Vite dev-сервер :5173
cd frontend; yarn build       # Проверка типов TypeScript и сборки React-фронтенда
yarn test:fast                # Быстрый прогон тестов (3 сек, Vitest)
yarn test                     # Полный прогон всех тестов (~13 сек)
yarn run ingest-competition <draft.json> # Безопасный импорт состязания с авто-сопоставлением
yarn export-protocol <eventId> [outDir]  # Экспорт векторного HTML/PDF протокола
yarn run build-all-data       # Полная пересборка всех индексов и publish-gates (тяжелая)
cd bot; yarn test; yarn build # Проверка Telegram-бота
```
*В PowerShell разделять команды через `;`, а не `&&`.*

---

## Протокол «Лёрн и коммит» (Learn & Commit Protocol)

Когда пользователь пишет **«лёрн и коммит»** (или вариации *«learn and commit»*, *«закоммить»*), агент автономно выполняет шаги 1–3 **строго локально, без git push**:

### 1. Анализ и извлечение инвариантов (Learn)
- Проанализировать всю проделанную в диалоге работу: какие архитектурные решения приняты, какие баги устранены, какие правила верстки или доменные ограничения согласованы.
- Сформулировать новые правила четко и лаконично (проблема → решение/инвариант → затрагиваемые файлы).
- **МАРШРУТИЗАЦИЯ:** строго **НЕ** загромождать `AGENTS.md`. Новые инварианты записываются в соответствующий файл из `docs/invariants/<domain>.md` (и при необходимости в `docs/sheets/`). В `AGENTS.md` добавляются исключительно глобальные изменения архитектурного масштаба всего проекта.

### 2. Верификация чистоты и качества
- Проверить `git status` и `git diff`: убедиться в отсутствии мусорных файлов, логов отладки (`console.log`) и лишних правок.
- Запустить `yarn test:fast` (или `yarn test` при изменениях в данных/парсерах). Код обязан быть зеленым.

### 3. Атомарные коммиты (Smart Atomic Commits)
- Разбить изменения на независимые логические коммиты (`git add <files>`):
  - `docs(learn): <описание нового правила>` — коммит для документации инвариантов;
  - `fix(<scope>): <описание исправления>` — коммит для багфикса;
  - `feat(<scope>): <описание фичи>` — коммит для новой функциональности;
  - `refactor(<scope>): ...`, `perf(<scope>): ...`, `data(<scope>): ...`.
- **Стандарт:** Conventional Commits на английском языке, в повелительном наклонении настоящего времени, строчными буквами, без точки в конце и **строго без эмодзи**. Запрещен составной союз "and" (разбивать на два коммита).
- Вывести пользователю отчет о сохраненных инвариантах и локальных коммитах.

### 4. Протокол «Пуш» (Push Protocol — ежемесячный S3 vs бесплатный Cloudflare)
- Команда `git push origin main` выполняется **только** по прямому запросу пользователя («пуш», «запушь», «git push»). Авто-пуш при «лёрн и коммит» строго запрещен.
- **Сайт и данные (`frontend/**`, `data/v1/**`, `.github/workflows/deploy.yml`):** правило **1 пуша в ~28–30 дней**. Новые соревнования, выставки и массовые пересборки индексов копятся в локальных коммитах и выгружаются раз в месяц. Перед выполнением `git push origin main` агент **обязан** проверить дату последнего S3-коммита (`git log -1 origin/main -- . ':!bot' ':!rkf-tracker' --format="%ci %h %s"`): если с последнего пуша прошло `< 28` дней, агент останавливается, сообщает точную дату и сколько дней прошло, и пушит **только** после повторного явного согласия пользователя (например, для срочного бага на проде).
- **Донино и план 2027:** обновляются автоматически 2 раза в день через `update-speed-records.yml` (точечная заливка ~2–4 файлов, 0 ₽).
- **Боты и микросервисы (`bot/**`, `rkf-tracker/**`):** воркфлоу Яндекс S3 их игнорирует (`paths-ignore`). Изменения в них деплоятся бесплатно в Cloudflare Workers (`deploy-bot.yml`, `deploy-tracker-bot.yml`) в любой момент.

---

## Done When

| Область | Критерий готовности |
|---------|---------------------|
| **Фронтенд (UI)** | `cd frontend; yarn build` проходит без ошибок TypeScript и сборки Vite |
| **Сайт / данные** | `yarn run build-all-data` + `yarn test:fast` проходят успешно |
| **Бот** | `cd bot; yarn run build` + `yarn test` зеленые |
| **Парсеры** | `yarn run test-parser-fixtures` проходит |
| **Соревнования** | `backend/tests/competition-integrity.test.ts` (0 дубликатов, 100% привязка к календарю) |
| **Документация** | Новые инварианты распределены по `docs/invariants/`, `AGENTS.md` остается компактным (< 20 КБ) |
