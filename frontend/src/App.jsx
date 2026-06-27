import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useRef } from 'react'
import Events from './pages/Events'
import TopDogs from './pages/TopDogs'
import DogProfile from './pages/DogProfile'
import EventResults from './pages/EventResults'
import SpeedRecords from './pages/SpeedRecords'
import Procoursing from './pages/Procoursing'
import Judges from './pages/Judges'
import JudgeDetail from './pages/JudgeDetail'
import { DogSilhouettes } from './components/DogSilhouettes'

function Nav() {
  const location = useLocation();
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const timeoutRef = useRef(null);
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

  return (
    <nav className="sticky top-0 z-50 bg-cream-50/90 backdrop-blur-xl border-b border-cream-300 shadow-md relative">
      <div className="absolute left-0 top-0 h-16 flex items-center px-4">
        <img src="/assets/navbar-bg.svg" alt="Logo" className="h-[61px] opacity-80" style={{ objectFit: 'contain' }} />
      </div>
      <div className="absolute right-0 top-0 h-16 flex items-center px-4">
        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className="w-10 h-10 border-2 border-old-money-300 rounded-lg bg-old-money-50 hover:bg-old-money-100 transition-colors flex items-center justify-center"
            title="Источники данных"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-old-money-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
          {sourcesOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border-2 border-old-money-200 overflow-hidden z-[100]">
              <a
                href="http://procoursing.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 text-sm text-charcoal-700 hover:bg-old-money-50 transition-colors border-b border-old-money-100"
              >
                Procoursing.ru
              </a>
              <a
                href="https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/edit?gid=1787526009#gid=1787526009"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 text-sm text-charcoal-700 hover:bg-old-money-50 transition-colors"
              >
                Таблица рекордов Донино
              </a>
            </div>
          )}
        </div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center h-16">
          <div className="flex items-center space-x-2">
            <Link
              to="/procoursing"
              className={`group relative px-6 py-2 text-sm font-semibold transition-all duration-300 ${
                isActive('/') ? 'text-camel-700' : 'text-charcoal-700 hover:text-charcoal-900'
              }`}
            >
              <span className="relative z-10">Procoursing</span>
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-camel-600 transition-transform duration-300 ${
                isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </Link>
            <Link
              to="/speed-records"
              className={`group relative px-6 py-2 text-sm font-semibold transition-all duration-300 ${
                isActive('/speed-records') ? 'text-camel-700' : 'text-charcoal-700 hover:text-charcoal-900'
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
    </nav>
  );
}

function App() {
  return (
    <Router>
      <DogSilhouettes />
      <div className="min-h-screen bg-gradient-to-br from-old-money-50 via-old-money-100 to-old-money-200">
        <Nav />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Routes>
            <Route path="/" element={<Procoursing />} />
            <Route path="/procoursing" element={<Procoursing />} />
            <Route path="/dog/:id" element={<DogProfile />} />
            <Route path="/event/:id" element={<EventResults />} />
            <Route path="/speed-records" element={<SpeedRecords />} />
            <Route path="/judges" element={<Judges />} />
            <Route path="/judges/:judgeId" element={<JudgeDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
