# Документация Coursing Stats

Агрегатор статистики собак с [procoursing.ru](https://procoursing.ru) (курсинг, БЗМП, бега), 2015–2026.

**Прод:** https://coursing-stats.ru · **Данные:** `/data/v1/` на CDN · **GitHub:** https://github.com/antajl/Coursing-Stats

---

## 🤖 Для ИИ-агентов — порядок чтения

Читай **в этом порядке** перед любой работой:

| # | Файл | Зачем |
|---|------|-------|
| 1 | **[00-AI-GUIDE.md](00-AI-GUIDE.md)** | Правила, запреты, `.devin/` или `.cursor/` |
| 2 | **[03-DATA.md](03-DATA.md)** | Где лежат данные, workflow |
| 3 | **[02-ARCHITECTURE.md](02-ARCHITECTURE.md)** | Компоненты, стек (high-level) |
| 4 | *по задаче* | см. таблицу ниже |

**Не читай всё подряд** — открой только нужный раздел.

**Runbook:** [20-OPERATIONS.md](20-OPERATIONS.md) (деплой, прод сломан, enrich)

---

## Правило документирования (без дублей)

| Тип | Канон | В остальных файлах |
|-----|-------|---------------------|
| Данные, indexes, enrich | **03-DATA.md** | ссылка |
| Диагностика пустого рейтинга | **03a-DATA-DIAGNOSTICS.md** | ссылка |
| Деплой, чеклисты | **20-OPERATIONS.md** | ссылка |
| UI, маршруты, **главная v2**, public surface / ui-flags | **04-FRONTEND.md** | ссылка |
| SEO / sitemap | **07-SEO.md** | ссылка |
| Донино модель/UI | **09-SPEED-RECORDS.md** | ссылка |
| Донино пайплайн | **09a-DONINO-PIPELINE.md** | ссылка |
| Выставки CDN/парсинг | **SHOWS.md** | кратко в 03-DATA |
| Симптом → fix | **16-TROUBLESHOOTING.md** | кратко + ссылка на канон |
| Backend scripts / npm | **11-DEVELOPMENT.md** | ссылка |
| D1 схема/workflow | stubs **12** / **13** → [`archive/`](archive/README.md) | не читать без импорта |

---

## Карта документов по задаче

### Основное (00–11, 20)
| Задача | Документ |
|--------|----------|
| Запуск, npm | [01-GETTING-STARTED.md](01-GETTING-STARTED.md), [20-OPERATIONS.md](20-OPERATIONS.md) |
| Backend scripts, локальная разработка | [11-DEVELOPMENT.md](11-DEVELOPMENT.md) |
| Фронтенд, компоненты, маршруты, главная | **[04-FRONTEND.md](04-FRONTEND.md)** |
| Архитектура, стек | [02-ARCHITECTURE.md](02-ARCHITECTURE.md) |
| Данные, админка, `data/v1/` | **[03-DATA.md](03-DATA.md)** |
| Breed Archive / `pedigree_url` | [03-DATA.md](03-DATA.md) → «Breed Archive» |
| Пустой рейтинг/судьи на проде | [03a-DATA-DIAGNOSTICS.md](03a-DATA-DIAGNOSTICS.md), [20-OPERATIONS.md](20-OPERATIONS.md) |
| Белый экран / MIME JS после деплоя | [16-TROUBLESHOOTING.md](16-TROUBLESHOOTING.md), [20-OPERATIONS.md](20-OPERATIONS.md) → «Кэш фронта» |
| Донино локально ≠ прод | [16-TROUBLESHOOTING.md](16-TROUBLESHOOTING.md), [09a-DONINO-PIPELINE.md](09a-DONINO-PIPELINE.md) |
| Выставки: PDF / CDN / UI | **[SHOWS.md](SHOWS.md)** (судьи: список % отлично / порог 30, профили) |
| Выставки: LC scrape (Playwright) | [SHOWS-RKF.md](SHOWS-RKF.md) (группы FCI — секция в том же файле) |
| Публичный UI: календари / ui-flags / протоколы | **[04-FRONTEND.md](04-FRONTEND.md)** → «Public surface» |
| Локальный API (админка) | [05-API-REFERENCE.md](05-API-REFERENCE.md) |
| UI, цвета, тёмная тема | [06-DESIGN-SYSTEM.md](06-DESIGN-SYSTEM.md) |
| Фильтры рейтинга | [03-DATA.md](03-DATA.md) → «Породы в UI», [18-CODE-PATTERNS.md](18-CODE-PATTERNS.md) |
| Индекс CS («по очкам») | [03-DATA.md](03-DATA.md) → «top-score», [18-CODE-PATTERNS.md](18-CODE-PATTERNS.md), `/guide?tab=rating` |
| SEO, sitemap, Метрика | **[07-SEO.md](07-SEO.md)** |
| Тесты | [08-TESTING.md](08-TESTING.md) |
| Донино: модель и UI | [09-SPEED-RECORDS.md](09-SPEED-RECORDS.md) |
| Донино: Sheets → CDN / CI | [09a-DONINO-PIPELINE.md](09a-DONINO-PIPELINE.md) |
| Справочник `/guide` (РКФ) | [10-GUIDE.md](10-GUIDE.md) — соревнования + выставки |

### Техническое (11–18, archive)
| Задача | Документ |
|--------|----------|
| Backend scripts, npm | [11-DEVELOPMENT.md](11-DEVELOPMENT.md) |
| Схема таблиц (**LEGACY** stub → archive) | [12-DATABASE-SCHEMA.md](12-DATABASE-SCHEMA.md) → [archive/12-…](archive/12-DATABASE-SCHEMA.md) |
| **LEGACY** D1 workflow (stub → archive) | [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md) → [archive/13-…](archive/13-DATABASE-WORKFLOW.md) |
| Парсеры (правила) | [14-PARSING-RULES.md](14-PARSING-RULES.md) |
| Парсеры (детали) | [15-PARSING-IMPLEMENTATION.md](15-PARSING-IMPLEMENTATION.md) |
| Решение проблем | [16-TROUBLESHOOTING.md](16-TROUBLESHOOTING.md) |
| Админка workflow | [17-ADMIN-WORKFLOW.md](17-ADMIN-WORKFLOW.md) |
| Паттерны кода / React pitfalls | [18-CODE-PATTERNS.md](18-CODE-PATTERNS.md) |

---

## Для людей — быстрый старт

```bash
npm install && cd frontend && npm install && cd ..
npm run dev                    # localhost:5173 + админка
```

Первый раз: `data/v1/` уже в git. При необходимости: `npm run build-all-data`  
Подробно: [01-GETTING-STARTED.md](01-GETTING-STARTED.md) · [20-OPERATIONS.md](20-OPERATIONS.md)

---

## Структура репозитория (кратко)

```
backend/          # API, парсеры, скрипты, local-dev-server
frontend/         # React SPA (staticData.ts → /data/v1/)
data/v1/          # ★ runtime данные в git
data/archive/     # снимки D1, HTML протоколов (results/)
docs/             # эта папка
.devin/           # rules/skills для Devin
.cursor/          # rules/skills для Cursor
scripts/          # start-servers.bat, deploy-to-github.bat
```

---

## Вклад в проект

См. раздел «Вклад в проект» в [01-GETTING-STARTED.md](01-GETTING-STARTED.md)
