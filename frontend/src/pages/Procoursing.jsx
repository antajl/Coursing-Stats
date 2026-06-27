import { useState } from 'react';
import Events from './Events';
import TopDogs from './TopDogs';

function Procoursing() {
  const [activeTab, setActiveTab] = useState('calendar');

  return (
    <div className="space-y-6">
      <div className="bg-cream-50/90 backdrop-blur-lg rounded-2xl shadow-xl border border-cream-300 p-8">
        <div className="flex gap-2 mb-6 bg-old-money-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'calendar'
                ? 'bg-white text-charcoal-700 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-700'
            }`}
          >
            Календарь событий
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'ranking'
                ? 'bg-white text-charcoal-700 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-700'
            }`}
          >
            Рейтинг собак
          </button>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'calendar' && <Events />}
          {activeTab === 'ranking' && <TopDogs />}
        </div>
      </div>
    </div>
  );
}

export default Procoursing;
