import { useState } from 'react';
import Events from './Events';
import TopDogs from './TopDogs';
import Judges from './Judges';

function Procoursing() {
  const [activeTab, setActiveTab] = useState('calendar');

  return (
    <div className="space-y-6">
      <div className="bg-cream-50/90 backdrop-blur-lg rounded-2xl shadow-xl border border-cream-300 p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-4 md:mb-6 bg-old-money-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'calendar'
                ? 'bg-white text-charcoal-700 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-700'
            }`}
          >
            <span className="md:hidden">Календарь</span>
            <span className="hidden md:inline">Календарь событий</span>
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'ranking'
                ? 'bg-white text-charcoal-700 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-700'
            }`}
          >
            <span className="md:hidden">Рейтинг</span>
            <span className="hidden md:inline">Рейтинг собак</span>
          </button>
          <button
            onClick={() => setActiveTab('judges')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'judges'
                ? 'bg-white text-charcoal-700 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-700'
            }`}
          >
            <span className="md:hidden">Судьи</span>
            <span className="hidden md:inline">Статистика судей</span>
          </button>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'calendar' && <Events />}
          {activeTab === 'ranking' && <TopDogs />}
          {activeTab === 'judges' && <Judges />}
        </div>
      </div>
    </div>
  );
}

export default Procoursing;
