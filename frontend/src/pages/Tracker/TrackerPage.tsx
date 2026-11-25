import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TrackerTab, TrackerCompetition, TrackerApplication } from './trackerTypes';
import {
  getReceivedBarcodes,
  toggleReceivedBarcode,
  getSubscribedCompetitions,
  toggleSubscribedCompetition,
  getStoredToken,
  setStoredAuth,
  fetchTrackerApplications,
  fetchSyncedState,
  pushSyncedState,
  fetchLiveCompetitions,
} from './trackerData';
import { TrackerApplications } from './TrackerApplications';
import { TrackerCompetitions } from './TrackerCompetitions';
import { TrackerApps } from './TrackerApps';
import { TrackerAuthModal } from './TrackerAuthModal';
import { TrackerDownloadModal } from './TrackerDownloadModal';
import { TrackerSubNav } from './TrackerSubNav';
import rawCompetitions from './rkf-competitions-2026.json';

const initialCompetitions = rawCompetitions as TrackerCompetition[];

export default function TrackerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as TrackerTab) || 'applications';

  const [competitions, setCompetitions] = useState<TrackerCompetition[]>(initialCompetitions);
  const [competitionsUpdatedAt, setCompetitionsUpdatedAt] = useState<string | null>(null);
  const [receivedSet, setReceivedSet] = useState<Set<string>>(() => getReceivedBarcodes());
  const [subscribedSet, setSubscribedSet] = useState<Set<string>>(() => getSubscribedCompetitions());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [isLive, setIsLive] = useState(() => Boolean(getStoredToken()));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [extensionToast, setExtensionToast] = useState<{ secondsLeft: number } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [authExpired, setAuthExpired] = useState(false);

  const [applications, setApplications] = useState<TrackerApplication[]>(() => {
    const token = getStoredToken();
    if (!token) return [];
    try {
      const stored = localStorage.getItem('cs_rkf_applications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    document.title = 'РКФ Трекер — Заявки и Соревнования | CoursingStats';
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchLiveCompetitions().then((live) => {
      if (!cancelled && live && live.events.length > 0) {
        setCompetitions(live.events);
        setCompetitionsUpdatedAt(live.updatedAt);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-dismiss extension sync toast without hard page reload
  useEffect(() => {
    if (!extensionToast) return;
    if (extensionToast.secondsLeft <= 0) {
      setExtensionToast(null);
      return;
    }
    const timer = setTimeout(() => {
      setExtensionToast((prev) => (prev ? { secondsLeft: prev.secondsLeft - 1 } : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [extensionToast]);

  // 1. Auto-login from query parameter: /tracker?token=xxx or open auth: ?action=login
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setStoredAuth(token.trim(), 'rkf.online');
      setIsLive(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('token');
      setSearchParams(nextParams, { replace: true });
    } else if (searchParams.get('action') === 'login' || searchParams.get('auth') === '1') {
      setAuthModalOpen(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('action');
      nextParams.delete('auth');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // 2. Auto-login from Chrome Extension message transfer / site-bridge
  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      if (!event.data) return;
      const { type, token, applications: extApps, userUuid } = event.data;
      if (
        (type === 'RKF_TOKEN_TRANSFER' ||
          type === 'RKF_TRACKER_TOKEN_SYNC' ||
          type === 'CS_EXTENSION_TOKEN_AVAILABLE' ||
          type === 'CS_EXTENSION_TOKEN_RESPONSE') &&
        token &&
        typeof token === 'string' &&
        token.trim().length >= 20
      ) {
        const prevToken = getStoredToken();
        const isNewToken = !prevToken || prevToken !== token.trim();
        setStoredAuth(token.trim(), 'rkf.online', userUuid);
        setIsLive(true);

        if (Array.isArray(extApps) && extApps.length > 0) {
          try {
            localStorage.setItem('cs_rkf_applications', JSON.stringify(extApps));
            setApplications(extApps);
          } catch {}
        }

        if (isNewToken) {
          setExtensionToast({ secondsLeft: 4 });
        }
      }
    };

    window.addEventListener('message', handleExtensionMessage);
    // Ping bridge to ask for token if extension is present
    window.postMessage({ type: 'CS_GET_EXTENSION_TOKEN' }, '*');
    return () => window.removeEventListener('message', handleExtensionMessage);
  }, []);

  const handleToggleReceived = useCallback((barcode: string) => {
    const updated = toggleReceivedBarcode(barcode);
    setReceivedSet(new Set(updated));
    const token = getStoredToken();
    if (token) {
      void pushSyncedState(token, Array.from(updated), Array.from(getSubscribedCompetitions()));
    }
  }, []);

  const handleToggleSubscribed = useCallback((id: string) => {
    const updated = toggleSubscribedCompetition(id);
    setSubscribedSet(new Set(updated));
    const token = getStoredToken();
    if (token) {
      void pushSyncedState(token, Array.from(getReceivedBarcodes()), Array.from(updated));
    }
  }, []);

  const syncApplications = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setApplications([]);
      setSyncError(null);
      setAuthExpired(false);
      return;
    }
    setIsRefreshing(true);
    window.dispatchEvent(new CustomEvent('tracker-sync-state', { detail: { syncing: true } }));
    try {
      const [res, cloudState] = await Promise.all([
        fetchTrackerApplications(token),
        fetchSyncedState(token),
      ]);
      if (cloudState) {
        const mergedReceived = new Set([...getReceivedBarcodes(), ...cloudState.receivedBarcodes]);
        const mergedSubs = new Set([...getSubscribedCompetitions(), ...cloudState.subscribedCompetitions]);
        localStorage.setItem('cs_received_barcodes', JSON.stringify(Array.from(mergedReceived)));
        localStorage.setItem('cs_subscribed_competitions', JSON.stringify(Array.from(mergedSubs)));
        setReceivedSet(mergedReceived);
        setSubscribedSet(mergedSubs);
      }
      if (res.ok && res.applications) {
        setApplications(res.applications);
        setSyncError(null);
        setAuthExpired(false);
      } else if (res.authExpired) {
        setAuthExpired(true);
        setSyncError(res.error || 'Срок действия сессии РКФ Онлайн истек. Войдите заново.');
        setIsLive(false);
      } else if (res.error) {
        setSyncError(res.error);
      }
    } finally {
      setIsRefreshing(false);
      window.dispatchEvent(new CustomEvent('tracker-sync-state', { detail: { syncing: false } }));
    }
  }, []);

  useEffect(() => {
    if (getStoredToken()) {
      void syncApplications();
    }
  }, [syncApplications]);

  const handleAuthChange = useCallback(() => {
    const hasToken = Boolean(getStoredToken());
    setIsLive(hasToken);
    if (hasToken) {
      void syncApplications();
    } else {
      localStorage.removeItem('cs_rkf_applications');
      setApplications([]);
    }
  }, [syncApplications]);

  useEffect(() => {
    const handleOpenAuth = () => setAuthModalOpen(true);
    const handleOpenDownload = () => setDownloadModalOpen(true);
    const handleRefresh = () => {
      setReceivedSet(getReceivedBarcodes());
      setSubscribedSet(getSubscribedCompetitions());
      setIsLive(Boolean(getStoredToken()));
      void syncApplications();
    };

    window.addEventListener('tracker-open-auth', handleOpenAuth);
    window.addEventListener('tracker-open-download', handleOpenDownload);
    window.addEventListener('tracker-refresh', handleRefresh);
    return () => {
      window.removeEventListener('tracker-open-auth', handleOpenAuth);
      window.removeEventListener('tracker-open-download', handleOpenDownload);
      window.removeEventListener('tracker-refresh', handleRefresh);
    };
  }, [syncApplications]);

  const isTelegramMiniApp =
    typeof window !== 'undefined' &&
    Boolean((window as unknown as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp?.initData);

  return (
    <div className="space-y-4">
      <div className={isTelegramMiniApp ? 'md:hidden' : ''}>
        <TrackerSubNav
          activeTab={currentTab}
          onSelectTab={(tab) => setSearchParams({ tab })}
          competitionsCount={competitions.length}
        />
      </div>

      {currentTab === 'applications' && (
        <TrackerApplications
          applications={applications}
          onToggleReceived={handleToggleReceived}
          receivedSet={receivedSet}
          syncError={syncError}
          authExpired={authExpired}
          isLive={isLive}
          isRefreshing={isRefreshing}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      )}

      {currentTab === 'competitions' && (
        <TrackerCompetitions
          competitions={competitions}
          subscribedSet={subscribedSet}
          onToggleSubscribed={handleToggleSubscribed}
          updatedAt={competitionsUpdatedAt}
        />
      )}

      {currentTab === 'apps' && (
        <TrackerApps />
      )}

      {/* Extension token auto-sync notification toast */}
      {extensionToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-xl bg-sand-100 border border-camel-400 shadow-xl flex items-center justify-between gap-3 text-xs text-charcoal-900"
        >
          <div>
            <div className="font-semibold text-charcoal-950">Аккаунт подхвачен из расширения</div>
            <div className="text-charcoal-600 mt-0.5">
              Данные синхронизированы автоматически
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExtensionToast(null)}
            className="px-3 py-1.5 rounded-lg bg-camel-700 hover:bg-camel-800 text-white font-medium text-xs transition-colors shrink-0 cursor-pointer"
          >
            Готово
          </button>
        </aside>
      )}

      <TrackerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthChange={handleAuthChange}
      />

      <TrackerDownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />
    </div>
  );
}
