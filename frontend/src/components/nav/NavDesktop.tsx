import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { Icons } from '../../lib/icons'
import { NavMenuDropdown } from '../NavMenuDropdown'
import { usePublicCalendarVisible } from '../../hooks/useStaticData'
import { useNavLogoVisibility } from './useNavLogoVisibility'
import FavoritesCapsule from './FavoritesCapsule'
import {
  competitionsMenuItems,
  DONINO_MENU_ITEMS,
  DATA_SOURCE_LINKS,
  GUIDE_MENU_ITEMS,
  showsMenuItems,
  type OpenMenuId,
} from './navLinks'

type NavDesktopProps = {
  isActive: (path: string) => boolean
  isCompetitionsActive: boolean
  isShowsActive: boolean
  isSpeedRecordsActive: boolean
  isGuideActive: boolean
  isAboutActive: boolean
  openMenu: OpenMenuId
  setMenuOpen: (id: Exclude<OpenMenuId, null>) => (open: boolean) => void
  sourcesOpen: boolean
  onSourcesMouseEnter: () => void
  onSourcesMouseLeave: () => void
  onOpenSearch: () => void
}

export function NavDesktop({
  isActive,
  isCompetitionsActive,
  isShowsActive,
  isSpeedRecordsActive,
  isGuideActive,
  isAboutActive,
  openMenu,
  setMenuOpen,
  sourcesOpen,
  onSourcesMouseEnter,
  onSourcesMouseLeave,
  onOpenSearch,
}: NavDesktopProps) {
  const competitionsCalendar = usePublicCalendarVisible('competitions')
  const showsCalendar = usePublicCalendarVisible('shows')
  const competitionsItems = competitionsMenuItems(competitionsCalendar)
  const showsItems = showsMenuItems(showsCalendar)
  const logoRef = useRef<HTMLAnchorElement>(null)
  const navCenterRef = useRef<HTMLDivElement>(null)
  const { logoVisible, logoOpacity } = useNavLogoVisibility(logoRef, navCenterRef)
  return (
    <div className="hidden md:flex relative h-16 w-full items-center justify-between pl-2 pr-2 sm:pl-3 sm:pr-3 lg:pl-4 lg:pr-4">
      <Link
        to="/"
        ref={logoRef}
        className="flex min-w-0 shrink-0 items-center transition-all duration-300 hover:opacity-90 active:scale-95"
        style={{
          opacity: logoOpacity,
          pointerEvents: logoVisible ? 'auto' : 'none',
        }}
        aria-label="Главная страница Курсинг Статс"
        title="Курсинг Статс"
      >
        {/* Full typographic brand mark on xl and larger screens (>= 1280px) */}
        <img
          src="/assets/brand/logo.svg"
          width={348}
          height={62}
          alt="Курсинг Статс"
          className="hidden xl:block h-[52px] xl:h-[55px] 2xl:h-[58px] w-auto"
          style={{ objectFit: 'contain' }}
          loading="eager"
          decoding="async"
        />

        {/* Compact emblem badge on md to xl screens (768px - 1279px) to prevent overlap with navigation links */}
        <img
          src="/assets/brand/logo-badge.svg"
          width={60}
          height={62}
          alt="Курсинг Статс"
          className="block xl:hidden h-[46px] w-auto drop-shadow-xs"
          style={{ objectFit: 'contain' }}
          loading="eager"
          decoding="async"
        />
      </Link>

      <div
        ref={navCenterRef}
        className="absolute left-1/2 flex -translate-x-1/2 items-center gap-0.5 xl:gap-1"
      >
        <Link
          to="/"
          className={`group relative flex shrink-0 items-center whitespace-nowrap py-2 px-2.5 text-xs font-semibold transition-colors duration-300 lg:px-3.5 lg:text-sm 2xl:px-5 ${
            isActive('/') ? 'text-camel-700' : 'text-charcoal-700 hover:text-charcoal-900'
          }`}
        >
          <span className="relative z-10">Главная</span>
          <span
            className={`pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left bg-camel-600 transition-transform duration-300 ${
              isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}
          />
        </Link>
        <NavMenuDropdown
          open={openMenu === 'competitions'}
          onOpenChange={setMenuOpen('competitions')}
          defaultTo="/competitions?tab=ranking"
          title="Рейтинг собак и судьи: курсинг, БЗМП, бега борзых"
          isSectionActive={isCompetitionsActive}
          chevronLabel="Меню раздела Соревнования"
          ariaLabel="Соревнования - рейтинг, архив, судьи"
          label={
            <>
              <span className="xl:hidden">Соревн.</span>
              <span className="hidden xl:inline">Соревнования</span>
            </>
          }
          items={competitionsItems}
        />
        <NavMenuDropdown
          open={openMenu === 'shows'}
          onOpenChange={setMenuOpen('shows')}
          defaultTo="/shows?tab=ranking"
          title="Рейтинг собак и судьи на выставках"
          isSectionActive={isShowsActive}
          chevronLabel="Меню раздела Выставки"
          ariaLabel="Выставки - рейтинг, календарь, судьи"
          label="Выставки"
          items={showsItems}
          onIntent={() => {
            void import('../../lib/prefetchShows').then((m) => m.prefetchShowsHeavyTabs())
          }}
        />
        <NavMenuDropdown
          open={openMenu === 'donino'}
          onOpenChange={setMenuOpen('donino')}
          defaultTo="/speed-records?tab=records"
          title="Рекорды полигона Курсинг Донино"
          isSectionActive={isSpeedRecordsActive}
          chevronLabel="Меню раздела Курсинг Донино"
          ariaLabel="Курсинг Донино - записи и статистика"
          label={
            <>
              <span className="xl:hidden">Донино</span>
              <span className="hidden xl:inline">Курсинг Донино</span>
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
          ariaLabel="Справка - правила, титулы, протоколы"
          label="Справка"
          items={GUIDE_MENU_ITEMS}
        />
        <Link
          to="/about"
          className={`group relative flex shrink-0 items-center whitespace-nowrap py-2 px-2.5 text-xs font-semibold transition-colors duration-300 lg:px-3.5 lg:text-sm 2xl:px-5 ${
            isAboutActive ? 'text-camel-700' : 'text-charcoal-700 hover:text-charcoal-900'
          }`}
        >
          <span className="relative z-10">О проекте</span>
          <span
            className={`pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left bg-camel-600 transition-transform duration-300 ${
              isAboutActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}
          />
        </Link>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 lg:gap-2 2xl:gap-2.5">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center justify-center gap-1.5 w-9 h-9 2xl:w-auto 2xl:h-auto 2xl:px-2.5 2xl:py-1.5 rounded-lg border border-old-money-300 bg-white/90 hover:bg-old-money-50 hover:border-camel-400 text-charcoal-700 transition-all text-xs font-semibold shadow-sm group cursor-pointer shrink-0"
          title="Быстрый поиск"
          aria-label="Быстрый поиск по базе"
        >
          <Icons.search className="w-4 h-4 2xl:w-3.5 2xl:h-3.5 text-camel-700 transition-transform group-hover:scale-110" aria-hidden />
          <span className="hidden 2xl:inline">Поиск</span>
        </button>
        <FavoritesCapsule />
        <div
          className="relative shrink-0"
          onMouseEnter={onSourcesMouseEnter}
          onMouseLeave={onSourcesMouseLeave}
        >
          <button
            aria-expanded={sourcesOpen}
            aria-label="Источники данных"
            className="w-9 h-9 2xl:w-11 2xl:h-11 border-2 border-old-money-300 rounded-lg bg-old-money-50 hover:bg-old-money-100 transition-colors flex items-center justify-center shrink-0"
            title="Источники данных"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 2xl:h-5 2xl:w-5 text-old-money-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
          {sourcesOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border-2 border-old-money-200 overflow-hidden z-[100]">
              {DATA_SOURCE_LINKS.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block px-4 py-3 text-sm text-charcoal-700 hover:bg-old-money-50 transition-colors${
                    index < DATA_SOURCE_LINKS.length - 1 ? ' border-b border-old-money-100' : ''
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
