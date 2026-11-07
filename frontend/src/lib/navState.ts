export type NavSection = 'competitions' | 'shows' | 'guide'

const TAB_STORAGE_PREFIX = 'cs_last_tab:'

const VALID_TABS: Record<NavSection, readonly string[]> = {
  competitions: ['ranking', 'archive', 'judges', 'builder'],
  shows: ['ranking', 'archive', 'judges'],
  guide: ['titles', 'shows', 'donino', 'protocol', 'rating', 'speeds'],
}

const DEFAULT_TABS: Record<NavSection, string> = {
  competitions: 'ranking',
  shows: 'ranking',
  guide: 'titles',
}

const DEFAULT_DONINO_PATH = '/speed-records/?tab=records'

const VALID_DONINO_PREFIXES = [
  '/speed-records',
  '/donino/championship',
  '/donino/analytics',
]

function safeGetItem(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return
    window.localStorage.setItem(key, value)
  } catch {
    // Ignore storage quota or security errors (e.g. private mode)
  }
}

/**
 * Returns the last active subtab for a given main section, fallback to default.
 */
export function getLastSectionTab(section: NavSection): string {
  const defaultTab = DEFAULT_TABS[section]
  const saved = safeGetItem(TAB_STORAGE_PREFIX + section)
  if (!saved) return defaultTab
  const valid = VALID_TABS[section]
  if (valid && valid.includes(saved)) {
    return saved
  }
  return defaultTab
}

/**
 * Persists the active subtab for a main section in localStorage.
 */
export function setLastSectionTab(section: NavSection, tab: string): void {
  const valid = VALID_TABS[section]
  if (valid && valid.includes(tab)) {
    safeSetItem(TAB_STORAGE_PREFIX + section, tab)
  }
}

/**
 * Generates the clean target link for a main section using its last active subtab.
 */
export function getSectionLink(section: NavSection): string {
  const tab = getLastSectionTab(section)
  return `/${section}/?tab=${tab}`
}

/**
 * Returns the last visited Donino subsection URL.
 */
export function getLastDoninoPath(): string {
  const saved = safeGetItem(TAB_STORAGE_PREFIX + 'donino')
  if (saved && VALID_DONINO_PREFIXES.some((prefix) => saved.startsWith(prefix))) {
    return saved
  }
  return DEFAULT_DONINO_PATH
}

/**
 * Persists the active Donino subsection URL in localStorage.
 */
export function setLastDoninoPath(path: string): void {
  if (VALID_DONINO_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    safeSetItem(TAB_STORAGE_PREFIX + 'donino', path)
  }
}
