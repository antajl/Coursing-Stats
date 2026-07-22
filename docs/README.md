# Документация Coursing Stats

Агрегатор статистики собак с [procoursing.ru](https://procoursing.ru) (курсинг, БЗМП, бега), 2015–2026.

**Прод:** https://coursing-stats.ru · **Данные:** `/data/v1/` на CDN · **GitHub:** https://github.com/antajl/Coursing-Stats

---

## 🤖 Для ИИ-агентов — порядок чтения

Читай **в этом порядке** перед любой работой:

| # | Файл | Зачем |
|---|------|-------|
| 1 | **[00-AI-GUIDE.md](00-AI-GUIDE.md)** | Правила, запреты, `.devin/` или `.cursor/` |
| 2 | **[03-DATA.md](03-DATA.md)** | Где лежат данные, workflow, диагностика |
| 3 | **[02-ARCHITECTURE.md](02-ARCHITECTURE.md)** | Компоненты, деплой, стек |
| 4 | *по задаче* | см. таблицу ниже |

**Не читай всё подряд** — открой только нужный раздел.

**Runbook:** [20-OPERATIONS.md](20-OPERATIONS.md) (деплой, прод сломан, enrich)

---

## Правило документирования (без дублей)

| Тип | Канон | В остальных файлах |
|-----|-------|---------------------|
| Данные, indexes, enrich | **03-DATA.md** | ссылка |
| Деплой, чеклисты | **20-OPERATIONS.md** | ссылка |
| UI, маршруты | **04-FRONTEND.md** | ссылка |
| Симптом → fix | **16-TROUBLESHOOTING.md** | кратко + ссылка на канон |

---

## Карта документов по задаче

### Основное (00–11, 20)
| Задача | Документ |
|--------|----------|
| Запуск, npm | [01-GETTING-STARTED.md](01-GETTING-STARTED.md), [20-OPERATIONS.md](20-OPERATIONS.md) |
| Backend scripts, CI, деплой | [04-DEVELOPMENT.md](04-DEVELOPMENT.md) |
| Фронтенд, компоненты, маршруты | **[04-FRONTEND.md](04-FRONTEND.md)** |
| Архитектура, стек | [02-ARCHITECTURE.md](02-ARCHITECTURE.md) |
| Данные, админка, `data/v1/` | **[03-DATA.md](03-DATA.md)** |
| Breed Archive / `pedigree_url` | [03-DATA.md](03-DATA.md) → «Breed Archive» |
| Пустой рейтинг/судьи на проде | [20-OPERATIONS.md](20-OPERATIONS.md), [03-DATA.md](03-DATA.md) → «Диагностика» |
| Белый экран / MIME JS после деплоя | [16-TROUBLESHOOTING.md](16-TROUBLESHOOTING.md), [20-OPERATIONS.md](20-OPERATIONS.md) → «Кэш фронта» |
| Донино локально ≠ прод | [16-TROUBLESHOOTING.md](16-TROUBLESHOOTING.md), [09-SPEED-RECORDS.md](09-SPEED-RECORDS.md) → «Локальное обновление» |
| Выставки: лимит 25 MB / медленный календарь | [03-DATA.md](03-DATA.md) → «Выставки», [SHOWS.md](SHOWS.md) |
| Локальный API (админка) | [05-API-REFERENCE.md](05-API-REFERENCE.md) |
| UI, цвета, тёмная тема | [06-DESIGN-SYSTEM.md](06-DESIGN-SYSTEM.md) |
| Фильтры рейтинга | [03-DATA.md](03-DATA.md) → «Породы в UI», [18-CODE-PATTERNS.md](18-CODE-PATTERNS.md) |
| Индекс CS («по очкам») | [03-DATA.md](03-DATA.md) → «top-score», [18-CODE-PATTERNS.md](18-CODE-PATTERNS.md), `/guide?tab=rating` |
| SEO, sitemap | [07-SEO.md](07-SEO.md) |
| Тесты | [08-TESTING.md](08-TESTING.md) |
| Донино, рекорды | [09-SPEED-RECORDS.md](09-SPEED-RECORDS.md) |
| Справочник `/guide` (РКФ) | [10-GUIDE.md](10-GUIDE.md) — соревнования + выставки |

### Техническое (12–18)
| Задача | Документ |
|--------|----------|
| Схема таблиц (legacy D1 / SQLite) | [12-DATABASE-SCHEMA.md](12-DATABASE-SCHEMA.md) |
| Legacy D1 workflow | [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md) |
| Парсеры (правила) | [14-PARSING-RULES.md](14-PARSING-RULES.md) |
| Парсеры (детали) | [15-PARSING-IMPLEMENTATION.md](15-PARSING-IMPLEMENTATION.md) |
| Решение проблем | [16-TROUBLESHOOTING.md](16-TROUBLESHOOTING.md) |
| Админка workflow | [17-ADMIN-WORKFLOW.md](17-ADMIN-WORKFLOW.md) |
| Паттерны кода | [18-CODE-PATTERNS.md](18-CODE-PATTERNS.md) |

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
