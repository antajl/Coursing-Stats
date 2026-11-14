import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import PageLoader from './components/PageLoader';
import { isLocalDev } from './lib/env';
import { usePublicCalendarVisible } from './hooks/useStaticData';

import Home from './pages/Home';
const Competitions = lazy(() => import('./pages/Competitions'));
const Competitions2027 = lazy(() => import('./pages/Competitions/Competitions2027'));
const Shows = lazy(() => import('./pages/Shows'));
const ShowDogProfile = lazy(() => import('./pages/Shows/ShowDogProfile'));
const UnifiedDogProfile = lazy(() => import('./pages/UnifiedDogProfile'));
const SpeedRecords = lazy(() => import('./pages/SpeedRecords/index'));
const DoninoChampionship = lazy(() => import('./pages/DoninoChampionship/index'));
const DoninoAnalytics = lazy(() => import('./pages/DoninoAnalytics/index'));
const DoninoDogProfile = lazy(() => import('./pages/DoninoDogProfile'));
const Guide = lazy(() => import('./pages/Guide'));
const About = lazy(() => import('./pages/About'));
const JudgeDetail = lazy(() => import('./pages/Judges/JudgeDetail'));
const ShowExhibitionDetail = lazy(() => import('./pages/Shows/ShowExhibitionDetail'));
const ShowJudgeDetail = lazy(() => import('./pages/Shows/ShowJudgeDetail'));
const EventResults = lazy(() => import('./pages/Events/EventResults'));
const ProtocolBuilder = lazy(() => import('./pages/ProtocolBuilder'));
const BreedsDirectory = lazy(() => import('./pages/Breeds'));
const BreedHub = lazy(() => import('./pages/BreedHub'));
const NotFound = lazy(() => import('./pages/NotFound'));

function LegacyProcoursingRedirect() {
  const location = useLocation();
  return <Navigate to={`/competitions/${location.search}`} replace />;
}

function LegacyTopRedirect() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  params.set('tab', 'ranking');
  const qs = params.toString();
  return <Navigate to={qs ? `/competitions/?${qs}` : '/competitions/?tab=ranking'} replace />;
}

function LegacyJudgesListRedirect() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  params.set('tab', 'judges');
  return <Navigate to={`/competitions/?${params.toString()}`} replace />;
}



function LegacyCompetitionRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/event/${id}/`} replace />;
}

function CompetitionsParamRoute() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryYear = searchParams.get('year');
  searchParams.delete('year');
  const qs = searchParams.toString();
  const queryPart = qs ? `?${qs}` : '';
  const resolvedYear = queryYear && queryYear !== '' ? queryYear : '2026';

  if (!id) return <Navigate to={`/competitions/ranking/${resolvedYear}/${queryPart}`} replace />;

  if (id === 'archive' || id === 'ranking' || id === 'judges') {
    return <Navigate to={`/competitions/${id}/${resolvedYear}/${queryPart}`} replace />;
  }
  if (id === 'calendar') {
    return <Navigate to={`/competitions/archive/${resolvedYear}/${queryPart}`} replace />;
  }
  if (id === '2027') {
    return <Navigate to={`/competitions/archive/2027/${queryPart}`} replace />;
  }
  if (/^20\d\d$/.test(id)) {
    return <Navigate to={`/competitions/archive/${id}/${queryPart}`} replace />;
  }
  return <LegacyCompetitionRedirect />;
}

function CompetitionsYearRoute() {
  const { tab, year } = useParams<{ tab: string; year: string }>();
  const location = useLocation();
  if (tab === 'calendar') {
    return <Navigate to={`/competitions/archive/${year || '2026'}/${location.search}`} replace />;
  }
  if (tab === 'archive' && year === '2027') {
    return <Competitions2027 />;
  }
  if (year !== 'all' && !/^20\d\d$/.test(year || '')) {
    return <NotFound />;
  }
  if (tab === 'archive' || tab === 'ranking' || tab === 'judges') {
    return <Competitions defaultTab={tab} />;
  }
  return <NotFound />;
}

function ShowsParamRoute() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryYear = searchParams.get('year');
  searchParams.delete('year');
  const qs = searchParams.toString();
  const queryPart = qs ? `?${qs}` : '';
  const resolvedYear = queryYear && queryYear !== '' ? queryYear : '2026';

  if (!id) return <Navigate to={`/shows/ranking/${resolvedYear}/${queryPart}`} replace />;

  if (id === 'archive' || id === 'ranking' || id === 'judges') {
    return <Navigate to={`/shows/${id}/${resolvedYear}/${queryPart}`} replace />;
  }
  if (id === 'calendar') {
    return <Navigate to={`/shows/archive/${resolvedYear}/${queryPart}`} replace />;
  }
  if (/^20\d\d$/.test(id)) {
    return <Navigate to={`/shows/archive/${id}/${queryPart}`} replace />;
  }
  return <NotFound />;
}

function ShowsYearRoute() {
  const { tab, year } = useParams<{ tab: string; year: string }>();
  const location = useLocation();
  if (tab === 'calendar') {
    return <Navigate to={`/shows/archive/${year || '2026'}/${location.search}`} replace />;
  }
  if (year !== 'all' && !/^20\d\d$/.test(year || '')) {
    return <NotFound />;
  }
  if (tab === 'archive' || tab === 'ranking' || tab === 'judges') {
    return <Shows defaultTab={tab} />;
  }
  return <NotFound />;
}

function LegacyExhibitionRedirect() {
  const { id } = useParams<{ id: string }>();
  if (!isLocalDev) return <Navigate to="/shows/" replace />;
  return <Navigate to={`/shows/exhibition/${id}/`} replace />;
}

function ShowDogIdRedirect() {
  const { id } = useParams<{ id: string }>();
  const [redirectId, setRedirectId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!id) return;
    
    let cancelled = false;
    
    // Load migrations and check if this ID needs redirect
    fetch('/data/v1/shows/id-migrations.json')
      .then(res => (res.ok ? res.json() : []))
      .then((migrations: Array<{ old_id: string; new_id: string }>) => {
        if (cancelled) return;
        const migration = migrations.find(m => m.old_id === id);
        if (migration) {
          setRedirectId(migration.new_id);
        }
      })
      .catch(() => {
        // File might not exist or error loading - no redirect needed
      });
      
    return () => {
      cancelled = true;
    };
  }, [id]);
  
  if (redirectId) {
    return <Navigate to={`/dog/${redirectId}/`} replace />;
  }
  
  // No redirect needed, show the normal profile
  return <UnifiedDogProfile />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preview/home" element={<Navigate to="/" replace />} />
        <Route path="/spa-shell" element={<Navigate to="/" replace />} />
        <Route path="/spa-shell/*" element={<Navigate to="/" replace />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/competitions/archive/2027" element={<Competitions2027 />} />
        <Route path="/competitions/archive/2027/" element={<Competitions2027 />} />
        <Route path="/competitions/2027" element={<Navigate to="/competitions/archive/2027/" replace />} />
        <Route path="/competitions/2027/" element={<Navigate to="/competitions/archive/2027/" replace />} />
        <Route path="/calendar/2027" element={<Navigate to="/competitions/archive/2027/" replace />} />
        <Route path="/calendar/2027/" element={<Navigate to="/competitions/archive/2027/" replace />} />
        <Route path="/competitions/:id" element={<CompetitionsParamRoute />} />
        <Route path="/competitions/:tab/:year" element={<CompetitionsYearRoute />} />
        <Route
          path="/protocol-builder"
          element={isLocalDev ? <ProtocolBuilder /> : <Navigate to="/competitions/ranking/" replace />}
        />
        <Route
          path="/protocol-builder/*"
          element={isLocalDev ? <ProtocolBuilder /> : <Navigate to="/competitions/ranking/" replace />}
        />
        <Route path="/procoursing" element={<LegacyProcoursingRedirect />} />
        <Route path="/shows" element={<Shows />} />
        <Route path="/shows/judges/:judgeId" element={<ShowJudgeDetail />} />
        <Route path="/shows/exhibition/:id" element={<ShowExhibitionDetail />} />
        <Route path="/shows/champions" element={<Navigate to="/shows/ranking/" replace />} />
        <Route path="/shows/:id" element={<ShowsParamRoute />} />
        <Route path="/shows/:tab/:year" element={<ShowsYearRoute />} />
        <Route path="/shows/dog/:showDogId" element={<ShowDogProfile />} />
        <Route path="/shows/dog/:dogId/:breed" element={<ShowDogProfile />} />
        <Route path="/exhibition/:id" element={<LegacyExhibitionRedirect />} />
        <Route path="/top" element={<LegacyTopRedirect />} />
        <Route path="/top-dogs" element={<LegacyTopRedirect />} />
        <Route path="/dog/:id" element={<ShowDogIdRedirect />} />
        <Route path="/event/:id" element={<EventResults />} />
        <Route path="/speed-records" element={<SpeedRecords />} />
        <Route path="/speed-records/:year" element={<SpeedRecords />} />
        <Route path="/donino/records" element={<Navigate to="/speed-records/2026/" replace />} />
        <Route path="/donino/records/:year" element={<SpeedRecords />} />
        <Route path="/donino/championship" element={<DoninoChampionship />} />
        <Route path="/donino/championship/standings" element={<Navigate to="/donino/championship/" replace />} />
        <Route path="/donino/championship/analytics" element={<Navigate to="/donino/analytics/" replace />} />
        <Route path="/donino-championship" element={<Navigate to="/donino/championship/" replace />} />
        <Route path="/donino/analytics" element={<DoninoAnalytics />} />
        <Route path="/breeds" element={<BreedsDirectory />} />
        <Route path="/breeds/" element={<BreedsDirectory />} />
        <Route path="/breed" element={<Navigate to="/breeds/" replace />} />
        <Route path="/breed/" element={<Navigate to="/breeds/" replace />} />
        <Route path="/breeds/:slug" element={<BreedHub />} />
        <Route path="/breed/:slug" element={<BreedHub />} />
        <Route path="/rating/:slug" element={<BreedHub />} />
        <Route path="/ratings/:slug" element={<BreedHub />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/about" element={<About />} />
        <Route path="/donino-dog/:name/:breed" element={<DoninoDogProfile />} />
        <Route path="/judges" element={<LegacyJudgesListRedirect />} />
        <Route path="/judges/:judgeId" element={<JudgeDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
