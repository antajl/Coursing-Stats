import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface TrackerSyncBarProps {
  isRefreshing: boolean;
  onOpenAuth: () => void;
}

export function TrackerSyncBar({
  isRefreshing,
  onOpenAuth,
}: TrackerSyncBarProps) {
  const [lastSyncStr, setLastSyncStr] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const last =
      localStorage.getItem('cs_rkf_last_sync_timestamp') ||
      localStorage.getItem('cs_rkf_last_sync');
    if (!last) return null;
    const d = new Date(Number(last));
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (!isRefreshing) {
      const last = localStorage.getItem('cs_rkf_last_sync');
      if (last) {
        const d = new Date(Number(last));
        setLastSyncStr(
          `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
        );
      }
    }
  }, [isRefreshing]);

  return (
    <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-cream-100/80 border border-old-money-200/70">
      <div className="flex items-center gap-2 min-w-0 text-xs text-charcoal-700">
        <span
          className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
            isRefreshing
              ? 'bg-amber-500 animate-pulse ring-2 ring-amber-500/20'
              : 'bg-emerald-500 ring-2 ring-emerald-500/20'
          }`}
        />
        <span className="font-medium truncate">
          {isRefreshing ? 'Синхронизация...' : 'РКФ Онлайн'}
        </span>
        {!isRefreshing && lastSyncStr && (
          <span className="text-[11px] font-mono text-charcoal-500 shrink-0">
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
  );
}
