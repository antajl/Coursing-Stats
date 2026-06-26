# Decision Log — Лог архитектурных решений

Этот файл фиксирует важные архитектурные решения и эксперименты, чтобы избежать повторения ошибок.

## 2026-06-26: Рефакторинг фронтенда

**Проблемы:**
- Mock-фолбэк в prod: `fetchWithFallback()` всегда возвращал mock-данные при ошибке, даже в продакшене
- Events.jsx обходил api.js и делал прямые fetch() с собственной копией API_URL
- App.jsx дублировал API_URL из api.js
- TopDogs.jsx загружал все три рейтинга одновременно при смене фильтров
- Дублирование фильтрации по breed (API + клиент)
- Константы (цвета дисциплин, статусы) дублировались по файлам
- Шаблонные файлы от create-vite (hero.png, react.svg, vite.svg) не использовались

**Решения:**
- Добавлена проверка `IS_DEV` в `fetchWithFallback()` — в prod нет fallback на mock
- Events.jsx переведён на api.js (api.getEvents(), api.getYears())
- Удалена дублирующаяся константа API_URL из App.jsx
- TopDogs.jsx загружает только активную вкладку, отслеживает загруженные вкладки
- Убрана клиентская фильтрация по breed (API уже возвращает отфильтрованные данные)
- Создан `frontend/src/constants.js` с DISCIPLINE_COLORS и STATUSES
- Удалены неиспользуемые assets (hero.png, react.svg, vite.svg)

**Реализация:**
- Обновлён `frontend/src/services/api.js`
- Обновлён `frontend/src/pages/Events.jsx`
- Обновлён `frontend/src/App.jsx`
- Обновлён `frontend/src/pages/TopDogs.jsx`
- Создан `frontend/src/constants.js`
- Обновлён `frontend/src/pages/Events.jsx` (импорт из constants.js)
- Удалены файлы из `frontend/src/assets/`

**Коммиты:**
- Починен mock-фолбэк в продакшене
- Events.jsx переведён на api.js
- Убрано дублирование API_URL из App.jsx
- Оптимизирован TopDogs.jsx
- Вынесены константы в constants.js
- Удалены неиспользуемые assets

## 2026-06-26: Покупка домена для решения проблемы uBlock Origin

**Проблема:**
- uBlock Origin блокирует cross-origin запросы к `antajltube.workers.dev` как потенциальный трекер
- Это edge case одного расширения, но uBlock популярен среди пользователей
- Pages Functions эксперимент уже пробовали и откатили (задокументировано ниже)

**Решение:**
- Куплен домен `antajl.ru` (основной) и `antajl.online` (дополнительный)
- NS записи изменены на Cloudflare (raquel.ns.cloudflare.com, rohin.ns.cloudflare.com)
- Настроены поддомены в Cloudflare:
  - `procoursing.antajl.ru` → Pages (фронтенд)
  - `api.procoursing.antajl.ru` → Worker (API)
- После обновления DNS фронтенд будет делать запросы к собственному домену, uBlock не будет блокировать

**Реализация:**
- Домены куплены на Reg.ru за 170 рублей
- NS записи изменены на Cloudflare
- Поддомены настроены в Cloudflare Dashboard
- Ожидание обновления DNS (1-2 часа, до 24 часов)

**Коммиты:**
- Обновлена документация (00-OVERVIEW.md) с информацией о новых доменах

## 2026-06-26: Упрощение статусов участников

**Проблема:** В коде использовались 5 статусов (finished, disqualified, withdrawn, dnf, dns), но на фронтенде они группировались в 2 категории (дисквалифицирован/не участвовал). Детальное разделение не использовалось по-разному.

**Решение:** Упростить до 3 статусов:
- `finished` — получил оценки
- `disqualified` — дисквалифицирован/снят/не финишировал (причина сохраняется в `status_reason`)
- `dns` — неявка (не участвовал)

**Реализация:**
- Обновлён `detectStatusFromText()` в парсере
- Создана миграция `data/migrate-simplify-statuses.sql`
- Обновлён фронтенд для работы с 3 статусами
- Причины отстранения сохраняются в `status_reason` для отображения в UI

**Коммиты:**
- Упрощение статусов в парсере
- Миграция статусов в базе данных
- Обновление фронтенда для упрощённых статусов

## 2026-06-26: Pages Functions эксперимент

**Проблема:** CORS при прямых запросах фронтенда к Worker API.

**Эксперимент:** Попытка использовать Cloudflare Pages Functions как прокси-слой для избежания CORS.

**Результат:** Не сработало. Проблемы:
- Сложности с binding names (hyphens не разрешены в binding names)
- 7 коммитов туда-обратно (63ec470 → de8bcbf)
- В итоге реверт на прямые запросы к Worker с wildcard CORS

**Решение:** Оставить Worker API с wildcard CORS, не повторять эксперимент с Pages Functions.

**Коммиты:**
- Add Cloudflare Pages Functions to proxy API requests and avoid CORS
- Fix: Update Pages Function to use env.pc_db binding name
- Fix: Use env['pc-db'] for binding name with hyphen
- Add: Complete Pages Functions for all API endpoints
- Change: Frontend uses relative paths for Pages Functions
- Fix: Pages Functions issues - speed query, breeds/years format, App.jsx API URL
- Revert: Back to Worker API with wildcard CORS (Pages Functions not working)

## 2026-06-26: Нормализация total_score

**Проблема:** Разные шкалы баллов для разных форматов:
- 2025-2026: сырая сумма (grand_total), зависит от числа судей (1=200 max, 2=400 max, 3=600 max)
- 2023-2024: деление на захардкоженные 2 судьи

**Решение:** ВСЕГДА делить на реальное количество судей (grand_total / judge_count) для сравнимости.

**Реализация:**
- Функция `extractJudgeCount()` в парсере курсинга
- SQL миграция для пересчета существующих данных
- Правило в AI-GUIDELINES: "Нормализация total_score: ВСЕГДА делить на количество судей"

## 2026-06-26: Безопасность admin-эндпоинтов

**Проблема:** Admin-эндпоинты без авторизации:
- POST /api/recreate-views
- POST /api/admin/reparse-coursing
- POST /api/update/trigger

**Решение:** Добавить проверку заголовка X-Admin-Token с переменной окружения ADMIN_TOKEN.

**Реализация:**
- Функция `checkAdminToken()` в worker.js
- Убрать кнопку "Обновить данные" из публичного UI

## 2026-06-26: Mock-фолбэк в продакшене

**Проблема:** При таймауте API (5 сек) фронтенд показывал фейковые mock-данные без явного предупреждения.

**Решение:** Убрать автоматический fallback в продакшене. Mock-данные только для локальной разработки (import.meta.env.DEV).

**Реализация:**
- Заменить `fetchWithFallback()` на `fetchAPI()` без fallback
- Mock-данные только при IS_DEV = true
