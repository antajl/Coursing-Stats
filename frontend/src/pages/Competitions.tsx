import { useSearchParams } from 'react-router-dom';
import { SEO } from '../components/SEO';
import ProcoursingAttribution from '../components/ProcoursingAttribution';
import TopDogs from './TopDogs';
import Judges from './Judges';

const VALID_TABS = new Set(['ranking', 'judges']);

function Competitions() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'ranking';
  const activeTab = VALID_TABS.has(tab) ? tab : 'ranking';

  return (
    <div className="space-y-6">
      <SEO
        title="Соревнования и рейтинги"
        description="Рейтинги собак по курсингу и бегам борзых, статистика судей, результаты соревнований. Топ собак по местам и очкам, медальный зачёт, экспертная оценка судей."
        canonicalUrl="https://coursing-stats.ru/competitions"
      />
      <div className="bg-cream-50/90 dark:bg-charcoal-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-cream-300 dark:border-charcoal-700 px-4 py-3 md:px-6 md:py-4">
        <ProcoursingAttribution className="mb-3 border-b border-cream-300/80 pb-2.5 dark:border-charcoal-700" />
        <div className="min-h-[480px]">
          {activeTab === 'ranking' && (
            <div id="tab-panel-ranking" role="tabpanel">
              <TopDogs />
            </div>
          )}
          {activeTab === 'judges' && (
            <div id="tab-panel-judges" role="tabpanel">
              <Judges />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Competitions;
