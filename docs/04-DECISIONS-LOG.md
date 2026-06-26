# Decision Log — Лог архитектурных решений

Этот файл фиксирует важные архитектурные решения и эксперименты, чтобы избежать повторения ошибок.

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
