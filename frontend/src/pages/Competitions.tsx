import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ToolbarSegmentControl from '../components/toolbar/ToolbarSegmentControl';
import Events from './Events';
import TopDogs from './TopDogs';
import Judges from './Judges';

const COMPETITION_SEGMENTS = [
  { id: 'calendar', label: 'Календарь' },
  { id: 'ranking', label: 'Рейтинг' },
  { id: 'judges', label: 'Судьи' },
];

function Competitions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'calendar');

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  return (
    <div className="space-y-6">
      <div className="bg-cream-50/90 dark:bg-charcoal-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-cream-300 dark:border-charcoal-700 p-4 md:p-8">
        <div className="mb-4 overflow-x-auto scrollbar-hide">
          <ToolbarSegmentControl
            segments={COMPETITION_SEGMENTS}
            value={activeTab}
            onChange={handleTabChange}
            ariaLabel="Разделы соревнований"
          />
        </div>

        <div className="min-h-[480px]">
          {activeTab === 'calendar' && (
            <div
              id="tab-panel-calendar"
              role="tabpanel"
              aria-labelledby="tab-calendar"
            >
              <Events />
            </div>
          )}
          {activeTab === 'ranking' && (
            <div
              id="tab-panel-ranking"
              role="tabpanel"
              aria-labelledby="tab-ranking"
            >
              <TopDogs />
            </div>
          )}
          {activeTab === 'judges' && (
            <div
              id="tab-panel-judges"
              role="tabpanel"
              aria-labelledby="tab-judges"
            >
              <Judges />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Competitions;
