# Локальная база v1

Каноническое хранилище для сайта. **Публичный прод** читает подмножество с CDN (`/data/v1/`).

**Источник правды:** эти файлы в git.  
**После парсинга в локальную SQLite:** `yarn run sync-sqlite-to-v1`.  
**Пересборка индексов:** `yarn run build-all-data`.  
**Локальный dev:** `yarn run dev` — Vite отдаёт `/data/v1/` со статического диска.

| Путь | Содержимое | На проде (S3 CDN)? |
|------|------------|---------------------|
| `manifest.json` | версия, дата, счётчики | да |
| `calendar/{year}.json` | события года; `results_file` → competitions | да |
| `competitions/...` | один JSON на турнир с `event` + `results[]` | да |
| `dogs/by-id/`, `dogs/by-key/` | карточки собак для билдов/импорта | **нет** (exclude) |
| `donino/` | рекорды Донино | да |
| `indexes/dog-profiles/pack-*.json` | профили спорта, 256 паков (`byId`) | да |
| `indexes/*` | топы, судьи спорта, years, events-by-id… | да (кроме oversized) |
| `shows/indexes/judge-details/pack-*.json` | судьи выставок, паки (`byKey`) | да |
| `shows/indexes/dog-details/` | карточки show-dogs (уже шарды) | да |
| `shows/protocols/{id}.json` | протоколы выставок (56k файлов, gzip) | да |
| `shows/calendar-*`, прочие indexes | календари/рейтинги выставок | да |

Слои: [ADR-014](../../docs/decisions/014-cdn-packs-vs-turso.md). Exclude: `backend/scripts/publish/publish-exclude.js` + `frontend/scripts/copy-data.js`.

Правка одного турнира = один файл в `competitions/`, без затрагивания остальных.

Новые собаки появляются при `sync-sqlite-to-v1` или безопасном импорте через `yarn ingest-competition`, затем `build-all-data` (пересоберёт `dog-profiles` паки).

**Прод:** `git push main` (1–2 раза в день) → CI `build-all-data` → Yandex Object Storage S3.
