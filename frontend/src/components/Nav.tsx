import { useLocation, useSearchParams } from 'react-router-dom'
import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react'
import { NavDesktop } from './nav/NavDesktop'
import { NavMobile } from './nav/NavMobile'
import { NavTracker } from './nav/NavTracker'
import type { TrackerTab } from '../pages/Tracker/trackerTypes'
import type { OpenMenuId } from './nav/navLinks'

const QuickSearchModal = lazy(() => import('./nav/QuickSearchModal'))

export default function Nav() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenuId>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path || (path === '/' && location.pathname === '/');
  const isCompetitionsActive =
    location.pathname === '/competitions' ||
    location.pathname.startsWith('/competitions/') ||
    location.pathname === '/procoursing' ||
    location.pathname === '/protocol-builder' ||
    location.pathname.startsWith('/protocol-builder/') ||
    location.pathname.startsWith('/event/')
  const isSpeedRecordsActive =
    location.pathname === '/speed-records' ||
    location.pathname.startsWith('/speed-records/') ||
    location.pathname === '/donino/championship' ||
    location.pathname.startsWith('/donino/') ||
    location.pathname.startsWith('/donino-');
  const isShowsActive =
    location.pathname === '/shows' || location.pathname.startsWith('/shows/')
  const isTrackerActive =
    location.pathname === '/tracker' || location.pathname.startsWith('/tracker/')
  const isGuideActive = location.pathname === '/guide';
  const isAboutActive = location.pathname === '/about';
  const [trackerRefreshing, setTrackerRefreshing] = useState(false);

  useEffect(() => {
    const onSyncState = (e: Event) => {
      const detail = (e as CustomEvent<{ syncing?: boolean }>).detail;
      setTrackerRefreshing(Boolean(detail?.syncing));
    };
    window.addEventListener('tracker-sync-state', onSyncState);
    return () => window.removeEventListener('tracker-sync-state', onSyncState);
  }, []);

  const menuCallbacks = useRef<Record<string, (open: boolean) => void>>({});
  const setMenuOpen = useCallback((id: Exclude<OpenMenuId, null>) => {
    if (!menuCallbacks.current[id]) {
      menuCallbacks.current[id] = (open: boolean) => {
        setOpenMenu((current) => {
          if (open) return id;
          if (current === id) return null;
          return current;
        });
      };
    }
    return menuCallbacks.current[id];
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    setOpenMenu((prev) => (prev !== null ? null : prev));
    setMobileMenuOpen((prev) => (prev ? false : prev));
  }, [location.pathname, location.search]);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setOpenMenu(null);
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);


  const isTelegramMiniApp =
    typeof window !== 'undefined' &&
    Boolean((window as unknown as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp?.initData);

  if (location.pathname.startsWith('/tracker') && isTelegramMiniApp) {
    const currentTab = (searchParams.get('tab') as TrackerTab) || 'applications';
    const isLive = typeof window !== 'undefined' && Boolean(localStorage.getItem('cs_rkf_token'));
    return (
      <nav className="nav-glass sticky top-0 z-50 relative print:hidden">
        <NavTracker
          activeTab={currentTab}
          onSelectTab={(tab) => setSearchParams({ tab })}
          competitionsCount={72}
          isLive={isLive}
          onRefresh={() => window.dispatchEvent(new CustomEvent('tracker-refresh'))}
          isRefreshing={trackerRefreshing}
          onOpenAuth={() => window.dispatchEvent(new CustomEvent('tracker-open-auth'))}
        />
      </nav>
    );
  }

  return (
    <nav className="nav-glass sticky top-0 z-50 relative print:hidden">
      <NavDesktop
        isActive={isActive}
        isCompetitionsActive={isCompetitionsActive}
        isShowsActive={isShowsActive}
        isSpeedRecordsActive={isSpeedRecordsActive}
        isTrackerActive={isTrackerActive}
        isGuideActive={isGuideActive}
        isAboutActive={isAboutActive}
        openMenu={openMenu}
        setMenuOpen={setMenuOpen}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <NavMobile
        isActive={isActive}
        isCompetitionsActive={isCompetitionsActive}
        isShowsActive={isShowsActive}
        isSpeedRecordsActive={isSpeedRecordsActive}
        isGuideActive={isGuideActive}
        isAboutActive={isAboutActive}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={toggleMobileMenu}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        onOpenSearch={() => setSearchOpen(true)}
      />
      {searchOpen && (
        <Suspense fallback={null}>
          <QuickSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </nav>
  );
}
