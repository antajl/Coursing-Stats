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
} from './trackerData';
import { TrackerApplications } from './TrackerApplications';
import { TrackerCompetitions } from './TrackerCompetitions';
import { TrackerAuthModal } from './TrackerAuthModal';
import { TrackerDownloadModal } from './TrackerDownloadModal';
import rawCompetitions from './rkf-competitions-2026.json';

const competitions = rawCompetitions as TrackerCompetition[];

export default function TrackerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as TrackerTab) || 'applications';

  const [receivedSet, setReceivedSet] = useState<Set<string>>(() => getReceivedBarcodes());
  const [subscribedSet, setSubscribedSet] = useState<Set<string>>(() => getSubscribedCompetitions());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [, setIsLive] = useState(() => Boolean(getStoredToken()));
  const [extensionToast, setExtensionToast] = useState<{ secondsLeft: number } | null>(null);

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

  // Countdown timer for extension sync toast -> auto reload
  useEffect(() => {
    if (!extensionToast) return;
    if (extensionToast.secondsLeft <= 0) {
      window.location.reload();
      return;
    }
    const timer = setTimeout(() => {
      setExtensionToast((prev) => (prev ? { secondsLeft: prev.secondsLeft - 1 } : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [extensionToast]);

  // 1. Auto-login from query parameter: /tracker?token=xxx
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setStoredAuth(token.trim(), 'rkf.online');
      setIsLive(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('token');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // 2. Auto-login from Chrome Extension message transfer / site-bridge
  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      if (!event.data) return;
      const { type, token, applications: extApps } = event.data;
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
        setStoredAuth(token.trim(), 'rkf.online');
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
  }, []);

  const handleToggleSubscribed = useCallback((id: string) => {
    const updated = toggleSubscribedCompetition(id);
    setSubscribedSet(new Set(updated));
  }, []);

  const handleAuthChange = useCallback(() => {
    setIsLive(Boolean(getStoredToken()));
  }, []);

  useEffect(() => {
    const handleOpenAuth = () => setAuthModalOpen(true);
    const handleOpenDownload = () => setDownloadModalOpen(true);
    const handleRefresh = () => {
      setReceivedSet(getReceivedBarcodes());
      setSubscribedSet(getSubscribedCompetitions());
      setIsLive(Boolean(getStoredToken()));
    };

    window.addEventListener('tracker-open-auth', handleOpenAuth);
    window.addEventListener('tracker-open-download', handleOpenDownload);
    window.addEventListener('tracker-refresh', handleRefresh);
    return () => {
      window.removeEventListener('tracker-open-auth', handleOpenAuth);
      window.removeEventListener('tracker-open-download', handleOpenDownload);
      window.removeEventListener('tracker-refresh', handleRefresh);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Mobile-only Page Tabs (on md+ desktop tabs are housed in sticky NavTracker) */}
      <div className="flex md:hidden items-center gap-6 border-b border-old-money-200/80 pt-1 pb-0 mb-3 select-none">
        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'applications' })}
          className={`group relative pb-2 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
            currentTab === 'applications'
              ? 'text-camel-950 font-bold'
              : 'text-charcoal-600 hover:text-charcoal-900'
          }`}
        >
          <span>Заявки на титулы</span>
          {currentTab === 'applications' && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-camel-600 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'competitions' })}
          className={`group relative pb-2 text-sm font-semibold transition-colors duration-200 cursor-pointer flex items-center gap-1.5 ${
            currentTab === 'competitions'
              ? 'text-camel-950 font-bold'
              : 'text-charcoal-600 hover:text-charcoal-900'
          }`}
        >
          <span>Соревнования РКФ</span>
          <span className="text-xs font-mono opacity-80">{competitions.length}</span>
          {currentTab === 'competitions' && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-camel-600 rounded-full" />
          )}
        </button>
      </div>

      {currentTab === 'applications' ? (
        <TrackerApplications
          applications={applications}
          onToggleReceived={handleToggleReceived}
          receivedSet={receivedSet}
        />
      ) : (
        <TrackerCompetitions
          competitions={competitions}
          subscribedSet={subscribedSet}
          onToggleSubscribed={handleToggleSubscribed}
        />
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
              Обновление страницы через {extensionToast.secondsLeft} сек...
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 rounded-lg bg-camel-700 hover:bg-camel-800 text-white font-medium text-xs transition-colors shrink-0 cursor-pointer"
          >
            Обновить
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
