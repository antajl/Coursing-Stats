import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import PageLoader from './components/PageLoader';

const Home = lazy(() => import('./pages/Home'));
const Competitions = lazy(() => import('./pages/Competitions'));
const Shows = lazy(() => import('./pages/Shows'));
const TopDogs = lazy(() => import('./pages/TopDogs'));
const DogProfile = lazy(() => import('./pages/DogProfile'));
const EventResults = lazy(() => import('./pages/Events/EventResults'));
const SpeedRecords = lazy(() => import('./pages/SpeedRecords/index'));
const DoninoDogProfile = lazy(() => import('./pages/DoninoDogProfile'));
const Guide = lazy(() => import('./pages/Guide'));
const Judges = lazy(() => import('./pages/Judges/index'));
const JudgeDetail = lazy(() => import('./pages/Judges/JudgeDetail'));
const ShowExhibitionDetail = lazy(() => import('./pages/Shows/ShowExhibitionDetail'));
const ShowChampions = lazy(() => import('./pages/Shows/ShowChampions'));
const ShowDogProfile = lazy(() => import('./pages/Shows/ShowDogProfile'));
const NotFound = lazy(() => import('./pages/NotFound'));

function LegacyProcoursingRedirect() {
  const location = useLocation();
  return <Navigate to={`/competitions${location.search}`} replace />;
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
        <Route path="/shows/champions" element={<ShowChampions />} />
        <Route path="/shows/dog/:dogId/:breed" element={<ShowDogProfile />} />
        <Route path="/exhibition/:id" element={<LegacyExhibitionRedirect />} />
        <Route path="/top" element={<TopDogs />} />
        <Route path="/dog/:id" element={<DogProfile />} />
        <Route path="/event/:id" element={<Navigate to="/competitions?tab=ranking" replace />} />
        <Route path="/speed-records" element={<SpeedRecords />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/donino-dog/:name/:breed" element={<DoninoDogProfile />} />
        <Route path="/judges" element={<Judges />} />
        <Route path="/judges/:judgeId" element={<JudgeDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
