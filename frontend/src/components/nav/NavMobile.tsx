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
  ChevronDown,
  Database,
  ExternalLink,
} from 'lucide-react'
import { Icons } from '../../lib/icons'
import FavoritesCapsule from './FavoritesCapsule'
import { DATA_SOURCE_LINKS } from './navLinks'
import { useInteractiveDrawer } from '../../hooks/useInteractiveDrawer'

type NavMobileProps = {
  isActive: (path: string) => boolean
  isCompetitionsActive: boolean
  isShowsActive: boolean
  isSpeedRecordsActive: boolean
  isGuideActive: boolean
  isAboutActive: boolean
  mobileMenuOpen: boolean
  sourcesOpen: boolean
  onToggleMobileMenu: () => void
  onCloseMobileMenu: () => void
  onToggleSources: () => void
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
  sourcesOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
  onToggleSources,
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
            className="w-11 h-11 border-2 border-old-money-300 rounded-lg bg-old-money-50 hover:bg-old-money-100 transition-colors flex items-center justify-center shrink-0 text-old-money-700 cursor-pointer"
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
            className="w-11 h-11 border-2 border-old-money-300 rounded-lg bg-old-money-50 hover:bg-old-money-100 transition-colors flex items-center justify-center cursor-pointer"
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
            {/* Затемняющий оверлей с мягким blur */}
            <div
              ref={overlayRef}
              className="fixed inset-0 bg-charcoal-950/45 backdrop-blur-[2px] opacity-0"
              onClick={onCloseMobileMenu}
              aria-hidden="true"
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
                    className="w-9 h-9 rounded-lg border border-old-money-300 bg-cream-50 hover:bg-cream-200 transition-colors flex items-center justify-center text-charcoal-700 cursor-pointer"
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
                    to="/competitions/"
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
                    to="/shows/"
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
                    to="/speed-records/"
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
                    to="/guide/"
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

                  {/* Источники данных */}
                  <div className="pt-2 mt-2 border-t border-old-money-200/80">
                    <button
                      type="button"
                      onClick={onToggleSources}
                      className="w-full min-h-[44px] flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-semibold text-charcoal-700 hover:bg-cream-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Database className="w-4 h-4 text-charcoal-500 shrink-0" aria-hidden="true" />
                        <span>Источники данных</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${sourcesOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                    {sourcesOpen && (
                      <div className="mt-1 space-y-0.5 pl-9 pr-2">
                        {DATA_SOURCE_LINKS.map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between min-h-[38px] px-3 py-1.5 text-xs text-charcoal-700 hover:bg-cream-200/60 rounded-lg transition-colors"
                          >
                            <span>{link.label}</span>
                            <ExternalLink className="w-3 h-3 text-charcoal-400" aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
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
