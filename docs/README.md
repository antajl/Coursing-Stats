# Coursing Stats — Документация

Полная документация проекта Coursing Stats.

## Для ИИ-агентов

**Важно:** Если вы ИИ-агент и впервые анализируете этот проект, **сначала прочитайте [AI-GUIDE.md](AI-GUIDE.md)** и создайте указанные memories. Это критически важно для корректной работы с проектом.

## Структура документации

### Начало работы
- **[GETTING-STARTED.md](GETTING-STARTED.md)** — Быстрый старт для новых разработчиков
  - Установка зависимостей
  - Запуск серверов
  - Первые шаги
  - Технический стек
  - Состояние базы данных

### Вклад в проект
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — Как внести вклад
  - Как начать
  - Стандарты кода
  - Pull Requests

### История изменений
- **[CHANGELOG.md](CHANGELOG.md)** — История изменений проекта
  - Датированные записи
  - Значимые изменения

### Для ИИ-агента
- **[AI-GUIDE.md](AI-GUIDE.md)** — Руководство для ИИ-агента
  - Контекст в `.cursor/rules/` и `.cursor/skills/`
  - Критически важные правила и workflow

### Архитектура
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Архитектура системы
  - High-level architecture
  - Components (Scraper, Database, Worker, Frontend)
  - Deployment state
  - Бренд и инфраструктура
- **[API-REFERENCE.md](API-REFERENCE.md)** — Документация API
  - Base URL
  - Endpoints с примерами
  - Response structures
  - Error handling

### Данные
- **[PARSING.md](PARSING.md)** — Парсинг данных
  - Источник данных
  - HTML формат по годам
  - Coursing parsing
  - BZMP parsing
  - Racing parsing
  - Статистика судей
  - Рекорды Донино
- **[DATA-ARCHIVE.md](DATA-ARCHIVE.md)** — Файловый архив БД
  - `npm run export-archive`
  - Снимки в `data/archive/snapshots/`
  - Будущая схема v1
- **[GUIDE.md](GUIDE.md)** — Справочник `/guide`
  - Правила РКФ, протоколы, титулы
  - `frontend/src/pages/Guide/constants.ts`
- **[DATABASE.md](DATABASE.md)** — Работа с БД
  - Schema, migrations, sync local ↔ remote
  - Календарь и заливка D1
  - D1 Free tier и edge cache
- **[SPEED-RECORDS.md](SPEED-RECORDS.md)** — Рекорды Донино (два Google Sheet: скорость + курсинг 350 м)
  - Два источника: `speed_records` и `coursing_records`
  - UI: две колонки на одной странице; статистика — `DoninoStatsColumns`
  - Data processing pipeline
  - Профили `/donino-dog` и история бегов 350 м
  - Troubleshooting guide

### SEO
- **[SEO.md](SEO.md)** — Поисковая оптимизация
  - Верификация поисковиков (Яндекс, Google)
  - Sitemap (статический и динамический)
  - Meta-теги и компонент SEO
  - Правило для новых страниц
  - Мониторинг индексации

### Разработка
- **[DEVELOPMENT.md](DEVELOPMENT.md)** — Разработка
  - File structure
  - NPM scripts
  - Local development
  - Testing (кратко; подробно — `TESTING.md`)
  - Code splitting
  - Deployment и инфраструктура
  - Frontend map — навигация для ИИ-агентов
  - PageToolbar, главная (`Home.tsx`), профили Донино, **рекорды Донино (двухколоночный hub)**
  - Отладка парсеров с фикстурами
- **[TESTING.md](TESTING.md)** — Тестирование
  - Unit: парсеры, vitest, smoke-api
  - E2E: Playwright (`npm run test:e2e`)
  - Фикстуры и добавление новых тестов

### Дизайн
- **[DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)** — Дизайн-система
  - Цветовая палитра (light + dark mode)
  - Типографика
  - Компоненты
  - PageToolbar и шапка профиля собаки
  - Цветовая система календаря событий
  - Правила dark mode
  - Accessibility
  - Чек-лист для новых компонентов

### История
- **[DECISIONS-LOG.md](DECISIONS-LOG.md)** — Лог архитектурных решений
  - Датированные записи
  - Важные архитектурные решения и эксперименты

### Планы
- **[FUTURE-PLANS.md](FUTURE-PLANS.md)** — Планы на будущее
  - Выполненное — в `docs/_archive/FUTURE-PLANS-COMPLETED.md`

---

## Краткий обзор проекта

**Coursing Stats** — агрегатор статистики собак по соревнованиям procoursing.ru (курсинг, БЗМП, бега) за 2015–2026 годы.

**Статус:** Полностью рабочий, развернут на Cloudflare (Pages + Worker + D1).

**Технический стек:**
- Backend: Cloudflare Worker (API), Cloudflare D1 (SQLite), TypeScript (`npx tsx` для скриптов)
- Frontend: React, Vite, TailwindCSS, кастомные `components/ui/` (без shadcn), Lucide, xlsx, TypeScript
- Деплой: Cloudflare Pages (фронтенд), Cloudflare Workers (бэкенд), Cloudflare D1 (база данных)
- CI: `package-lock.json` в репозитории для `npm ci`

**Данные:**
- events: 225 (2015-2026)
- dogs: 1628
- results: 2966 (2025-2026)
- speed_records: замер скорости (Google Sheets, 213 записей)
- coursing_records: бега борзых 350 м (отдельный Google Sheet, 107 записей)

**Домены:**
- Фронтенд: https://coursing-stats.ru
- API: https://api.coursing-stats.ru
- GitHub: https://github.com/antajl/Coursing-Stats
