import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import PageLoader from './components/PageLoader';

const Home = lazy(() => import('./pages/Home'));
const Competitions = lazy(() => import('./pages/Competitions'));
const Shows = lazy(() => import('./pages/Shows'));
const ShowDogProfile = lazy(() => import('./pages/Shows/ShowDogProfile'));
const UnifiedDogProfile = lazy(() => import('./pages/UnifiedDogProfile'));
const SpeedRecords = lazy(() => import('./pages/SpeedRecords/index'));
const DoninoDogProfile = lazy(() => import('./pages/DoninoDogProfile'));
const Guide = lazy(() => import('./pages/Guide'));
const JudgeDetail = lazy(() => import('./pages/Judges/JudgeDetail'));
const ShowExhibitionDetail = lazy(() => import('./pages/Shows/ShowExhibitionDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

function LegacyProcoursingRedirect() {
  const location = useLocation();
  return <Navigate to={`/competitions${location.search}`} replace />;
}

function LegacyTopRedirect() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  params.set('tab', 'ranking');
  const qs = params.toString();
  return <Navigate to={qs ? `/competitions?${qs}` : '/competitions?tab=ranking'} replace />;
}

function LegacyJudgesListRedirect() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  params.set('tab', 'judges');
  return <Navigate to={`/competitions?${params.toString()}`} replace />;
}

function LegacyExhibitionRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/shows/exhibition/${id}`} replace />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/procoursing" element={<LegacyProcoursingRedirect />} />
        <Route path="/shows" element={<Shows />} />
        <Route path="/shows/exhibition/:id" element={<ShowExhibitionDetail />} />
        <Route path="/shows/champions" element={<Navigate to="/shows?tab=ranking" replace />} />
        <Route path="/shows/dog/:dogId/:breed" element={<ShowDogProfile />} />
        <Route path="/exhibition/:id" element={<LegacyExhibitionRedirect />} />
        <Route path="/top" element={<LegacyTopRedirect />} />
        <Route path="/dog/:id" element={<UnifiedDogProfile />} />
        <Route path="/event/:id" element={<Navigate to="/competitions?tab=ranking" replace />} />
        <Route path="/speed-records" element={<SpeedRecords />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/donino-dog/:name/:breed" element={<DoninoDogProfile />} />
        <Route path="/judges" element={<LegacyJudgesListRedirect />} />
        <Route path="/judges/:judgeId" element={<JudgeDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
