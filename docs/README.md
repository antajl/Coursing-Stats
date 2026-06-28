# ProCoursing Stats — Документация

Полная документация проекта ProCoursing Stats.

## Для ИИ-агентов

**Важно:** Если вы ИИ-агент и впервые анализируете этот проект, **сначала прочитайте [00-AI-MEMORY-SETUP.md](00-AI-MEMORY-SETUP.md)** и создайте указанные memories. Это критически важно для корректной работы с проектом.

## Структура документации

### Начало работы
- **[01-QUICK-START.md](01-QUICK-START.md)** — Быстрый старт для новых разработчиков
  - Установка зависимостей
  - Запуск серверов
  - Первые шаги

### Для ИИ-агента
- **[02-AI-GUIDELINES.md](02-AI-GUIDELINES.md)** — Правила для ИИ-агента
  - Зафиксированные архитектурные решения
  - Правила турниров курсинга
  - Критически важное (кодировка windows-1251)
  - Рабочий процесс

### Архитектура
- **[03-ARCHITECTURE.md](03-ARCHITECTURE.md)** — Архитектура системы
  - High-level architecture
  - Components (Scraper, Database, Worker, Frontend)
  - Deployment state

### API
- **[04-API-REFERENCE.md](04-API-REFERENCE.md)** — Документация API
  - Base URL
  - Endpoints с примерами
  - Response structures
  - Error handling

### Парсинг
- **[05-PARSING.md](05-PARSING.md)** — Парсинг данных
  - Источник данных
  - HTML формат по годам
  - Coursing parsing
  - BZMP parsing
  - Racing parsing
  - Статистика судей
  - Рекорды Донино

### База данных
- **[06-DATABASE.md](06-DATABASE.md)** — Работа с БД
  - Schema
  - Views
  - Migrations
  - Data import/export
  - Sync local ↔ remote

### Деплой
- **[07-DEPLOYMENT.md](07-DEPLOYMENT.md)** — Деплой и инфраструктура
  - Cloudflare Pages
  - Cloudflare Worker
  - Cloudflare D1
  - GitHub Actions
  - Домены

### Разработка
- **[08-DEVELOPMENT.md](08-DEVELOPMENT.md)** — Разработка
  - File structure
  - NPM scripts
  - Local development
  - Testing
  - Code splitting

### История
- **[09-DECISIONS-LOG.md](09-DECISIONS-LOG.md)** — Лог архитектурных решений
  - Датированные записи
  - Эксперименты и их результаты

### Планы
- **[10-FUTURE-PLANS.md](10-FUTURE-PLANS.md)** — Планы на будущее
  - Статистика судей
  - Оптимизация сборки
  - Парсинг результатов
  - Общие задачи

### Архив
- **[archive/](archive/)** — Устаревшая документация
  - AUDIT-ProCoursing.md

---

## Краткий обзор проекта

**ProCoursing Stats** — агрегатор статистики собак по соревнованиям procoursing.ru (курсинг, БЗМП, бега) за 2015–2026 годы.

**Статус:** Полностью рабочий, развернут на Cloudflare (Pages + Worker + D1).

**Технический стек:**
- Backend: Cloudflare Worker (API), Cloudflare D1 (SQLite), TypeScript, Node.js (скраперы/парсеры)
- Frontend: React, Vite, TailwindCSS, shadcn/ui, Lucide, xlsx, TypeScript
- Деплой: Cloudflare Pages (фронтенд), Cloudflare Workers (бэкенд), Cloudflare D1 (база данных)

**Данные:**
- events: 219 (2023-2026)
- dogs: ~1579
- results: 4639
- speed_records: данные из Google Sheets (автообновление)

**Домены:**
- Фронтенд: https://procoursing.antajl.ru
- API: https://api.procoursing.antajl.ru
- GitHub: https://github.com/antajl/ProCoursing
