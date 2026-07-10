# Admin Workflow — Работа с админкой

> **ИИ:** API endpoints — [05-API-REFERENCE.md](05-API-REFERENCE.md). Runtime данные — [03-DATA.md](03-DATA.md).

Workflow для редактирования данных через админку (альтернатива скриптам).

---

## Обзор

Админка — локальный UI для редактирования данных без использования скриптов парсинга. Работает только в dev режиме.

**URL:** `http://localhost:5173/admin` (при `npm run dev`)

**Backend API:** `http://127.0.0.1:8787` (local-dev-server)

---

## Настройка

### Требования
- Установить `ADMIN_API_TOKEN` в `.env.local`
- Запустить `npm run dev` (frontend + backend API)

### Пример .env.local
```env
ADMIN_API_TOKEN=your-secret-token-here
```

---

## Компоненты админки

### Frontend (`frontend/src/pages/Admin/`)

- `index.tsx` — Admin dashboard с списком событий
- `EventEdit.tsx` — Форма редактирования события (30KB, сложная)
- `AdminCalendarForm.tsx` — Форма календаря события
- `AdminResultsSection.tsx` — Редактирование результатов с редактором оценок
- `ResultScoresEditor.tsx` — Редактор оценок судей
- `DogSearchSelect.tsx` — Поиск собак для результатов
- `adminApi.ts` — Admin API клиент
- `adminEventUtils.ts` — Утилиты событий

### Backend API (`backend/src/routes/admin.ts`)

**Защита:** Все endpoints требуют заголовок `X-Admin-Token`

**Endpoints:**
- `POST /api/admin/events` — Создание/обновление события
- `POST /api/admin/results` — Загрузка результатов
- `DELETE /api/admin/events/:id` — Удаление события
- `POST /api/admin/reparse` — Перепарсинг результатов
- `POST /api/admin/recreate-views` — Пересоздание views

**Ограничения:**
- Local only (не доступен в production)
- Пишет напрямую в JSON файлы в `data/v1/`
- Sync mechanism: SQLite → data/v1/ через sync-sqlite-to-v1

---

## Workflow редактирования события

### 1. Открыть админку
```bash
npm run dev
# Открыть http://localhost:5173/admin
```

### 2. Выбрать событие
- Список исторических событий (год < 2026)
- Фильтр по году

### 3. Редактировать событие
- Изменить title, location, dates
- Добавить/изменить judges
- Добавить track_schemes

### 4. Сохранить
- POST /api/admin/events с X-Admin-Token
- Данные сохраняются в SQLite
- Автоматический sync в data/v1/

---

## Workflow редактирования результатов

### 1. Открыть событие в админке
- Перейти к событию
- Открыть секцию результатов

### 2. Добавить результат
- Поиск собаки через DogSearchSelect
- Ввод breed_class, catalog_no
- Редактирование оценок через ResultScoresEditor

### 3. Сохранить результат
- POST /api/admin/results с X-Admin-Token
- Данные сохраняются в SQLite
- Автоматический sync в data/v1/

---

## Sync механизм

### SQLite → data/v1/
Админка пишет в локальную SQLite, затем синхронизирует в JSON:

```bash
npm run sync-sqlite-to-v1
```

**Скрипт:** `backend/scripts/sync/sync-sqlite-to-v1.ts`

**Что синхронизируется:**
- events → data/v1/competitions/
- results → в соответствующие файлы событий
- dogs → data/v1/dogs/
- indexes → пересборка

---

## Альтернатива: прямое редактирование JSON

Для быстрого исправления можно редактировать JSON напрямую:

```bash
# Редактировать файл события
nano data/v1/competitions/2026/04/123-event-slug.json

# Пересобрать индексы
npm run build-all-data
```

**Ограничения:**
- Нет валидации
- Можно сломать формат
- Рекомендуется только для опытных пользователей

---

## Типичные задачи

### Добавить новое событие
1. Админка → Создать событие
2. Заполнить форму (AdminCalendarForm)
3. Сохранить
4. Добавить результаты (если есть)

### Исправить результат
1. Админка → Событие → Результаты
2. Найти результат
3. Редактировать оценки (ResultScoresEditor)
4. Сохранить

### Удалить событие
1. Админка → Событие
2. Удалить (DELETE /api/admin/events/:id)
3. Подтвердить

---

## Безопасность

### X-Admin-Token
- Обязательный заголовок для всех admin запросов
- Проверяется в backend/src/routes/admin.ts
- Защищает от несанкционированного доступа

### Local only
- Админка не деплоится в production
- API доступен только на localhost:8787
- Production использует только статические JSON

---

## См. также

- [06-API-REFERENCE.md](06-API-REFERENCE.md) — Admin API endpoints
- [03-DATA.md](03-DATA.md) — Runtime данные в data/v1/
- [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md) — Workflow D1
