import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TrackerTab, TrackerCompetition } from './trackerTypes';
import {
  MOCK_APPLICATIONS,
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

  useEffect(() => {
    document.title = 'РКФ Трекер — Заявки и Соревнования | CoursingStats';
  }, []);

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

  // 2. Auto-login from Chrome Extension message transfer
  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'RKF_TOKEN_TRANSFER' && event.data.token) {
        setStoredAuth(event.data.token.trim(), 'rkf.online');
        setIsLive(true);
      }
    };
    window.addEventListener('message', handleExtensionMessage);
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
      {/* Old Money Page Tabs (Image 1 replica: clean baseline with solid brown active indicator) */}
      <div className="flex items-center gap-6 sm:gap-8 border-b border-old-money-200/80 pt-1 pb-0 mb-3 select-none">
        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'applications' })}
          className={`group relative pb-2.5 text-base sm:text-lg font-serif transition-colors duration-200 cursor-pointer ${
            currentTab === 'applications'
              ? 'text-camel-950 font-bold'
              : 'text-charcoal-600 hover:text-charcoal-900 font-medium'
          }`}
        >
          <span>Заявки на титулы</span>
          {currentTab === 'applications' && (
            <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#8B4513] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSearchParams({ tab: 'competitions' })}
          className={`group relative pb-2.5 text-base sm:text-lg font-serif transition-colors duration-200 cursor-pointer flex items-center gap-2 ${
            currentTab === 'competitions'
              ? 'text-camel-950 font-bold'
              : 'text-charcoal-600 hover:text-charcoal-900 font-medium'
          }`}
        >
          <span>Соревнования РКФ</span>
          <span
            className={`text-xs font-mono font-medium transition-colors ${
              currentTab === 'competitions' ? 'text-camel-800' : 'text-charcoal-400'
            }`}
          >
            {competitions.length}
          </span>
          {currentTab === 'competitions' && (
            <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#8B4513] rounded-full" />
          )}
        </button>
      </div>

      {currentTab === 'applications' ? (
        <TrackerApplications
          applications={MOCK_APPLICATIONS}
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
