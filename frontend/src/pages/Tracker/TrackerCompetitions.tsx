import { useState, useMemo, useEffect } from 'react';
import type { TrackerCompetition, DisciplineKey, CompetitionStatusFilter } from './trackerTypes';
import { TrackerCompetitionRow } from './TrackerCompetitionRow';
import { TrackerCompetitionsToolbar } from './TrackerCompetitionsToolbar';
import {
  parseDateScore,
  formatShortDate,
  type SortOption,
} from './trackerCompetitionUtils';

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
  const [season, setSeason] = useState<'2026' | '2027'>('2026');
  const [events2027, setEvents2027] = useState<TrackerCompetition[] | null>(null);
  const [discipline, setDiscipline] = useState<DisciplineKey>('Курсинг борзых');
  const [statusFilter, setStatusFilter] = useState<CompetitionStatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [onlySubscribed, setOnlySubscribed] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (season !== '2027' || events2027 !== null) return;
    let cancelled = false;
    fetch('/data/v1/calendar/2027.json')
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data?.events) ? data.events : [];
        const mapped: TrackerCompetition[] = list.map((ev: any) => {
          const dStart = String(ev.date_start || '');
          const dEnd = String(ev.date_end || dStart);
          const s = dStart.split('-');
          const e = dEnd.split('-');
          const dateRaw =
            s.length === 3
              ? e.length === 3 && dEnd !== dStart && s[1] === e[1]
                ? `${s[2]}-${e[2]}.${s[1]}.${s[0]}`
                : `${s[2]}.${s[1]}.${s[0]}`
              : '';
          const notesStr = String(ev.notes || '').toLowerCase();
          const status: TrackerCompetition['status'] = notesStr.includes('задержан')
            ? 'DELAYED'
            : ev.confirmed === 1
            ? 'APPROVED'
            : 'PENDING';
          return {
            id: String(ev.id),
            sheetName: ev.competition_type || '',
            dateRaw,
            discipline: ev.competition_type || (ev.event_type === 'coursing' ? 'Курсинг борзых' : 'Бега борзых'),
            rank: ev.competition_kind || '',
            location: ev.location || ev.region || '',
            club: ev.host_club || ev.title || '',
            status,
            reglament: ev.rules_file || '',
            summary: '',
            judges: ev.judges || '',
            notes: ev.notes || '',
            eventId: typeof ev.id === 'number' ? ev.id : undefined,
          };
        });
        setEvents2027(mapped);
      })
      .catch(() => {
        if (!cancelled) setEvents2027([]);
      });
    return () => {
      cancelled = true;
    };
  }, [season, events2027]);

  const activeList = season === '2027' ? (events2027 || []) : competitions;

  const coursingCount = useMemo(
    () => activeList.filter((c) => c.discipline === 'Курсинг борзых').length,
    [activeList]
  );
  const racingCount = useMemo(
    () => activeList.filter((c) => c.discipline === 'Бега борзых').length,
    [activeList]
  );
  const bzmpCount = useMemo(
    () => activeList.filter((c) => c.discipline.includes('механической')).length,
    [activeList]
  );

  const disciplineItems: { key: DisciplineKey; label: string }[] = [
    { key: 'Курсинг борзых', label: `Курсинг (${coursingCount})` },
    { key: 'Бега борзых', label: `Бега борзых (${racingCount})` },
    { key: 'БЗМП', label: `БЗМП (${bzmpCount})` },
  ];

  const statusItems: { key: CompetitionStatusFilter; label: string; color: string }[] = [
    { key: 'all', label: 'Все статусы', color: 'bg-charcoal-400' },
    { key: 'APPROVED', label: 'Утверждено', color: 'bg-emerald-500' },
    { key: 'DELAYED', label: 'Задержано', color: 'bg-rose-500' },
    { key: 'PENDING', label: 'На согласовании', color: 'bg-amber-500' },
  ];

  const filteredCompetitions = useMemo(() => {
    const q = query.toLowerCase().trim();
    const result = activeList.filter((comp) => {
      // 1. Single Discipline match (strictly matches one selected discipline)
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

    // 5. Explicit Sorting
    const statusWeight = (st: TrackerCompetition['status'], mode: 'delayed_first' | 'approved_first') => {
      if (mode === 'delayed_first') {
        return st === 'DELAYED' ? 0 : st === 'PENDING' ? 1 : 2;
      }
      return st === 'APPROVED' ? 0 : st === 'PENDING' ? 1 : 2;
    };

    result.sort((a, b) => {
      if (sortBy === 'date_asc') {
        return parseDateScore(a.dateRaw) - parseDateScore(b.dateRaw);
      }
      if (sortBy === 'date_desc') {
        return parseDateScore(b.dateRaw) - parseDateScore(a.dateRaw);
      }
      if (sortBy === 'status_delayed') {
        const diff = statusWeight(a.status, 'delayed_first') - statusWeight(b.status, 'delayed_first');
        return diff !== 0 ? diff : parseDateScore(b.dateRaw) - parseDateScore(a.dateRaw);
      }
      if (sortBy === 'status_approved') {
        const diff = statusWeight(a.status, 'approved_first') - statusWeight(b.status, 'approved_first');
        return diff !== 0 ? diff : parseDateScore(b.dateRaw) - parseDateScore(a.dateRaw);
      }
      if (sortBy === 'club_asc') {
        return a.club.localeCompare(b.club, 'ru');
      }
      return 0;
    });

    return result;
  }, [activeList, discipline, statusFilter, onlySubscribed, query, subscribedSet, sortBy]);

  return (
    <div className="space-y-3">
      <TrackerCompetitionsToolbar
        season={season}
        onSeasonChange={setSeason}
        query={query}
        onQueryChange={setQuery}
        discipline={discipline}
        onDisciplineChange={setDiscipline}
        disciplineItems={disciplineItems}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusItems={statusItems}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onlySubscribed={onlySubscribed}
        onToggleOnlySubscribed={() => setOnlySubscribed((prev) => !prev)}
        subscribedCount={subscribedSet.size}
      />

      {/* Monolithic Glass Table */}
      <div className="cs-glass-card bg-white rounded-2xl overflow-hidden shadow-2xs">
        <div className="relative flex min-h-9 items-center justify-between border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3 sm:px-4 py-1.5">
          <span className="text-[11.5px] font-bold uppercase tracking-wider text-charcoal-700">
            График согласования РКФ {season}
          </span>
        </div>

        {filteredCompetitions.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-500">
            Соревнований по выбранным параметрам не найдено
          </div>
        ) : (
          <div className="divide-y divide-sand-200/60">
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
