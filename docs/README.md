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
  - Настройка памяти ИИ-агента
  - Критически важные memories
  - Правила работы с проектом
  - Правила турниров курсинга
  - Критически важное (кодировка windows-1251)
  - Рабочий процесс

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
- **[DATABASE.md](DATABASE.md)** — Работа с БД
  - Schema
  - Views
  - Migrations
  - Data import/export
  - Sync local ↔ remote
  - Календарь и заливка D1
- **[SPEED-RECORDS.md](SPEED-RECORDS.md)** — Рекорды Донино (два Google Sheet: скорость + курсинг 350 м)
  - Два источника: `speed_records` и `coursing_records`
  - Статистика 350 м в `Stats.tsx` — только coursing
  - Data processing pipeline
  - Troubleshooting guide

### Разработка
- **[DEVELOPMENT.md](DEVELOPMENT.md)** — Разработка
  - File structure
  - NPM scripts
  - Local development
  - Testing
  - Code splitting
  - Deployment и инфраструктура
  - Frontend map — навигация для ИИ-агентов
  - Отладка парсеров с фикстурами

### Дизайн
- **[DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)** — Дизайн-система
  - Цветовая палитра (light + dark mode)
  - Типографика
  - Компоненты
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
  - Статистика судей
  - Оптимизация сборки
  - Парсинг результатов
  - Общие задачи
  - UI / визуальная согласованность
  - UI / Мобильная адаптация
  - Компоненты
  - Новые разделы
  - Навигация

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
- dogs: 1619
- results: 2966 (2025-2026)
- speed_records: замер скорости (Google Sheets, 198 записей)
- coursing_records: бега борзых 350 м (отдельный Google Sheet, 95 записей)

**Домены:**
- Фронтенд: https://coursing-stats.ru
- API: https://api.coursing-stats.ru
- GitHub: https://github.com/antajl/Coursing-Stats
