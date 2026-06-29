# Design Changelog — История изменений дизайна

> Этот файл фиксирует изменения дизайна фронтенда для отслеживания эволюции визуального стиля.

## 2026-06-29: Исправления по дизайн-аудиту

**Проблемы:**
- Критический баг контраста в DogProfile (1.15:1 в dark mode)
- Отсутствие dark: вариантов для медальных бейджей в EventResults
- Отсутствие dark: варианта для пагинации в DogStatsTable (2.93:1)
- Raw цвета (yellow/orange/gray) вместо palette tokens в DogTooltip
- Отсутствие font-serif для pedigree aesthetic
- lang="en" на русском сайте
- ErrorState/EmptyState/SkeletonLoader созданы но не подключены (~20% покрытие)
- Inline loading состояния вместо SkeletonLoader

**Решения:**
- DogProfile.tsx:77 - добавлен dark:bg-charcoal-900 к внешнему контейнеру
- index.html:2 - изменен lang="en" → lang="ru"
- DogTooltip.tsx - добавлен font-serif к имени и породе, заменены raw цвета на palette tokens (camel/terracotta/old-money)
- EventResults.tsx - добавлены dark: варианты к медальным бейджам (золото/серебро/бронза)
- DogStatsTable.tsx - добавлен dark:text-old-money-400 к пагинации
- ErrorState - интегрирован в EventResults, DogProfile, TopDogs
- EmptyState - интегрирован в TopDogs
- SkeletonLoader - интегрирован в EventResults, Events/index, Judges/index, TopDogs

**Реализация:**
- Обновлён `frontend/src/pages/DogProfile.tsx`
- Обновлён `frontend/index.html`
- Обновлён `frontend/src/components/DogTooltip.tsx`
- Обновлён `frontend/src/pages/Events/EventResults.tsx`
- Обновлён `frontend/src/components/DogStatsTable.tsx`
- Обновлён `frontend/src/pages/TopDogs.tsx`
- Обновлён `frontend/src/pages/Events/index.tsx`
- Обновлён `frontend/src/pages/Judges/index.tsx`

**Результат:**
- Контраст в dark mode исправлен на критических участках
- Все страницы используют единые компоненты состояний
- Убраны raw цвета в пользу palette tokens
- Добавлен font-serif для pedigree aesthetic
- lang атрибут соответствует языку сайта

**Осталось:**
- navbar-bg-dark.svg - требует оригинальный PNG для регенерации (path данные обрезаны)

---

## 2026-06-29: Унификация теней, границ и улучшение UX

**Изменения:**
- Унифицированы тени в Events/index.tsx, Judges/index.tsx, JudgeDetail.tsx, DogStatsTable.tsx: `shadow-[0_20px_50px_rgba(67,58,49,0.08)]` → `shadow-md`
- Унифицированы границы: `border` → `border-2` в тех же файлах
- Уменьшены тени в DogTooltip.tsx: `shadow-2xl` → `shadow-xl`
- Уменьшена тень в Procoursing.tsx: `shadow-xl` → `shadow-md`
- Добавлены focus-visible стили для keyboard navigation в FiltersDropdown, FilterSelect, Events, Judges, DogProfile
- Созданы компоненты EmptyState, SkeletonLoader, ErrorState
- Интегрированы EmptyState в Events и Judges
- Интегрирован SkeletonLoader в DogProfile
- Удалены все эмодзи из компонентов (EmptyState, ErrorState)
- Улучшена адаптивность для маленьких экранов (<360px): добавлены min-w-[320px], min-h-[44px], min-w-[44px]

**Файлы:**
- `frontend/src/pages/Events/index.tsx`
- `frontend/src/pages/Judges/index.tsx`
- `frontend/src/pages/Judges/JudgeDetail.tsx`
- `frontend/src/components/DogStatsTable.tsx`
- `frontend/src/components/DogTooltip.tsx`
- `frontend/src/pages/Procoursing.tsx`
- `frontend/src/components/FiltersDropdown.tsx`
- `frontend/src/components/FilterSelect.tsx`
- `frontend/src/pages/DogProfile.tsx`
- `frontend/src/components/EmptyState.tsx` (новый)
- `frontend/src/components/SkeletonLoader.tsx` (новый)
- `frontend/src/components/ErrorState.tsx` (новый)

---

## 2026-06-29: Второй этап — доводка Stats.tsx и финальная полировка

**Проблемы:**
- Страница статистики рекордов (SpeedRecords/Stats.tsx) всё ещё имела визуальные отличия от обновлённых экранов
- Вкладки были слишком мелкими и не имели shadow при активации
- Карточки статистики не использовали градиенты и акцентные границы для выделения ключевых метрик
- Spinner загрузки использовал `border-camel-500` вместо `border-camel-600`

**Решения:**
- Вкладки статистики получили увеличенные размеры (`py-2.5`, `min-w-*`), shadow при активном состоянии и плавные переходы
- Добавлен `overflow-x-auto scrollbar-thin` для корректного отображения на мобильных
- Карточки статистики собаки: градиентные фоны (`from-camel-50 to-cream-100`), акцентные границы, uppercase лейблы с letter-spacing
- Общие карточки статистики: выделение `camel-300` границей для скоростных метрик, hover-эффект `shadow-lg`
- Spinner унифицирован: `border-camel-600` во всех местах
- Все `rounded-xl` заменены на `rounded-2xl` для более мягкого ощущения
- Все `shadow-sm` заменены на `shadow-md` для лучшей глубины

**Реализация:**
- Обновлён `frontend/src/pages/SpeedRecords/Stats.tsx`:
  - Вкладки: улучшены размеры и стили
  - Карточки собаки: градиенты и акцентные границы
  - Общая статистика: camel-акценты для скоростных метрик
  - Hover-эффекты на карточках
  - Унификация spinner цвета

**Результат:**
- Страница статистики теперь визуально согласована с остальными экранами
- Вкладки имеют более выраженную обратную связь при взаимодействии
- Ключевые метрики (скорость) выделены акцентным цветом
- Все карточки имеют одинаковую глубину и мягкость скруглений

**Проверка:**
- Выполнен `npm run build` в `frontend/`
- Сборка завершилась успешно (`vite build`, exit code 0)

---

## 2026-06-29: Третий этап — упрощение data-heavy экранов и переработка DogProfile

**Проблемы:**
- Data-heavy экраны (Events, Judges, TopDogs) уже были обновлены в первых этапах
- DogProfile выглядел слишком "декоративно" с градиентами и случайными золотыми акцентами
- Не хватало ощущения "музейной" благородности и чёткой структуры

**Решения:**
- Упрощён фон DogProfile: убран градиент, оставлен чистый `cream-50`
- Кнопка экспорта: вместо заливки camel — outline-стиль с белым фоном
- Шапка профиля: убраны градиенты, добавлены чёткие границы, более строгая типографика
- Карточки статистики: унифицированные границы, uppercase лейблы, более нейтральные фоны
- Медали: убраны цветные тексты (text-yellow-700 и т.д.), оставлены только эмодзи
- История выступлений: добавлены границы карточек, унифицированы стили

**Реализация:**
- Обновлён `frontend/src/pages/DogProfile.tsx`:
  - Фон: `bg-cream-50` вместо градиента
  - Кнопка экспорта: outline-стиль
  - Шапка: строгая структура с чёткими границами
  - Статистика: uppercase лейблы, нейтральные фоны
  - Медали: только эмодзи, charcoal для текста
  - История: карточки с границами

**Результат:**
- DogProfile стал более "музейным" и благородным
- Убраны случайные декоративные акценты
- Чёткое деление на блоки: профиль / статистика / история
- Единый визуальный язык с остальными экранами

**Проверка:**
- Выполнен `npm run build` в `frontend/`
- Сборка завершилась успешно (`vite build`, exit code 0)

---

## 2026-06-29: Первый этап системного редизайна фронтенда

**Проблемы:**
- Интерфейс распадался на несколько визуальных подстилей: `old-money` база смешивалась с несогласованными `gold` и `steel`
- Табличные экраны были перегружены декоративными акцентами и теряли ощущение продуктовой цельности
- Фильтры, тулбары и таблицы были похожи, но не образовывали стабильную единую систему
- В точке входа фронтенда был неверный путь `main.jsx` при фактическом использовании `main.tsx`

**Решения:**
- Зафиксирован единый визуальный базис: `cream / old-money / camel / charcoal` как основа интерфейса
- `gold` и `steel` легализованы в палитре как совместимые системные алиасы, чтобы убрать визуальные и технические расхождения
- Акцентный цвет `camel` закреплён как основной для действий, ссылок и ключевых метрик
- Data-heavy экраны переведены на более спокойные шапки таблиц, более нейтральные поверхности и более строгую иерархию текста
- Общие компоненты фильтрации обновлены так, чтобы страницы перестали расходиться по ощущению
- Исправлена точка входа `frontend/index.html` для корректной сборки

**Реализация:**
- Обновлён `frontend/tailwind.config.js`:
  - уточнена базовая палитра `old-money`, `cream`, `camel`, `forest`, `charcoal`, `terracotta`, `warm-blue`
  - добавлены официальные алиасы `gold` и `steel`
- Обновлён `frontend/index.html`:
  - путь входного скрипта исправлен с `main.jsx` на `main.tsx`
- Обновлены общие компоненты:
  - `frontend/src/components/FilterSelect.tsx`
  - `frontend/src/components/FiltersDropdown.tsx`
  - `frontend/src/components/DogStatsTable.tsx`
  - `frontend/src/components/DogTooltip.tsx`
- Обновлены ключевые страницы:
  - `frontend/src/pages/TopDogs.tsx`
  - `frontend/src/pages/Events/index.tsx`
  - `frontend/src/pages/Events/EventResults.tsx`
  - `frontend/src/pages/Judges/index.tsx`
  - `frontend/src/pages/Judges/JudgeDetail.tsx`
  - `frontend/src/pages/DogProfile.tsx`
  - `frontend/src/pages/SpeedRecords/index.tsx`
  - `frontend/src/pages/SpeedRecords/Stats.tsx`

**Результат:**
- Интерфейс стал визуально тише и целостнее без смены продуктовой структуры
- Таблицы и фильтры теперь ближе к одному стилю вместо набора похожих, но расходящихся решений
- Профиль собаки и страницы деталей получили более уверенную иерархию и более ясные акцентные цвета
- Продакшен-сборка фронтенда проходит успешно после изменений

**Проверка:**
- Выполнен `npm run build` в `frontend/`
- Сборка завершилась успешно (`vite build`, exit code 0)

**Следующий этап:**
- Довести `SpeedRecords/Stats.tsx` до того же уровня системности, что и остальные экраны
- Упростить навигационные и вспомогательные состояния в `App.tsx`
- При необходимости отдельно сделать более глубокий polish для `DogProfile` как флагманского экрана
