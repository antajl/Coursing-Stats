import { Link } from 'react-router-dom'
import ThemeToggle from '../ThemeToggle'
import { DATA_SOURCE_LINKS, GUIDE_MENU_ITEMS } from './navLinks'

type NavMobileProps = {
  isDark: boolean
  isActive: (path: string) => boolean
  isCompetitionsActive: boolean
  isShowsActive: boolean
  isSpeedRecordsActive: boolean
  isGuideActive: boolean
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
  isDark,
  isActive,
  isCompetitionsActive,
  isShowsActive,
  isSpeedRecordsActive,
  isGuideActive,
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
  return (
    <>
      <div className="md:hidden flex items-center justify-between h-12 pl-2 pr-2 gap-2">
        <Link to="/">
          <img src={isDark ? '/assets/logo-dark.svg' : '/assets/logo-light.svg'} alt="" className="h-10 opacity-80" style={{ objectFit: 'contain' }} />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onToggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Навигационное меню"
            className="w-11 h-11 border-2 border-old-money-300 dark:border-charcoal-600 rounded-lg bg-old-money-50 dark:bg-charcoal-800 hover:bg-old-money-100 dark:hover:bg-charcoal-700 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-old-money-700 dark:text-camel-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div id="mobile-menu" className="md:hidden absolute top-12 left-0 right-0 z-50 bg-white dark:bg-charcoal-900 border-b border-old-money-200 dark:border-charcoal-700 shadow-lg">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/"
              onClick={onCloseMobileMenu}
              className={`block px-4 py-2 text-sm font-semibold transition-colors ${
                isActive('/') ? 'text-camel-700 dark:text-camel-400' : 'text-charcoal-700 dark:text-charcoal-200'
              }`}
            >
              <span className="relative inline-block">
                Главная
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-camel-600 transition-transform duration-300 ${
                  isActive('/') ? 'scale-x-100' : 'scale-x-0'
                }`}></span>
              </span>
            </Link>
            <div>
              <button
                onClick={onToggleStatistics}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-semibold transition-colors ${
                  isCompetitionsActive ? 'text-camel-700 dark:text-camel-400' : 'text-charcoal-700 dark:text-charcoal-200'
                }`}
              >
                <span className="relative inline-block">
                  Соревнования
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-camel-600 transition-transform duration-300 ${
                    isCompetitionsActive ? 'scale-x-100' : 'scale-x-0'
                  }`}></span>
                </span>
                <svg className={`w-4 h-4 transition-transform ${statisticsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {statisticsOpen && (
                <div className="mt-2 space-y-1 pl-4">
                  <Link
                    to="/competitions?tab=ranking"
                    onClick={onCloseMobileMenu}
                    className="block px-4 py-2 text-sm text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
                  >
                    Рейтинг
                  </Link>
                  <Link
                    to="/competitions?tab=judges"
                    onClick={onCloseMobileMenu}
                    className="block px-4 py-2 text-sm text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
                  >
                    Судьи
                  </Link>
                </div>
              )}
            </div>
            <div>
              <button
                onClick={onToggleShows}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-semibold transition-colors ${
                  isShowsActive ? 'text-camel-700 dark:text-camel-400' : 'text-charcoal-700 dark:text-charcoal-200'
                }`}
              >
                <span className="relative inline-block">
                  Выставки
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-camel-600 transition-transform duration-300 ${
                    isShowsActive ? 'scale-x-100' : 'scale-x-0'
                  }`}></span>
                </span>
                <svg className={`w-4 h-4 transition-transform ${showsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showsOpen && (
                <div className="mt-2 space-y-1 pl-4">
                  <Link
                    to="/shows?tab=ranking"
                    onClick={onCloseMobileMenu}
                    className="block px-4 py-2 text-sm text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
                  >
                    Рейтинг
                  </Link>
                  <Link
                    to="/shows?tab=calendar"
                    onClick={onCloseMobileMenu}
                    className="block px-4 py-2 text-sm text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
                  >
                    Календарь
                  </Link>
                  <Link
                    to="/shows?tab=judges"
                    onClick={onCloseMobileMenu}
                    className="block px-4 py-2 text-sm text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
                  >
                    Судьи
                  </Link>
                </div>
              )}
            </div>
            <div>
              <button
                onClick={onToggleDonino}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-semibold transition-colors ${
                  isSpeedRecordsActive ? 'text-camel-700 dark:text-camel-400' : 'text-charcoal-700 dark:text-charcoal-200'
                }`}
              >
                <span className="relative inline-block">
                  Курсинг Донино
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-camel-600 transition-transform duration-300 ${
                    isSpeedRecordsActive ? 'scale-x-100' : 'scale-x-0'
                  }`}></span>
                </span>
                <svg className={`w-4 h-4 transition-transform ${doninoOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {doninoOpen && (
                <div className="mt-2 space-y-1 pl-4">
                  <Link
                    to="/speed-records?view=table"
                    onClick={onCloseMobileMenu}
                    className="block px-4 py-2 text-sm text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
                  >
                    Записи
                  </Link>
                  <Link
                    to="/speed-records?view=stats"
                    onClick={onCloseMobileMenu}
                    className="block px-4 py-2 text-sm text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
                  >
                    Статистика
                  </Link>
                </div>
              )}
            </div>
            <div>
              <button
                onClick={onToggleGuide}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-semibold transition-colors ${
                  isGuideActive ? 'text-camel-700 dark:text-camel-400' : 'text-charcoal-700 dark:text-charcoal-200'
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
                <svg
                  className={`h-4 w-4 transition-transform ${guideOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {guideOpen && (
                <div className="mt-2 space-y-1 pl-4">
                  {GUIDE_MENU_ITEMS.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onCloseMobileMenu}
                      className="block rounded-lg px-4 py-2 text-sm text-charcoal-700 transition-colors hover:bg-old-money-50 dark:text-charcoal-200 dark:hover:bg-charcoal-800"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-old-money-200 dark:border-charcoal-600 pt-2 mt-2">
              <button
                onClick={onToggleSources}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-semibold text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-800 transition-colors"
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
                      className="block px-4 py-2 text-sm text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
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
