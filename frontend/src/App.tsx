import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import Events from './pages/Events/index'
import TopDogs from './pages/TopDogs'
import DogProfile from './pages/DogProfile'
import EventResults from './pages/Events/EventResults'
import SpeedRecords from './pages/SpeedRecords/index'
import Procoursing from './pages/Procoursing'
import Judges from './pages/Judges/index'
import JudgeDetail from './pages/Judges/JudgeDetail'
import DoninoDogProfile from './pages/DoninoDogProfile'
import { DogSilhouettes } from './components/DogSilhouettes'
import { QueryProvider } from './lib/query-client'
import ThemeToggle from './components/ThemeToggle'
import { useDarkMode } from './hooks/useDarkMode'

function Nav() {
  const location = useLocation();
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const timeoutRef = useRef(null);
  const isDark = useDarkMode();
  const isActive = (path) => location.pathname === path || (path === '/' && location.pathname === '/procoursing');

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setSourcesOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setSourcesOpen(false);
    }, 200);
  };

  const toggleSources = () => {
    setSourcesOpen(!sourcesOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setSourcesOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-cream-50/90 dark:bg-charcoal-900/90 backdrop-blur-xl border-b border-cream-300 dark:border-charcoal-700 shadow-md dark:shadow-dark-md relative">
      {/* Logo */}
      <div className="hidden md:flex absolute left-0 top-0 h-16 items-center px-4">
        <Link to="/procoursing">
          <img src={isDark ? '/assets/navbar-bg-dark.svg' : '/assets/navbar-bg.svg'} alt="" className="h-[61px] opacity-80" style={{ objectFit: 'contain' }} />
        </Link>
      </div>

      {/* Desktop navigation */}
      <div className="hidden md:flex absolute right-0 top-0 h-16 items-center px-4 z-20 gap-3">
        <ThemeToggle />
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
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
              <a
                href="http://procoursing.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 text-sm text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-700 transition-colors border-b border-old-money-100 dark:border-charcoal-600"
              >
                Procoursing.ru
              </a>
              <a
                href="https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/edit?gid=1787526009#gid=1787526009"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 text-sm text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-700 transition-colors border-b border-old-money-100 dark:border-charcoal-600"
              >
                Рекорды Донино (курсинг)
              </a>
              <a
                href="https://docs.google.com/spreadsheets/d/1hpdA8vlIfeECgpnPvuk5xfezPsdUh1EXULjeATAF9dw/edit?pli=1&gid=0#gid=0"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 text-sm text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-700 transition-colors"
              >
                Рекорды Донино (бега борзых)
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Mobile header with logo and menu button */}
      <div className="md:hidden flex items-center justify-between h-12 px-3 gap-2">
        <Link to="/procoursing">
          <img src={isDark ? '/assets/navbar-bg-dark.svg' : '/assets/navbar-bg.svg'} alt="" className="h-10 opacity-80" style={{ objectFit: 'contain' }} />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={toggleMobileMenu}
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

      {/* Desktop links */}
      <div className="hidden md:block relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="flex justify-end items-center h-16">
          <div className="flex items-center space-x-2">
            <Link
              to="/procoursing"
              className={`group relative px-6 py-2 text-sm font-semibold transition-all duration-300 ${
                isActive('/') ? 'text-camel-700 dark:text-camel-400' : 'text-charcoal-700 dark:text-charcoal-200 hover:text-charcoal-900 dark:hover:text-charcoal-100'
              }`}
            >
              <span className="relative z-10">Соревнования</span>
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-camel-600 transition-transform duration-300 ${
                isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </Link>
            <Link
              to="/speed-records"
              className={`group relative px-6 py-2 text-sm font-semibold transition-all duration-300 ${
                isActive('/speed-records') ? 'text-camel-700 dark:text-camel-400' : 'text-charcoal-700 dark:text-charcoal-200 hover:text-charcoal-900 dark:hover:text-charcoal-100'
              }`}
            >
              <span className="relative z-10">Рекорды Донино</span>
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-camel-600 transition-transform duration-300 ${
                isActive('/speed-records') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden absolute top-12 left-0 right-0 bg-white dark:bg-charcoal-900 border-b border-old-money-200 dark:border-charcoal-700 shadow-lg z-50">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/procoursing"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/') ? 'bg-camel-100 dark:bg-camel-900/30 text-camel-700 dark:text-camel-400' : 'text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-800'
              }`}
            >
              Соревнования
            </Link>
            <Link
              to="/speed-records"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/speed-records') ? 'bg-camel-100 dark:bg-camel-900/30 text-camel-700 dark:text-camel-400' : 'text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-800'
              }`}
            >
              Рекорды Донино
            </Link>
            <div className="border-t border-old-money-200 dark:border-charcoal-600 pt-2 mt-2">
              <button
                onClick={toggleSources}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-semibold text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-800 transition-colors"
              >
                <span>Источники данных</span>
                <svg className={`w-4 h-4 transition-transform ${sourcesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {sourcesOpen && (
                <div className="mt-2 space-y-1 pl-4">
                  <a
                    href="http://procoursing.ru"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
                  >
                    Procoursing.ru
                  </a>
                  <a
                    href="https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/edit?gid=1787526009#gid=1787526009"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
                  >
                    Рекорды Донино (курсинг)
                  </a>
                  <a
                    href="https://docs.google.com/spreadsheets/d/1hpdA8vlIfeECgpnPvuk5xfezPsdUh1EXULjeATAF9dw/edit?pli=1&gid=0#gid=0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
                  >
                    Рекорды Донино (бега борзых)
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    <QueryProvider>
      <Router>
        <DogSilhouettes />
        <a href="#main-content"
           className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                      focus:z-50 focus:px-4 focus:py-2 focus:bg-camel-600 focus:text-white
                      focus:rounded-lg">
          Перейти к содержимому
        </a>
        <div className="min-h-screen bg-gradient-to-br from-old-money-50 via-old-money-100 to-old-money-200 dark:from-charcoal-900 dark:via-charcoal-800 dark:to-charcoal-900">
          <Nav />

          <main id="main-content" className="w-full md:max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-5">
            <Routes>
              <Route path="/" element={<Procoursing />} />
              <Route path="/procoursing" element={<Procoursing />} />
              <Route path="/top" element={<TopDogs />} />
              <Route path="/dog/:id" element={<DogProfile />} />
              <Route path="/event/:id" element={<EventResults />} />
              <Route path="/speed-records" element={<SpeedRecords />} />
              <Route path="/donino-dog/:name/:breed" element={<DoninoDogProfile />} />
              <Route path="/judges" element={<Judges />} />
              <Route path="/judges/:judgeId" element={<JudgeDetail />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryProvider>
  )
}

export default App
