import { Link } from 'react-router-dom';
import { RotateCw, User } from 'lucide-react';
import type { TrackerTab } from '../../pages/Tracker/trackerTypes';

interface NavTrackerProps {
  activeTab: TrackerTab;
  onSelectTab: (tab: TrackerTab) => void;
  competitionsCount: number;
  isLive: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenAuth: () => void;
}

export function NavTracker({
  activeTab,
  onSelectTab,
  competitionsCount,
  isLive,
  onRefresh,
  isRefreshing,
  onOpenAuth,
}: NavTrackerProps) {
  return (
    <div className="relative h-16 w-full items-center justify-between px-3 sm:px-4 lg:px-6 flex">
      {/* 1. Left: Authentic CoursingStats Brand Logo */}
      <Link
        to="/tracker"
        className="flex min-w-0 shrink-0 items-center transition-all duration-300 hover:opacity-90 active:scale-95"
        aria-label="CoursingStats Tracker"
        title="CoursingStats Tracker"
      >
        <img
          src="/assets/brand/logo.svg"
          width={348}
          height={62}
          alt="CoursingStats Tracker"
          className="hidden xl:block h-[50px] xl:h-[54px] w-auto"
          style={{ objectFit: 'contain' }}
        />
        <img
          src="/assets/brand/logo-badge.svg"
          width={44}
          height={44}
          alt="CoursingStats Tracker"
          className="block xl:hidden h-9 w-9 sm:h-10 sm:w-10 rounded-xl"
        />
      </Link>

      {/* 2. Center: STRICTLY Two Internal Tracker Navigation Tabs */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => onSelectTab('applications')}
          className={`relative px-3 sm:px-4 py-2 text-xs sm:text-[13.5px] font-semibold transition-colors rounded-xl ${
            activeTab === 'applications'
              ? 'text-charcoal-900 font-bold'
              : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100/60'
          }`}
        >
          <span>Заявки на титулы</span>
          {activeTab === 'applications' && (
            <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-camel-600 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('competitions')}
          className={`relative px-3 sm:px-4 py-2 text-xs sm:text-[13.5px] font-semibold transition-colors rounded-xl flex items-center gap-1.5 ${
            activeTab === 'competitions'
              ? 'text-charcoal-900 font-bold'
              : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-100/60'
          }`}
        >
          <span>Соревнования РКФ</span>
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-sand-200/80 text-charcoal-700">
            {competitionsCount}
          </span>
          {activeTab === 'competitions' && (
            <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-camel-600 rounded-full" />
          )}
        </button>
      </nav>

      {/* 3. Right: Sync status, Refresh button, Account button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sand-100/70 text-[11.5px] text-charcoal-600 border border-old-money-200/50">
          <span
            className={`w-2 h-2 rounded-full ${
              isLive
                ? 'bg-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-amber-400'
            }`}
          />
          <span className="font-medium">{isLive ? 'РКФ Онлайн' : 'Демо-режим'}</span>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="cs-glass-pill p-2 rounded-xl text-charcoal-700 hover:text-charcoal-900 disabled:opacity-50 transition-all flex items-center justify-center"
          title="Синхронизировать данные с РКФ"
          aria-label="Синхронизировать"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-camel-700' : ''}`} />
        </button>

        {/* Account Button */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="cs-glass-pill px-3 py-1.5 rounded-xl text-xs font-semibold text-charcoal-800 hover:text-charcoal-950 transition-all flex items-center gap-1.5"
          title="Управление авторизацией РКФ"
        >
          <User className="w-3.5 h-3.5 text-camel-700" />
          <span className="hidden sm:inline">Аккаунт</span>
        </button>
      </div>
    </div>
  );
}
