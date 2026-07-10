import { useSearchParams } from 'react-router-dom';
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
      <div className="bg-cream-50/90 dark:bg-charcoal-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-cream-300 dark:border-charcoal-700 p-4 md:p-8">
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

        <ProcoursingAttribution className="mt-6 pt-4 border-t border-cream-300 dark:border-charcoal-700" />
      </div>
    </div>
  );
}

export default Competitions;
