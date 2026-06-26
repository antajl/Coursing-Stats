import { useState } from 'react';
import Events from './Events';
import TopDogs from './TopDogs';

function Procoursing() {
  const [activeTab, setActiveTab] = useState('calendar');

  return (
    <div className="space-y-6">
      <div className="bg-cream-50/90 backdrop-blur-lg rounded-2xl shadow-xl border border-cream-300 p-8">
        <h1 className="text-4xl font-extrabold text-charcoal-700 mb-6">
          <a 
            href="http://procoursing.ru" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-camel-700 hover:underline transition-colors"
          >
            Статистика соревнований procoursing
          </a>
        </h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'calendar'
                ? 'bg-camel-600 text-white shadow-lg'
                : 'bg-white text-charcoal-700 border-2 border-cream-300 hover:border-camel-500'
            }`}
          >
            Календарь событий
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'ranking'
                ? 'bg-camel-600 text-white shadow-lg'
                : 'bg-white text-charcoal-700 border-2 border-cream-300 hover:border-camel-500'
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
