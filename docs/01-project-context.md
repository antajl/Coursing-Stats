# 01. Project Context — ProCoursing Stats

## Overview

**Проект:** агрегатор статистики собак по результатам procoursing.ru (курсинг/БЗМП/бега).

**Полная спецификация:** см. `README.md`, схема БД — `schema.sql`.

## Scope

- **Все породы** (с фильтром в UI)
- **Весь архив 2015–2026** (с фильтром по году, по умолчанию открыт текущий год)

## Data Sources

| Source | URL Pattern |
|--------|-------------|
| Events Index | `http://procoursing.ru/s_{YEAR}.html` |
| Catalog PDF | `http://procoursing.ru/{year}/{date}_Catalog_{Type}.pdf` |
| Results HTML | `http://procoursing.ru/{year}/{date}_Complete_Results_{Type}.html` |

`Type` ∈ `Coursing | BZMP | Racing`

## Key Decisions (Не менять без явного запроса)

1. **Топ — ДВА отдельных рейтинга:**
   - По местам (медальный зачёт: золото→серебро→бронза)
   - По очкам (лучший результат + средний + число стартов рядом)
   - **Не сводить в одну формулу!**

2. **Родословные:** переход на внешний сайт по клику, не парсим PDF-каталоги.
   - Сайт: https://saluki.breedarchive.com/
   - Пример: https://saluki.breedarchive.com/animal/view/emul-de-gepard-gelila-al-rawda-699f7593-397c-4b71-89a7-09e352f30907

3. **Стек:** Cloudflare Pages + Worker + D1 (как в SW Forge).