import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PageLoader from './components/PageLoader';

const Home = lazy(() => import('./pages/Home'));
const Competitions = lazy(() => import('./pages/Competitions'));
const TopDogs = lazy(() => import('./pages/TopDogs'));
const DogProfile = lazy(() => import('./pages/DogProfile'));
const EventResults = lazy(() => import('./pages/Events/EventResults'));
const SpeedRecords = lazy(() => import('./pages/SpeedRecords/index'));
const DoninoDogProfile = lazy(() => import('./pages/DoninoDogProfile'));
const Judges = lazy(() => import('./pages/Judges/index'));
const JudgeDetail = lazy(() => import('./pages/Judges/JudgeDetail'));
const Admin = lazy(() => import('./pages/Admin'));
const EventEdit = lazy(() => import('./pages/Admin/EventEdit'));

function LegacyProcoursingRedirect() {
  const location = useLocation();
  return <Navigate to={`/competitions${location.search}`} replace />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/procoursing" element={<LegacyProcoursingRedirect />} />
        <Route path="/top" element={<TopDogs />} />
        <Route path="/dog/:id" element={<DogProfile />} />
        <Route path="/event/:id" element={<EventResults />} />
        <Route path="/speed-records" element={<SpeedRecords />} />
        <Route path="/donino-dog/:name/:breed" element={<DoninoDogProfile />} />
        <Route path="/judges" element={<Judges />} />
        <Route path="/judges/:judgeId" element={<JudgeDetail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/events/:id" element={<EventEdit />} />
      </Routes>
    </Suspense>
  );
}
