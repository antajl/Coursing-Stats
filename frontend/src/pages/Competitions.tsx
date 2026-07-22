import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEO } from '../components/SEO';
import ProcoursingAttribution from '../components/ProcoursingAttribution';
import ToolbarSegmentControl from '../components/toolbar/ToolbarSegmentControl';
import TopDogs from './TopDogs';
import Judges from './Judges';

const COMPETITIONS_SEGMENTS = [
  { id: 'ranking', label: 'Рейтинг' },
  { id: 'judges', label: 'Судьи' },
] as const;

type TabId = (typeof COMPETITIONS_SEGMENTS)[number]['id'];

const VALID_TABS = new Set<string>(COMPETITIONS_SEGMENTS.map((s) => s.id));

function Competitions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'ranking';
  const activeTab = (VALID_TABS.has(tab) ? tab : 'ranking') as TabId;

  const handleTabChange = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams);
      params.set('tab', next);
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  return (
    <div className="space-y-6">
      <SEO
        title="Соревнования и рейтинги"
        description="Рейтинги собак по курсингу и бегам борзых, статистика судей, результаты соревнований. Топ собак по местам и очкам, медальный зачёт, экспертная оценка судей."
        canonicalUrl="https://coursing-stats.ru/competitions"
      />
      <div className="bg-cream-50/90 dark:bg-charcoal-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-cream-300 dark:border-charcoal-700 px-4 py-3 md:px-6 md:py-4">
        <ProcoursingAttribution className="mb-3 border-b border-cream-300/80 pb-2.5 dark:border-charcoal-700" />
        <div className="mb-4 overflow-x-auto scrollbar-hide">
          <ToolbarSegmentControl
            segments={[...COMPETITIONS_SEGMENTS]}
            value={activeTab}
            onChange={handleTabChange}
            ariaLabel="Разделы соревнований"
          />
        </div>
        <div className="min-h-[480px]">
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
