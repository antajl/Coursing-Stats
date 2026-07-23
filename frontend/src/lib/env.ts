/** Локальная разработка (Vite `import.meta.env.DEV`). На production Pages build — false. */
export const isLocalDev = import.meta.env.DEV

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
