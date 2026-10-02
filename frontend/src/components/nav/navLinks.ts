import { Icons } from '../../lib/icons'
import type { NavMenuItem } from '../NavMenuDropdown'

export type OpenMenuId = 'competitions' | 'shows' | 'donino' | 'guide' | null

export function competitionTabActive(tab: string) {
  return (pathname: string, search: string) => {
    if (pathname !== '/competitions' && pathname !== '/procoursing') return false
    const current = new URLSearchParams(search).get('tab') || 'ranking'
    return current === tab
  }
}

export function showTabActive(tab: string) {
  return (pathname: string, search: string) => {
    if (pathname !== '/shows') return false
    const current = new URLSearchParams(search).get('tab') || 'ranking'
    return current === tab
  }
}

export function doninoTabActive(tab: 'records' | 'stats') {
  return (pathname: string, search: string) => {
    if (pathname !== '/speed-records') return false
    const sp = new URLSearchParams(search)
    const currentTab = sp.get('tab')
    const currentView = sp.get('view')
    if (tab === 'records') {
      return currentTab === 'records' || currentTab === 'table' || (!currentTab && currentView !== 'stats')
    }
    return currentTab === 'stats' || currentView === 'stats'
  }
}

export function doninoViewActive(view: 'table' | 'stats') {
  return doninoTabActive(view === 'stats' ? 'stats' : 'records')
}

export function guideTabActive(tab: string) {
  return (pathname: string, search: string) => {
    if (pathname !== '/guide') return false
    const current = new URLSearchParams(search).get('tab') || 'titles'
    return current === tab
  }
}

const COMPETITIONS_ARCHIVE_ITEM: NavMenuItem = {
  to: '/competitions?tab=archive',
  label: 'Архив',
  icon: Icons.calendar,
  isActive: (pathname: string, search: string) => {
    if (pathname !== '/competitions' && pathname !== '/procoursing') return false
    const current = new URLSearchParams(search).get('tab')
    return current === 'archive' || current === 'calendar'
  },
}

export function competitionsMenuItems(calendarVisible: boolean): NavMenuItem[] {
  return [
    {
      to: '/competitions?tab=ranking',
      label: 'Рейтинг',
      icon: Icons.medal,
      isActive: competitionTabActive('ranking'),
    },
    ...(calendarVisible ? [COMPETITIONS_ARCHIVE_ITEM] : []),
    {
      to: '/competitions?tab=judges',
      label: 'Судьи',
      icon: Icons.club,
      isActive: competitionTabActive('judges'),
    },
    {
      to: '/protocol-builder',
      label: 'Конструктор протокола',
      icon: Icons.fileText,
      isActive: (pathname: string) => pathname === '/protocol-builder',
    },
  ]
}

const SHOWS_CALENDAR_ITEM: NavMenuItem = {
  to: '/shows?tab=calendar',
  label: 'Календарь',
  icon: Icons.calendar,
  isActive: showTabActive('calendar'),
}

export function showsMenuItems(calendarVisible: boolean): NavMenuItem[] {
  return [
    {
      to: '/shows?tab=ranking',
      label: 'Рейтинг',
      icon: Icons.medal,
      isActive: showTabActive('ranking'),
    },
    ...(calendarVisible ? [SHOWS_CALENDAR_ITEM] : []),
    {
      to: '/shows?tab=judges',
      label: 'Судьи',
      icon: Icons.club,
      isActive: showTabActive('judges'),
    },
  ]
}

export const DONINO_MENU_ITEMS: NavMenuItem[] = [
  {
    to: '/speed-records?tab=records',
    label: 'Записи',
    icon: Icons.speed,
    isActive: doninoTabActive('records'),
  },
  {
    to: '/speed-records?tab=stats',
    label: 'Статистика',
    icon: Icons.trend,
    isActive: doninoTabActive('stats'),
  },
]

export const GUIDE_MENU_ITEMS: NavMenuItem[] = [
  {
    to: '/guide?tab=titles',
    label: 'Соревнования',
    icon: Icons.medal,
    isActive: guideTabActive('titles'),
  },
  {
    to: '/guide?tab=shows',
    label: 'Выставки',
    icon: Icons.award,
    isActive: guideTabActive('shows'),
  },
  {
    to: '/guide?tab=protocol',
    label: 'Протоколы',
    icon: Icons.flag,
    isActive: guideTabActive('protocol'),
  },
  {
    to: '/guide?tab=rating',
    label: 'Рейтинг',
    icon: Icons.trend,
    isActive: guideTabActive('rating'),
  },
]

export const DATA_SOURCE_LINKS = [
  { href: 'http://procoursing.ru', label: 'Procoursing.ru' },
  { href: 'https://runningdog.ru/', label: 'Курсинг Донино' },
  {
    href: 'https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/edit?gid=1787526009#gid=1787526009',
    label: 'Рекорды Донино (курсинг)',
  },
  {
    href: 'https://docs.google.com/spreadsheets/d/1hpdA8vlIfeECgpnPvuk5xfezPsdUh1EXULjeATAF9dw/edit?pli=1&gid=0#gid=0',
    label: 'Рекорды Донино (бега борзых)',
  },
] as const
