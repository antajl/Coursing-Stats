# Документация Coursing Stats

Агрегатор статистики собак с [procoursing.ru](https://procoursing.ru) (курсинг, БЗМП, бега), 2015–2026.

**Прод:** https://coursing-stats.ru · **Данные:** `/data/v1/` на CDN · **GitHub:** https://github.com/antajl/Coursing-Stats

---

## 🤖 Для ИИ-агентов — порядок чтения

Читай **в этом порядке** перед любой работой:

| # | Файл | Зачем |
|---|------|-------|
| 1 | **[AI-GUIDE.md](AI-GUIDE.md)** | Правила, запреты, куда смотреть |
| 2 | **[DATA.md](DATA.md)** | Где лежат данные, что редактировать, workflow |
| 3 | **[ARCHITECTURE.md](ARCHITECTURE.md)** | Компоненты, деплой, стек |
| 4 | *по задаче* | см. таблицу ниже |

Также: `.cursor/rules/` (alwaysApply) и skills `.cursor/skills/coursing-stats-{dev,parsers}/`.

**Не читай всё подряд** — открой только нужный раздел.

---

## Карта документов по задаче

| Задача | Документ |
|--------|----------|
| Запуск, npm, деплой | [GETTING-STARTED.md](GETTING-STARTED.md), [DEVELOPMENT.md](DEVELOPMENT.md) |
| Архитектура, стек, CI | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Данные, админка, `data/v1/` | **[DATA.md](DATA.md)** |
| D1, импорт, миграции | [DATABASE.md](DATABASE.md) |
| Парсеры windows-1251 | [PARSING.md](PARSING.md) |
| Локальный API (админка) | [API-REFERENCE.md](API-REFERENCE.md) |
| Донино, рекорды | [SPEED-RECORDS.md](SPEED-RECORDS.md) |
| Фронтенд, компоненты | [DEVELOPMENT.md](DEVELOPMENT.md) → Frontend map |
| UI, цвета, тёмная тема | [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) |
| SEO, sitemap | [SEO.md](SEO.md) |
| Тесты | [TESTING.md](TESTING.md) |
| Справочник `/guide` (РКФ) | [GUIDE.md](GUIDE.md) |
| Бэкап D1 | [DATA-ARCHIVE.md](DATA-ARCHIVE.md) |
| История решений | [DECISIONS-LOG.md](DECISIONS-LOG.md) |
| Планы | [FUTURE-PLANS.md](FUTURE-PLANS.md) |
| Changelog | [CHANGELOG.md](CHANGELOG.md) |

---

## Для людей — быстрый старт

```bash
npm install && cd frontend && npm install && cd ..
npm run dev                    # localhost:5173 + админка
```

Первый раз без данных: `npm run export-local-data -- --local`  
Подробно: [GETTING-STARTED.md](GETTING-STARTED.md)

---

## Структура репозитория (кратко)

```
backend/          # API, парсеры, скрипты, local-dev-server
frontend/         # React SPA (staticData.ts → /data/v1/)
data/v1/          # ★ runtime данные в git
docs/             # эта папка
scripts/          # start-servers.bat, deploy-to-github.bat
.cursor/rules/    # правила для Cursor
```

---

## Архив (не для повседневной работы)

`docs/_archive/` — старые планы и аудиты UI. Не использовать как источник правды.

---

## Вклад в проект

[CONTRIBUTING.md](CONTRIBUTING.md)
