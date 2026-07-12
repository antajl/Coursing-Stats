import { useSearchParams } from 'react-router-dom';
import RKFAttribution from '../components/RKFAttribution';
import ShowRanking from './Shows/ShowRanking';
import ShowJudges from './Shows/ShowJudges';
import ShowCalendar from './Shows/ShowCalendar';
import ShowChampions from './Shows/ShowChampions';

const VALID_TABS = new Set(['ranking', 'calendar', 'champions', 'judges']);

function Shows() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'ranking';
  const activeTab = VALID_TABS.has(tab) ? tab : 'ranking';

  return (
    <div className="space-y-6">
      <div className="bg-cream-50/90 dark:bg-charcoal-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-cream-300 dark:border-charcoal-700 px-4 py-3 md:px-6 md:py-4">
        <RKFAttribution className="mb-3 border-b border-cream-300/80 pb-2.5 dark:border-charcoal-700" />
        <div className="min-h-[480px]">
          {activeTab === 'ranking' && (
            <div
              id="tab-panel-ranking"
              role="tabpanel"
              aria-labelledby="tab-ranking"
            >
              <ShowRanking />
            </div>
          )}
          {activeTab === 'calendar' && (
            <div
              id="tab-panel-calendar"
              role="tabpanel"
              aria-labelledby="tab-calendar"
            >
              <ShowCalendar />
            </div>
          )}
          {activeTab === 'champions' && (
            <div
              id="tab-panel-champions"
              role="tabpanel"
              aria-labelledby="tab-champions"
            >
              <ShowChampions />
            </div>
          )}
          {activeTab === 'judges' && (
            <div
              id="tab-panel-judges"
              role="tabpanel"
              aria-labelledby="tab-judges"
            >
              <ShowJudges />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Shows;
