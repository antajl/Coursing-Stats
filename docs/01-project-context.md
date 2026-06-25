# 01. Project Context — ProCoursing Stats

## Overview

**Проект:** агрегатор статистики собак по результатам procoursing.ru (курсинг/БЗМП/бега).

**Статус:** ✅ **ПОЛНОСТЬЮ РАБОЧИЙ** — фронтенд и бэкенд развернуты и функционируют.

**Полная спецификация:** см. `00-PROJECT-OVERVIEW.md` для полного контекста, схема БД — `03-database-schema.md`.

## Scope

- **Все породы** (с фильтром в UI)
- **Архив данных:**
  - 2015-2022: **НЕДОСТУПЕН** - результаты хранятся как изображения (требуется OCR)
  - 2023-2026: **ДОСТУПЕН** - успешно импортирован (4639 результатов)
- **Фильтр по году** (по умолчанию открыт текущий год 2026)
- **Раздельная статистика** для курсинга и бегов в tooltip

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

4. **Tooltip дизайн:** раздельные блоки для курсинга и бегов с сайд-бай-сайд layout.

5. **Данные о скорости:** извлекаются из Racing результатов (м/с конвертируются в км/ч).

## Current Data Status (2026-06-25)

### База данных (local = remote, синхронизировано)
- **events:** 302
- **dogs:** ~1579
- **results:** 4639 (2023–2026)

### Автоматизация
- GitHub Actions: `.github/workflows/update-db.yml` (secrets настроены)
- `npm run ci-update-db` — инкремент текущего года
- `npm run sync-to-remote` — полный синк local → remote

### Статусы результатов
- `finished` — завершенные выступления
- `dns` — неявка
- `withdrawn` — снят/сошел
- `disqualified` — дисквалифицирован
- `dnf` — не финишировал
- `unknown_status_check_raw_text` — требует ручной проверки

## Known Issues

### Остаточные «Dog not found»
- Существенно снижено после `normalizeDogName` и миграции remote
- Ручное слияние: `backend/scripts/merge-dogs.mjs`