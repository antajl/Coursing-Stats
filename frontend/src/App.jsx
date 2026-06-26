import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Events from './pages/Events'
import TopDogs from './pages/TopDogs'
import DogProfile from './pages/DogProfile'
import EventResults from './pages/EventResults'
import SpeedRecords from './pages/SpeedRecords'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-old-money-50 via-old-money-100 to-old-money-200">
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-old-money-200 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-16">
              <div className="flex items-center space-x-2">
                <Link 
                  to="/" 
                  className="group relative px-6 py-2 text-sm font-semibold text-navy-700 hover:text-navy-900 transition-all duration-300"
                >
                  <span className="relative z-10">Календарь</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-navy-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Link>
                <Link 
                  to="/top" 
                  className="group relative px-6 py-2 text-sm font-semibold text-navy-700 hover:text-navy-900 transition-all duration-300"
                >
                  <span className="relative z-10">Рейтинг</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-navy-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Link>
                <Link 
                  to="/speed-records" 
                  className="group relative px-6 py-2 text-sm font-semibold text-navy-700 hover:text-navy-900 transition-all duration-300"
                >
                  <span className="relative z-10">Рекорды</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-navy-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Routes>
            <Route path="/" element={<Events />} />
            <Route path="/top" element={<TopDogs />} />
            <Route path="/dog/:id" element={<DogProfile />} />
            <Route path="/event/:id" element={<EventResults />} />
            <Route path="/speed-records" element={<SpeedRecords />} />
          </Routes>
        </main>

        <footer className="bg-white/80 backdrop-blur-lg border-t border-old-money-300 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <p className="text-center text-old-money-600 text-sm">
              © 2026 ProCoursing Stats. Данные с procoursing.ru
            </p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
