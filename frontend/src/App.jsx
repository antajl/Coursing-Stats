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
        <nav className="bg-white/80 backdrop-blur-lg border-b border-old-money-300 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center">
                <Link to="/" className="text-3xl font-extrabold bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent hover:from-gold-500 hover:to-gold-300 transition-all duration-300">
                  ProCoursing Stats
                </Link>
              </div>
              <div className="flex items-center space-x-3">
                <Link 
                  to="/" 
                  className="text-lg font-bold text-white bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 px-6 py-3 rounded-xl shadow-lg shadow-gold-500/30 transition-all duration-300 backdrop-blur-sm"
                >
                  Календарь событий
                </Link>
                <Link 
                  to="/top" 
                  className="text-lg font-bold text-white bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 px-6 py-3 rounded-xl shadow-lg shadow-gold-500/30 transition-all duration-300 backdrop-blur-sm"
                >
                  Рейтинг собак
                </Link>
                <Link 
                  to="/speed-records" 
                  className="text-lg font-bold text-white bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 px-6 py-3 rounded-xl shadow-lg shadow-gold-500/30 transition-all duration-300 backdrop-blur-sm"
                >
                  Личные рекорды скорости
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
