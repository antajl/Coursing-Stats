import { BrowserRouter as Router } from 'react-router-dom'
import { DogSilhouettes } from './components/DogSilhouettes'
import { QueryProvider } from './lib/query-client'
import Nav from './components/Nav'
import AppRoutes from './AppRoutes'

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
            <AppRoutes />
          </main>
        </div>
      </Router>
    </QueryProvider>
  )
}

export default App
