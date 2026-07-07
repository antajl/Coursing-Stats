# Временный план рефакторинга Coursing Stats

**Важно:** procoursing.ru не работает, база данных D1 НЕ должна быть затронута.

## Приоритет 1: Массовые и простые удаления (безопасно)

### 1.1 Проверить использование парсера v1
- **Файлы:** `backend/parsers/parse-results-*.ts`
- **Действие:** grep по проекту для поиска импортов
- **Решение:** Если не используется - удалить, если используется - оставить

### 1.2 Удалить временные файлы в .cursor/
- `.cursor/tmp-coursing-rules.txt` (86 KB)
- `.cursor/tmp-hits.txt` (3 KB)
- `.cursor/fetch-rkf-342.py`
- `.cursor/fetch-rkf-pdf.py`

### 1.3 Удалить пустой SQL файл
- `data/updates/reparse-2023-coursing.sql` (0 bytes)

### 1.4 Архивировать выполненный план UI
- `docs/cursor-ui-plan-v2.md` → `docs/_archive/cursor-ui-plan-v2.md`

### 1.5 Переместить SQL экспорты в бекапы
- Переместить все файлы из `data/exports/` в `data/backups/exports/`
- Создать подпапку для организации

### 1.6 Объединить директории бекапов
- Переместить содержимое `data/backup/` в `data/backups/`
- Удалить пустую `data/backup/`

### 1.7 Удалить старый снапшот
- `data/archive/snapshots/2026-07-06T21-11-05/` (оставить только 2026-07-06T21-11-36)

---

## Приоритет 2: Разбивание backend routes (безопасно, только код)

### 2.1 Разбить judges.ts
- **Файл:** `backend/src/routes/judges.ts` (16 KB, 426 lines)
- **Создать:** `backend/lib/judge-stats.ts`
- **Вынести:** breed stats aggregation, criteria stats, dog stats calculation
- **Оставить в routes:** только Hono endpoints

### 2.2 Разбить admin.ts
- **Файл:** `backend/src/routes/admin.ts` (15 KB, 464 lines)
- **Создать:**
  - `backend/src/routes/admin/events.ts` - события
  - `backend/src/routes/admin/results.ts` - результаты
  - `backend/src/routes/admin/views.ts` - views recreation
- **Оставить в admin.ts:** только импорт и регистрация

---

## Приоритет 3: Разбивание frontend (нужно тестирование)

### 3.1 Разбить DogProfile.tsx
- **Файл:** `frontend/src/pages/DogProfile.tsx` (47 KB, 821 lines)
- **Создать компоненты:**
  - `frontend/src/pages/DogProfile/DogProfileHeader.tsx`
  - `frontend/src/pages/DogProfile/DogProfileStats.tsx`
  - `frontend/src/pages/DogProfile/DogProfileDonino.tsx`
  - `frontend/src/pages/DogProfile/DogProfileHistory.tsx`
  - `frontend/src/pages/DogProfile/DogProfileExport.tsx`

### 3.2 Разбить JudgeDetail.tsx
- **Файл:** `frontend/src/pages/Judges/JudgeDetail.tsx` (27 KB, 446 lines)
- **Создать:** `frontend/src/lib/judgeSortUtils.ts`
- **Вынести:** логику сортировки breed и criteria

### 3.3 Разбить EventEdit.tsx
- **Файл:** `frontend/src/pages/Admin/EventEdit.tsx` (20 KB, 533 lines)
- **Создать:**
  - `frontend/src/pages/Admin/EventEditForm.tsx`
  - `frontend/src/pages/Admin/ResultsEditor.tsx`

---

## Приоритет 4: Аудит кода

### 4.1 Поиск дублирующегося кода
- Проверить SpeedRecords компоненты на дублирование
- Проверить Donino компоненты на дублирование
- Проверить общие утилиты форматирования

---

## Порядок выполнения

1. Сначала Priority 1 (массовые удаления) - безопасно, не влияет на функциональность
2. Потом Priority 2 (backend routes) - только код, легко откатить через git
3. Потом Priority 3 (frontend) - нужно визуальное тестирование
4. Потом Priority 4 (аудит) - оптимизация

## Статус выполнения

- [x] 1.1 Check parser v1 usage - не используется, удалены
- [x] 1.2 Delete .cursor temp files - удалены
- [x] 1.3 Delete empty SQL - удалён
- [x] 1.4 Archive UI plan - архивирован
- [x] 1.5 Move SQL exports to backups - перемещены
- [x] 1.6 Merge backup directories - объединены
- [x] 1.7 Delete old snapshot - удалён
- [x] 2.1 Split judges.ts - создан backend/src/lib/judge-stats.ts
- [x] 2.2 Split admin.ts - созданы admin/events.ts, admin/results.ts, admin/views.ts
- [~] 3.1 Split DogProfile.tsx - ПРОПУЩЕНО (слишком сложно, требует тщательного тестирования)
- [x] 3.2 Split JudgeDetail.tsx - создан frontend/src/lib/judgeSortUtils.ts
- [~] 3.3 Split EventEdit.tsx - ПРОПУЩЕНО (уже использует AdminResultsSection, достаточно организован)
- [x] 4.1 Audit duplicate code - дубликатов не найдено
