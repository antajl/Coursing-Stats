import { lazy, Suspense, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import PageLoader from './components/PageLoader';
import { isLocalDev } from './lib/env';
import { usePublicCalendarVisible } from './hooks/useStaticData';
import { ErrorFallback } from './components/ErrorBoundary';

import Home from './pages/Home';
const Competitions = lazy(() => import('./pages/Competitions'));
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

function ErrorPreviewPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const shouldCrash = searchParams.get('crash') === '1';

  if (shouldCrash) {
    throw new Error('Тестовая ошибка runtime: проверка срабатывания реального ErrorBoundary');
  }

  const sampleError = new Error('TypeError: Failed to fetch competition protocol data (/data/v1/competitions/2026/04-05.json)');
  sampleError.stack = `TypeError: Failed to fetch competition protocol data\n    at loadCompetitionData (http://localhost:5173/src/pages/Events/EventResults/index.tsx:42:15)\n    at EventResults (http://localhost:5173/src/pages/Events/EventResults/index.tsx:78:9)\n    at renderWithHooks (http://localhost:5173/node_modules/react-dom/cjs/react-dom.development.js:15486:18)`;

  return createPortal(<ErrorFallback error={sampleError} />, document.body);
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
        <Route path="/competitions/:id" element={<LegacyCompetitionRedirect />} />
        <Route
          path="/protocol-builder"
          element={isLocalDev ? <ProtocolBuilder /> : <Navigate to="/competitions?tab=ranking" replace />}
        />
        <Route
          path="/protocol-builder/*"
          element={isLocalDev ? <ProtocolBuilder /> : <Navigate to="/competitions?tab=ranking" replace />}
        />
        <Route path="/procoursing" element={<LegacyProcoursingRedirect />} />
        <Route path="/shows" element={<Shows />} />
        <Route path="/shows/judges/:judgeId" element={<ShowJudgeDetail />} />
        <Route path="/shows/exhibition/:id" element={<ShowExhibitionDetail />} />
        <Route path="/shows/champions" element={<Navigate to="/shows?tab=ranking" replace />} />
        <Route path="/shows/dog/:showDogId" element={<ShowDogProfile />} />
        <Route path="/shows/dog/:dogId/:breed" element={<ShowDogProfile />} />
        <Route path="/exhibition/:id" element={<LegacyExhibitionRedirect />} />
        <Route path="/top" element={<LegacyTopRedirect />} />
        <Route path="/top-dogs" element={<LegacyTopRedirect />} />
        <Route path="/dog/:id" element={<ShowDogIdRedirect />} />
        <Route path="/event/:id" element={<EventResults />} />
        <Route path="/speed-records" element={<SpeedRecords />} />
        <Route path="/donino/championship" element={<DoninoChampionship />} />
        <Route path="/donino-championship" element={<Navigate to="/donino/championship" replace />} />
        <Route path="/donino/analytics" element={<DoninoAnalytics />} />
        <Route path="/breeds/:slug" element={<BreedHub />} />
        <Route path="/breed/:slug" element={<BreedHub />} />
        <Route path="/rating/:slug" element={<BreedHub />} />
        <Route path="/ratings/:slug" element={<BreedHub />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/about" element={<About />} />
        <Route path="/donino-dog/:name/:breed" element={<DoninoDogProfile />} />
        <Route path="/judges" element={<LegacyJudgesListRedirect />} />
        <Route path="/judges/:judgeId" element={<JudgeDetail />} />
        <Route path="/test-error" element={<ErrorPreviewPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
