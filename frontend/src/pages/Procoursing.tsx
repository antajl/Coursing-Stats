import { useState, useCallback, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageLoader from '../components/PageLoader';

const Events = lazy(() => import('./Events'));
const TopDogs = lazy(() => import('./TopDogs'));
const Judges = lazy(() => import('./Judges'));

function Procoursing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'calendar');

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  return (
    <div className="space-y-6">
      <div className="bg-cream-50/90 dark:bg-charcoal-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-cream-300 dark:border-charcoal-700 p-4 md:p-8">
        <div role="tablist" aria-label="Разделы" className="flex flex-col md:flex-row gap-2 md:gap-4 mb-2 bg-old-money-100 dark:bg-charcoal-800 p-1 rounded-xl">
          <button
            role="tab"
            aria-selected={activeTab === 'calendar'}
            aria-controls="tab-panel-calendar"
            id="tab-calendar"
            onClick={() => handleTabChange('calendar')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'calendar'
                ? 'bg-white dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-100 shadow-sm'
                : 'text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-200'
            }`}
          >
            <span className="md:hidden">Календарь</span>
            <span className="hidden md:inline">Календарь событий</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'ranking'}
            aria-controls="tab-panel-ranking"
            id="tab-ranking"
            onClick={() => handleTabChange('ranking')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'ranking'
                ? 'bg-white dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-100 shadow-sm'
                : 'text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-200'
            }`}
          >
            <span className="md:hidden">Рейтинг</span>
            <span className="hidden md:inline">Рейтинг собак</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'judges'}
            aria-controls="tab-panel-judges"
            id="tab-judges"
            onClick={() => handleTabChange('judges')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'judges'
                ? 'bg-white dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-100 shadow-sm'
                : 'text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-200'
            }`}
          >
            <span className="md:hidden">Судьи</span>
            <span className="hidden md:inline">Статистика судей</span>
          </button>
        </div>

        <div className="min-h-[400px]">
          <Suspense fallback={<PageLoader />}>
          <div
            id="tab-panel-calendar"
            role="tabpanel"
            aria-labelledby="tab-calendar"
            className={activeTab === 'calendar' ? '' : 'hidden'}
          >
            {activeTab === 'calendar' && <Events />}
          </div>
          <div
            id="tab-panel-ranking"
            role="tabpanel"
            aria-labelledby="tab-ranking"
            className={activeTab === 'ranking' ? '' : 'hidden'}
          >
            {activeTab === 'ranking' && <TopDogs />}
          </div>
          <div
            id="tab-panel-judges"
            role="tabpanel"
            aria-labelledby="tab-judges"
            className={activeTab === 'judges' ? '' : 'hidden'}
          >
            {activeTab === 'judges' && <Judges />}
          </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default Procoursing;
