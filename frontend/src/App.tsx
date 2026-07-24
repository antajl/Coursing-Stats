import { BrowserRouter as Router } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { DogSilhouettes } from './components/DogSilhouettes'
import { YandexMetrica } from './components/YandexMetrica'
import { QueryProvider } from './lib/query-client'
import Nav from './components/Nav'
import TemporaryCompetitionsCalendarBanner from './components/TemporaryCompetitionsCalendarBanner'
import AppRoutes from './AppRoutes'

function App() {
  return (
    <HelmetProvider>
      <QueryProvider>
        <Router>
          <YandexMetrica />
          <DogSilhouettes />
          <a href="#main-content"
             className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                        focus:z-50 focus:px-4 focus:py-2 focus:bg-camel-600 focus:text-white
                        focus:rounded-lg">
            Перейти к содержимому
          </a>
          <div className="min-h-screen bg-gradient-to-br from-old-money-50 via-old-money-100 to-old-money-200 dark:from-charcoal-900 dark:via-charcoal-800 dark:to-charcoal-900">
            <Nav />
            <TemporaryCompetitionsCalendarBanner />
            <main id="main-content" className="w-full md:max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pt-3 pb-5 md:pt-4 flex-1">
              <AppRoutes />
            </main>
          </div>
        </Router>
      </QueryProvider>
    </HelmetProvider>
  )
}

export default App
