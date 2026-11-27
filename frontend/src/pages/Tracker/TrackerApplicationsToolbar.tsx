import { useState, useEffect } from 'react';
import { ChevronDown, Check, Dog, User } from 'lucide-react';
import type { ApplicationFilter } from './trackerTypes';
import ModernDropdown from '../../components/ui/ModernDropdown';
import ToolbarSearch from '../../components/toolbar/ToolbarSearch';
import { toolbarPillTriggerClass } from '../../lib/toolbar';
import { toDogTitleCase } from '../../lib/dogName';

export interface StatusFilterItem {
  key: ApplicationFilter;
  label: string;
  count: number;
  dotClass: string;
}

export interface CountedFilterItem {
  name: string;
  count: number;
}

interface TrackerApplicationsToolbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  filter: ApplicationFilter;
  onFilterChange: (f: ApplicationFilter) => void;
  statusItems: StatusFilterItem[];
  selectedDog: string;
  onDogChange: (dog: string) => void;
  dogItems: CountedFilterItem[];
  showSyncControls: boolean;
  isRefreshing: boolean;
  onOpenAuth?: () => void;
}

function readLastSyncTime(): string | null {
  if (typeof window === 'undefined') return null;
  const raw =
    localStorage.getItem('cs_rkf_last_sync_timestamp') ||
    localStorage.getItem('cs_rkf_last_sync');
  if (!raw) return null;
  const ts = Number(raw);
  if (!Number.isFinite(ts) || ts <= 0) return null;
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function TrackerApplicationsToolbar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  statusItems,
  selectedDog,
  onDogChange,
  dogItems,
  showSyncControls,
  isRefreshing,
  onOpenAuth,
}: TrackerApplicationsToolbarProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [dogOpen, setDogOpen] = useState(false);
  const [lastSyncStr, setLastSyncStr] = useState<string | null>(readLastSyncTime);

  useEffect(() => {
    if (!isRefreshing) {
      setLastSyncStr(readLastSyncTime());
    }
  }, [isRefreshing]);

  const activeStatus = statusItems.find((s) => s.key === filter) || statusItems[0];
  const activeDogLabel = selectedDog === 'all' ? 'Собаки' : toDogTitleCase(selectedDog);

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full min-w-0 py-1">
      <div className="w-full sm:w-auto">
        <ToolbarSearch
          value={query}
          onChange={onQueryChange}
          placeholder="Кличка, титул, штрихкод..."
          width="220px"
          className="!w-full sm:!w-[220px]"
        />
      </div>

      {/* Статусы заявок */}
      <ModernDropdown
        isOpen={statusOpen}
        onOpenChange={setStatusOpen}
        width="210px"
        trigger={
          <button
            type="button"
            className={toolbarPillTriggerClass(filter !== 'all', '!h-8 !px-3')}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${activeStatus?.dotClass || 'bg-camel-500'}`} />
            <span className="truncate max-w-[130px]">
              {filter === 'all' ? 'Статусы' : activeStatus?.label}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
          </button>
        }
      >
        {(close) => (
          <div className="p-1 space-y-0.5" role="menu">
            {statusItems.map((item) => {
              const isSelected = filter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onFilterChange(item.key);
                    close();
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-xs rounded-md text-left transition-colors ${
                    isSelected
                      ? 'bg-camel-100 text-camel-950 font-semibold'
                      : 'text-charcoal-700 hover:bg-cream-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.dotClass}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-mono text-charcoal-500">{item.count}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-camel-700" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ModernDropdown>

      {/* Выбор собаки из аккаунта */}
      {dogItems.length > 0 && (
        <ModernDropdown
          isOpen={dogOpen}
          onOpenChange={setDogOpen}
          width="280px"
          trigger={
            <button
              type="button"
              className={toolbarPillTriggerClass(selectedDog !== 'all', '!h-8 !px-3')}
              title={selectedDog === 'all' ? 'Фильтр по собаке' : activeDogLabel}
            >
              <Dog className="h-3.5 w-3.5 shrink-0 text-camel-700 opacity-80" />
              <span className="truncate max-w-[140px] sm:max-w-[180px]">{activeDogLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
            </button>
          }
        >
          {(close) => (
            <div className="p-1 space-y-0.5 max-h-72 overflow-y-auto" role="menu">
              <button
                type="button"
                onClick={() => {
                  onDogChange('all');
                  close();
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-xs rounded-md text-left transition-colors ${
                  selectedDog === 'all'
                    ? 'bg-camel-100 text-camel-950 font-semibold'
                    : 'text-charcoal-700 hover:bg-cream-200/60'
                }`}
              >
                <span>Все собаки ({dogItems.length})</span>
                {selectedDog === 'all' && <Check className="h-3.5 w-3.5 text-camel-700 shrink-0" />}
              </button>
              {dogItems.map((item) => {
                const isSelected = selectedDog === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      onDogChange(item.name);
                      close();
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-xs rounded-md text-left transition-colors ${
                      isSelected
                        ? 'bg-camel-100 text-camel-950 font-semibold'
                        : 'text-charcoal-700 hover:bg-cream-200/60'
                    }`}
                  >
                    <span className="truncate">{toDogTitleCase(item.name)}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-mono text-charcoal-500">{item.count}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-camel-700" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ModernDropdown>
      )}

      {/* Статус РКФ Онлайн и кнопка Аккаунт в одной строке справа */}
      {showSyncControls && onOpenAuth && (
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <div
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-cream-100/90 border border-old-money-200/80 text-xs text-charcoal-700"
            title={isRefreshing ? 'Идёт синхронизация с РКФ Онлайн' : 'Подключение к РКФ Онлайн активно'}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                isRefreshing
                  ? 'bg-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-emerald-500 ring-2 ring-emerald-500/20'
              }`}
            />
            <span className="hidden xs:inline font-medium whitespace-nowrap">
              {isRefreshing ? 'Синхронизация...' : 'РКФ Онлайн'}
            </span>
            {!isRefreshing && lastSyncStr && (
              <span className="text-[11px] font-mono text-charcoal-500 tabular-nums">
                {lastSyncStr}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenAuth}
            className="h-8 px-3 rounded-full cs-glass-pill text-xs font-medium text-charcoal-800 inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <User className="w-3.5 h-3.5 text-camel-700" />
            <span>Аккаунт</span>
          </button>
        </div>
      )}
    </div>
  );
}
