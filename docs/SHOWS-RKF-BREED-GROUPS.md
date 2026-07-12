# Группы пород и судьи по породам (реализовано 2026-07-12)

## Решение

**Источник:** AJAX `ExhibitionResultListViewRefresh` (POST, перехват через Playwright при загрузке списка пород).

Структура уже содержит всё нужное для каталога:

| Поле JSON | Наше поле |
|-----------|-----------|
| `GroupName` | `breed_group` (группа FCI, на RKF — `h2.titlelight`) |
| `Items[].Name` | `breed` |
| `Items[].Count` | `breed_count` |
| `Items[].LocalizationParameters` (ru-RU) `"BREED (Specialty) Judge"` | `breed_judge` |
| `Items[].DogBreedId` | `dog_breed_id` |

**BreedView** — только построчные результаты (классы, собаки, титулы). Группы и судья Specialty **не** на BreedView.

### Код

- `backend/parsers/shows/exhibition-catalog.ts` — парсинг каталога
- `backend/parsers/shows/parse-breed-view.ts` — парсинг BreedView
- `backend/parsers/shows/scrape-show-results.ts` — каталог → затем BreedView по каждой породе
- `backend/scripts/enrich-show-exhibition.ts` — обогатить уже скачанный JSON без полного перескрапа

### Обогащение

```bash
cd backend && npx tsx scripts/enrich-show-exhibition.ts 106
```

Скрипт по очереди: каталог (ru-RU + title/date) → результаты BreedView → титулы.

**BreedView (ru-RU):** парсер идёт секциями после `h2.titlelight` (Титулы / Кобели / Суки), протягивает название класса на следующие строки, отдельно `grade` (оценка) и `title` (награды).

Фикстура для тестов: `backend/fixtures/show-106-refresh-captured.json`.
