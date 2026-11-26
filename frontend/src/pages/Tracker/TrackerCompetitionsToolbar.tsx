import { useState } from 'react';
import { Bell, ChevronDown, Check, ArrowUpDown } from 'lucide-react';
import type { DisciplineKey, CompetitionStatusFilter } from './trackerTypes';
import ModernDropdown from '../../components/ui/ModernDropdown';
import ToolbarSearch from '../../components/toolbar/ToolbarSearch';
import { toolbarPillTriggerClass } from '../../lib/toolbar';
import { SORT_OPTIONS, type SortOption } from './trackerCompetitionUtils';

interface TrackerCompetitionsToolbarProps {
  season: '2026' | '2027';
  onSeasonChange: (s: '2026' | '2027') => void;
  query: string;
  onQueryChange: (q: string) => void;
  discipline: DisciplineKey;
  onDisciplineChange: (d: DisciplineKey) => void;
  disciplineItems: { key: DisciplineKey; label: string }[];
  statusFilter: CompetitionStatusFilter;
  onStatusChange: (s: CompetitionStatusFilter) => void;
  statusItems: { key: CompetitionStatusFilter; label: string; color: string }[];
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  onlySubscribed: boolean;
  onToggleOnlySubscribed: () => void;
  subscribedCount: number;
}

export function TrackerCompetitionsToolbar({
  season,
  onSeasonChange,
  query,
  onQueryChange,
  discipline,
  onDisciplineChange,
  disciplineItems,
  statusFilter,
  onStatusChange,
  statusItems,
  sortBy,
  onSortChange,
  onlySubscribed,
  onToggleOnlySubscribed,
  subscribedCount,
}: TrackerCompetitionsToolbarProps) {
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [disciplineOpen, setDisciplineOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const activeSortLabel = SORT_OPTIONS.find((s) => s.id === sortBy)?.label || 'Сортировка';
  const activeStatusLabel = statusItems.find((s) => s.key === statusFilter)?.label || 'Статус';
  const activeDisciplineLabel = disciplineItems.find((d) => d.key === discipline)?.label || discipline;

  return (
    <div className="flex items-center gap-1.5 w-full min-w-0 overflow-x-auto no-scrollbar py-1.5">
      {/* 1. Compact Search Pill */}
      <ToolbarSearch
        value={query}
        onChange={onQueryChange}
        placeholder="Поиск по клубу, городу, рангу..."
        width="280px"
      />

      {/* 1.5 Season Dropdown */}
      <ModernDropdown
        isOpen={seasonOpen}
        onOpenChange={setSeasonOpen}
        width="110px"
        trigger={
          <button
            type="button"
            className={toolbarPillTriggerClass(season !== '2026', '!h-8 !px-3')}
          >
            <span>{season}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
          </button>
        }
      >
        {(close) => (
          <div className="p-1 space-y-0.5" role="menu">
            {(['2026', '2027'] as const).map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => {
                  onSeasonChange(yr);
                  close();
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md text-left transition-colors ${
                  season === yr
                    ? 'bg-camel-100 text-camel-950 font-semibold'
                    : 'text-charcoal-700 hover:bg-cream-200/60'
                }`}
              >
                <span>{yr}</span>
                {season === yr && <Check className="h-3.5 w-3.5 text-camel-700 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </ModernDropdown>

      {/* 2. Discipline Dropdown */}
      <ModernDropdown
        isOpen={disciplineOpen}
        onOpenChange={setDisciplineOpen}
        width="210px"
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
        {(close) => (
          <div className="p-1 space-y-0.5" role="menu">
            {disciplineItems.map((item) => {
              const isSelected = discipline === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onDisciplineChange(item.key);
                    close();
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
        )}
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
        {(close) => (
          <div className="p-1 space-y-0.5" role="menu">
            {statusItems.map((item) => {
              const isSelected = statusFilter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onStatusChange(item.key);
                    close();
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
        )}
      </ModernDropdown>

      {/* 4. Sort Dropdown */}
      <ModernDropdown
        isOpen={sortOpen}
        onOpenChange={setSortOpen}
        width="240px"
        trigger={
          <button
            type="button"
            className={toolbarPillTriggerClass(sortBy !== 'date_desc', '!h-8 !px-3')}
          >
            <ArrowUpDown className="h-3 w-3 shrink-0 opacity-70" />
            <span className="truncate max-w-[145px] sm:max-w-[160px]">{activeSortLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
          </button>
        }
      >
        {(close) => (
          <div className="p-1 space-y-0.5" role="menu">
            {SORT_OPTIONS.map((item) => {
              const isSelected = sortBy === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSortChange(item.id);
                    close();
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
        )}
      </ModernDropdown>

      {/* 5. Subscriptions Pill Button */}
      <button
        type="button"
        onClick={onToggleOnlySubscribed}
        className={`ml-auto shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          onlySubscribed ? 'cs-glass-pill-active' : 'cs-glass-pill'
        }`}
        title="Показать только отслеживаемые состязания"
      >
        <Bell className={`w-3.5 h-3.5 ${onlySubscribed ? 'fill-current' : ''}`} />
        <span>Мои подписки ({subscribedCount})</span>
      </button>
    </div>
  );
}
