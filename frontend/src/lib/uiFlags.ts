import { fetchJson } from './staticData/core'
import { isLocalDev } from './env'

export type PublicCalendarKind = 'competitions' | 'shows'

export interface UiFlags {
  schema?: string
  updated_at?: string
  publicCalendars: {
    competitions: boolean
    shows: boolean
  }
}

export const DEFAULT_UI_FLAGS: UiFlags = {
  schema: 'coursing-stats/ui-flags-v1',
  publicCalendars: {
    competitions: false,
    shows: false,
  },
}

export async function getUiFlags(): Promise<UiFlags> {
  const doc = await fetchJson<Partial<UiFlags>>('ui-flags.json')
  if (!doc?.publicCalendars) return { ...DEFAULT_UI_FLAGS }
  return {
    schema: doc.schema ?? DEFAULT_UI_FLAGS.schema,
    updated_at: doc.updated_at,
    publicCalendars: {
      competitions: doc.publicCalendars.competitions === true,
      shows: doc.publicCalendars.shows === true,
    },
  }
}

/** Локально всегда true; на проде — флаг из ui-flags.json. */
export function calendarVisibleFromFlags(
  kind: PublicCalendarKind,
  flags: UiFlags | undefined | null,
): boolean {
  if (isLocalDev) return true
  return flags?.publicCalendars?.[kind] === true
}
