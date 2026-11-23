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
  competitionsCount: _competitionsCount,
  isLive,
  onRefresh,
  isRefreshing,
  onOpenAuth,
}: NavTrackerProps) {
  return (
    <div className="flex relative h-16 w-full items-center justify-between pl-2 pr-2 sm:pl-3 sm:pr-3 lg:pl-4 lg:pr-4">
      {/* 1. Left: Brand Logo (identical to NavDesktop.tsx) */}
      <Link
        to="/tracker"
        className="flex min-w-0 shrink-0 items-center transition-all duration-300 hover:opacity-90 active:scale-95"
        aria-label="Главная страница Курсинг Статс"
        title="Курсинг Статс"
      >
        <img
          src="/assets/brand/logo.svg"
          width={348}
          height={62}
          alt="Курсинг Статс"
          className="hidden xl:block h-[52px] xl:h-[55px] 2xl:h-[58px] w-auto"
          style={{ objectFit: 'contain' }}
          loading="eager"
          decoding="async"
        />
        <img
          src="/assets/brand/logo-badge.svg"
          width={60}
          height={62}
          alt="Курсинг Статс"
          className="block xl:hidden h-[46px] w-auto drop-shadow-xs"
          style={{ objectFit: 'contain' }}
          loading="eager"
          decoding="async"
        />
      </Link>

      {/* 2. Center: STRICTLY Two Internal Tracker Navigation Tabs (identical to NavDesktop.tsx) */}
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-0.5 xl:gap-1">
        <button
          type="button"
          onClick={() => onSelectTab('applications')}
          className={`group relative flex shrink-0 items-center whitespace-nowrap py-2 px-2.5 text-xs font-semibold transition-colors duration-300 lg:px-3.5 lg:text-sm 2xl:px-5 ${
            activeTab === 'applications' ? 'text-camel-700' : 'text-charcoal-700 hover:text-charcoal-900'
          }`}
        >
          <span className="relative z-10">Заявки на титулы</span>
          <span
            className={`pointer-events-none absolute bottom-0 left-0 h-0.5 bg-camel-600 transition-[width] duration-300 ease-out ${
              activeTab === 'applications' ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
          />
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('competitions')}
          className={`group relative flex shrink-0 items-center whitespace-nowrap py-2 px-2.5 text-xs font-semibold transition-colors duration-300 lg:px-3.5 lg:text-sm 2xl:px-5 ${
            activeTab === 'competitions' ? 'text-camel-700' : 'text-charcoal-700 hover:text-charcoal-900'
          }`}
        >
          <span className="relative z-10">Соревнования РКФ</span>
          <span
            className={`pointer-events-none absolute bottom-0 left-0 h-0.5 bg-camel-600 transition-[width] duration-300 ease-out ${
              activeTab === 'competitions' ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
          />
        </button>
      </div>

      {/* 3. Right: Sync status, Refresh button, Account button (matching NavDesktop.tsx right block) */}
      <div className="flex shrink-0 items-center gap-1.5 lg:gap-2 2xl:gap-2.5">
        {/* Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream-100 text-[11.5px] text-charcoal-700 border border-old-money-200/60 shadow-2xs">
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
          className="cs-glass-pill flex items-center justify-center gap-1.5 h-9 w-9 rounded-full text-charcoal-700 text-xs font-semibold group cursor-pointer shrink-0 disabled:opacity-50"
          title="Синхронизировать данные"
          aria-label="Синхронизировать"
        >
          <RotateCw
            className={`w-4 h-4 text-camel-700 transition-transform ${
              isRefreshing ? 'animate-spin' : 'group-hover:rotate-45'
            }`}
          />
        </button>

        {/* Account Button */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="cs-glass-pill flex items-center justify-center gap-1.5 h-9 px-2.5 2xl:px-3 rounded-full text-charcoal-700 hover:text-charcoal-900 hover:border-camel-300 text-xs font-semibold transition-all shrink-0 active:scale-95"
          title="Управление входом в РКФ Онлайн"
        >
          <User className="w-3.5 h-3.5 text-camel-700" />
          <span className="hidden sm:inline">Аккаунт</span>
        </button>
      </div>
    </div>
  );
}
