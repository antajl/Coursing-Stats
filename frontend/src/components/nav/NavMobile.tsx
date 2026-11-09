import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  Home,
  Trophy,
  Award,
  Zap,
  BookOpen,
  Info,
  X,
} from 'lucide-react'
import { Icons } from '../../lib/icons'
import FavoritesCapsule from './FavoritesCapsule'
import { useInteractiveDrawer } from '../../hooks/useInteractiveDrawer'
import { getSectionLink, getLastDoninoPath } from '../../lib/navState'

type NavMobileProps = {
  isActive: (path: string) => boolean
  isCompetitionsActive: boolean
  isShowsActive: boolean
  isSpeedRecordsActive: boolean
  isGuideActive: boolean
  isAboutActive: boolean
  mobileMenuOpen: boolean
  onToggleMobileMenu: () => void
  onCloseMobileMenu: () => void
  onOpenSearch: () => void
}

export function NavMobile({
  isActive,
  isCompetitionsActive,
  isShowsActive,
  isSpeedRecordsActive,
  isGuideActive,
  isAboutActive,
  mobileMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
  onOpenSearch,
}: NavMobileProps) {
  const [mounted, setMounted] = useState(false)

  const { containerRef, overlayRef, drawerRef } = useInteractiveDrawer({
    isOpen: mobileMenuOpen,
    onOpen: onToggleMobileMenu,
    onClose: onCloseMobileMenu,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {/* Мобильная верхняя планка в шапке */}
      <div className="md:hidden flex items-center justify-between h-12 pl-2 pr-2 gap-2">
        <Link
          to="/"
          className="flex items-center min-w-0 shrink-0"
          aria-label="Главная страница Курсинг Статс"
        >
          <img
            src="/assets/brand/logo.svg"
            width={348}
            height={62}
            alt="Курсинг Статс"
            className="h-10 sm:h-11 w-auto"
            loading="eager"
            decoding="async"
            style={{ objectFit: 'contain' }}
          />
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            className="cs-glass-pill w-11 h-11 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Быстрый поиск"
            title="Быстрый поиск"
          >
            <Icons.search className="w-5 h-5 text-camel-700" aria-hidden />
          </button>
          <FavoritesCapsule />
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-drawer"
            aria-label="Навигационное меню"
            className="cs-glass-pill w-11 h-11 rounded-full flex items-center justify-center cursor-pointer"
          >
            <svg className="w-5 h-5 text-old-money-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Невидимая полоса перехвата жеста у правого края (под шапкой) для надежного свайпа на открытие */}
      {!mobileMenuOpen && (
        <div
          className="fixed top-12 bottom-0 right-0 w-6 z-30 md:hidden pointer-events-auto touch-none"
          aria-hidden="true"
        />
      )}

      {/* Портал на document.body — монтируется независимо от шапки */}
      {mounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={containerRef}
            className="fixed inset-0 z-[999] md:hidden invisible pointer-events-none"
          >
            {/* Затемняющий оверлей с поддержкой тапов на iOS Safari */}
            <div
              ref={overlayRef}
              role="button"
              tabIndex={-1}
              aria-label="Закрыть меню"
              className="fixed inset-0 bg-charcoal-950/45 opacity-0 cursor-pointer touch-manipulation"
              onClick={onCloseMobileMenu}
            />

            {/* Выдвижная боковая шторка (Drawer) */}
            <aside
              ref={drawerRef}
              id="mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Навигационное меню"
              className="fixed inset-y-0 right-0 z-10 h-full w-[min(320px,84vw)] max-w-sm bg-cream-50 text-charcoal-900 shadow-2xl border-l border-old-money-200/90 flex flex-col justify-between overflow-y-auto translate-x-full"
            >
              <div>
                {/* Шапка шторки */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-old-money-200/80 bg-cream-100/60">
                  <div className="flex items-center gap-2">
                    <img
                      src="/assets/brand/logo-badge.svg"
                      width={32}
                      height={32}
                      alt=""
                      className="h-8 w-8 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="font-serif text-sm font-bold tracking-wide text-charcoal-900">
                      Курсинг Статс
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onCloseMobileMenu}
                    className="w-9 h-9 rounded-full border border-old-money-300 bg-cream-50 hover:bg-cream-200 transition-colors flex items-center justify-center text-charcoal-700 cursor-pointer"
                    aria-label="Закрыть меню"
                  >
                    <X className="w-4 h-4 text-charcoal-800" aria-hidden="true" />
                  </button>
                </div>

                {/* Список навигационных ссылок */}
                <nav className="p-3 space-y-1">
                  <Link
                    to="/"
                    onClick={onCloseMobileMenu}
                    className={`min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all ${
                      isActive('/')
                        ? 'bg-camel-500/15 text-charcoal-900 border-l-2 border-camel-600 font-bold'
                        : 'text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-900'
                    }`}
                  >
                    <Home className={`w-4 h-4 shrink-0 ${isActive('/') ? 'text-camel-700' : 'text-charcoal-500'}`} aria-hidden="true" />
                    <span>Главная</span>
                  </Link>

                  <Link
                    to={getSectionLink('competitions')}
                    onClick={onCloseMobileMenu}
                    className={`min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all ${
                      isCompetitionsActive
                        ? 'bg-camel-500/15 text-charcoal-900 border-l-2 border-camel-600 font-bold'
                        : 'text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-900'
                    }`}
                  >
                    <Trophy className={`w-4 h-4 shrink-0 ${isCompetitionsActive ? 'text-camel-700' : 'text-charcoal-500'}`} aria-hidden="true" />
                    <span>Соревнования</span>
                  </Link>

                  <Link
                    to={getSectionLink('shows')}
                    onClick={() => {
                      void import('../../lib/prefetchShows').then((m) => m.prefetchShowsHeavyTabs())
                      onCloseMobileMenu()
                    }}
                    className={`min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all ${
                      isShowsActive
                        ? 'bg-camel-500/15 text-charcoal-900 border-l-2 border-camel-600 font-bold'
                        : 'text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-900'
                    }`}
                  >
                    <Award className={`w-4 h-4 shrink-0 ${isShowsActive ? 'text-camel-700' : 'text-charcoal-500'}`} aria-hidden="true" />
                    <span>Выставки</span>
                  </Link>

                  <Link
                    to={getLastDoninoPath()}
                    onClick={onCloseMobileMenu}
                    className={`min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all ${
                      isSpeedRecordsActive
                        ? 'bg-camel-500/15 text-charcoal-900 border-l-2 border-camel-600 font-bold'
                        : 'text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-900'
                    }`}
                  >
                    <Zap className={`w-4 h-4 shrink-0 ${isSpeedRecordsActive ? 'text-camel-700' : 'text-charcoal-500'}`} aria-hidden="true" />
                    <span>Курсинг Донино</span>
                  </Link>

                  <Link
                    to={getSectionLink('guide')}
                    onClick={onCloseMobileMenu}
                    className={`min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all ${
                      isGuideActive
                        ? 'bg-camel-500/15 text-charcoal-900 border-l-2 border-camel-600 font-bold'
                        : 'text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-900'
                    }`}
                  >
                    <BookOpen className={`w-4 h-4 shrink-0 ${isGuideActive ? 'text-camel-700' : 'text-charcoal-500'}`} aria-hidden="true" />
                    <span>Справка</span>
                  </Link>

                  <Link
                    to="/about/"
                    onClick={onCloseMobileMenu}
                    className={`min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all ${
                      isAboutActive
                        ? 'bg-camel-500/15 text-charcoal-900 border-l-2 border-camel-600 font-bold'
                        : 'text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-900'
                    }`}
                  >
                    <Info className={`w-4 h-4 shrink-0 ${isAboutActive ? 'text-camel-700' : 'text-charcoal-500'}`} aria-hidden="true" />
                    <span>О проекте</span>
                  </Link>
                </nav>
              </div>

              {/* Чистый аккуратный подвал без лишних подсказок */}
              <div className="p-4 border-t border-old-money-200/80 bg-cream-100/40 text-[11px] text-charcoal-600 font-serif flex items-center justify-center">
                <span>Coursing Stats · 2026</span>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  )
}
