import { useState, useMemo } from 'react';
import { Search, Bell } from 'lucide-react';
import type { TrackerCompetition, DisciplineKey, CompetitionStatusFilter } from './trackerTypes';
import { TrackerCompetitionRow } from './TrackerCompetitionRow';

interface TrackerCompetitionsProps {
  competitions: TrackerCompetition[];
  subscribedSet: Set<string>;
  onToggleSubscribed: (id: string) => void;
}

export function TrackerCompetitions({
  competitions,
  subscribedSet,
  onToggleSubscribed,
}: TrackerCompetitionsProps) {
  const [discipline, setDiscipline] = useState<DisciplineKey>('Курсинг борзых');
  const [statusFilter, setStatusFilter] = useState<CompetitionStatusFilter>('all');
  const [onlySubscribed, setOnlySubscribed] = useState(false);
  const [query, setQuery] = useState('');

  const coursingCount = useMemo(
    () => competitions.filter((c) => c.discipline === 'Курсинг борзых').length,
    [competitions]
  );
  const racingCount = useMemo(
    () => competitions.filter((c) => c.discipline === 'Бега борзых').length,
    [competitions]
  );
  const bzmpCount = useMemo(
    () => competitions.filter((c) => c.discipline.includes('механической')).length,
    [competitions]
  );

  const formatShortDate = (raw: string) => {
    if (!raw) return '—';
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    const m = raw.match(/^([0-9\-]+)\.([0-9]{2})/);
    if (m) {
      const days = m[1].replace('-', '–');
      const mIdx = parseInt(m[2], 10) - 1;
      if (mIdx >= 0 && mIdx < 12) return `${days} ${months[mIdx]}`;
    }
    return raw;
  };

  const filteredCompetitions = useMemo(() => {
    const q = query.toLowerCase().trim();
    return competitions.filter((comp) => {
      // 1. Discipline match
      if (discipline === 'БЗМП') {
        if (!comp.discipline.includes('механической') && !comp.discipline.includes('БЗМП')) {
          return false;
        }
      } else if (comp.discipline !== discipline) {
        return false;
      }

      // 2. Status match
      if (statusFilter !== 'all' && comp.status !== statusFilter) return false;

      // 3. Subscribed match
      if (onlySubscribed && !subscribedSet.has(comp.id)) return false;

      // 4. Search query match
      if (!q) return true;
      return (
        comp.club.toLowerCase().includes(q) ||
        comp.location.toLowerCase().includes(q) ||
        comp.rank.toLowerCase().includes(q) ||
        (comp.judges && comp.judges.toLowerCase().includes(q))
      );
    });
  }, [competitions, discipline, statusFilter, onlySubscribed, query, subscribedSet]);

  return (
    <div className="space-y-4">
      {/* 1. Sighthound 3 Separate Discipline Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setDiscipline('Курсинг борзых');
            setOnlySubscribed(false);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            discipline === 'Курсинг борзых' && !onlySubscribed
              ? 'cs-glass-pill-active'
              : 'cs-glass-pill'
          }`}
        >
          Курсинг борзых ({coursingCount})
        </button>

        <button
          type="button"
          onClick={() => {
            setDiscipline('Бега борзых');
            setOnlySubscribed(false);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            discipline === 'Бега борзых' && !onlySubscribed
              ? 'cs-glass-pill-active'
              : 'cs-glass-pill'
          }`}
        >
          Бега борзых ({racingCount})
        </button>

        <button
          type="button"
          onClick={() => {
            setDiscipline('БЗМП');
            setOnlySubscribed(false);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            discipline === 'БЗМП' && !onlySubscribed
              ? 'cs-glass-pill-active'
              : 'cs-glass-pill'
          }`}
        >
          БЗМП ({bzmpCount})
        </button>

        {/* Subscribed Filter Button */}
        <button
          type="button"
          onClick={() => setOnlySubscribed((prev) => !prev)}
          className={`ml-auto px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            onlySubscribed ? 'cs-glass-pill-active' : 'cs-glass-pill'
          }`}
          title="Показать только отслеживаемые турниры"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Мои подписки ({subscribedSet.size})</span>
        </button>
      </div>

      {/* 2. Status Toolbar + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-charcoal-900 text-white'
                : 'bg-sand-100 text-charcoal-600 hover:bg-sand-200/80'
            }`}
          >
            Все статусы
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 hover:bg-emerald-100'
            }`}
          >
            Утверждено
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('DELAYED')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'DELAYED'
                ? 'bg-rose-700 text-white'
                : 'bg-rose-50 text-rose-800 border border-rose-200/70 hover:bg-rose-100'
            }`}
          >
            Задержано
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'PENDING'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200/70 hover:bg-amber-100'
            }`}
          >
            На согласовании
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по клубу, городу, рангу..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-old-money-200/90 bg-white/95 text-charcoal-900 focus:border-camel-600 focus:ring-1 focus:ring-camel-600 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* 3. Monolithic Glass Table */}
      <div className="cs-glass-card bg-white/95 rounded-2xl overflow-hidden shadow-sm border border-old-money-200/80">
        {filteredCompetitions.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-500">
            Соревнований по выбранным параметрам не найдено
          </div>
        ) : (
          <div className="divide-y divide-old-money-100/70">
            {filteredCompetitions.map((comp) => (
              <TrackerCompetitionRow
                key={comp.id}
                comp={comp}
                isSubscribed={subscribedSet.has(comp.id)}
                onToggleSubscribed={onToggleSubscribed}
                formatShortDate={formatShortDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
