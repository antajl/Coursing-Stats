import { useLocation } from 'react-router-dom'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useDarkMode } from '../hooks/useDarkMode'
import { isLocalDev } from '../lib/env'
import { NavDesktop } from './nav/NavDesktop'
import { NavMobile } from './nav/NavMobile'
import type { OpenMenuId } from './nav/navLinks'

export default function Nav() {
  const location = useLocation();
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenuId>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statisticsOpen, setStatisticsOpen] = useState(false);
  const [doninoOpen, setDoninoOpen] = useState(false);
  const [showsOpen, setShowsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDark = useDarkMode();
  const isActive = (path: string) => location.pathname === path || (path === '/' && location.pathname === '/');
  const isCompetitionsActive =
    location.pathname === '/competitions' ||
    location.pathname === '/procoursing' ||
    (isLocalDev && location.pathname.startsWith('/event/'))
  const isSpeedRecordsActive = location.pathname === '/speed-records';
  const isShowsActive =
    location.pathname === '/shows' || location.pathname.startsWith('/shows/')
  const isGuideActive = location.pathname === '/guide';

  const setMenuOpen = useCallback((id: Exclude<OpenMenuId, null>) => {
    return (open: boolean) => {
      setOpenMenu((current) => {
        if (open) return id
        if (current === id) return null
        return current
      })
    }
  }, [])

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setSourcesOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setSourcesOpen(false);
    }, 200);
  };

  const toggleSources = () => {
    setSourcesOpen(!sourcesOpen);
  };

  const toggleStatistics = () => {
    setStatisticsOpen(!statisticsOpen);
  };

  const toggleDonino = () => {
    setDoninoOpen(!doninoOpen);
  };

  const toggleShows = () => {
    setShowsOpen(!showsOpen);
  };

  const toggleGuide = () => {
    setGuideOpen(!guideOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    setOpenMenu(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setSourcesOpen(false);
        setOpenMenu(null);
        setStatisticsOpen(false);
        setDoninoOpen(false);
        setShowsOpen(false);
        setGuideOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <nav className="nav-glass sticky top-0 z-50 relative border-b border-cream-300/20 dark:border-charcoal-700/30 shadow-[0_4px_7px_-2px_rgba(43,37,32,0.34)] dark:shadow-[0_4px_8px_-2px_rgba(0,0,0,0.72)]">
      <NavDesktop
        isDark={isDark}
        isActive={isActive}
        isCompetitionsActive={isCompetitionsActive}
        isShowsActive={isShowsActive}
        isSpeedRecordsActive={isSpeedRecordsActive}
        isGuideActive={isGuideActive}
        openMenu={openMenu}
        setMenuOpen={setMenuOpen}
        sourcesOpen={sourcesOpen}
        onSourcesMouseEnter={handleMouseEnter}
        onSourcesMouseLeave={handleMouseLeave}
      />
      <NavMobile
        isDark={isDark}
        isActive={isActive}
        isCompetitionsActive={isCompetitionsActive}
        isShowsActive={isShowsActive}
        isSpeedRecordsActive={isSpeedRecordsActive}
        isGuideActive={isGuideActive}
        mobileMenuOpen={mobileMenuOpen}
        statisticsOpen={statisticsOpen}
        showsOpen={showsOpen}
        doninoOpen={doninoOpen}
        guideOpen={guideOpen}
        sourcesOpen={sourcesOpen}
        onToggleMobileMenu={toggleMobileMenu}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        onToggleStatistics={toggleStatistics}
        onToggleShows={toggleShows}
        onToggleDonino={toggleDonino}
        onToggleGuide={toggleGuide}
        onToggleSources={toggleSources}
      />
    </nav>
  );
}
