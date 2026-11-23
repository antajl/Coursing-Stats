import { useState, useMemo } from 'react';
import { Bell, ChevronDown, Check, ArrowUpDown } from 'lucide-react';
import type { TrackerCompetition, DisciplineKey, CompetitionStatusFilter } from './trackerTypes';
import { TrackerCompetitionRow } from './TrackerCompetitionRow';
import ModernDropdown from '../../components/ui/ModernDropdown';
import ToolbarSearch from '../../components/toolbar/ToolbarSearch';
import { toolbarPillTriggerClass } from '../../lib/toolbar';

interface TrackerCompetitionsProps {
  competitions: TrackerCompetition[];
  subscribedSet: Set<string>;
  onToggleSubscribed: (id: string) => void;
}

type SortOption = 'date_asc' | 'date_desc' | 'status_delayed' | 'status_approved' | 'club_asc';

interface SortItem {
  id: SortOption;
  label: string;
}

const SORT_OPTIONS: SortItem[] = [
  { id: 'date_asc', label: 'По дате: сперва ранние' },
  { id: 'date_desc', label: 'По дате: сперва поздние' },
  { id: 'status_delayed', label: 'Сначала задержанные' },
  { id: 'status_approved', label: 'Сначала утвержденные' },
  { id: 'club_asc', label: 'По клубу (А—Я)' },
];

function parseDateScore(raw: string): number {
  if (!raw) return 0;
  // Match '04-05.04.2026' or '19.04.2026'
  const m = raw.match(/(?:[0-9]+-)?([0-9]{2})\.([0-9]{2})\.([0-9]{4})/);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    const year = parseInt(m[3], 10);
    return new Date(year, month, day).getTime();
  }
  return 0;
}

export function TrackerCompetitions({
  competitions,
  subscribedSet,
  onToggleSubscribed,
}: TrackerCompetitionsProps) {
  const [discipline, setDiscipline] = useState<DisciplineKey>('Курсинг борзых');
  const [statusFilter, setStatusFilter] = useState<CompetitionStatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_asc');
  const [onlySubscribed, setOnlySubscribed] = useState(false);
  const [query, setQuery] = useState('');

  const [disciplineOpen, setDisciplineOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

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

  const disciplineItems = [
    { key: 'Курсинг борзых' as const, label: `Курсинг (${coursingCount})` },
    { key: 'Бега борзых' as const, label: `Бега борзых (${racingCount})` },
    { key: 'БЗМП' as const, label: `БЗМП (${bzmpCount})` },
  ];

  const statusItems: { key: CompetitionStatusFilter; label: string; color: string }[] = [
    { key: 'all', label: 'Все статусы', color: 'bg-charcoal-400' },
    { key: 'APPROVED', label: 'Утверждено', color: 'bg-emerald-500' },
    { key: 'DELAYED', label: 'Задержано', color: 'bg-rose-500' },
    { key: 'PENDING', label: 'На согласовании', color: 'bg-amber-500' },
  ];

  const filteredCompetitions = useMemo(() => {
    const q = query.toLowerCase().trim();
    const result = competitions.filter((comp) => {
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

    // 5. Explicit Sorting
    result.sort((a, b) => {
      if (sortBy === 'date_asc') {
        return parseDateScore(a.dateRaw) - parseDateScore(b.dateRaw);
      }
      if (sortBy === 'date_desc') {
        return parseDateScore(b.dateRaw) - parseDateScore(a.dateRaw);
      }
      if (sortBy === 'status_delayed') {
        const priority: Record<string, number> = { DELAYED: 0, PENDING: 1, APPROVED: 2 };
        return (priority[a.status] ?? 3) - (priority[b.status] ?? 3);
      }
      if (sortBy === 'status_approved') {
        const priority: Record<string, number> = { APPROVED: 0, PENDING: 1, DELAYED: 2 };
        return (priority[a.status] ?? 3) - (priority[b.status] ?? 3);
      }
      if (sortBy === 'club_asc') {
        return a.club.localeCompare(b.club, 'ru');
      }
      return 0;
    });

    return result;
  }, [competitions, discipline, statusFilter, onlySubscribed, query, subscribedSet, sortBy]);

  const activeSortLabel = SORT_OPTIONS.find((s) => s.id === sortBy)?.label || 'Сортировка';
  const activeStatusLabel = statusItems.find((s) => s.key === statusFilter)?.label || 'Статус';
  const activeDisciplineLabel = disciplineItems.find((d) => d.key === discipline)?.label || discipline;

  return (
    <div className="space-y-3">
      {/* Unified Single-Row Toolbar (Matching ShowCalendarToolbar & EventsToolbar) */}
      <div className="flex items-center gap-1.5 w-full min-w-0 overflow-x-auto no-scrollbar py-0.5">
        {/* 1. Compact Search Pill [ Q ] */}
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Поиск по клубу, городу, рангу..."
          width="280px"
        />

        {/* 2. Discipline Dropdown */}
        <ModernDropdown
          isOpen={disciplineOpen}
          onOpenChange={setDisciplineOpen}
          width="200px"
          trigger={
            <button
              type="button"
              className={toolbarPillTriggerClass(true, '!h-8 !px-3')}
            >
              <span className="truncate max-w-[130px]">{activeDisciplineLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
            </button>
          }
        >
          <div className="p-1 space-y-0.5" role="menu">
            {disciplineItems.map((item) => {
              const isSelected = discipline === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setDiscipline(item.key);
                    setDisciplineOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md text-left transition-colors ${
                    isSelected
                      ? 'bg-camel-100 text-camel-950 font-semibold'
                      : 'text-charcoal-700 hover:bg-cream-200/60'
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-camel-700 shrink-0" />}
                </button>
              );
            })}
          </div>
        </ModernDropdown>

        {/* 3. Status Dropdown */}
        <ModernDropdown
          isOpen={statusOpen}
          onOpenChange={setStatusOpen}
          width="210px"
          trigger={
            <button
              type="button"
              className={toolbarPillTriggerClass(statusFilter !== 'all', '!h-8 !px-3')}
            >
              <span className="truncate max-w-[120px]">{activeStatusLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
            </button>
          }
        >
          <div className="p-1 space-y-0.5" role="menu">
            {statusItems.map((item) => {
              const isSelected = statusFilter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setStatusFilter(item.key);
                    setStatusOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md text-left transition-colors ${
                    isSelected
                      ? 'bg-camel-100 text-camel-950 font-semibold'
                      : 'text-charcoal-700 hover:bg-cream-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-camel-700 shrink-0" />}
                </button>
              );
            })}
          </div>
        </ModernDropdown>

        {/* 4. Sort Dropdown */}
        <ModernDropdown
          isOpen={sortOpen}
          onOpenChange={setSortOpen}
          width="240px"
          trigger={
            <button
              type="button"
              className={toolbarPillTriggerClass(sortBy !== 'date_asc', '!h-8 !px-3')}
            >
              <ArrowUpDown className="h-3 w-3 shrink-0 opacity-70" />
              <span className="truncate max-w-[130px]">{activeSortLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
            </button>
          }
        >
          <div className="p-1 space-y-0.5" role="menu">
            {SORT_OPTIONS.map((item) => {
              const isSelected = sortBy === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSortBy(item.id);
                    setSortOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md text-left transition-colors ${
                    isSelected
                      ? 'bg-camel-100 text-camel-950 font-semibold'
                      : 'text-charcoal-700 hover:bg-cream-200/60'
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-camel-700 shrink-0" />}
                </button>
              );
            })}
          </div>
        </ModernDropdown>

        {/* 5. Subscriptions Pill Button */}
        <button
          type="button"
          onClick={() => setOnlySubscribed((prev) => !prev)}
          className={`ml-auto shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold transition-all ${
            onlySubscribed ? 'cs-glass-pill-active' : 'cs-glass-pill'
          }`}
          title="Показать только отслеживаемые состязания"
        >
          <Bell className={`w-3.5 h-3.5 ${onlySubscribed ? 'fill-current' : ''}`} />
          <span>Мои подписки ({subscribedSet.size})</span>
        </button>
      </div>

      {/* Monolithic Glass Table */}
      <div className="cs-glass-card bg-white rounded-2xl overflow-hidden shadow-2xs">
        <div className="relative flex min-h-10 items-center justify-between gap-1.5 border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3 sm:px-4 py-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-charcoal-700">
              График сертификатных состязаний РКФ 2026
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md bg-cream-200/80 text-charcoal-700">
              {filteredCompetitions.length}
            </span>
          </div>
          <span className="text-[11px] text-charcoal-500 font-medium hidden sm:inline">
            Колокольчик справа включает отслеживание
          </span>
        </div>

        {filteredCompetitions.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-500">
            Соревнований по выбранным параметрам не найдено
          </div>
        ) : (
          <div className="divide-y divide-cream-200/60">
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
