/** Локальная разработка (Vite dev server). На проде — false. */
export const isLocalDev = import.meta.env.DEV

/** Базовый путь к просмотру протокола — только в dev. */
export const localEventPath = isLocalDev ? '/admin/event' : null
