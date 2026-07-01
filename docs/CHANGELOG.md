# Changelog — История изменений

Все значимые изменения проекта ProCoursing Stats.

## [Unreleased]

### Добавлено
- **Dark Mode**: Полная реализация темной темы для всего приложения
  - Конфигурация dark mode в tailwind.config.js (class-based)
  - Компонент ThemeToggle с SVG иконками (sun/moon)
  - Сохранение предпочтения темы в localStorage
  - Поддержка системной темы по умолчанию
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
