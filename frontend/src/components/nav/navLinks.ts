import { Icons } from '../../lib/icons'
import { isLocalDev } from '../../lib/env'
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

export function doninoViewActive(view: 'table' | 'stats') {
  return (pathname: string, search: string) => {
    if (pathname !== '/speed-records') return false
    const current = new URLSearchParams(search).get('view')
    if (view === 'table') return current !== 'stats'
    return current === 'stats'
  }
}

export function guideTabActive(tab: string) {
  return (pathname: string, search: string) => {
    if (pathname !== '/guide') return false
    const current = new URLSearchParams(search).get('tab') || 'titles'
    return current === tab
  }
}

const COMPETITIONS_CALENDAR_ITEM: NavMenuItem = {
  to: '/competitions?tab=calendar',
  label: 'Календарь',
  icon: Icons.calendar,
  isActive: competitionTabActive('calendar'),
}

export const COMPETITIONS_MENU_ITEMS: NavMenuItem[] = [
  {
    to: '/competitions?tab=ranking',
    label: 'Рейтинг',
    icon: Icons.medal,
    isActive: competitionTabActive('ranking'),
  },
  ...(isLocalDev ? [COMPETITIONS_CALENDAR_ITEM] : []),
  {
    to: '/competitions?tab=judges',
    label: 'Судьи',
    icon: Icons.club,
    isActive: competitionTabActive('judges'),
  },
]

const SHOWS_CALENDAR_ITEM: NavMenuItem = {
  to: '/shows?tab=calendar',
  label: 'Календарь',
  icon: Icons.calendar,
  isActive: showTabActive('calendar'),
}

export const SHOWS_MENU_ITEMS: NavMenuItem[] = [
  {
    to: '/shows?tab=ranking',
    label: 'Рейтинг',
    icon: Icons.medal,
    isActive: showTabActive('ranking'),
  },
  ...(isLocalDev ? [SHOWS_CALENDAR_ITEM] : []),
  {
    to: '/shows?tab=judges',
    label: 'Судьи',
    icon: Icons.club,
    isActive: showTabActive('judges'),
  },
]

export const DONINO_MENU_ITEMS: NavMenuItem[] = [
  {
    to: '/speed-records?view=table',
    label: 'Записи',
    icon: Icons.speed,
    isActive: doninoViewActive('table'),
  },
  {
    to: '/speed-records?view=stats',
    label: 'Статистика',
    icon: Icons.trend,
    isActive: doninoViewActive('stats'),
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
  {
    to: '/guide?tab=site',
    label: 'О сайте',
    icon: Icons.paw,
    isActive: guideTabActive('site'),
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
