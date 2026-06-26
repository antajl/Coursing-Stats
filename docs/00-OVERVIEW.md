# ProCoursing Stats — Обзор проекта

## Краткое описание

**ProCoursing Stats** — агрегатор статистики собак по результатам соревнований курсинга, БЗМП и бегов с сайта procoursing.ru (2015-2026).

**Статус проекта:** ✅ **ПОЛНОСТЬЮ РАБОЧИЙ** — фронтенд и бэкенд развернуты и функционируют.

## Технический стек

- **Backend:** Cloudflare Worker (API), Cloudflare D1 (SQLite), Node.js (скраперы/парсеры)
- **Frontend:** React, Vite, TailwindCSS, shadcn/ui, Lucide
- **Деплой:** Cloudflare Pages (фронтенд), Cloudflare Workers (бэкенд), Cloudflare D1 (база данных)

## Текущее состояние данных

**База данных:** local и remote синхронизированы (2026-06-25)
- events: 302
- dogs: ~1579
- results: 4639
- Remote D1: ~21 MB

**Распределение по годам:**
- 2023: 771 результатов (22 события)
- 2024: 1086 результатов (27 событий)
- 2025: 1971 результатов (50 событий)
- 2026: 811 результатов (16 событий)
- 2015-2022: НЕДОСТУПНЫ (хранятся как изображения, требуется OCR)

## Деплой

**GitHub:** https://github.com/antajl/ProCoursing

**Cloudflare Pages:** https://procoursing.pages.dev
- Автоматический деплой через GitHub Actions при push в main

**Cloudflare Worker:** https://procoursing-stats.antajltube.workers.dev
- Активен, cron: понедельник 02:00 UTC

## Автоматизация

**GitHub Actions:**
- Update D1 Database — каждый понедельник 03:00 UTC + ручной запуск
- Deploy Frontend — при push в main с изменениями в `frontend/`

## Зафиксированные решения (не менять без явного запроса)

- Охват: все породы (с фильтром в UI), весь архив 2015–2026 (с фильтром по году)
- Топ — ДВА отдельных рейтинга, не один: по местам и по очкам
- Родословные — переход на внешний сайт по клику
- Стек: Cloudflare Pages + Worker + D1
- Бэкафилл истории — разовый Node-скрипт локально, текущий год — инкремент по GitHub Actions

## Источник данных

`http://procoursing.ru/s_{YEAR}.html` — индекс событий за год (2015…2026).

⚠️ Кодировка сайта — **windows-1251**. Декодируется явно через iconv-lite.

## Документация

- **01-AI-GUIDELINES.md** — Правила для ИИ-агента (читать первым)
- **02-ARCHITECTURE.md** — Архитектура, БД, API, деплой
- **03-DEVELOPMENT.md** — Разработка, данные, парсинг
