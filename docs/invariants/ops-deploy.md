---
title: Ops, Deploy & Infrastructure Invariants
domain: ops-deploy
description: Правила инфраструктуры: Yandex Object Storage S3, кэширование, пререндер, CI/CD, протокол коммитов без автопуша.
---

# Ops, Deploy & Infrastructure Invariants

> Правила инфраструктуры: Yandex Object Storage S3, кэширование, пререндер, CI/CD, протокол коммитов без автопуша.  
> Читать вместе с [AGENTS.md](../../AGENTS.md) и [docs/sheets/09-ops-deploy.md](../sheets/09-ops-deploy.md).

---

## Invariants & Architectural Rules

### Public site

JSON from CDN only — **no** Worker/D1 runtime

### Hosting

**Yandex Object Storage** (`deploy.yml` CI sync)

### S3 Cache policy

`/assets/*` 1y immutable, HTML no-cache, `/data/v1/` 1h ([sheet 09](../sheets/09-ops-deploy.md))

### Truth

`data/v1/` in git

### CDN packs

`dog-profiles/pack-*`, show `judge-details/pack-*` ([ADR-014](../decisions/014-cdn-packs-vs-turso.md))

### Pages slim

exclude `dogs/by-id` + bulk exhibitions (`publish-exclude.js`)

### Calendars

ON in `data/v1/ui-flags.json` (competitions + shows)

### Turso

Удален из проекта. Все 56 225 протоколов выставок отдаются статически из Яндекс S3 CDN (`/data/v1/shows/protocols/{id}.json`) в gzip. В `deploy.yml` команда `aws s3 sync data/v1/ ... --delete` обязана содержать `--exclude "shows/protocols/*"`.

### Legacy scripts & Drafts

Одноразовые скрипты состязаний (2021–2022), утилиты Turso и Elo удалены ([ADR-015](../decisions/015-legacy-code-cleanup.md)). Ввод ведется строго через `yarn ingest-competition`.

### S3 Asset Compression

Хэшированные JS/CSS в `/assets/*` предварительно сжимаются gzip level 9 (`yarn compress-assets`) и синхронизируются в S3 с `--content-encoding gzip`.

### Incremental SEO Prerender, Loader Decoupling & S3 Cost Guard

1) **Отвязка 25 000 entity-страниц от сборки (`/assets/loader.js`):** Вся SEO-разметка (`<title>`, `<meta description>`, `canonical`, Schema.org JSON-LD, кличка/результаты в `#root`) остается в статическом HTML (`buildEntitySpaShell` в `html-shell.ts`), а хэшированные чанки Vite вынесены в стабильный `/assets/loader.js` (`public, max-age=0, must-revalidate`). Правки дизайна/UI больше не меняют HTML-хэши 25k страниц.
2) **Инкрементальная хеш-карта (`_seo-state.json.gz`):** `prerender-pages.ts` + `incremental-state.ts` сравнивают SHA-256 итогового HTML с `_seo-state.json.gz` из S3 и формируют точные списки `--hubs-out`, `--delta-out` (только новые/изменившиеся entity-страницы) и `--delete-out`. При сбое в `s3_apply_delta.py` состояние `_seo-state.json.gz` на S3 не обновляется.
3) **Защита активных вкладок, конкурентности и live smoke check:** В `deploy.yml` включен `concurrency: group: deploy-yandex-s3`, старые корневые чанки `/assets/*.{js,css}` хранятся 7 дней по `LastModified` перед удалением, для ручного аудита есть `dry_run`, а в конце деплоя запускается `yarn run verify-live` (`backend/scripts/ops/verify-live-deploy.ts`) — проверка HTTP 200, `<main>`, `canonical`, `/assets/loader.js` и отсутствия пустого SPA fallback на реальных URL из всех 12 дочерних sitemap (включая Донино, судей, выставки, протоколы и редирект `/procoursing/`). Хаб `/shows/judges/2026/` и `/shows/judges/all/` выгружаются через `--hubs-out` и не классифицируются как entity-страницы.
4) **Паритет числовых ID судей в пререндере:** `prerenderSportJudges` и `prerenderShowJudges` обязаны иметь fallback-резолв `numeric_id` через `resolveSportJudgeNumericId` / `resolveShowJudgeNumericId` (`judgeIdMap.generated.ts`), чтобы пересборка `judges-summary.json` не отрывала пререндер `/judges/:id/` от `sitemap-judges.xml`.

### Package manager

**yarn@1.22.22**

### Local secrets

`.env.ai` (gitignored)

### Bot

Workers + Grammy + KV; aggregates only

### Local Dev Data Compression Parity

В локальном сервере разработки (frontend/vite.config.ts -> serveDataV1) раздача файлов .json из /data/v1/ обязана поддерживать gzip-сжатие при наличии заголовка Accept-Encoding: gzip, обеспечивая паритет скорости передачи данных с продакшн CDN S3 и предотвращая передачу многомегабайтных несжатых файлов через loopback

### S3 Trailing Slash Canonical & Crawl Invariant

На статическом веб-хостинге S3 (Яндекс Облако) все директории и страницы каталогов в канонических URL (`<link rel="canonical">`), хлебных крошках (`BreadcrumbList`), внутренней перелинковке хабов и файлах `sitemap*.xml` обязаны строго содержать замыкающий слэш (`/`). Ссылки без слэша вызывают цепочки HTTP `302 Found` редиректов веб-сервера S3, сжигая краулинговый бюджет ботов

### Canonical URL Trailing Slash & Route Redirects Invariant

Все внутренние ссылки на разделы каталога и хабов обязаны строго содержать замыкающий слэш (`/speed-records/`, `/donino/championship/`, `/competitions/?tab=...`, `/shows/?tab=...`). Редиректы со старых путей (`/donino/championship/standings` → `/donino/championship/`, `/donino/championship/analytics` → `/donino/analytics/`, `/donino-championship` → `/donino/championship/`) регистрируются в `AppRoutes.tsx` с флагом `replace`, предотвращая накопление лишней истории навигации

### Static S3 Prerender Hubs & Legacy Redirects Invariant

На статическом хостинге Yandex S3 все сезонные хабы (`/shows/judges/${year}/`, `/competitions/judges/${year}/`, `/all/`) и каталог всех пород `/breeds/` обязаны быть включены в `HUB_PAGES` и `STATIC_PAGES`. Все устаревшие адреса и редиректы (`/procoursing`, `/top`, `/top-dogs`, `/judges`, `/breed`, `/shows/champions`, `/coursing-records`, `/donino/records`, `/donino-championship*`, `/calendar/2027`) обязаны пререндериться как физические `index.html` файлы с мета-редиректом и статусом HTTP 200 OK через функцию `prerenderStaticRedirects()`, исключая появление HTTP 404, всплывающих баннеров Wayback Machine и отклонений в Google Search Console

### Schema.org Dataset License & Distribution Invariant

При разметке структурированных данных Schema.org `Dataset` (для базы радарных замеров скорости и спринта 350 м полигона Донино: `doninoDatasetJsonLd()` в `hub-seo.ts` и `doninoDatasetSchema` в `JsonLd.tsx`) строго обязательно наличие поля `license` (URL открытой лицензии `https://creativecommons.org/licenses/by/4.0/`), флага бесплатного доступа `isAccessibleForFree: true`, а также массива `distribution` (`DataDownload` с прямыми ссылками на JSON-файлы датасетов `speed_records.json` и `coursing_records.json`). Это предотвращает предупреждения Google Search Console («Отсутствует поле "license"») и обеспечивает полное соответствие стандартам Google Dataset Search

### Unofficial Status & Author Attribution Invariant

Проект CoursingStats — независимый общественный аналитический архив, не являющийся официальным ресурсом РКФ или бегового клуба в Донино. Строго запрещено позиционировать сайт, Telegram-бота, базу данных, протоколы или рейтинги как «официальные» (запрещены формулировки: «официальный бот», «официальная база», «официальный протокол состязания: ...», «официальный спортивный профиль», «официальные рекорды Донино», «единый всероссийский рейтинг»). Слово «официальный» допустимо исключительно при описании внешних первоисточников и нормативов: правил и регламентов РКФ/FCI, официальных титулов РКФ (CAC, CACL, ЧР, НЧ РК), судейских отчетов и рекордов Книги Гиннесса. В подсказках спортивного рейтинга (`CoursingRatingHint.tsx`) и профилях собак (`DogProfile/index.tsx`) обязательны дисклеймеры о независимом характере данных и неофициальном статусе ресурса

### Modular Sitemap & 10K Chunking Invariant

`sitemap.ts` генерирует модульный индекс `https://coursing-stats.ru/sitemap-index.xml` (12 подкатегорий: `sitemap-main.xml`, `sitemap-events.xml`, `sitemap-protocols.xml`, `sitemap-dogs.xml`, `sitemap-judges.xml`, и выставки `sitemap-shows-*.xml` с чанками до 10 000 URL). В `robots.txt` декларируется только `sitemap-index.xml`. В XML исключены `<priority>` и `<changefreq>`. Для быстрой индексации используется IndexNow (`yarn indexnow`).

### AI Search & GEO Discovery Invariant

Для ИИ-поисковиков в `robots.txt` разрешены `OAI-SearchBot`, `GPTBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `anthropic-ai`, `Applebot`, `Applebot-Extended`, `Google-Extended`. В `<head>` страниц подключены `<link rel="alternate" type="text/markdown" href="/llms.txt">` и `/llms-full.txt`.

### Canonical Old Money OG Image Invariant

Каноническое OG-изображение для соцсетей и мессенджеров — светлая картина маслом `frontend/public/og-image.png` (1200×630, салюки/афган на фоне холмов). Тёмные плашки удалены. Сброс превью в Google Search Console выполняется через Refresh Outdated Content (вкладка «Изображение»).

### Apple Touch Icon & SEO Component Invariants

1) Иконка для iOS/macOS (`apple-touch-icon.png`, 180×180 px) лежит в `/apple-touch-icon.png` с тегом `<link rel="apple-touch-icon">` в `<head>`.
2) В `frontend/src/components/SEO.tsx` проп `description` опционален; мета-теги рендерятся строго при наличии описания, а утилиты `cleanOgTitle`/`cleanOgDescription` защищены от `undefined`.
3) В SPA `YandexMetrica.tsx` переходы триггерят `ym('hit')` и `gtag('page_view')`.
4) Векторные HTML-протоколы (`export-protocol-vector.ts`) содержат Open Graph теги и Schema.org `SportsEvent`.

### SEO Sitelinks & Hash Anchors

Быстрые ссылки строятся на 3 уровнях: 1) Семантический `<nav aria-label="Разделы платформы">` на главной; 2) Оглавления (`hub-toc`/`guide-toc`) и `<section id="...">` с `<h2>` на ключевых страницах; 3) `<ScrollToHash />` с экспоненциальным backoff до 1.5 с для плавной прокрутки к `#якорям` при Suspense-чанках; 4) Используются `BreadcrumbList`, `hasPart` (`WebPage`/`CollectionPage`) и `manifest.webmanifest`.

### SEO & Social Preview Natural Phrasing Invariant

1) Бренд в Open Graph — строго «Курсинг Статс» (`og:site_name`).
2) `cleanOgTitle` удаляет дубли бренда, а `cleanOgDescription` отсекает повтор имени/породы в начале (`${entity}: `).
3) Склонение числительных строго через `pluralizeRu` («24 участника», «20 забегов», «1 победа (золото)», «8 медалей»).
4) Запрещено слово «старты» (используются «забеги» для собак и «состязания» для турниров).
5) В кличках собак разделитель RU/EN — слэш (`NameRu / NameLat (Порода)`), без двойных скобок.

### Clean Canonical Links & Bot Parity Invariant

1) Все внутренние ссылки в компонентах сайта, пререндере SEO и боте ведут на прямые канонические ссылки активного сезона (`/competitions/ranking/2026/`, `/shows/ranking/2026/`, `/speed-records/2026/`), без устаревших параметров `?tab=`.
2) Завершающий слэш перед query-параметрами обязателен: ссылки с параметрами строятся как `/dog/${id}/?name=...` (не `/dog/${id}?name=...`), предотвращая 301/308 редиректы в Google Search Console.
3) Schema.org для животных: профили собак размечаются строго как `@type: ItemPage` (`mainEntity: Thing`). Разметка собак через `@type: ProfilePage` запрещена стандартами Google Rich Results.

### Frontend Bundle Optimization & Dead Code Invariant

1) Тяжелые SVG-контуры (`DogSilhouettes` ~676 КБ) запрещено монтировать в корневой `App.tsx` или входной бандл: силуэты загружаются исключительно внутри ленивого чанка профиля собаки (`DogProfileHeader`); 2) Маппинг пород на критическом пути (`breedMapping.ts`) обязан импортировать легковесный `breed-slugs.ts` вместо тяжелого реестра хабов (`breed-hubs-data.ts` ~147 КБ); 3) Тяжелые сгенерированные таблицы судей (`judgeIdMap.generated.ts` ~140 КБ) изолируются за динамическими маршрутами (`JudgeRoutes.tsx`); 4) Внешние аналитические скрипты (Яндекс Метрика `tag.js`) обязаны загружаться отложенно (по первому взаимодействию или `requestIdleCallback`) с сохранением синхронной очереди вызовов `window.ym`; 5) Аудит мертвого кода обязан учитывать инвариантные тесты (`ios-safari-modal-invariants.test.ts`), гарантируя сохранение компонентов (`HomeDogSearch.tsx`, `ToolbarSelectDropdown.tsx`), защищающих поведение мобильных шторок, даже если они не задействованы в основном кодовом потоке

### UI-First Fast Diagnosis vs Database Dump Probing

При пользовательских замечаниях о верстке, кривом отображении, лишних элементах или растянутости на страницах (`/dog/:id`, `/shows`, `/competitions`, etc.) агент обязан немедленно начинать диагностику с целевых React-компонентов и стилей (принцип Ponytail / YAGNI). Строго запрещено запускать фоновые скрипты парсинга тяжелых 100+ МБ CDN-шардов или баз данных ради поиска единичных ID без крайней необходимости, предотвращая зависание очереди и блокировку ответа

### AI Documentation Tool Bounds & 40 KB File Cap Invariant

1) **Лимит размера файлов документации:** Все файлы `.md` в папках `docs/` и `.agents/` обязаны иметь размер строго менее 40 КБ (~20 000 символов). Инструмент чтения агентов (`read_file`) имеет жесткий лимит в 46 080 байт; в UTF-8 для кириллицы каждый символ занимает 2 байта, поэтому файлы больше 22 000 символов усекаются, приводя к потере контекста агентом.
2) **Модуляризация скиллов и спецификаций:** Если документ или скилл разрастается сверх 30–35 КБ, детальные спецификации геометрии, CSS-правила или примеры кода обязаны выноситься в подпапку `references/` (по эталону `.agents/skills/old-money-design/references/geometry-and-layout.md`), оставляя основной `SKILL.md` компактным (~10–15 КБ).
3) **Строгая доменная изоляция инвариантов:** Все правила в каталоге `docs/invariants/` распределяются строго по 7 специализированным доменным файлам (соревнования, выставки, Донино, судьи, идентичность собак, ops/деплой, UI/дизайн). Запрещено сваливать правила по ключевым словам или раздувать файлы до непригодного для чтения размера.

### Pre-Commit Secret Leak Scanner & Credential Guard

1) **Защита токенов и ключей:** Перед выполнением `git commit` агент обязан проверять `git diff --cached` и `git status` на утечки секретов: Telegram bot token (`bot[0-9]{9}:...`), токены Cloudflare, S3 AWS Access Key/Secret Key, файлы `.env` и локальные дампы авторизации (`scripts/rkf-tracker/config.json`).
2) **Откат при обнаружении:** При обнаружении учетных данных коммит немедленно блокируется, файл добавляется в `.gitignore` или секреты выносятся в переменные окружения. Запрещено использовать `git add .` без избирательной проверки staged-файлов.

### RKF Tracker & Browser Extension Isolation Invariant

1) **Изоляция от S3 и прода:** Внутренние утилиты мониторинга личного кабинета РКФ (`rkf-tracker/`, включающая `extension/`, `desktop/`, `bot/`, `web/`) полностью изолированы от сборки и деплоя публичного сайта. В `.github/workflows/deploy.yml` настроен `paths-ignore: - 'rkf-tracker/**'`, а локальные конфигурации с токенами (`config.json`, `state.json`, `received.json`) занесены в `.gitignore`.
2) **Zero Server & Zero Liability для Chrome Extension:** Расширение для браузера на Manifest V3 функционирует на 100% клиентской стороне браузера без сторонних бэкендов. Токены сессии извлекаются напрямую из активной вкладки `rkf.online` (`content_script` -> `chrome.storage.local`) и опрашивают API РКФ напрямую через разрешения `host_permissions` (`https://rkf.online/*`, `https://*.rkf.online/*`). Никакие учетные данные пользователей не передаются и не сохраняются на серверах проекта.
3) **Защита от спама и рейт-лимиты РКФ:** Для предотвращения блокировки IP-адресов пользователей или аккаунтов со стороны шлюзов РКФ, в UI трекера (как в расширении, так и в десктопном дашборде) жестко зафиксирован кулдаун не менее 60 секунд на кнопку ручного обновления с сохранением таймера в `localStorage` / `chrome.storage.local`.
4) **Юридическая чистота и бренд РКФ (Nominative Fair Use Invariant):** Обозначения «РКФ» и «RKF» являются зарегистрированными товарными знаками СОКО РКФ. Категорически запрещено использовать прямые конструкции вида `@rkf_*`, «Официальный бот РКФ» или «Личный кабинет РКФ в Телеграм» во избежание блокировки за недобросовестную конкуренцию и имперсонацию (ст. 1484, 1515 ГК РФ, Telegram Impersonation Policy). Все названия ботов и утилит строятся строго на бренде CoursingStats (`@coursing_stats_tracker_bot`) с обязательным дисклеймером: *«Неофициальный помощник собаковода от CoursingStats для отслеживания статусов на rkf.online»*.
5) **Официальное имя бота заявок:** Для Telegram-бота мониторинга заявок утвержден юзернейм `@coursing_stats_notify_bot` (отображаемое имя: *CoursingStats Tracker*).
6) **Фоновый мониторинг и безопасность запросов (Safe Polling & Service Worker):** В расширении для Chrome фоновая проверка статусов реализуется через `chrome.alarms` в `background.js` (Manifest V3 Service Worker). Настройки частоты: 15 минут (быстрый), 1 час (рекомендуемый), 4 часа (в течение дня), 24 часа (раз в сутки) и 0 (только вручную). В спящем режиме Service Worker полностью выгружается из памяти браузера, создавая нулевую нагрузку на процессор и память ПК пользователя, а 24 запроса в сутки полностью безопасны для инфраструктуры РКФ.
7) **Уведомления, звук и визуальные инварианты попапа:** Расширение поддерживает нативные уведомления Windows через `chrome.notifications` с кнопкой «Тест» и двухтональный аудиосигнал на базе Web Audio API (`AudioContext`). В настройках частоты проверки текст опций лаконичен (сохранено только пояснение «(рекомендуется)» у интервала 1 час). Для забранных документов (`.is-collected`) применен эффект «матовой бледной пленки» (`opacity: 0.52; filter: saturate(0.65)`), сохраняющий фоновый оттенок статуса (зеленый, янтарный, розовый) вместо серой заливки. Режим Chrome Side Panel полностью исключен из манифеста, восстановлена фиксированная ширина окна 780px.
8) **Модульная ES-архитектура расширения (File-Budget < 250-300 строк):** Во избежание разрастания монолитов код расширения декомпозирован на независимые ES-модули (`<script type="module">`): `formatters.js`, `audio.js`, `api.js`, `render.js`, `settings.js`, `popup.js` и модульные таблицы стилей: `theme.css`, `auth.css`, `filters.css`, `cards.css`, `timeline.css`, `settings.css`, `dialogs.css`. Ни один файл не превышает лимит бюджета в 250–280 строк.
9) **Минималистичный UX заголовка:** В шапке попапа размещаются только кнопки немедленного действия: кнопка обновления, разворот во вкладку и шестерёнка настроек. Кнопка выхода из профиля (Logout) с деструктивным действием убрана из шапки внутрь модального окна настроек для предотвращения случайного сброса авторизации.
10) **Раздел трекера coursing-stats.ru/tracker/ и бесшовная дизайн-система:** Веб-версия личного кабинета оформляется не как расширение на весь экран, а как полноценный раздел портала CoursingStats (`https://coursing-stats.ru/tracker/`): навбар с логотипом и сквозными ссылками на разделы спорта/выставок/Донино, хлебные крошки, сводная панель из 4 KPI-карточек (Всего, В обработке, Готовы, Забрали), футер, тёплый кремовый фон с радиальным градиентом и текстурой зерна (`grain-overlay`). Запускается локально на основном фронтенде.
11) **In-Memory Streaming парсер соревнований РКФ (Track 4, info.rkf.online):** Парсинг официальных Excel-книг графиков испытаний и состязаний РКФ (`https://info.rkf.online/article/fb2b53ca-bdf2-5e35-bea2-2e973592e2d7`) реализуется изолированным ядром в `rkf-tracker/shared/` (`parser.js`, `differ.js`, `search.js`). Запрещено физическое скачивание файлов на диск пользователя; разбор выполняется исключительно в оперативной памяти (fetch в `ArrayBuffer` -> `xlsx.read`). Differ отслеживает статус `APPROVED` («Утверждено РКФ», «В графике», присвоение номера в календаре) с генерацией оповещений, а поиск и фильтрация поддерживают фасетные срезы по дисциплинам, городам и клубам. Юнит-тесты выполняются строго на изолированных фикстурах без живых HTTP-запросов.
12) **Десктопный трекер Windows и монолитная архитектура Embedded WebView2 (Track 3/4 Desktop):** Десктопный клиент (`rkf-tracker/desktop/`) строится как монолитное приложение Windows (`RkfTracker.exe`) на базе `MainWindow` со встроенным контролом `Microsoft.Web.WebView2` (запрещен запуск внешнего процесса `msedge.exe`). В окне строго отключены контекстные меню Chromium (`AreDefaultContextMenusEnabled = false`), системные хоткеи отладки/перезагрузки (`AreBrowserAcceleratorKeysEnabled = false`) и строка состояния URL. Любая внешняя навигация перехватывается в `NavigationStarting` и выносится в системный браузер пользователя по умолчанию (`Process.Start`). При закрытии окно скрывается (`Hide()`), сохраняя мгновенный вызов из трея. Опрос ленты событий (`articles_feed` в `Poller.cs`) обязан учитывать обратный хронологический порядок и дедуплицироваться через `seenBarcodes` для исключения ложных алертов по архивным записям. Уведомление `StatusChanged` генерируется строго при реальном изменении статуса активной заявки. В веб-интерфейсе демо-режим исключен, файлы отдаются локально.
13) **Сквозной мост расширения Chrome и веб-трекера (Track 3 Extension Site Bridge):** В расширении браузера Manifest V3 (`rkf-tracker/extension/`) для передачи авторизационного токена в веб-интерфейс трекера (`https://coursing-stats.ru/tracker`, `localhost`) используется выделенный контентный скрипт `site-bridge.js` с запуском `run_at: "document_start"`. Скрипт проактивно передает токен через `window.postMessage({ type: 'CS_EXTENSION_TOKEN_AVAILABLE', token: ... })` при загрузке страницы и по событию `chrome.storage.onChanged`, а также отвечает на запрос страницы `CS_GET_EXTENSION_TOKEN`. В попапе расширения обязательна кнопка «Скопировать токен» с копированием в буфер обмена для ручного резервного ввода, стили кнопок выдержаны в эстетике Physical Glass / Old Money, а при обновлении локального кода расширения требуется перезагрузка на `chrome://extensions` (кликом по круговой стрелке).
14) **Приоритетный вход через сайт РКФ (WebView2) и мост в Telegram (Track 3/4 Desktop):** Десктопное приложение Windows (`RkfTracker.exe`) и веб-интерфейс трекера выстроены по иерархии:
   - *Главный приоритетный вход (Официальный сайт РКФ):* по клику на кнопку «Войти через официальный сайт РКФ Онлайн» открывается изолированное окно `LoginWindow` с нативным контролом `Microsoft.Web.WebView2`, загружающее `https://rkf.online/login`. Навигация жестко изолирована доменами `rkf.online` и `my.rkf.online`. При успешном входе окно автоматически считывает `localStorage.getItem('apikey')`, сохраняет токен в `config.json` и закрывается, а дашборд мгновенно переходит в активное состояние через опрос `/api/desktop/auth/poll-web-login`.
   - *Мост в Telegram (1-Click Binding):* после успешного входа на главном экране отображается карточка «Получать уведомления на телефон: [ Подключить Telegram-бота в 1 клик ]». По клику генерируется безопасный тикет и открывается ссылка `https://t.me/coursing_stats_notify_bot?start=bind_tk_<ticket>` в системном браузере (`/api/desktop/telegram/bind-url`).
   - *Запасные способы входа (Fallback):* ввод по E-mail/паролю и ручная вставка API-токена скрыты в аккуратный выпадающий аккордеон «Другие способы входа» для пользователей, у которых заблокирован WebView2.
   - *Стабильность рантайма и единый экземпляр (Single Instance):* активация уже запущенного окна трекера выполняется через легкий локальный loopback HTTP-запрос `GET /api/desktop/show` на порту 4199. Широковещательные вызовы Win32 `HWND_BROADCAST` строго запрещены. Рантайм `WebView2Loader.dll` обязан присутствовать в корне `desktop/` и в портативном каталоге `dist/`.

### Git Ignore & Exclusion Architecture

1) **Единый источник правды — `.gitignore`:** Все правила исключения проекта (секреты, переменные окружения, артефакты сборки, локальные дампы данных, кэши компиляторов и IDE) фиксируются исключительно в корневом `.gitignore`.
2) **Изоляция `.git/info/exclude`:** Файл `.git/info/exclude` предназначен строго для локальных персональных оверрайдов на конкретной машине разработчика (личные заметки, ad-hoc скрипты), не подлежащих коммиту. Запрещено дублировать туда общие правила проекта или правила из `.gitignore`, чтобы предотвратить скрытые рассинхронизации и непредсказуемое маскирование файлов.
3) **Защита шаблонов конфигураций:** При игнорировании переменных окружения и локальных настроек (`**/.env*`, `rkf-tracker/**/config.json`) обязательны исключения (`!**/.env.example`, `!bot/.dev.vars.example`, `!rkf-tracker/**/config.example.json`), гарантирующие постоянное нахождение публичных шаблонов в репозитории.
4) **Запрет игнорирования системных файлов:** Запрещено вносить в `.gitignore` отслеживаемые системные файлы и документацию репозитория (включая `AGENTS.md`).

### Agent Skills Scoping & Customization Hygiene

1) **Локальная изоляция проектных скиллов:** Специфичные для сторонних проектов скиллы (например, `roblox-dev`) обязаны храниться локально в целевом каталоге (`<workspace>/.agents/skills/`), а не в глобальном каталоге пользователя (`~/.gemini/config/skills/`). Это гарантирует чистый системный промпт и нулевой расход токенов в несвязанных проектах.
2) **Двухуровневая модель UI-скиллов:** Проектные UI-скиллы (`old-money-design`, `accessibility`, `react-performance`, `react-composition-patterns`) сохраняются модульными с разделением на компактный `SKILL.md` (< 40 КБ) и каталоги углубленных спецификаций (`rules/`, `references/`). Это предотвращает усечение лимитами `read_file` (46 080 байт) и исключает шум в контексте при точечных задачах.
3) **Пошаговая разработка vs Рой (Incremental over Swarm):** Для исследовательских задач и проектирования новых продуктов с нуля (0-to-1) применяется строго последовательная разработка вертикальными слоями одним агентом. Использование параллельных роев (Swarm) запрещено во избежание конфликтов несовместимых веток и рассинхронизации структур данных.

### RKF Tracker Bot Single-Bubble Ergonomics & MenuButton Invariant

В Telegram-боте RKF Tracker (`rkf-tracker/bot/`, Cloudflare Workers + Grammy) вся навигация по разделам (`cmd_start`, `cmd_status`, `cmd_competitions`, `cmd_apps`, `cmd_help`, `cmd_auth_prompt`, `cmd_auth_how`) обязана выполняться строго по принципу Single-Bubble через `ctx.editMessageText()` без дублирования сообщений в чате. Нижняя громоздкая `ReplyKeyboardMarkup` исключена в пользу нативной кнопки Telegram MenuButton (`setChatMenuButton`, WebApp `https://coursing-stats.ru/tracker/`). Все хэндлеры и вспомогательные модули строго подчиняются ограничению file-budget (< 250 строк на файл). Допустимы только локальные коммиты (`git push` выполняется исключительно по прямому запросу пользователя).

### RKF Tracker Security, Tickets & Cloud Sync Invariants

1. **Запрет хардкода токенов в коде:** `rkf-tracker/bot/src/local-dev.ts` обязан читать `BOT_TOKEN` / `TELEGRAM_BOT_TOKEN` исключительно из `process.env` или локального `.env` (в `.gitignore`).
2. **Защита Worker-эндпоинтов:** В `rkf-tracker/bot/src/worker.ts` запрещены публичные `/debug`-маршруты, отдающие обновления/PII; административные маршруты (`/get-me`, `/webhook-info`, `/set-webhook`) требуют `ADMIN_SECRET`, а `/webhook` проверяет `X-Telegram-Bot-Api-Secret-Token` при наличии `WEBHOOK_SECRET`. CORS ограничен доверенными доменами (`coursing-stats.ru`, `localhost`, `chrome-extension://`).
3. **Одноразовые тикеты привязки вместо токена в URL:** Все клиенты (сайт, расширение, букмарклет, Desktop) передают сессию в Telegram строго через `POST /api/auth/ticket` (`crypto.randomUUID()`, TTL 600 сек, формат `bind_tk_<ticket>`), а передача токена из расширения на сайт выполняется через `window.postMessage` (`site-bridge.js`) без `?token=` в URL.
4. **Безопасность расширения и Desktop WebView2:** В `rkf-tracker/extension/` весь рендер полей API РКФ обязан проходить через `escapeHtml()`. В `rkf-tracker/desktop/LocalServer.cs` статические пути валидируются через `Path.GetFullPath()`, а `MainWindow.cs` не очищает общий `WebViewProfile` во избежание сброса веб-сессии `LoginWindow.cs`.
5. **Хранение пользователей KV и облачный `/api/sync`:** Список пользователей бота перечисляется через `kv.list({ prefix: 'user:' })` без гонки записи в `users:index`; при `AUTH_EXPIRED` уведомление отправляется однократно (`authExpiredNotifiedAt`). Состояние отметок «Забрали» и подписок синхронизируется через `GET/PUT /api/sync` по SHA-256 хэшу токена.
6. **Единый серверный мониторинг графика РКФ и политика обновлений:** Воркер (`rkf-tracker/bot/src/services/calendar-sync.ts`) по фиксированному часовому крону (`0 * * * *`) скачивает актуальный `.xlsx` со страницы `info.rkf.online` в `KV_STORAGE` (`calendar:2026:v1`) и отдает всем клиентам (сайту, боту, расширению, Desktop) через `GET /api/competitions` (5 мин кэш, откат на статический JSON). На сайте и сервере кнопки/эндпоинты ручного обновления исключены (заявки на `/tracker` обновляются автоматически при открытии страницы, а настраиваемый интервал опроса разрешен только в локальных клиентах пользователя — расширении и Desktop).
7. **Нативная интеграция `/tracker` в основной сайт и безопасность логина:**
   - В обычном браузере `/tracker` использует стандартную шапку сайта (`NavDesktop`/`NavMobile`), а `NavTracker` включается только внутри Telegram Mini App (`Telegram.WebApp.initData`); точки входа — в `Competitions2027` и `/about` (без отдельного пилла рядом с «Породы» в `NavDesktop`).
   - Вкладки `/tracker` используют единый `MobileSubNavTabs` (`TrackerSubNav.tsx`), статус и кнопка «Аккаунт» (`TrackerSyncBar.tsx`) показываются только внутри вкладки «Заявки» при активной сессии, модалки рендерятся через `createPortal(..., document.body)` с `z-[100]`, а в `TrackerCompetitionRow` свернутая строка содержит только дату в 1 строку, название клуба (раскрывает спойлер), чип `Протокол`, статус, колокольчик и шеврон.
   - Пароли при логине в `rkf.online` не обрезаются через `.trim()` (`worker-auth.ts`, `rkf-api.ts`, `TrackerAuthPasswordForm.tsx`), а `buildCorsHeaders` в `worker.ts` допускает `*.trycloudflare.com` для локальных Vite-туннелей.

### Strict Frontend Build, CI Tests & Unified Bot Tracker Security

1. **Строгий `tsc --noEmit` и CI test gate:** Команда `build` в `frontend/package.json` строго выполняет `tsc --noEmit && vite build`, а `.github/workflows/deploy.yml` устанавливает зависимости `frontend/`, `bot/` и `rkf-tracker/bot/` перед `yarn test -- --maxWorkers=2`. Тесты обязаны читать канонические данные из `data/v1/` (не из gitignored `frontend/public/data/v1/`), а `loadExhibitionsByYear` (`sitemap.ts`) при отсутствии локальной SQLite `data/local/exhibitions-rkf-archive.sqlite` опирается на закоммиченные `frontend/public/sitemap-shows-*.xml`.
2. **Единый календарь РКФ (`yarn sync-tracker`):** Файл `rkf-competitions-2026.json` синхронизируется во все клиенты (`bot/src/tracker/`, `rkf-tracker/{web,extension,desktop,bot}/`) строго через `rkf-tracker/shared/sync-tracker-calendar.cjs`, без унификации визуального дизайна разных платформ (сайт vs расширение vs Windows Desktop).
3. **Безопасность и лимиты объединённого Telegram-бота (`bot/src/tracker/`):** Токены `rkfToken` шифруются в KV алгоритмом AES-GCM (`enc:v1:`), WebApp-авторизация проверяется по HMAC-SHA256, а крон-опрос (`*/15 * * * *`) ограничен round-robin квотой `MAX_RKF_POLLS_PER_CRON = 8` (пакеты по 4).
4. **Стиль маркеров в Telegram-боте:** Допустимы только сдержанные функциональные маркеры (`🥇🥈🥉🏆📅📋🔍🏅⭐`), запрещены избыточные декоративные эмодзи (`🎪`, `❌`, `🏠`, `⏳`, `💡`) и неработающие пункты меню (кнопка `rating_elo` удалена). Запрещено смешивать UI-эмодзи сайта (в веб-фронтенде по-прежнему строго 0 эмодзи).
5. **Очистка наследия Turso и одноразовых скриптов:** Зависимости `@libsql/client`, `@tursodatabase/api`, `turso:*` команды и устаревшие одноразовые скрипты (`backend/scripts/repair/`, `tmp-*`, `check-*`, `test-*.js`) удалены из репозитория.

### Monthly S3 Push Cadence, Deploy Billing Guard & Bucket Hygiene

1. **Ежемесячное накопление крупных обновлений данных (`data/v1/`):** Новые соревнования, выставки РКФ и массовые пересборки индексов копятся локально и пушатся на прод **1 раз в ~28–30 дней**, а ежедневные обновления Донино и плана 2027 идут отдельно через `update-speed-records.yml` (0 ₽). Перед любым `git push origin main`, затрагивающим сайт/данные, агент обязан проверить дату последнего S3-деплоя командой `git log -1 origin/main -- . ':!bot' ':!rkf-tracker' --format="%ci %h %s"` и при интервале `< 28` дней предупредить пользователя, получив подтверждение (UI-правки или мелкие турниры после внедрения `loader.js` + `_seo-state.json.gz` тратят минимум операций S3).
2. **Точечный S3 sync без полного `LIST` бакета:** Статические папки (`.well-known`, `bimi`, `bot`, `favicons`, `images`, `protocols`) синхронизируются по префиксам, корневые немаскируемые файлы (`sitemap*.xml`, `og-image.png`, `robots.txt`) сверяются одним запросом `list-objects-v2 --delimiter "/"`, дифф `data/v1/` рассчитывается от `${{ github.event.before }}` с порогом `> 2000` файлов и исключением внутренних директорий (`dogs/by-id/`, `shows/exhibitions/`, `shows/indexes/show-dog-lookup/`).
3. **Защита 87 классических выставок и окна сборок в `assets/`:** В `data/v1/shows/exhibitions/` на S3 хранятся 87 файлов из `data/v1/shows/index.json`, которых нет в `shows/protocols/` — при зачистке дублей их удалять запрещено. В `assets/` на S3 удаляются только корневые `assets/*.{js,css}` старше 7 дней, отсутствующие в текущей сборке, не затрагивая `loader.js` и медиапапки (`badges`, `brand`, `errors`, `hero`, `home`, `icons`).
4. **Бесплатный DNS-хостинг (Selectel) вместо Yandex Cloud DNS:** Публичный DNS для `coursing-stats.ru` вынесен в Selectel (`a..d.ns.selectel.ru`, зона в reg.ru), чтобы не платить ~44 ₽/мес за Yandex Cloud DNS (остается только Object Storage ~12–20 ₽/мес и бесплатный Certificate Manager). Корневой `ALIAS` -> `coursing-stats.ru.website.yandexcloud.net.` (TTL 600) скрыт в UI Selectel, но создается нативно через DNS API v2 (`POST /zones/{zone_id}/rrset`, единственное число, с Project IAM-токеном `X-Auth-Token`); статические API-ключи (`X-Token`) работают только в legacy v1. Для автопродления SSL и Search Console обязательны оба `_acme-challenge` / `_acme-challenge.www` `CNAME` (`*.cm.yandexcloud.net.`) и корневой `TXT` (`google-site-verification=...`).

### Sitemap Redirect-Stub & Soft 404 Guard

Запрещено включать в `STATIC_PAGES` (`backend/scripts/build-derived/sitemap.ts`) и файлы `sitemap*.xml` URL-адреса, которые пререндерятся функцией `prerenderStaticRedirects()` (`backend/scripts/seo/prerender-pages.ts`) как заглушки редиректов (например, `/competitions/2027/` -> `/competitions/archive/2027/`). Страницы из Sitemap, отдающие HTTP 200 OK с `<meta name="robots" content="noindex, follow" />` и мгновенным мета-редиректом, классифицируются Google Search Console как «Ложная ошибка 404» (Soft 404). В Sitemap попадают исключительно канонические конечные URL.

---

## Domain Forbidden Rules

- Строго ZERO эмодзи в кодовой базе, коммитах, документации и PR.
- Строгий запрет на автоматический git push при триггере «лёрн и коммит» (только локальные коммиты; пуш по прямому запросу).
- Разделение пушей Яндекс S3 vs Cloudflare: данные и сайт (`frontend/**`, `data/v1/**`) копятся локально и пушатся 1 раз в ~28–30 дней с обязательной проверкой интервала по `git log -1 origin/main` перед пушем; боты и микросервисы (`bot/**`, `rkf-tracker/**`) игнорируются Яндекс S3 (`paths-ignore`) и деплоятся в Cloudflare Workers бесплатно.
- Запрещено раздувать любые файлы документации или скиллов (.md) сверх 40 КБ (лимит инструмента read_file — 46 080 байт).
- Запрещено использовать серверные БД (Turso, D1, Postgres) в проде (только статический S3 CDN).
- Запрещены неизолированные живые HTTP-запросы в юнит-тестах без оффлайн-фикстур или моков.
- Запрещено публиковать незакешированные или нежатые gzip-ассеты в /assets/.
- Запрещено использовать эпитет «официальный» применительно к проекту CoursingStats, боту или сайту.
