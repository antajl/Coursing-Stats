import { useState, useMemo } from 'react';
import { Key, AlertTriangle } from 'lucide-react';
import type { TrackerApplication, ApplicationFilter } from './trackerTypes';
import { TrackerApplicationRow } from './TrackerApplicationRow';
import {
  TrackerApplicationsToolbar,
  type StatusFilterItem,
  type CountedFilterItem,
} from './TrackerApplicationsToolbar';
import { getStoredToken } from './trackerData';

interface TrackerApplicationsProps {
  applications: TrackerApplication[];
  onToggleReceived: (barcode: string) => void;
  receivedSet: Set<string>;
  syncError?: string | null;
  authExpired?: boolean;
  isLive?: boolean;
  isRefreshing?: boolean;
  onOpenAuth?: () => void;
}

export function TrackerApplications({
  applications,
  onToggleReceived,
  receivedSet,
  syncError,
  authExpired,
  isLive = false,
  isRefreshing = false,
  onOpenAuth,
}: TrackerApplicationsProps) {
  const [filter, setFilter] = useState<ApplicationFilter>('all');
  const [selectedDog, setSelectedDog] = useState<string>('all');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [expandedBarcode, setExpandedBarcode] = useState<string | null>(null);

  const totalCount = applications.length;
  const activeCount = useMemo(
    () => applications.filter((a) => a.statusGroup === 'active').length,
    [applications]
  );
  const readyCount = useMemo(
    () => applications.filter((a) => a.statusGroup === 'ready' && !receivedSet.has(a.barcode)).length,
    [applications, receivedSet]
  );
  const collectedCount = useMemo(
    () => applications.filter((a) => a.statusGroup === 'ready' && receivedSet.has(a.barcode)).length,
    [applications, receivedSet]
  );
  const rejectedCount = useMemo(
    () => applications.filter((a) => a.statusGroup === 'rejected').length,
    [applications]
  );

  const statusItems = useMemo<StatusFilterItem[]>(() => {
    const items: StatusFilterItem[] = [
      { key: 'all', label: 'Все статусы', count: totalCount, dotClass: 'bg-camel-500' },
      { key: 'active', label: 'В обработке', count: activeCount, dotClass: 'bg-amber-500' },
      { key: 'to_pickup', label: 'Готовы к выдаче', count: readyCount, dotClass: 'bg-emerald-500' },
      { key: 'collected', label: 'Забрано', count: collectedCount, dotClass: 'bg-charcoal-400' },
    ];
    if (rejectedCount > 0) {
      items.push({ key: 'rejected', label: 'Отклонено', count: rejectedCount, dotClass: 'bg-rose-500' });
    }
    return items;
  }, [totalCount, activeCount, readyCount, collectedCount, rejectedCount]);

  const dogItems = useMemo<CountedFilterItem[]>(() => {
    const counts = new Map<string, number>();
    for (const app of applications) {
      const name = app.dogName?.trim();
      if (!name) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [applications]);

  const docTypeItems = useMemo<CountedFilterItem[]>(() => {
    const counts = new Map<string, number>();
    for (const app of applications) {
      const docName = app.documentName?.trim();
      if (!docName) continue;
      counts.set(docName, (counts.get(docName) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [applications]);

  const filteredApps = useMemo(() => {
    const q = query.toLowerCase().trim();
    return applications.filter((app) => {
      const isCollected = receivedSet.has(app.barcode);
      let matchFilter = true;
      if (filter === 'active') matchFilter = app.statusGroup === 'active';
      else if (filter === 'to_pickup') matchFilter = app.statusGroup === 'ready' && !isCollected;
      else if (filter === 'collected') matchFilter = app.statusGroup === 'ready' && isCollected;
      else if (filter === 'rejected') matchFilter = app.statusGroup === 'rejected';

      if (!matchFilter) return false;
      if (selectedDog !== 'all' && app.dogName?.trim() !== selectedDog) return false;
      if (selectedDocType !== 'all' && app.documentName?.trim() !== selectedDocType) return false;
      if (!q) return true;

      return (
        app.dogName.toLowerCase().includes(q) ||
        app.documentName.toLowerCase().includes(q) ||
        app.barcode.includes(q) ||
        (app.pedigreeNumber && app.pedigreeNumber.includes(q))
      );
    });
  }, [applications, filter, selectedDog, selectedDocType, query, receivedSet]);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      const currentYear = new Date().getFullYear();
      if (d.getFullYear() !== currentYear) {
        return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
      }
      return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  const hasToken = Boolean(getStoredToken());
  const hasActiveFilters =
    Boolean(query) || filter !== 'all' || selectedDog !== 'all' || selectedDocType !== 'all';

  return (
    <div className="space-y-3">
      {/* 1. Unified Single-Row Toolbar: Search + Dropdown Filters + RKF Online Status + Account */}
      {(hasToken || isLive) && (
        <TrackerApplicationsToolbar
          query={query}
          onQueryChange={setQuery}
          filter={filter}
          onFilterChange={setFilter}
          statusItems={statusItems}
          selectedDog={selectedDog}
          onDogChange={setSelectedDog}
          dogItems={dogItems}
          selectedDocType={selectedDocType}
          onDocTypeChange={setSelectedDocType}
          docTypeItems={docTypeItems}
          showSyncControls={hasToken || isLive}
          isRefreshing={isRefreshing}
          onOpenAuth={onOpenAuth}
        />
      )}

      {/* Sync / Auth Expired Alert Banner */}
      {syncError && getStoredToken() && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-rose-50/90 border border-rose-200/80 text-rose-900 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{syncError}</span>
          </div>
          {authExpired && (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('tracker-open-auth'))}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-medium text-xs transition-colors cursor-pointer shrink-0"
            >
              Войти заново
            </button>
          )}
        </div>
      )}

      {/* 2. Single Clean Onboarding Card when logged out */}
      {!hasToken && (
        <div className="rounded-2xl border border-old-money-200/90 bg-white p-6 sm:p-8 text-center space-y-4 shadow-2xs">
          <div className="w-11 h-11 rounded-2xl bg-sand-100 border border-old-money-200/80 text-camel-800 flex items-center justify-center mx-auto">
            <Key className="w-5 h-5" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-sm sm:text-base font-bold text-charcoal-900">
              Подключите личный кабинет РКФ Онлайн
            </h2>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Отслеживайте изготовление чемпионских титулов, рабочих сертификатов и родословных. Через расширение браузера вход выполняется в 1 клик без ввода пароля.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('tracker-open-auth'))}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-camel-700 hover:bg-camel-800 text-white font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
            >
              <Key className="w-4 h-4" />
              <span>Подключить аккаунт</span>
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('tracker-open-download'))}
              className="min-h-[44px] px-4 py-2.5 rounded-xl cs-glass-pill text-charcoal-800 font-semibold text-xs transition-colors cursor-pointer"
            >
              Установить расширение
            </button>
          </div>
        </div>
      )}

      {/* 3. Monolithic Table Card (shown when authenticated) */}
      {hasToken && (
      <div className="cs-glass-card bg-white rounded-2xl overflow-hidden">
        {/* Table Header Bar */}
        <div className="relative flex min-h-9 items-center justify-between border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3 sm:px-4 py-1.5">
          <span className="text-[11.5px] font-bold uppercase tracking-wider text-charcoal-700">
            Реестр заявок РКФ Онлайн
          </span>
          <span className="text-[11px] font-mono text-charcoal-500">
            Показано: {filteredApps.length}
          </span>
        </div>

        {filteredApps.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-500 space-y-2">
            <div>
              {hasActiveFilters
                ? 'Заявок по выбранным параметрам не найдено'
                : 'В личном кабинете активных заявок не найдено'}
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setFilter('all');
                  setSelectedDog('all');
                  setSelectedDocType('all');
                }}
                className="inline-flex items-center px-3 py-1 rounded-full cs-glass-pill text-xs font-medium text-charcoal-700 cursor-pointer"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-sand-200/60">
            {filteredApps.map((app) => (
              <TrackerApplicationRow
                key={app.barcode}
                app={app}
                isCollected={receivedSet.has(app.barcode)}
                isOpen={expandedBarcode === app.barcode}
                onToggleReceived={onToggleReceived}
                onToggleAccordion={() =>
                  setExpandedBarcode(expandedBarcode === app.barcode ? null : app.barcode)
                }
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
