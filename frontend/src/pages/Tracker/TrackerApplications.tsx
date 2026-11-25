import { useState, useMemo } from 'react';
import { Key, AlertTriangle } from 'lucide-react';
import type { TrackerApplication, ApplicationFilter } from './trackerTypes';
import { TrackerApplicationRow } from './TrackerApplicationRow';
import ToolbarSearch from '../../components/toolbar/ToolbarSearch';
import { TrackerSyncBar } from './TrackerSyncBar';
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
      if (!q) return true;

      return (
        app.dogName.toLowerCase().includes(q) ||
        app.documentName.toLowerCase().includes(q) ||
        app.barcode.includes(q) ||
        (app.pedigreeNumber && app.pedigreeNumber.includes(q))
      );
    });
  }, [applications, filter, query, receivedSet]);

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

  return (
    <div className="space-y-3">
      {/* 0a. Compact Account & Sync Status Bar (when connected) */}
      {(hasToken || isLive) && onOpenAuth && (
        <TrackerSyncBar
          isRefreshing={isRefreshing}
          onOpenAuth={onOpenAuth}
        />
      )}

      {/* 0. Compact Old Money KPI Summary Strip (when connected) */}
      {hasToken && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`text-left px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white border-camel-400 shadow-xs'
                : 'bg-cream-50/80 border-old-money-200/80 hover:border-camel-300'
            }`}
          >
            <div className="text-[11px] font-medium text-charcoal-500">Всего заявок</div>
            <div className="text-lg font-bold text-charcoal-900 tabular-nums mt-0.5">{totalCount}</div>
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`text-left px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
              filter === 'active'
                ? 'bg-white border-amber-400 shadow-xs'
                : 'bg-cream-50/80 border-old-money-200/80 hover:border-amber-300'
            }`}
          >
            <div className="text-[11px] font-medium text-amber-800">В обработке</div>
            <div className="text-lg font-bold text-amber-900 tabular-nums mt-0.5">{activeCount}</div>
          </button>
          <button
            type="button"
            onClick={() => setFilter('to_pickup')}
            className={`text-left px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
              filter === 'to_pickup'
                ? 'bg-white border-emerald-400 shadow-xs'
                : 'bg-cream-50/80 border-old-money-200/80 hover:border-emerald-300'
            }`}
          >
            <div className="text-[11px] font-medium text-emerald-800">Готовы к выдаче</div>
            <div className="text-lg font-bold text-emerald-900 tabular-nums mt-0.5">{readyCount}</div>
          </button>
          <button
            type="button"
            onClick={() => setFilter('collected')}
            className={`text-left px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
              filter === 'collected'
                ? 'bg-white border-camel-400 shadow-xs'
                : 'bg-cream-50/80 border-old-money-200/80 hover:border-camel-300'
            }`}
          >
            <div className="text-[11px] font-medium text-charcoal-500">Забрано</div>
            <div className="text-lg font-bold text-charcoal-700 tabular-nums mt-0.5">{collectedCount}</div>
          </button>
        </div>
      )}
      {/* 1. Unified Single-Row Toolbar (Matching ShowCalendarToolbar & EventsToolbar) */}
      <div className="flex items-center gap-1.5 w-full min-w-0 overflow-x-auto no-scrollbar py-0.5">
        <ToolbarSearch
          value={query}
          onChange={setQuery}
          placeholder="Поиск по кличке собаки, титулу или номеру заявки..."
          width="280px"
        />

        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
            filter === 'all' ? 'cs-glass-pill-active' : 'cs-glass-pill'
          }`}
        >
          Все ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('active')}
          className={`h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
            filter === 'active' ? 'cs-glass-pill-active' : 'cs-glass-pill'
          }`}
        >
          В обработке ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('to_pickup')}
          className={`h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
            filter === 'to_pickup' ? 'cs-glass-pill-active' : 'cs-glass-pill'
          }`}
        >
          Готовы к выдаче ({readyCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('collected')}
          className={`h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
            filter === 'collected' ? 'cs-glass-pill-active' : 'cs-glass-pill'
          }`}
        >
          Забрано ({collectedCount})
        </button>
        {rejectedCount > 0 && (
          <button
            type="button"
            onClick={() => setFilter('rejected')}
            className={`h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              filter === 'rejected' ? 'cs-glass-pill-active' : 'cs-glass-pill'
            }`}
          >
            Отклонено ({rejectedCount})
          </button>
        )}
      </div>

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
              {query || filter !== 'all' ? 'Заявок по выбранным параметрам не найдено' : 'В личном кабинете активных заявок не найдено'}
            </div>
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
