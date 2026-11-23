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
} from './trackerData';
import { TrackerApplications } from './TrackerApplications';
import { TrackerCompetitions } from './TrackerCompetitions';
import { TrackerAuthModal } from './TrackerAuthModal';
import rawCompetitions from './rkf-competitions-2026.json';

const competitions = rawCompetitions as TrackerCompetition[];

export default function TrackerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as TrackerTab) || 'applications';

  const [receivedSet, setReceivedSet] = useState<Set<string>>(() => getReceivedBarcodes());
  const [subscribedSet, setSubscribedSet] = useState<Set<string>>(() => getSubscribedCompetitions());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [, setIsLive] = useState(() => Boolean(getStoredToken()));

  useEffect(() => {
    document.title = 'РКФ Трекер — Заявки и Соревнования | CoursingStats';
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
    const handleRefresh = () => {
      setReceivedSet(getReceivedBarcodes());
      setSubscribedSet(getSubscribedCompetitions());
      setIsLive(Boolean(getStoredToken()));
    };

    window.addEventListener('tracker-open-auth', handleOpenAuth);
    window.addEventListener('tracker-refresh', handleRefresh);
    return () => {
      window.removeEventListener('tracker-open-auth', handleOpenAuth);
      window.removeEventListener('tracker-refresh', handleRefresh);
    };
  }, []);

  return (
    <div className="space-y-4">
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
    </div>
  );
}
