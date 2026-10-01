import { Link } from 'react-router-dom'
import FavoritesCapsule from './FavoritesCapsule'
import { usePublicCalendarVisible } from '../../hooks/useStaticData'
import { useNavLogoVisibility } from './useNavLogoVisibility'
import { DATA_SOURCE_LINKS, GUIDE_MENU_ITEMS } from './navLinks'

type NavMobileProps = {
  isActive: (path: string) => boolean
  isCompetitionsActive: boolean
  isShowsActive: boolean
  isSpeedRecordsActive: boolean
  isGuideActive: boolean
  isAboutActive: boolean
  mobileMenuOpen: boolean
  statisticsOpen: boolean
  showsOpen: boolean
  doninoOpen: boolean
  guideOpen: boolean
  sourcesOpen: boolean
  onToggleMobileMenu: () => void
  onCloseMobileMenu: () => void
  onToggleStatistics: () => void
  onToggleShows: () => void
  onToggleDonino: () => void
  onToggleGuide: () => void
  onToggleSources: () => void
}

export function NavMobile({
  isActive,
  isCompetitionsActive,
  isShowsActive,
  isSpeedRecordsActive,
  isGuideActive,
  isAboutActive,
  mobileMenuOpen,
  statisticsOpen,
  showsOpen,
  doninoOpen,
  guideOpen,
  sourcesOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
  onToggleStatistics,
  onToggleShows,
  onToggleDonino,
  onToggleGuide,
  onToggleSources,
}: NavMobileProps) {
  const competitionsCalendar = usePublicCalendarVisible('competitions')
  const showsCalendar = usePublicCalendarVisible('shows')
  const { logoVisible, logoOpacity } = useNavLogoVisibility()
  return (
    <>
      <div className="md:hidden flex items-center justify-between h-12 pl-2 pr-2 gap-2">
        <Link
          to="/"
          className="transition-opacity duration-[200ms] ease-linear"
          style={{
            opacity: logoOpacity * 0.8,
            pointerEvents: logoVisible ? 'auto' : 'none',
          }}
          aria-hidden={!logoVisible}
          tabIndex={logoVisible ? undefined : -1}
        >
          <img
            src="/assets/brand/logo.webp"
            alt="Coursing Stats"
            className="h-10"
            loading="lazy"
            decoding="async"
            style={{ objectFit: 'contain' }}
          />
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <FavoritesCapsule />
          <button
            onClick={onToggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Навигационное меню"
            className="w-11 h-11 border-2 border-old-money-300 rounded-lg bg-old-money-50 hover:bg-old-money-100 transition-colors flex items-center justify-center"
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

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onCloseMobileMenu}
          aria-hidden
        />
      )}

      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden absolute top-12 left-0 right-0 z-50 bg-white border-b border-old-money-200 shadow-lg">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/"
              onClick={onCloseMobileMenu}
              className={`block px-4 py-2 text-sm font-semibold transition-colors ${
                isActive('/') ? 'text-camel-700' : 'text-charcoal-700'
              }`}
            >
              <span className="relative inline-block">
                Главная
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-camel-600 transition-transform duration-300 ${
                  isActive('/') ? 'scale-x-100' : 'scale-x-0'
                }`}></span>
              </span>
            </Link>
            <Link
              to="/competitions"
              onClick={onCloseMobileMenu}
              className={`block px-4 py-2 text-sm font-semibold transition-colors ${
                isCompetitionsActive ? 'text-camel-700' : 'text-charcoal-700'
              }`}
            >
              <span className="relative inline-block">
                Соревнования
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-camel-600 transition-transform duration-300 ${
                  isCompetitionsActive ? 'scale-x-100' : 'scale-x-0'
                }`}></span>
              </span>
            </Link>
            <Link
              to="/shows"
              onClick={() => {
                void import('../../lib/prefetchShows').then((m) => m.prefetchShowsHeavyTabs())
                onCloseMobileMenu()
              }}
              className={`block px-4 py-2 text-sm font-semibold transition-colors ${
                isShowsActive ? 'text-camel-700' : 'text-charcoal-700'
              }`}
            >
              <span className="relative inline-block">
                Выставки
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-camel-600 transition-transform duration-300 ${
                  isShowsActive ? 'scale-x-100' : 'scale-x-0'
                }`}></span>
              </span>
            </Link>
            <Link
              to="/speed-records"
              onClick={onCloseMobileMenu}
              className={`block px-4 py-2 text-sm font-semibold transition-colors ${
                isSpeedRecordsActive ? 'text-camel-700' : 'text-charcoal-700'
              }`}
            >
              <span className="relative inline-block">
                Курсинг Донино
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-camel-600 transition-transform duration-300 ${
                  isSpeedRecordsActive ? 'scale-x-100' : 'scale-x-0'
                }`}></span>
              </span>
            </Link>
            <Link
              to="/guide"
              onClick={onCloseMobileMenu}
              className={`block px-4 py-2 text-sm font-semibold transition-colors ${
                isGuideActive ? 'text-camel-700' : 'text-charcoal-700'
              }`}
            >
              <span className="relative inline-block">
                Справка
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-full bg-camel-600 transition-transform duration-300 ${
                    isGuideActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </span>
            </Link>
            <Link
              to="/about"
              onClick={onCloseMobileMenu}
              className={`block px-4 py-2 text-sm font-semibold transition-colors ${
                isAboutActive ? 'text-camel-700' : 'text-charcoal-700'
              }`}
            >
              <span className="relative inline-block">
                О проекте
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-camel-600 transition-transform duration-300 ${
                  isAboutActive ? 'scale-x-100' : 'scale-x-0'
                }`}></span>
              </span>
            </Link>
            <div className="border-t border-old-money-200 pt-2 mt-2">
              <button
                onClick={onToggleSources}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-semibold text-charcoal-700 hover:bg-old-money-50 transition-colors"
              >
                <span>Источники данных</span>
                <svg className={`w-4 h-4 transition-transform ${sourcesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {sourcesOpen && (
                <div className="mt-2 space-y-1 pl-4">
                  {DATA_SOURCE_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-charcoal-700 hover:bg-old-money-50 rounded-lg transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
