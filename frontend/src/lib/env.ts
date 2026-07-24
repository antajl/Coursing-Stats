/** Локальная разработка (Vite `import.meta.env.DEV`). На production Pages build — false. */
export const isLocalDev = import.meta.env.DEV

/**
 * Публичные вкладки «Календарь» на проде — не через DEV, а через `data/v1/ui-flags.json`
 * (scripts/show-calendar-*.bat / hide-calendar-*.bat). Локально календари всегда видны.
 * Протоколы `/event/:id` и `/shows/exhibition/:id` по-прежнему только DEV.
 */

/**
 * Базовый путь к локальному просмотру протокола соревнования.
 * На проде null — ссылки ведут на procoursing.ru (см. ProcoursingEventLink).
 */
export const localEventPath = isLocalDev ? '/event' : null

/**
 * Базовый путь к локальному просмотру протокола выставки.
 * На проде null — ссылки ведут на rkf.online / PDF отчёт (см. rkfLinks, history.url).
 */
export const localExhibitionPath = isLocalDev ? '/shows/exhibition' : null
