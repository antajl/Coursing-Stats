# Changelog — История изменений

Все значимые изменения проекта ProCoursing Stats.

## [Unreleased]

### 2026-07-04 — Админ-интерфейс, исправление TypeScript ошибок, OCR эксперимент

- **Админ-интерфейс для исторических данных:**
  - Создана страница `/admin` с авторизацией через `ADMIN_API_TOKEN`
  - Проверка токена через API перед входом (защита от неверных токенов)
  - Список событий до 2026 года с фильтром по году
  - Страница редактирования `/admin/events/:id` с inline-редактированием результатов
  - CRUD операции для результатов (создание, редактирование, удаление)
  - Изменения сохраняются сразу в D1 базу данных
  - Новые API endpoints: `/api/admin/events`, `/api/admin/events/:id/results`, `/api/admin/results/:id`
- **Исправление TypeScript ошибок (42 → 0):**
  - Создан `frontend/src/vite-env.d.ts` для Vite environment variables
  - Исправлены типы в `FilterSelect`, `api.ts`, `useSpeedRecordsPage.ts`, `DogTooltip.tsx`, `MedalTally.tsx`
  - Расширен generic тип в `dedupeByRecordDate` function
  - Добавлены `Number()` casts в `DogProfile.tsx` и `DoninoDogProfile.tsx`
- **Backend API:**
  - Добавлен UTF-8 charset middleware для исправления кодировки в JSON ответах
  - Исправлен `/api/dogs` маршрут (был SPA fallback)
- **OCR эксперимент (не используется в продакшене):**
  - Установлены `tesseract.js` и `sharp`
  - Созданы скрипты для скачивания изображений 2015 года и OCR
  - Результат: OCR качество недостаточно (~50% confidence), решено использовать ручной ввод
- **Конфигурация:**
  - Изменен Vite proxy target на локальный бэкенд (`http://127.0.0.1:8787`)
  - Подробности: `docs/CHANGES-2026-07-04.md`

### 2026-07-03 — UI polish, календарь, Донино, тема

- **Nav:** `.nav-glass` (прозрачность + blur 16px), лого слева / ссылки по центру viewport / тема и источники справа
- **Тема:** по умолчанию **светлая**; `localStorage.theme` = `dark` | `light`; без авто-`prefers-color-scheme`
- **Календарь:** компактный тулбар, `FilterSelect` без подписей (`allLabel` / `ariaLabel`), легенда и счётчик справа
- **EventResults:** «Назад» через `navigate(-1)`; бронзовый `PlacementBadge` через CSS vars в `index.css`
- **DogStatsTable:** иконки медалей в заголовках, числа в ячейках
- **Донино:** `lib/recordDates.ts` (Excel serial, формат дат); `Stats.tsx` limit 10000 для распределения скоростей; таблица — limit 1000; dark-стили бейджей `upd`/`new`
- Подробности: `docs/CHANGES-2026-07-03.md` (сессия UI)

### Добавлено (ранее)
- **Календарь событий**: Золотое свечение для важных соревнований (чемпионаты, кубки)
  - text-camel-600/400 + drop-shadow + font-semibold для ячейки competition_kind
  - Обычные соревнования используют стандартный цвет текста text-old-money-700/400
- **Календарь событий**: Уменьшена насыщенность цвета для дисциплины "Бега"
  - rose-300 → rose-200 в light mode для лучшей визуальной гармонии
- **Dark Mode**: Полная реализация темной темы для всего приложения
  - Конфигурация dark mode в tailwind.config.js (class-based)
  - Компонент ThemeToggle с SVG иконками (sun/moon)
  - Сохранение предпочтения темы в localStorage
  - ~~Поддержка системной темы по умолчанию~~ → с 2026-07-03 по умолчанию светлая тема
  - Dark mode классы для всех страниц и компонентов:
    - App.tsx (навигация и основной контейнер)
    - Procoursing.tsx
    - Events/index.tsx
    - TopDogs.tsx
    - SpeedRecords/index.tsx
    - Judges/index.tsx
    - Judges/JudgeDetail.tsx
    - DogProfile.tsx
    - Shared components: EmptyState, ErrorState, FilterSelect, FiltersDropdown, SkeletonLoader, DogStatsTable
- **Accessibility**: Улучшение доступности интерфейса
  - Skip-link для keyboard navigation
  - ARIA атрибуты для вкладок (role="tablist/tab/tabpanel")
  - ARIA атрибуты для dropdowns (aria-expanded, aria-controls, aria-label)
  - Escape для закрытия всех меню и dropdowns
  - Увеличение touch targets с w-9/h-9 до w-11/h-11
- **Semantic color tokens**: Добавление семантических цветов в tailwind.config.js
  - primary, secondary, muted, accent, surface, surface-alt, border
- **Dark shadows**: Переопределение теней для dark mode
  - dark-sm, dark, dark-md, dark-lg, dark-xl с повышенной непрозрачностью
- **SVG иконки**: Добавление SVG иконок в EmptyState и ErrorState
- **useDarkMode hook**: Создание хука для определения текущей темы
- **Logo переключение**: Логотип переключается в зависимости от темы (navbar-bg.svg / navbar-bg-dark.svg)
- **Кликабельный логотип**: Логотип теперь ссылается на главную страницу
- **Плавный переход темы**: Добавлен transition на html для background-color и color (200ms)
- Реорганизация документации в папки по темам
- Объединение SPEED_RECORDS.md и TROUBLESHOOTING_SPEED_RECORDS.md
- Создание CONTRIBUTING.md
- Упрощение Windows скриптов (start-servers.bat, deploy-to-github.bat)
- Удаление дублирующего docs/design/changelog.md (интегрировано в общий CHANGELOG.md)
- **Документация EVENT-COLORS.md**: Создание документации по системе цветов календаря событий
- **Профиль собаки**: Добавлены медали для рейсинга (золото, серебро, бронза)
  - Backend API: добавлены поля gold, silver, bronze в racing_stats
  - Frontend: отображение медалей в блоке рейсинга (аналогично курсингу)
- **Профиль собаки**: Разделение истории выступлений на отдельные блоки
  - Курсинг/БЗМП и рейсинг отображаются в отдельных блоках side-by-side
  - Удалены заголовки блоков по запросу пользователя
  - Grid layout для desktop (2 колонки), stacked для mobile
- **Профиль собаки**: Обновление цветовой схемы для курсинга
  - Курсинг: forest (зелёный) вместо old-money/camel
  - Рейсинг: warm-blue (синий) - без изменений
  - Визуальное разделение дисциплин через цвет
- **Профиль собаки**: Исправление отступов в блоке рейсинга
  - Добавлен mb-4 для consistency с курсингом
- **Профиль собаки**: Исправление отображения рейсинга
  - Обновлен статус записей рейсинга с 'unknown_status_check_raw_text' на 'finished' в БД

### Изменено
- **Контрастность в dark mode**: Улучшение контраста текста
  - old-money-600 → 700, old-money-400 → 300 в dark mode
  - camel-400 → 300 в dark mode
  - Применено в DogTooltip, EventResults, DogProfile
- **Стилизация таблиц**: Унификация стилей таблиц в SpeedRecords с DogStatsTable
  - Добавлен dark mode для thead/th (bg-cream-100 dark:bg-charcoal-700)
  - Обновлены разделители tbody (divide-y divide-old-money-200 dark:divide-charcoal-600)
  - Обновлены цвета текста в ячейках (text-old-money-800 dark:text-old-money-300)
- **Стилизация вкладок**: Поменяли местами вкладки и тулбар в TopDogs.tsx
  - Теперь тулбар с поиском и фильтрами идёт перед вкладками
- **Цвета дисциплин**: Оптимизация цветов дисциплин для тёмной темы
  - Используется прозрачность 25-35% на оттенках 900 для гармонии с charcoal-900 фоном
  - Разделители строк таблицы сделаны толщиной 2px и цветом как рамка таблицы
  - БЗМП имеет повышенную насыщенность (35-45%) для лучшей заметности
- **Dark mode для карточек**: Добавлен dark mode для белых карточек в JudgeDetail.tsx
- **Dark mode для Stats компонента**: Добавлены dark: классы для текста в SpeedRecords/Stats.tsx
  - Единицы измерения "км/ч" и "сек" теперь имеют dark:text-charcoal-400
  - Проценты в статистике имеют правильные цвета для тёмной темы
  - Все таблицы статистики (по породам, полу, годам) обновлены
- **ThemeToggle**: Исправлена логика иконок
  - В тёмной теме показывается солнце (для переключения на светлую)
  - В светлой теме показывается луна (для переключения на тёмную)
- **Унификация рамок**: ThemeToggle теперь имеет ту же рамку, что и кнопки в шапке
  - border-old-money-300 dark:border-charcoal-600, rounded-lg, w-11 h-11
- **Dark mode для input[type="date"]**: Добавлен color-scheme для нативного календаря
- **Цвета календаря событий**: Синхронизация цветов таблицы с легендой
  - Переход на inline стили с hex/rgba цветами для надёжности
  - Цвета в таблице теперь точно соответствуют кружочкам легенды
  - Светлый режим: forest-300, warm-blue-300, terracotta-300, camel-300
  - Тёмный режим: forest-900/25, warm-blue-900/35, terracotta-900/25, camel-900/25
- **Таблица календаря событий**: Улучшение отображения данных
  - Убраны прочерки из колонки "Судьи" (пусто если нет данных)
  - Убран текст "Ожидается" из колонки "Результаты" (пусто если нет данных)
  - Добавлено whitespace-nowrap для колонок "Судьи" и "Дисциплина" (текст не переносится)
  - Колонка "Результаты" выровнена по центру
- **Исправления багов**:
  - Исправлен фликер при смене фильтров в Judges/index.tsx (добавлен isInitialLoad)
  - Исправлен бесконечный цикл в TopDogs.tsx (добавлена проверка needsUpdate перед обновлением URL)
  - Исправлена терминология дисциплины: "Беги борзых" → "Бега борзых" (именительный падеж)
  - Исправлено склонение в комментариях: "Статистика бегов борзых" (родительный падеж)
- Переименование папки проекта SALUKI → Procoursing
- Обновление всех ссылок в документации
- Перемещение logo.svg в frontend/public/assets/
- Обновление .gitignore (.junie/, *.iml)

### Удалено
- Пустая папка .uploads/
- Пустая папка assets/
- Папка archive/ в docs/

## [2026-06-29]

### Дизайн
- Унификация теней и границ в data-heavy страницах
- Добавление focus-visible стилей для keyboard navigation
- Создание компонентов EmptyState, SkeletonLoader, ErrorState
- Удаление эмодзи из UI компонентов
- Улучшение адаптивности для маленьких экранов (<360px)
- Увеличение touch targets до 44x44px

### Документация
- Создание docs/design.md с полной палитрой и планом dark mode
- Создание docs/design/changelog.md с историей дизайна

## [2026-06-28]

### Добавлено
- Страница "Рекорды Донино" с двумя подвкладками (Таблица, Статистика)
- Автоматическое обновление рекордов через GitHub Actions (ежедневно)
- История предыдущих результатов при наведении на кличку
- Экспорт в Excel (.xlsx)
- Статистика по породам, полу и годам

### Изменено
- Обновлённая навигация с минималистичным дизайном
- Old money цветовая палитра
- Новый домен: https://procoursing.antajl.ru

## [2026-06-27]

### Добавлено
- API endpoint POST /api/admin/import-results для пакетной загрузки результатов
- Валидация данных на сервере
- Логирование ошибок при импорте
- ADMIN_TOKEN для авторизации admin endpoints

### Изменено
- Скрипт load-results.mjs переписан для использования API
- Обновлена документация API и БД

## [2026-06-26]

### Добавлено
- React Query для кэширования данных
- Zod для валидации данных
- TypeScript в frontend
- Мобильная адаптация всех страниц

### Изменено
- Events.jsx переведён на api.js
- Убрано дублирование API_URL из App.jsx
- Оптимизирован TopDogs.jsx (загружает только активную вкладку)
- Вынесены константы в constants.js
- Удалены неиспользуемые assets



### Удалено
- Mock-фолбэк в prod (только в dev)

## [Ранее]

- Первоначальная версия проекта
- Парсинг данных с procoursing.ru
- API на Cloudflare Worker
- Фронтенд на Cloudflare Pages
- База данных D1
