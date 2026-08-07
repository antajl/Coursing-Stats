/** Локальная разработка (Vite `import.meta.env.DEV`). На production Pages build — false. */
export const isLocalDev = import.meta.env.DEV

/**
 * Публичные вкладки «Календарь» на проде — через `data/v1/ui-flags.json`
 * (scripts/show-calendar-*.bat / hide-calendar-*.bat). Локально календари всегда видны.
 *
 * Протоколы выставок `/shows/exhibition/:id` — на сайте (Turso).
 * Протоколы соревнований `/event/:id` — только DEV; на проде ссылки на procoursing.ru.
 */

/**
 * Базовый путь к локальному просмотру протокола соревнования.
 * На проде null — ссылки ведут на procoursing.ru (см. ProcoursingEventLink).
 */
export const localEventPath = isLocalDev ? '/event' : null

/** Базовый путь к протоколу выставки на сайте (dev и prod). */
export const localExhibitionPath = '/shows/exhibition'
