# Coursing Stats — Документация

Полная документация проекта Coursing Stats.

## Для ИИ-агентов

**Важно:** Если вы ИИ-агент и впервые анализируете этот проект, **сначала прочитайте [ai/MEMORY-SETUP.md](ai/MEMORY-SETUP.md)** и создайте указанные memories. Это критически важно для корректной работы с проектом.

## Структура документации

### Начало работы
- **[00-PROJECT-STATUS.md](00-PROJECT-STATUS.md)** — Текущий статус проекта
- **[BRANDING-INFRA.md](BRANDING-INFRA.md)** — Бренд, домены, Cloudflare, GitHub
- **[01-QUICK-START.md](01-QUICK-START.md)** — Быстрый старт для новых разработчиков
  - Установка зависимостей
  - Запуск серверов
  - Первые шаги

### Вклад в проект
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — Как внести вклад
  - Как начать
  - Стандарты кода
  - Pull Requests

### История изменений
- **[CHANGELOG.md](CHANGELOG.md)** — История изменений проекта
  - Датированные записи
  - Добавления, изменения, удаления
- **[CHANGES-2026-07-03.md](CHANGES-2026-07-03.md)** — Детальный отчёт за 2026-07-03 (рефакторинг, календарь, D1, UI polish)

### Для ИИ-агента
- **[ai/MEMORY-SETUP.md](ai/MEMORY-SETUP.md)** — Настройка памяти ИИ-агента
  - Критически важные memories
  - Правила работы с проектом
- **[ai/GUIDELINES.md](ai/GUIDELINES.md)** — Правила для ИИ-агента
  - Зафиксированные архитектурные решения
  - Правила турниров курсинга
  - Критически важное (кодировка windows-1251)
  - Рабочий процесс

### Архитектура
- **[architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md)** — Архитектура системы
  - High-level architecture
  - Components (Scraper, Database, Worker, Frontend)
  - Deployment state
- **[architecture/API-REFERENCE.md](architecture/API-REFERENCE.md)** — Документация API
  - Base URL
  - Endpoints с примерами
  - Response structures
  - Error handling

### Данные
- **[data/PARSING.md](data/PARSING.md)** — Парсинг данных
  - Источник данных
  - HTML формат по годам
  - Coursing parsing
  - BZMP parsing
  - Racing parsing
  - Статистика судей
  - Рекорды Донино
- **[data/CALENDAR-AND-DB-UPDATE.md](data/CALENDAR-AND-DB-UPDATE.md)** — **Календарь и заливка D1** (workflow, `D1_RESET_DO`, батчи, подводные камни)
- **[data/DATABASE.md](data/DATABASE.md)** — Работа с БД
  - Schema
  - Views
  - Migrations
  - Data import/export
  - Sync local ↔ remote
- **[data/SPEED_RECORDS.md](data/SPEED_RECORDS.md)** — Рекорды Донино (два Google Sheet: скорость + курсинг 350 м)
  - Два источника: `speed_records` и `coursing_records`
  - Статистика 350 м в `Stats.tsx` — только coursing
  - Data processing pipeline
  - Troubleshooting guide

### Разработка
- **[development/DEVELOPMENT.md](development/DEVELOPMENT.md)** — Разработка
  - File structure
  - NPM scripts
  - Local development
  - Testing
  - Code splitting
- **[development/FRONTEND-MAP.md](development/FRONTEND-MAP.md)** — Навигация фронтенда для ИИ
- **[development/parser-fixtures-debugging.md](development/parser-fixtures-debugging.md)** — Отладка парсеров на фикстурах
- **[development/DEPLOYMENT.md](development/DEPLOYMENT.md)** — Деплой и инфраструктура
  - Cloudflare Pages
  - Cloudflare Worker
  - Cloudflare D1
  - GitHub Actions
  - Домены

### Дизайн
- **[design/DESIGN-SYSTEM.md](design/DESIGN-SYSTEM.md)** — Дизайн-система
  - Цветовая палитра (light + dark mode)
  - Типографика
  - Компоненты
- **[design/DESIGN-ROADMAP.md](design/DESIGN-ROADMAP.md)** — Дизайн-роадмап
  - Статус задач
  - Приоритеты
- **[design/EVENT-COLORS.md](design/EVENT-COLORS.md)** — Цвета календаря событий
  - Система цветов дисциплин
  - Реализация

### История
- **[history/DECISIONS-LOG.md](history/DECISIONS-LOG.md)** — Лог архитектурных решений
  - Датированные записи
  - Эксперименты и их результаты
- **[history/MIGRATION-PLAN.md](history/MIGRATION-PLAN.md)** — План миграции

### Планы
- **[plans/FUTURE-PLANS.md](plans/FUTURE-PLANS.md)** — Планы на будущее
  - Статистика судей
  - Оптимизация сборки
  - Парсинг результатов
  - Общие задачи

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
- events: 219 (2023-2026)
- dogs: ~1579
- results: 4639
- speed_records: замер скорости (Google Sheets)
- coursing_records: бега борзых 350 м (отдельный Google Sheet)

**Домены:**
- Фронтенд: https://coursing-stats.ru
- API: https://api.coursing-stats.ru
- GitHub: https://github.com/antajl/Coursing-Stats
