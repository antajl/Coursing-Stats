import { Link } from 'react-router-dom'
import ThemeToggle from '../ThemeToggle'
import { NavMenuDropdown } from '../NavMenuDropdown'
import {
  COMPETITIONS_MENU_ITEMS,
  DONINO_MENU_ITEMS,
  DATA_SOURCE_LINKS,
  GUIDE_MENU_ITEMS,
  SHOWS_MENU_ITEMS,
  type OpenMenuId,
} from './navLinks'

type NavDesktopProps = {
  isDark: boolean
  isActive: (path: string) => boolean
  isCompetitionsActive: boolean
  isShowsActive: boolean
  isSpeedRecordsActive: boolean
  isGuideActive: boolean
  openMenu: OpenMenuId
  setMenuOpen: (id: Exclude<OpenMenuId, null>) => (open: boolean) => void
  sourcesOpen: boolean
  onSourcesMouseEnter: () => void
  onSourcesMouseLeave: () => void
}

export function NavDesktop({
  isDark,
  isActive,
  isCompetitionsActive,
  isShowsActive,
  isSpeedRecordsActive,
  isGuideActive,
  openMenu,
  setMenuOpen,
  sourcesOpen,
  onSourcesMouseEnter,
  onSourcesMouseLeave,
}: NavDesktopProps) {
  return (
    <div className="hidden md:flex relative h-16 w-full items-center justify-between pl-2 pr-2 sm:pl-3 sm:pr-3 lg:pl-4 lg:pr-4">
      <Link to="/" className="relative z-10 flex shrink-0 items-center">
        <img
          src={isDark ? '/assets/logo-dark.svg' : '/assets/logo-light.svg'}
          alt="Coursing Stats"
          className="h-[52px] lg:h-[61px] opacity-80"
          style={{ objectFit: 'contain' }}
        />
      </Link>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-0.5 lg:gap-1">
          <Link
            to="/"
            className={`group relative shrink-0 px-2.5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-300 lg:px-5 lg:text-sm ${
              isActive('/') ? 'text-camel-700 dark:text-camel-400' : 'text-charcoal-700 dark:text-charcoal-200 hover:text-charcoal-900 dark:hover:text-charcoal-100'
            }`}
          >
            <span className="relative z-10">Главная</span>
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-camel-600 transition-transform duration-300 ${
              isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}></span>
          </Link>
          <NavMenuDropdown
            open={openMenu === 'competitions'}
            onOpenChange={setMenuOpen('competitions')}
            defaultTo="/competitions?tab=ranking"
            title="Рейтинг собак и судьи: курсинг, БЗМП, бега борзых"
            isSectionActive={isCompetitionsActive}
            chevronLabel="Меню раздела Соревнования"
            label={
              <>
                <span className="lg:hidden">Соревн.</span>
                <span className="hidden lg:inline">Соревнования</span>
              </>
            }
            items={COMPETITIONS_MENU_ITEMS}
          />
          <NavMenuDropdown
            open={openMenu === 'shows'}
            onOpenChange={setMenuOpen('shows')}
            defaultTo="/shows?tab=ranking"
            title="Рейтинг собак и судьи на выставках"
            isSectionActive={isShowsActive}
            chevronLabel="Меню раздела Выставки"
            label="Выставки"
            items={SHOWS_MENU_ITEMS}
          />
          <NavMenuDropdown
            open={openMenu === 'donino'}
            onOpenChange={setMenuOpen('donino')}
            defaultTo="/speed-records?view=table"
            title="Рекорды полигона Курсинг Донино"
            isSectionActive={isSpeedRecordsActive}
            chevronLabel="Меню раздела Курсинг Донино"
            label={
              <>
                <span className="lg:hidden">Донино</span>
                <span className="hidden lg:inline">Курсинг Донино</span>
              </>
            }
            items={DONINO_MENU_ITEMS}
          />
          <NavMenuDropdown
            open={openMenu === 'guide'}
            onOpenChange={setMenuOpen('guide')}
            defaultTo="/guide?tab=titles"
            title="Правила, титулы, протоколы и рейтинг"
            isSectionActive={isGuideActive}
            chevronLabel="Меню раздела Справка"
            label="Справка"
            items={GUIDE_MENU_ITEMS}
          />
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 items-center gap-3">
        <ThemeToggle />
        <div
          className="relative"
          onMouseEnter={onSourcesMouseEnter}
          onMouseLeave={onSourcesMouseLeave}
        >
          <button
            aria-expanded={sourcesOpen}
            aria-label="Источники данных"
            className="w-11 h-11 border-2 border-old-money-300 dark:border-charcoal-600 rounded-lg bg-old-money-50 dark:bg-charcoal-800 hover:bg-old-money-100 dark:hover:bg-charcoal-700 transition-colors flex items-center justify-center"
            title="Источники данных"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-old-money-700 dark:text-camel-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
          {sourcesOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-charcoal-800 rounded-xl shadow-xl border-2 border-old-money-200 dark:border-charcoal-600 overflow-hidden z-[100]">
              {DATA_SOURCE_LINKS.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block px-4 py-3 text-sm text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-700 transition-colors${
                    index < DATA_SOURCE_LINKS.length - 1 ? ' border-b border-old-money-100 dark:border-charcoal-600' : ''
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
