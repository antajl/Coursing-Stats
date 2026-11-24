import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RotateCw, User, LogIn, Download } from 'lucide-react';
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
  const [cooldown, setCooldown] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const last = localStorage.getItem('cs_rkf_last_sync_timestamp');
    if (!last) return 0;
    const elapsed = Math.floor((Date.now() - Number(last)) / 1000);
    return elapsed < 60 ? 60 - elapsed : 0;
  });

  const [lastSyncStr, setLastSyncStr] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const last = localStorage.getItem('cs_rkf_last_sync_timestamp');
    if (!last) return null;
    const d = new Date(Number(last));
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleOpenDownload = () => {
    window.dispatchEvent(new CustomEvent('tracker-open-download'));
  };

  const handleTriggerRefresh = () => {
    if (cooldown > 0 || isSyncing || isRefreshing) return;
    setIsSyncing(true);
    onRefresh();

    const now = Date.now();
    localStorage.setItem('cs_rkf_last_sync_timestamp', String(now));
    const d = new Date(now);
    setLastSyncStr(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);

    setTimeout(() => {
      setIsSyncing(false);
      setCooldown(60);
    }, 1000);
  };

  const activeSync = isRefreshing || isSyncing;

  return (
    <div className="flex relative h-16 w-full items-center justify-between pl-2 pr-2 sm:pl-3 sm:pr-3 lg:pl-4 lg:pr-4">
      {/* 1. Left: Brand Logo (identical to NavDesktop.tsx) */}
      <Link
        to="/tracker"
        className="flex min-w-0 shrink-0 items-center transition-all duration-300 hover:opacity-90 active:scale-95"
        aria-label="Главная страница РКФ Трекер"
        title="РКФ Трекер"
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

      {/* 2. Center: Two Navigation Tabs (desktop only, synchronized with page) */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
        <button
          type="button"
          onClick={() => onSelectTab('applications')}
          className={`group relative flex shrink-0 items-center whitespace-nowrap py-2 px-3 text-xs lg:text-sm font-semibold transition-colors duration-200 cursor-pointer ${
            activeTab === 'applications' ? 'text-camel-800' : 'text-charcoal-700 hover:text-charcoal-900'
          }`}
        >
          <span>Заявки на титулы</span>
          <span
            className={`pointer-events-none absolute bottom-0 left-0 h-0.5 bg-camel-600 transition-[width] duration-300 ease-out ${
              activeTab === 'applications' ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
          />
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('competitions')}
          className={`group relative flex shrink-0 items-center gap-1.5 whitespace-nowrap py-2 px-3 text-xs lg:text-sm font-semibold transition-colors duration-200 cursor-pointer ${
            activeTab === 'competitions' ? 'text-camel-800' : 'text-charcoal-700 hover:text-charcoal-900'
          }`}
        >
          <span>Соревнования РКФ</span>
          <span className="text-[11px] font-mono opacity-80">{competitionsCount}</span>
          <span
            className={`pointer-events-none absolute bottom-0 left-0 h-0.5 bg-camel-600 transition-[width] duration-300 ease-out ${
              activeTab === 'competitions' ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
          />
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('apps')}
          className={`group relative flex shrink-0 items-center whitespace-nowrap py-2 px-3 text-xs lg:text-sm font-semibold transition-colors duration-200 cursor-pointer ${
            activeTab === 'apps' ? 'text-camel-800' : 'text-charcoal-700 hover:text-charcoal-900'
          }`}
        >
          <span>Приложения и бот</span>
          <span
            className={`pointer-events-none absolute bottom-0 left-0 h-0.5 bg-camel-600 transition-[width] duration-300 ease-out ${
              activeTab === 'apps' ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
          />
        </button>
      </div>

      {/* 3. Right: Auth/Account, and Adjacent Synchronization Block */}
      <div className="flex shrink-0 items-center gap-2 lg:gap-2.5">
        {/* Account / Login Management Button (Renamed from Токен) */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="cs-glass-pill flex items-center justify-center gap-1.5 h-9 px-3 rounded-full text-charcoal-700 hover:text-charcoal-900 hover:border-camel-300 text-xs font-semibold transition-all shrink-0 active:scale-95 cursor-pointer"
          title={isLive ? 'Управление аккаунтом РКФ Онлайн' : 'Войти в личный кабинет РКФ Онлайн'}
        >
          {isLive ? (
            <>
              <User className="w-3.5 h-3.5 text-camel-700" />
              <span className="hidden sm:inline">Аккаунт</span>
            </>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5 text-camel-700" />
              <span className="hidden sm:inline">Войти</span>
            </>
          )}
        </button>

        {/* Consolidated Synchronization Block: Status Badge + Refresh Button adjacent */}
        <div className="flex items-center gap-1.5 pl-1.5 border-l border-old-money-200/60">
          {/* Status Indicator with dynamic Dot and Last Sync Time */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-100 text-[11.5px] text-charcoal-700 border border-old-money-200/60 shadow-2xs">
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                !isLive
                  ? 'bg-charcoal-400'
                  : activeSync
                  ? 'bg-amber-500 animate-pulse ring-2 ring-amber-500/20'
                  : 'bg-emerald-500 ring-2 ring-emerald-500/20'
              }`}
            />
            <span className="font-medium">
              {!isLive
                ? 'Не подключен'
                : activeSync
                ? 'Синхронизация...'
                : 'РКФ Онлайн'}
            </span>
            {isLive && lastSyncStr && !activeSync && (
              <span className="text-[10.5px] font-mono text-charcoal-500 opacity-90 pl-0.5">
                {lastSyncStr}
              </span>
            )}
          </div>

          {/* Smart Refresh Button (Matches Extension Behavior with Cooldown) */}
          <button
            type="button"
            onClick={handleTriggerRefresh}
            disabled={activeSync || cooldown > 0}
            className="cs-glass-pill flex items-center justify-center gap-1.5 h-9 px-3 rounded-full text-charcoal-700 hover:text-charcoal-900 hover:border-camel-300 text-xs font-semibold transition-all shrink-0 active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
            title={
              cooldown > 0
                ? `Повторное обновление будет доступно через ${cooldown} сек.`
                : 'Синхронизировать данные с РКФ Онлайн'
            }
            aria-label="Синхронизировать"
          >
            <RotateCw
              className={`w-3.5 h-3.5 text-camel-700 transition-transform ${
                activeSync ? 'animate-spin' : 'group-hover:rotate-45'
              }`}
            />
            <span className="hidden sm:inline">
              {activeSync ? 'Запрос...' : cooldown > 0 ? `${cooldown} сек...` : 'Обновить'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
