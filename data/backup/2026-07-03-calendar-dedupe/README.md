# Backup: dedupe calendar events (2026-07-03)

Создано скриптом `backend/scripts/migrate/dedupe-events-from-scrape.ts`.

## Файлы

- `events-removed.json` — удалённые события
- `delete-events.sql` — SQL удаления (results + events)

## Статистика

- Scrape: 225 событий, годы 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026
- В БД: 389, оставлено 225, удалено 164
