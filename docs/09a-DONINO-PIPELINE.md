# Донино — пайплайн Sheets → CDN

> **Модель и правила UI** (speed ≠ coursing): [`09-SPEED-RECORDS.md`](09-SPEED-RECORDS.md).  
> **Файлы runtime:** [`03-DATA.md`](03-DATA.md) → `donino/`.

---

## Канон: локальное обновление → прод

Обе дисциплины из Google Sheets:

```bash
scripts\update-donino.bat
# = npm run export-donino
#   1) export-speed-from-sheets.ts  → data/v1/donino/speed_records.json
#   2) export-coursing-from-sheets.ts → data/v1/donino/coursing_records.json
```

На **прод** данные попадут только после commit + push в `main` (CI Pages):

```bash
scripts\deploy-to-github.bat
```

| Источник | speed (км/ч) | coursing 350 м |
|----------|--------------|----------------|
| `update-donino.bat` / `export-donino` | да | да |
| Cron `update-speed-records.yml` (4×/день) | да | **нет** |

Локальный Vite читает `data/v1/` с диска сразу после экспорта. Прод — только CDN после деплоя. См. [`16-TROUBLESHOOTING.md`](16-TROUBLESHOOTING.md) → «Донино: локально новые…».

Атрибуция на UI: `DoninoAttribution` → [runningdog.ru](https://runningdog.ru/).

---

## Источники Google Sheets

### Замер скорости (`speed_records`)

- **URL:** https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/export?format=xlsx
- **Листы:** «2026», «2025», «2025 по породам», «Абсолютный зачёт», «старые личные рекорды»
- **Колонки:** Порода, Пол, Кличка, Лучшая скорость (км/ч), Дата, Скриншот
- **Скрипты:** `parse-speed-xlsx.ts`, `fetch-speed-records.ts`, `sync-speed-records.ts`, `export-speed-from-sheets.ts`

### Бега 350 м (`coursing_records`)

- **URL:** https://docs.google.com/spreadsheets/d/1hpdA8vlIfeECgpnPvuk5xfezPsdUh1EXULjeATAF9dw/export?format=xlsx&gid=0
- **Колонки:** Порода, Кличка, Время (сек), Дата
- **Скорость из времени** (для отображения): `1260 / time_seconds` км/ч
- **Скрипты:** `parse-coursing-xlsx.ts`, `fetch-coursing-records.ts`, `export-coursing-from-sheets.ts`

```bash
npx tsx backend/scripts/speed/fetch-coursing-records.ts
npx tsx backend/scripts/speed/fetch-coursing-records.ts --remote   # remote D1 (legacy)
```

### Парсинг листа 350 м

На листе **одна строка на собаку**. История — в **примечании ячейки «Дата»** (не отдельные строки).

- **Парсер:** `parse-coursing-xlsx.ts` — XLSX с `cellStyles: true`
- **Статусы:** `coursing-sheet-status.ts`
- **Формат примечания:** `23,36 - 31.05.2026` → `history: [{ time_seconds, date }, …]`
- **Анализ:** `npx tsx backend/scripts/speed/analyze-coursing-xlsx.ts`

| Признак | Интерпретация |
|---------|----------------|
| Примечание в «Дата» | `history`; `status` = `improved`; бейдж `upd` |
| Белая заливка `#FFFFFF`, без примечания | `status` = `new` |
| Серая `#CCCCCC`, без примечания | `status` = `normal` |

**Про серый:** `#CCCCCC` — фон по умолчанию у большинства строк; `improved` бывает и на сером, и на белом. Для UI достаточно примечания: есть `history` → `upd`.

---

## Пайплайн speed (детали)

Гибрид: Google Sheets → JSON кэш / `data/v1/donino/` → (опционально) D1 для импорта/cron.

### Шаги `sync-speed-records.ts`

1. Загрузка XLSX, парсинг по абсолютным координатам (`parse-speed-xlsx.ts`, `cellStyles: true`)
2. Статусы из цвета клички (`speed-sheet-status.ts`): `#B6D7A8` → `new`, `#9FC5E8` → `improved`, без цвета → `normal`; лист «старые…» → `old`
3. Сравнение с кэшем `data/speed-records.json`
4. Дедуп: ключ `name + breed + sex + date + speed_km_h`
5. История: группировка `name + breed`, сортировка по дате → `history: [{speed_km_h, date}, …]`
6. (Legacy) SQL → D1 `INSERT OR REPLACE`
7. Runtime: `data/v1/donino/speed_records.json` (через `export-donino` / cron export)

### Ключи

| Операция | Ключ |
|----------|------|
| Дедупликация | `name + breed + sex + date + speed` |
| История / UI-список | `name + breed` |

---

## GitHub Actions / ручной запуск

### Ручная синхронизация (legacy D1 path)

```bash
npx tsx backend/scripts/speed/sync-speed-records.ts
```

### Cron

- **Workflow:** `.github/workflows/update-speed-records.yml`
- **Расписание:** 4×/день — 08:00, 14:00, 20:00, 23:30 МСК
- **Действие:** `sync-speed-records.ts` → D1; `export-donino-speed-v1.ts` → `data/v1/donino/speed_records.json`; коммит при изменении (`[skip ci]` — деплой Pages **не** запускается)
- **Не обновляет** `coursing_records` — для 350 м нужен `export-donino` + обычный push

---

## Статистика (ориентир, 2026-07)

| Метрика | Значение |
|---------|----------|
| Строк в `speed_records` (после дедупа) | ~213 |
| Уникальных собак в speed (name+breed) | ~136 |
| Строк в `coursing_records` | ~107 |
| Уникальных собак в coursing | ~107 |

Пример **Уиппет** (350 м): лучшее **22,81 с**, не 19,69 с (то было бы из max 64 км/ч таблицы замеров).

Исторический снимок кэша: сырые 418 → после дедупа 187 → ~131 уникальных собак.

---

## Устранение проблем (pipeline)

### Проверка CDN / локально

```bash
curl "https://coursing-stats.ru/data/v1/donino/speed_records.json" | head -c 500
curl "http://127.0.0.1:8787/api/speed-records?limit=10"   # нужен npm run dev
```

### D1 переполнен дублями (legacy)

Если remote D1 показывает 2000+ вместо ~200:

```bash
npx wrangler d1 execute pc-db --remote --command="DELETE FROM speed_records"
npx tsx backend/scripts/speed/fetch-speed-records.ts --remote
npx wrangler d1 execute pc-db --remote --command="SELECT COUNT(*) as total FROM speed_records"
```

Публичный сайт читает **CDN JSON**, не D1 — после фикса экспортируйте в `data/v1/` и задеплойте.

### Локально новые, на проде старые

1. `scripts\update-donino.bat` выполнен?
2. `donino/*.json` закоммичены и запушены в `main`?
3. CI Pages успешен?
4. Жёсткое обновление / другой CDN edge

См. [`16-TROUBLESHOOTING.md`](16-TROUBLESHOOTING.md).

### Нет истории / дубли в UI

- Ключ группировки бэкенд и фронт: **`name + breed`** (не + sex)
- Разный spelling породы/клички в Sheets → разные ключи
- Дедуп должен включать `date + speed_km_h` (или `time_seconds` для coursing)

### Limit API / stats неполные

`useSpeedRecordsPage` грузит с `limit=1000`. При росте базы >1000 — увеличить limit или отдельный stats-endpoint.

```bash
curl "https://coursing-stats.ru/data/v1/donino/speed_records.json" | jq '.records | length'
```

### Чеклист отладки

1. CDN `speed_records.json` / `coursing_records.json` — непустые, актуальные даты
2. Локальный `data/v1/donino/` совпадает с ожиданием после `export-donino`
3. Группировка `name + breed` согласована
4. Не смешивать метрики двух дисциплин (см. [`09-SPEED-RECORDS.md`](09-SPEED-RECORDS.md))

---

## Связанные файлы

- **Speed:** `backend/scripts/speed/parse-speed-xlsx.ts`, `sync-speed-records.ts`, `fetch-speed-records.ts`, `speed-sheet-status.ts`, `export-speed-from-sheets.ts`
- **Coursing 350 м:** `parse-coursing-xlsx.ts`, `fetch-coursing-records.ts`, `coursing-sheet-status.ts`, `export-coursing-from-sheets.ts`
- **Routes (local API):** `backend/src/routes/speed.ts`
- **Фронтенд:** `frontend/src/pages/SpeedRecords/`
- **Даты/статистика:** `frontend/src/lib/recordDates.ts`
- **CI:** `.github/workflows/update-speed-records.yml`
- **Bat:** `scripts/update-donino.bat`, `scripts/deploy-to-github.bat`
