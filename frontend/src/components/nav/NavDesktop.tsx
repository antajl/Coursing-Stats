import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { Icons } from '../../lib/icons'
import { useNavLogoVisibility } from './useNavLogoVisibility'
import FavoritesCapsule from './FavoritesCapsule'
import type { OpenMenuId } from './navLinks'

type NavDesktopProps = {
  isActive: (path: string) => boolean
  isCompetitionsActive: boolean
  isShowsActive: boolean
  isSpeedRecordsActive: boolean
  isGuideActive: boolean
  isAboutActive: boolean
  openMenu?: OpenMenuId
  setMenuOpen?: (id: Exclude<OpenMenuId, null>) => (open: boolean) => void
  onOpenSearch: () => void
}

export function NavDesktop({
  isActive,
  isCompetitionsActive,
  isShowsActive,
  isSpeedRecordsActive,
  isGuideActive,
  isAboutActive,
  openMenu: _openMenu,
  setMenuOpen: _setMenuOpen,
  onOpenSearch,
}: NavDesktopProps) {
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

        {/* Соревнования */}
        <Link
          to="/competitions/?tab=ranking"
          className={`group relative flex shrink-0 items-center whitespace-nowrap py-2 px-2.5 text-xs font-semibold transition-colors duration-300 lg:px-3.5 lg:text-sm 2xl:px-5 ${
            isCompetitionsActive ? 'text-camel-700' : 'text-charcoal-700 hover:text-charcoal-900'
          }`}
          title="Рейтинг собак и судьи: курсинг, БЗМП, бега борзых"
        >
          <span className="relative z-10">
            <span className="xl:hidden">Соревн.</span>
            <span className="hidden xl:inline">Соревнования</span>
          </span>
          <span
            className={`pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left bg-camel-600 transition-transform duration-300 ${
              isCompetitionsActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}
          />
        </Link>

        {/* Выставки */}
        <Link
          to="/shows/?tab=ranking"
          onMouseEnter={() => {
            void import('../../lib/prefetchShows').then((m) => m.prefetchShowsHeavyTabs())
          }}
          className={`group relative flex shrink-0 items-center whitespace-nowrap py-2 px-2.5 text-xs font-semibold transition-colors duration-300 lg:px-3.5 lg:text-sm 2xl:px-5 ${
            isShowsActive ? 'text-camel-700' : 'text-charcoal-700 hover:text-charcoal-900'
          }`}
          title="Рейтинг собак и судьи на выставках"
        >
          <span className="relative z-10">Выставки</span>
          <span
            className={`pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left bg-camel-600 transition-transform duration-300 ${
              isShowsActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}
          />
        </Link>

        {/* Курсинг Донино */}
        <Link
          to="/speed-records/?tab=records"
          className={`group relative flex shrink-0 items-center whitespace-nowrap py-2 px-2.5 text-xs font-semibold transition-colors duration-300 lg:px-3.5 lg:text-sm 2xl:px-5 ${
            isSpeedRecordsActive ? 'text-camel-700' : 'text-charcoal-700 hover:text-charcoal-900'
          }`}
          title="Рекорды полигона Курсинг Донино"
        >
          <span className="relative z-10">
            <span className="xl:hidden">Донино</span>
            <span className="hidden xl:inline">Курсинг Донино</span>
          </span>
          <span
            className={`pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left bg-camel-600 transition-transform duration-300 ${
              isSpeedRecordsActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}
          />
        </Link>

        {/* Справка */}
        <Link
          to="/guide/?tab=titles"
          className={`group relative flex shrink-0 items-center whitespace-nowrap py-2 px-2.5 text-xs font-semibold transition-colors duration-300 lg:px-3.5 lg:text-sm 2xl:px-5 ${
            isGuideActive ? 'text-camel-700' : 'text-charcoal-700 hover:text-charcoal-900'
          }`}
          title="Правила, титулы, протоколы и рейтинг"
        >
          <span className="relative z-10">Справка</span>
          <span
            className={`pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left bg-camel-600 transition-transform duration-300 ${
              isGuideActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}
          />
        </Link>

        {/* О проекте */}
        <Link
          to="/about/"
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
          className="cs-glass-pill flex items-center justify-center gap-1.5 h-9 w-9 2xl:w-auto 2xl:px-3 rounded-full text-charcoal-700 text-xs font-semibold group cursor-pointer shrink-0"
          title="Быстрый поиск"
          aria-label="Быстрый поиск по базе"
        >
          <Icons.search className="w-4 h-4 text-camel-700 transition-transform group-hover:scale-110" aria-hidden />
          <span className="hidden 2xl:inline">Поиск</span>
        </button>
        <FavoritesCapsule />
      </div>
    </div>
  )
}
