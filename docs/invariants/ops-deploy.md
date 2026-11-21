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

Полностью удалён из проекта. Все 56 225 протоколов выставок (2019–2026) отдаются статически из Яндекс S3 CDN (`/data/v1/shows/protocols/{id}.json`) в сжатом виде gzip. В `deploy.yml` команда `aws s3 sync data/v1/ ... --delete` обязана содержать `--exclude "shows/protocols/*"`, исключая удаление протоколов при полном деплое данных

### Legacy scripts & Drafts

Одноразовые исторические скрипты черновиков состязаний (2021–2022), утилиты Turso и Elo полностью удалены из кодовой базы ([ADR-015](../decisions/015-legacy-code-cleanup.md)). Запрещено захламлять кодовую базу устаревшими черновиками; ввод ведётся строго через `yarn ingest-competition`

### S3 Asset Compression

Хэшированные JS и CSS в `/assets/*` обязаны предварительно сжиматься gzip level 9 (`yarn compress-assets`) и синхронизироваться в S3 с `--content-encoding gzip` и точным `--content-type`

### Two-Tier Prerender & S3 Deployment Cost Optimization

1) В пайплайне деплоя `deploy.yml` и скрипте `prerender-pages.ts` внедрена двухуровневая модель пререндера: при повседневных коммитах (git push в `main`) выполняется лёгкий пререндер `yarn run prerender-seo --hubs-only` (~180 страниц: все разделы, каталог пород, хабы пород `/breeds/:slug/`, 404.html, sitemap), занимающий 0.26 сек и генерирующий менее 200 операций записи в месяц. Это полностью укладывается в бесплатный лимит Free Tier Яндекс Облака (10 000 операций в месяц — 0 ₽) и предотвращает спам 25 000 PUT-запросами на каждый коммит (устраняя необоснованные списания ~350–900 ₽/мес). Живые пользователи мгновенно обслуживаются через React SPA и S3 fallback (`--error-document index.html`); 2) Полный SEO-пререндер всех 25 000+ HTML-страниц (собаки, выставки, судьи) запускается строго 1 раз в месяц по расписанию (`0 3 1 * *`) либо вручную по кнопке в GitHub Actions (`inputs.full_prerender: true` или `[seo full]`), что обходится всего в ~7.7 ₽ за весь месяц; 3) В `deploy.yml` поиск HTML-страниц хабов ограничен `-maxdepth 3`: `find frontend/dist -maxdepth 3 -name "index.html"` рекурсивно находит и обновляет 100% хабов пород любой глубины (включая `/breeds/:slug/index.html` на глубине 3), гарантируя актуальность хэшей скриптов и предотвращая зависание цикла; при лёгком деплое устаревшие страницы `dog/` на S3 очищаются (`aws s3 rm .../dog/ --recursive`), гарантируя отдачу свежего SPA-бандла пользователям

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

### Modular Sitemap & IndexNow Instant Indexing

`sitemap.ts` обязан поддерживать 6 модульных карт (`sitemap-main.xml`, `sitemap-events.xml`, `sitemap-protocols.xml`, `sitemap-dogs.xml`, `sitemap-judges.xml`, `sitemap-shows.xml`), объединенных в `sitemap-index.xml`. В `STATIC_PAGES` и предрендер `HUB_PAGES` обязательно включаются `/donino/championship/` и `/donino/analytics/`. Для мгновенной индексации новых страниц и турниров в Яндексе и Bing используется IndexNow (`yarn indexnow` / `backend/scripts/seo/submit-indexnow.ts`, ключ верификации `c03759a2f3e843e99fa68cf38c4125b0.txt`)

### Modular Sitemap Index & 10K Enterprise Chunking Invariant

В Google Search Console, Яндекс.Вебмастере и `robots.txt` картой сайта обязан выступать модульный индекс `https://coursing-stats.ru/sitemap-index.xml`, разделяющий ссылки по 12 подкатегориям: ядро и хабы (`sitemap-main.xml`), спорт (`sitemap-events.xml`, `sitemap-protocols.xml`), собаки (`sitemap-dogs.xml`), судьи (`sitemap-judges.xml`) и выставки РКФ с гранулярной нарезкой по годам до 10 000 URL (`sitemap-shows-2026.xml` со свежим `<lastmod>` активного сезона, `sitemap-shows-2025.xml` .. `sitemap-shows-2021.xml` и `sitemap-shows-archive.xml` с фиксированными историческими датами окончания сезонов). В XML строго исключен мертвый синтаксис (`<priority>` и `<changefreq>`), снижая объем файлов на 40%. Ни один файл не превышает 10 000 URL, обеспечивая мгновенную отдачу поисковым роботам и защиту краулингового бюджета активного сезона. В `robots.txt` декларируется исключительно `https://coursing-stats.ru/sitemap-index.xml`

### AI Search & GEO Discovery Invariant

Для поддержки ИИ-поисковиков (SearchGPT, Perplexity, Claude, Apple Intelligence, Gemini) в `frontend/public/robots.txt` обязаны быть явно разрешены роботы `OAI-SearchBot`, `GPTBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `anthropic-ai`, `Applebot`, `Applebot-Extended`, `Google-Extended`. В `<head>` страниц обязана присутствовать автодискавери-линковка `<link rel="alternate" type="text/markdown" href="/llms.txt">` и `<link rel="help" href="/llms-full.txt">`

### Canonical Old Money OG Image Invariant

Единственным каноническим OG-изображением платформы для всех соцсетей, сниппетов поисковиков и мессенджеров является светлая картина маслом в стиле Old Money (`frontend/public/og-image.png`, 1200×630, бегущая салюки/афган на фоне холмов Тосканы и виллы). Устаревшие тёмно-зелёные плашки (`og-chatgpt-master.jpg`) и временные скрипты генерации (`generate-og-image.ts`) полностью удалены из репозитория и запрещены к возврату. Сброс устаревших графических сниппетов в поиске Google форсируется через инструмент Google «Обновление устаревшего контента» (Refresh Outdated Content) с вкладкой «Изображение» или версионированием URL, так как поисковый робот кэширует графические превью независимо от HTML

### Apple Touch Icon Invariant

Иконка быстрого доступа и закладок для iOS/macOS (`apple-touch-icon.png`, 180×180 px с непрозрачным фоном) размещается в `/apple-touch-icon.png` с обязательной декларацией `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />` в `<head>` файлов `index.html` и `404.html`

### SEO Component Optional Guard Invariant

В `frontend/src/components/SEO.tsx` проп `description` опционален. Мета-теги `<meta name="description">` и `<meta property="og:description">` рендерятся строго при наличии описания, а утилиты `cleanOgTitle` и `cleanOgDescription` экспортированы и защищены от `undefined`/пустых строк (покрыто тестами `SEO.test.ts`), предотвращая генерацию пустых или некорректных тегов в React 19

### SPA Metrica Page Hit Invariant

В SPA (`frontend/src/components/YandexMetrica.tsx`) виртуальные переходы React Router обязаны триггерить явные вызовы `ym(YANDEX_METRICA_ID, 'hit', url, { title: document.title, referer: prevUrl })` и `gtag('event', 'page_view', { page_path: url })`, предотвращая ложные 100% отказов и нулевую глубину просмотра в поведенческих факторах Яндекса и Google

### Protocol HTML SEO & SportsEvent Schema

Все 100% векторных HTML-протоколов (`export-protocol-vector.ts` / `/protocols/{id}.html`) обязаны содержать в `<head>`: `<meta name="description">` с саммари турнира, `<link rel="canonical">`, Open Graph теги (`og:title`, `og:description`, `og:url`, `og:site_name`) и структурированную разметку Schema.org `SportsEvent` (JSON-LD) с датой, местом проведения и клубом-организатором

### SEO Sitelinks & Hash Anchors

Быстрые ссылки (sitelinks) и внутрисниппетные ссылки-переходы Google/Яндекс строятся на трёх уровнях: 1) Семантический `<nav aria-label="Разделы платформы" class="site-navigation">` с `<ul><li><a href="..."><strong>Заголовок</strong></a> — <span>Описание</span></li></ul>` на главной; 2) Оглавления (`hub-toc`/`guide-toc`) и `<section id="...">` с `<h2>` на ключевых страницах (`/guide/`, `/competitions/`, `/shows/`, `/speed-records/`, `/dog/:id`) для генерации кликабельных Google jump-links со стрелкой `>`; 3) `<ScrollToHash />` в `App.tsx` с экспоненциальным backoff до 1.5 сек для плавной отложенной прокрутки к `#якорям` при асинхронной загрузке Suspense чанков и сквозной синхронизацией URL-хэшей с табами (`parseGuideTab`, `activeTab`, `activeDiscipline`); 4) Устаревший `SearchAction` удалён; используются `BreadcrumbList`, `hasPart` (`WebPage`/`CollectionPage`) и `manifest.webmanifest`

### SEO & Social Preview Natural Phrasing Invariant

Во всех мета-тегах (`<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:site_name`, `JsonLd`, `SEO.tsx`, `html-shell.ts`, `prerender-seo`) строго соблюдаются стандарты естественного русского языка и защиты от повторов: 1) Бренд сайта в Open Graph — строго «Курсинг Статс» (`og:site_name: "Курсинг Статс"`); 2) Нулевая тавтология в превью Telegram: `cleanOgTitle` удаляет дублирующий бренд из конца и начала `og:title`, а `cleanOgDescription` отсекает повтор клички собаки, имени судьи или породы в начале описания (`${entity}: `), исключая дублирование одной и той же фразы в соседних строках; 3) Склонение числительных строго через `pluralizeRu` («41 участник», «24 участника», «20 забегов», «1 победа (золото)», «8 медалей: 5 золотых, 2 серебряные, 1 бронзовая», «1 450 оценок» с тонким пробелом в тысячах); 4) Запрещены канцелярские базы данных и точки с запятой в описаниях; 5) Запрещено слово «старты» (используются «забеги» для собак и «состязания» для турниров); 6) В кличках собак разделителем между русской и латинской кличкой служит слэш (`NameRu / NameLat (Порода)`), запрещая двойные круглые скобки `(...) (...)`; 7) В судейских сниппетах запрещены ложные кликбейты («отзывы» при отсутствии системы комментариев); 8) Аббревиатура CS расшифровывается понятным собаководам языком («рейтинговый индекс качества (CS)» или «очки качества CS»), термин БЗМП сохраняется в естественном контексте, на выставках — «высший титул (BIS, CACIB)»

### Clean Canonical Links & Bot Parity Invariant

1) Все внутренние ссылки во всех компонентах сайта (карусели главной страницы, хабы пород `BreedHub`, колонки наград и карьеры `DogProfile`, справочник `Guide`, шорткаты `quickSearchData`, ссылки из протоколов выставок `ShowExhibitionDetail`), схемы `JsonLd`, пререндер SEO (`dog-seo`, `event-seo`, `hub-seo`, `judge-seo`, `submit-indexnow`, `html-shell`, `404.html`) и клавиатуры Telegram-бота (`bot/src/keyboards.ts`) строго формируют прямые канонические ссылки активного сезона (`/competitions/ranking/2026/`, `/shows/ranking/2026/`, `/speed-records/2026/`, `/competitions/archive/2026/`, `/shows/archive/2026/`, `/competitions/judges/2026/`, `/shows/judges/2026/`), полностью исключая устаревшие параметры `?tab=`; 2) Обязательный завершающий слэш перед query-параметрами: любые внутренние ссылки с параметрами запроса (напр. `/dog/${id}/?name=...`, `/donino/championship/?tab=...`) обязаны содержать слэш ПЕРЕД знаком «?». Запрещено формировать ссылки вида `/dog/${id}?name=...`, так как они вызывают 301/308 редиректы на сервере, сжигают краулинговый бюджет и плодят тысячи записей «Страница с переадресацией» в Google Search Console; 3) Аудит GSC по `referringUrls`: при исследовании ошибок 404 и редиректов источник кривых ссылок обязан выявляться через Google URL Inspection API (поле `referringUrls`), а не только по `sitemap.xml`; 4) Schema.org для животных: профили собак обязаны размечаться строго как `@type: ItemPage` (`mainEntity: Thing`). Разметка собак через `@type: ProfilePage` запрещена стандартами Google Rich Results (допустима только для `Person` и `Organization`) и порождает критические ошибки в Search Console

### Frontend Bundle Optimization & Dead Code Invariant

1) Тяжелые SVG-контуры (`DogSilhouettes` ~676 КБ) запрещено монтировать в корневой `App.tsx` или входной бандл: силуэты загружаются исключительно внутри ленивого чанка профиля собаки (`DogProfileHeader`); 2) Маппинг пород на критическом пути (`breedMapping.ts`) обязан импортировать легковесный `breed-slugs.ts` вместо тяжелого реестра хабов (`breed-hubs-data.ts` ~147 КБ); 3) Тяжелые сгенерированные таблицы судей (`judgeIdMap.generated.ts` ~140 КБ) изолируются за динамическими маршрутами (`JudgeRoutes.tsx`); 4) Внешние аналитические скрипты (Яндекс Метрика `tag.js`) обязаны загружаться отложенно (по первому взаимодействию или `requestIdleCallback`) с сохранением синхронной очереди вызовов `window.ym`; 5) Аудит мертвого кода обязан учитывать инвариантные тесты (`ios-safari-modal-invariants.test.ts`), гарантируя сохранение компонентов (`HomeDogSearch.tsx`, `ToolbarSelectDropdown.tsx`), защищающих поведение мобильных шторок, даже если они не задействованы в основном кодовом потоке

### UI-First Fast Diagnosis vs Database Dump Probing

При пользовательских замечаниях о верстке, кривом отображении, лишних элементах или растянутости на страницах (`/dog/:id`, `/shows`, `/competitions`, etc.) агент обязан немедленно начинать диагностику с целевых React-компонентов и стилей (принцип Ponytail / YAGNI). Строго запрещено запускать фоновые скрипты парсинга тяжелых 100+ МБ CDN-шардов или баз данных ради поиска единичных ID без крайней необходимости, предотвращая зависание очереди и блокировку ответа

---

## Domain Forbidden Rules

- Строго ZERO эмодзи в кодовой базе, коммитах, документации и PR.
- Строгий запрет на автоматический git push при триггере «лёрн и коммит» (только локальные коммиты; пуш строго 1–2 раза в день по прямому запросу).
- Запрещено использовать серверные БД (Turso, D1, Postgres) в проде (только статический S3 CDN).
- Запрещены неизолированные живые HTTP-запросы в юнит-тестах без оффлайн-фикстур или моков.
- Запрещено публиковать незакешированные или нежатые gzip-ассеты в /assets/.
- Запрещено использовать эпитет «официальный» применительно к проекту CoursingStats, боту или сайту.
