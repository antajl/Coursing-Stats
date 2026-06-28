# Project Migration Plan — План миграции структуры проекта

Этот документ содержит план реструктуризации проекта для улучшения навигации и поддержки кода для ИИ-агентов.

**Цель:** Сделать структуру проекта понятной, логичной и легко масштабируемой, аналогично реструктуризации docs/.

---

## Обзор текущих проблем

### backend/scripts/
- 15 активных файлов без четкого разделения по типам
- 18 файлов в archive/ без структуры
- migrate-normalize-dog-names.mjs лежит в scripts/, а не в отдельной папке
- Нет разделения на scrape, load, reparse, migrate, sync, update, test, ci

### backend/src/routes/
- competitions.js - неочевидное название (лучше events.js)
- judges.js - большой файл (~16 KB), можно разбить

### frontend/src/components/
- DogTooltip.jsx - большой файл (~15 KB)

### frontend/src/pages/
- EventResults.jsx - большой файл (~26 KB)
- SpeedRecords.jsx - большой файл (~26 KB)
- JudgeDetail.jsx - большой файл (~21 KB)
- SpeedRecordsStats.jsx - большой файл (~21 KB)
- Нет логической группировки (Events, Judges, SpeedRecords)

### data/
- 20 файлов без структуры
- migrate-*.sql, sync-*.sql, update-*.sql, load-*.sql смешаны в корне
- Нет разделения на migrations, exports, imports, updates, temp

### Корневые файлы
- 2.svg - неочевидное название
- push-github.bat, start-local.bat лежат в корне

---

## Предлагаемая структура

### backend/scripts/

**Текущая:**
```
backend/scripts/
├── archive/ (18 файлов)
├── ci-update-db.mjs
├── fetch-speed-records-pdf.py
├── fetch-speed-records.mjs
├── load-events.mjs
├── load-results.mjs
├── merge-dogs.mjs
├── migrate-normalize-dog-names.mjs
├── reparse-bzmp-events.mjs
├── reparse-coursing-events.mjs
├── reparse-racing-events.mjs
├── scrape-year-index.mjs
├── sync-local-to-remote.mjs
├── test-parser.mjs
└── update-current-year.mjs
```

**Предлагаемая:**
```
backend/scripts/
├── scrape/              # Скрапинг данных
│   └── scrape-year-index.mjs
├── load/                # Загрузка данных в БД
│   ├── load-events.mjs
│   └── load-results.mjs
├── reparse/             # Репарсинг событий
│   ├── reparse-bzmp-events.mjs
│   ├── reparse-coursing-events.mjs
│   └── reparse-racing-events.mjs
├── migrate/             # Миграции БД
│   └── migrate-normalize-dog-names.mjs
├── sync/                # Синхронизация D1
│   └── sync-local-to-remote.mjs
├── update/              # Обновление данных
│   ├── update-current-year.mjs
│   └── merge-dogs.mjs
├── speed/               # Рекорды скорости
│   ├── fetch-speed-records.mjs
│   └── fetch-speed-records-pdf.py
├── test/                # Тесты
│   └── test-parser.mjs
├── ci/                  # CI/CD скрипты
│   └── ci-update-db.mjs
└── archive/             # Архивные скрипты (18 файлов)
```

**Преимущества:**
- Четкое разделение по типам операций
- Легко найти нужный скрипт
- Масштабируемость

---

### backend/src/routes/

**Текущая:**
```
backend/src/routes/
├── admin.js
├── competitions.js
├── dogs.js
├── judges.js
├── speed.js
└── top.js
```

**Предлагаемая:**
```
backend/src/routes/
├── admin.js
├── events.js (переименовать из competitions.js)
├── dogs.js
├── judges/
│   ├── index.js (основной, из judges.js)
│   └── stats.js (статистика, если большой файл)
├── speed.js
└── top.js
```

**Преимущества:**
- Более очевидное название events.js
- Возможность разбить большой judges.js на модули

---

### frontend/src/components/

**Текущая:**
```
frontend/src/components/
├── DogSilhouettes.jsx
├── DogStatsTable.jsx
├── DogTooltip.jsx
├── FilterSelect.jsx
└── FiltersDropdown.jsx
```

**Предлагаемая:**
```
frontend/src/components/
├── DogSilhouettes.jsx
├── DogStatsTable.jsx
├── DogTooltip/
│   ├── index.jsx (из DogTooltip.jsx)
│   └── components/ (если есть подкомпоненты)
├── FilterSelect.jsx
└── FiltersDropdown.jsx
```

**Преимущества:**
- Возможность разбить большой DogTooltip.jsx на модули

---

### frontend/src/pages/

**Текущая:**
```
frontend/src/pages/
├── DogProfile.jsx
├── EventResults.jsx
├── Events.jsx
├── JudgeDetail.jsx
├── Judges.jsx
├── Procoursing.jsx
├── SpeedRecords.jsx
├── SpeedRecordsStats.jsx
└── TopDogs.jsx
```

**Предлагаемая:**
```
frontend/src/pages/
├── DogProfile.jsx
├── Events/
│   ├── index.jsx (из Events.jsx)
│   └── EventResults.jsx
├── Judges/
│   ├── index.jsx (из Judges.jsx)
│   └── JudgeDetail.jsx
├── Procoursing.jsx
├── SpeedRecords/
│   ├── index.jsx (из SpeedRecords.jsx)
│   └── Stats.jsx (из SpeedRecordsStats.jsx)
└── TopDogs.jsx
```

**Преимущества:**
- Логическая группировка связанных страниц
- Легко найти все страницы по функционалу
- Масштабируемость

**Примечание:** После группировки нужно обновить импорты в App.jsx и router.

---

### data/

**Текущая:**
```
data/
├── events-2023.json
├── events-2024.json
├── events-2025.json
├── events-2026.json
├── events-historical.json
├── events.json
├── load-events.sql
├── load-results.sql
├── migrate-add-judges.sql
├── migrate-add-track-schemes.sql
├── migrate-normalize-dogs.sql
├── migrate-normalize-total-score.sql
├── migrate-remote-schema.sql
├── migrate-simplify-statuses.sql
├── migrate-speed-records-history.sql
├── speed-records.sql
├── sync-dogs.sql
├── sync-events.sql
├── sync-local-to-remote.sql
├── sync-results.sql
├── update-judges.sql
├── update-missing-bib-numbers.sql
├── update-raw-scores.sql
├── update-status-reasons.sql
└── update-track-schemes.sql
```

**Предлагаемая:**
```
data/
├── events/              # JSON файлы событий
│   ├── events-2023.json
│   ├── events-2024.json
│   ├── events-2025.json
│   ├── events-2026.json
│   ├── events-historical.json
│   └── events.json
├── migrations/          # SQL миграции
│   ├── migrate-add-judges.sql
│   ├── migrate-add-track-schemes.sql
│   ├── migrate-normalize-dogs.sql
│   ├── migrate-normalize-total-score.sql
│   ├── migrate-remote-schema.sql
│   ├── migrate-simplify-statuses.sql
│   └── migrate-speed-records-history.sql
├── exports/             # SQL экспорты (для синка)
│   ├── sync-events.sql
│   ├── sync-results.sql
│   └── sync-dogs.sql
├── imports/             # SQL импорты (для загрузки)
│   ├── load-events.sql
│   ├── load-results.sql
│   └── speed-records.sql
├── updates/             # SQL обновления
│   ├── update-judges.sql
│   ├── update-missing-bib-numbers.sql
│   ├── update-raw-scores.sql
│   ├── update-status-reasons.sql
│   └── update-track-schemes.sql
└── temp/                # Временные файлы
    └── sync-local-to-remote.sql
```

**Преимущества:**
- Четкое разделение по типам операций
- Легко найти нужный SQL файл
- Масштабируемость

**Примечание:** После реструктуризации нужно обновить пути в скриптах.

---

### Корневые файлы

**Текущая:**
```
/
├── 2.svg
├── README.md
├── package.json
├── push-github.bat
├── start-local.bat
└── wrangler.toml
```

**Предлагаемая:**
```
/
├── README.md
├── package.json
├── wrangler.toml
├── scripts/              # Batch/Shell скрипты
│   ├── start-local.bat
│   └── push-github.bat
└── assets/               # Статические ассеты
    └── logo.svg (переименовать из 2.svg)
```

**Преимущества:**
- Чистый корень проекта
- Логическая группировка скриптов и ассетов
- Очевидные названия файлов

**Примечание:** После реструктуризации нужно обновить README.md и .gitignore.

---

## План миграции

### Этап 1: backend/scripts/

1. Создать папки: scrape/, load/, reparse/, migrate/, sync/, update/, speed/, test/, ci/
2. Переместить файлы:
   - scrape-year-index.mjs → scrape/
   - load-events.mjs, load-results.mjs → load/
   - reparse-*.mjs → reparse/
   - migrate-normalize-dog-names.mjs → migrate/
   - sync-local-to-remote.mjs → sync/
   - update-current-year.mjs, merge-dogs.mjs → update/
   - fetch-speed-records.mjs, fetch-speed-records-pdf.py → speed/
   - test-parser.mjs → test/
   - ci-update-db.mjs → ci/
3. Обновить package.json скрипты
4. Обновить README.md
5. Тестировать все скрипты

### Этап 2: backend/src/routes/

1. Переименовать competitions.js → events.js
2. Проверить размер judges.js
3. Если большой (>10 KB), разбить на judges/index.js и judges/stats.js
4. Обновить импорты в worker.js
5. Тестировать API

### Этап 3: frontend/src/components/

1. Проверить размер DogTooltip.jsx
2. Если большой (>10 KB), создать DogTooltip/ и разбить
3. Обновить импорты
4. Тестировать фронтенд

### Этап 4: frontend/src/pages/

1. Создать папки: Events/, Judges/, SpeedRecords/
2. Переместить файлы:
   - Events.jsx → Events/index.jsx
   - EventResults.jsx → Events/
   - Judges.jsx → Judges/index.jsx
   - JudgeDetail.jsx → Judges/
   - SpeedRecords.jsx → SpeedRecords/index.jsx
   - SpeedRecordsStats.jsx → SpeedRecords/Stats.jsx
3. Обновить импорты в App.jsx
4. Обновить router paths
5. Тестировать фронтенд

### Этап 5: data/

1. Создать папки: events/, migrations/, exports/, imports/, updates/, temp/
2. Переместить файлы по категориям
3. Обновить пути в скриптах
4. Тестировать скрипты

### Этап 6: Корневые файлы

1. Создать папки: scripts/, assets/
2. Переместить файлы:
   - start-local.bat, push-github.bat → scripts/
   - 2.svg → assets/logo.svg
3. Обновить README.md
4. Обновить .gitignore
5. Обновить ссылки на файлы

### Этап 7: Обновление документации

1. Обновить docs/08-DEVELOPMENT.md
2. Обновить docs/00-AI-MEMORY-SETUP.md
3. Обновить memories
4. Обновить README.md

---

## Риски

- **Обновление импортов:** Много файлов нужно обновить
- **Тестирование:** Нужно протестировать все скрипты и API
- **CI/CD:** GitHub Actions могут сломаться
- **Разрыв:** Рекомендуется делать поэтапно с коммитами

---

## Рекомендации

1. **Делать поэтапно:** Каждая папка отдельно с коммитом
2. **Тестировать после каждого этапа:** Убедиться что ничего сломалось
3. **Создать ветку:** Не делать в main
4. **Обновить документацию сразу:** Не откладывать
5. **Сообщить команде:** Если есть другие разработчики

---

## Приоритет

**Высокий:**
- backend/scripts/ (наибольшая польза)
- data/ (наибольшая польза)
- frontend/src/pages/ (улучшение навигации)

**Средний:**
- backend/src/routes/ (минимальные изменения)
- frontend/src/components/ (если большой файл)

**Низкий:**
- Корневые файлы (косметические изменения)

---

## Дата создания

2026-06-27
