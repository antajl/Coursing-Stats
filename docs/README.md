# Документация Coursing Stats

Агрегатор статистики собак с [procoursing.ru](https://procoursing.ru) (курсинг, БЗМП, бега), 2015–2026.

**Прод:** https://coursing-stats.ru · **Данные:** `/data/v1/` на CDN · **GitHub:** https://github.com/antajl/Coursing-Stats

---

## 🤖 Для ИИ-агентов — порядок чтения

Читай **в этом порядке** перед любой работой:

| # | Файл | Зачем |
|---|------|-------|
| 1 | **[00-AI-GUIDE.md](00-AI-GUIDE.md)** | Правила, запреты, куда смотреть |
| 2 | **[03-DATA.md](03-DATA.md)** | Где лежат данные, что редактировать, workflow |
| 3 | **[02-ARCHITECTURE.md](02-ARCHITECTURE.md)** | Компоненты, деплой, стек |
| 4 | *по задаче* | см. таблицу ниже |

**Не читай всё подряд** — открой только нужный раздел.

---

## Карта документов по задаче

### Основное (00-11)
| Задача | Документ |
|--------|----------|
| Запуск, npm, деплой | [01-GETTING-STARTED.md](01-GETTING-STARTED.md), [04-DEVELOPMENT.md](04-DEVELOPMENT.md) |
| Архитектура, стек, CI | [02-ARCHITECTURE.md](02-ARCHITECTURE.md) |
| Данные, админка, `data/v1/` | **[03-DATA.md](03-DATA.md)** |
| Пустой рейтинг/судьи на проде | [03-DATA.md](03-DATA.md) → «Диагностика» или [16-TROUBLESHOOTING.md](16-TROUBLESHOOTING.md) |
| Фронтенд, компоненты | [04-DEVELOPMENT.md](04-DEVELOPMENT.md) → Frontend map |
| Локальный API (админка) | [05-API-REFERENCE.md](05-API-REFERENCE.md) |
| UI, цвета, тёмная тема | [06-DESIGN-SYSTEM.md](06-DESIGN-SYSTEM.md) |
| SEO, sitemap | [07-SEO.md](07-SEO.md) |
| Тесты | [08-TESTING.md](08-TESTING.md) |
| Донино, рекорды | [09-SPEED-RECORDS.md](09-SPEED-RECORDS.md) |
| Справочник `/guide` (РКФ) | [10-GUIDE.md](10-GUIDE.md) |
| Планы | [11-FUTURE-PLANS.md](11-FUTURE-PLANS.md) |

### Техническое (12-18)
| Задача | Документ |
|--------|----------|
| D1 схема (таблицы, views) | [12-DATABASE-SCHEMA.md](12-DATABASE-SCHEMA.md) |
| D1 workflow (импорт, sync) | [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md) |
| Парсеры windows-1251 (правила) | [14-PARSING-RULES.md](14-PARSING-RULES.md) |
| Парсеры (детали реализации) | [15-PARSING-IMPLEMENTATION.md](15-PARSING-IMPLEMENTATION.md) |
| Решение проблем | [16-TROUBLESHOOTING.md](16-TROUBLESHOOTING.md) |
| Админка workflow | [17-ADMIN-WORKFLOW.md](17-ADMIN-WORKFLOW.md) |
| Паттерны кода | [18-CODE-PATTERNS.md](18-CODE-PATTERNS.md) |

### История (19)
| Задача | Документ |
|--------|----------|
| История изменений и решений | [19-HISTORY.md](19-HISTORY.md) |

---

## Для людей — быстрый старт

```bash
npm install && cd frontend && npm install && cd ..
npm run dev                    # localhost:5173 + админка
```

Первый раз без данных: `npm run export-local-data -- --local`  
Подробно: [01-GETTING-STARTED.md](01-GETTING-STARTED.md)

---

## Структура репозитория (кратко)

```
backend/          # API, парсеры, скрипты, local-dev-server
frontend/         # React SPA (staticData.ts → /data/v1/)
data/v1/          # ★ runtime данные в git
data/archive/     # снимки D1, HTML протоколов (results/)
docs/             # эта папка
scripts/          # start-servers.bat, deploy-to-github.bat
```

---

## Архив (не для повседневной работы)

`archive/` — исторические документы. Не использовать как источник правды.

---

## Вклад в проект

См. раздел "Вклад в проект" в [01-GETTING-STARTED.md](01-GETTING-STARTED.md)
