# 00. Project Overview — Полный обзор для ИИ-агента

## Краткое описание

**ProCoursing Stats** — агрегатор статистики собак по результатам соревнований курсинга, БЗМП и бегов с сайта procoursing.ru (2015-2026).

**Статус проекта:** ✅ **ПОЛНОСТЬЮ РАБОЧИЙ** — фронтенд и бэкенд развернуты и функционируют.

## Технический стек

### Backend
- **Cloudflare Worker** — API сервер
- **Cloudflare D1** — SQLite база данных
- **Node.js** — скраперы и парсеры
- **cheerio** — HTML парсинг
- **iconv-lite** — декодирование windows-1251

### Frontend
- **React** — UI фреймворк
- **Vite** — сборщик
- **TailwindCSS** — стили
- **shadcn/ui** — компоненты
- **Lucide** — иконки

### Деплой
- **Cloudflare Pages** — фронтенд
- **Cloudflare Workers** — бэкенд
- **Cloudflare D1** — база данных

## Текущее состояние данных

### База данных — local и remote синхронизированы (2026-06-25)

| Таблица | Записей |
|---------|---------|
| events | 302 |
| dogs | ~1579 |
| results | 4639 |

**Remote D1:** ~21 MB. Проверка: `GET /api/top/placement?year=2025` возвращает данные.

### Распределение по годам (results)
- **2023:** 771 результатов (22 события)
- **2024:** 1086 результатов (27 событий)
- **2025:** 1971 результатов (50 событий)
- **2026:** 811 результатов (16 событий)
- **2015-2022:** НЕДОСТУПНЫ (хранятся как изображения, требуется OCR)

### Статусы результатов
- `finished` — завершенные выступления
- `dns` — неявка
- `withdrawn` — снят/сошел
- `disqualified` — дисквалифицирован
- `dnf` — не финишировал
- `unknown_status_check_raw_text` — требует ручной проверки

## API эндпоинты

### Основные эндпоинты
- `GET /api/top/placement` — топ по местам (медальный зачёт)
- `GET /api/top/score` — топ по очкам
- `GET /api/top/speed` — топ по скорости (racing)
- `GET /api/dogs/:id` — профиль собаки
- `GET /api/breeds` — список пород
- `GET /api/years` — список годов
- `GET /api/events` — список событий

### Параметры фильтрации
- `breed` — фильтр по породе
- `year` — фильтр по году
- `minStarts` — минимальное количество стартов
- `limit` / `offset` — пагинация (опционально; при `limit` ответ — объект `{ items, total, limit, offset }`)

## Локальная разработка

### Запуск серверов
```bash
# Backend (Worker)
cd backend
npx wrangler dev
# Запускается на http://127.0.0.1:8787

# Frontend (Vite)
cd frontend  
npm run dev
# Запускается на http://localhost:5173
```

**ВАЖНО:** Серверы МОЖНО запускать командами. Это разрешено и рекомендуется для разработки.

## Автоматизация (GitHub Actions)

### Workflow: Update D1 Database
- **Запуск:** Каждый понедельник в 03:00 UTC
- **Ручной запуск:** GitHub → Actions → Update D1 Database → Run workflow
- **Что делает:**
  - Скрапинг индекса событий текущего года
  - Парсинг результатов с procoursing.ru
  - Загрузка данных в remote D1
- **Скрипт:** `backend/scripts/ci-update-db.mjs`

### Workflow: Deploy Frontend
- **Запуск:** При push в main с изменениями в `frontend/`
- **Ручной запуск:** GitHub → Actions → Deploy Frontend → Run workflow
- **Что делает:**
  - Установка зависимостей фронтенда
  - Сборка React-приложения
  - Деплой на Cloudflare Pages
- **Результат:** Автоматическое обновление сайта https://procoursing.pages.dev

### Тестирование парсера
```bash
cd backend
node scripts/test-parser.mjs
```

### Перепарсинг данных
```bash
cd backend
node scripts/reparse-standalone.mjs
```

## Ключевые файлы проекта

### Backend
- `backend/src/worker.js` — Cloudflare Worker API
- `backend/schema.sql` — схема базы данных
- `backend/lib/dog-lookup.mjs` — нормализация кличек, поиск собак
- `backend/parsers/parse-results-coursing.mjs` — парсер курсинга
- `backend/parsers/parse-results-bzmp.mjs` — парсер БЗМП
- `backend/parsers/parse-results-racing.mjs` — парсер бега
- `backend/scripts/ci-update-db.mjs` — пайплайн для GitHub Actions
- `backend/scripts/sync-local-to-remote.mjs` — синк локальной D1 → remote
- `backend/scripts/migrate-normalize-dog-names.mjs` — миграция кличек
- `backend/scripts/merge-dogs.mjs` — ручное слияние дубликатов
- `backend/scripts/reparse-standalone.mjs` — перепарсинг данных
- `backend/scripts/test-parser.mjs` — тест парсера

### Frontend
- `frontend/src/App.jsx` — главный компонент
- `frontend/src/pages/TopDogs.jsx` — страница топов
- `frontend/src/pages/DogProfile.jsx` — профиль собаки
- `frontend/src/pages/Events.jsx` — календарь событий
- `frontend/src/services/api.js` — API клиент

## Архитектурные решения

### Два отдельных рейтинга
- **По местам:** медальный зачёт (золото→серебро→бронза)
- **По очкам:** лучший результат + средний + число стартов
- **НЕ сводить в одну формулу!**

### Родословные
- Переход на внешний сайт: https://saluki.breedarchive.com/
- Парсинг PDF-каталогов не реализован

### Нормализация очков (coursing)
- `total_score` рассчитывается как среднее от баллов всех судей
- Учитываются оба забега (heat1 + heat2)
- При статусе во втором забеге учитывается только первый

### Обработка статусов
- Функция `detectStatusFromText` в `parse-results-coursing.mjs`
- Маркеры: неявка, дисквалификац, снят, сошел, отстран, ветеринар
- raw_text сохраняется всегда для отладки

## Известные проблемы

### Остаточные «Dog not found» при перепарсинге
- После нормализации кличек и миграции remote — значительно реже
- Ручное слияние: `merge-dogs.mjs`

### Исторические данные 2015–2022
- Результаты на сайте — изображения, нужен OCR

## Правила для ИИ-агента

### Критические правила
1. **ВСЕГДА читай этот файл первым** — полный контекст проекта
2. **Перед изменением парсера — прогони тест** — `node scripts/test-parser.mjs`
3. **Не меняй архитектурные решения** — два топа, все породы, весь архив
4. **Сохраняй raw_text всегда** — страховка от потери данных
5. **Серверы МОЖНО запускать** — это разрешено для разработки

### Работа с кодировкой
- procoursing.ru использует windows-1251
- Используй `iconv-lite` для декодирования
- НЕ доверяй `fetch().text()` — декодируй из байт

### Порядок работы
1. Прочитай `00-PROJECT-OVERVIEW.md` (этот файл)
2. Проверь актуальность других docs файлов
3. Перед изменением — прогони тесты
4. После изменения — обнови документацию

## Быстрый старт для нового ИИ

Если ты только что подключился к проекту:

1. **Понять структуру:** прочитай этот файл + `01-project-context.md`
2. **Запустить проект:**
   ```bash
   cd backend && npx wrangler dev
   cd frontend && npm run dev
   ```
3. **Проверить работоспособность:**
   - Открой http://localhost:5173
   - Проверь API эндпоинты на http://127.0.0.1:8787
4. **Изучить код:**
   - `backend/src/worker.js` — API
   - `backend/parsers/parse-results-coursing.mjs` — парсер
   - `frontend/src/pages/TopDogs.jsx` — UI

## Контакты и поддержка

- **Источник данных:** http://procoursing.ru
- **Лицензия данных:** проверить перед коммерческим использованием
- **Проблемы:** сначала проверь кодировку и логику парсера

## Последние изменения (2026-06-25)

### Выполнено
- ✅ План улучшений 1–5 (lint, нормализация, merge-dogs, GitHub Actions, пагинация)
- ✅ Миграция кличек на remote D1 (`migrate-normalize-dogs.sql`)
- ✅ Синхронизация local → remote (`sync-local-to-remote.mjs`) — 4639 results
- ✅ Миграция схемы remote (`migrate-remote-schema.sql`)
- ✅ GitHub Actions secrets настроены

### Осталось
- 📋 OCR для 2015–2022
- 📋 Родословные в UI (внешние ссылки)
- 📋 `wrangler deploy` после изменений worker.js (если ещё не задеплоен)

---

**Этот файл дает полный контекст проекта для любого ИИ-агента. Начни здесь!**
