import { BrowserRouter as Router } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { DogSilhouettes } from './components/DogSilhouettes'
import { YandexMetrica } from './components/YandexMetrica'
import { QueryProvider } from './lib/query-client'
import Nav from './components/Nav'
import AppRoutes from './AppRoutes'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { ToastProvider } from './components/ToastManager'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <HelmetProvider>
      <QueryProvider>
        <FavoritesProvider>
          <ToastProvider>
            <ErrorBoundary>
              <Router>
                <YandexMetrica />
                <DogSilhouettes />
                <a href="#main-content"
                   className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                              focus:z-50 focus:px-4 focus:py-2 focus:bg-camel-600 focus:text-white
                              focus:rounded-lg">
                  Перейти к содержимому
                </a>
                {/* Глобальный grain — покрывает все карточки и блоки без правки каждого компонента */}
                <div
                  className="print:hidden"
                  aria-hidden="true"
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2,
                    pointerEvents: 'none',
                    opacity: 0.048,
                    mixBlendMode: 'multiply',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
                    backgroundSize: '120px 120px',
                    backgroundRepeat: 'repeat',
                  }}
                />
                <div className="cs-page-shell min-h-screen">
                  <Nav />
                  <div className="relative z-[1]">
                    <main id="main-content" className="w-full md:max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pt-3 pb-5 md:pt-4 flex-1 print:p-0 print:m-0 print:max-w-none">
                      <AppRoutes />
                    </main>
                  </div>
                </div>
              </Router>
            </ErrorBoundary>
          </ToastProvider>
        </FavoritesProvider>
      </QueryProvider>
    </HelmetProvider>
  )
}

export default App
