import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PageLoader from './components/PageLoader';

const Home = lazy(() => import('./pages/Home'));
const Procoursing = lazy(() => import('./pages/Procoursing'));
const TopDogs = lazy(() => import('./pages/TopDogs'));
const DogProfile = lazy(() => import('./pages/DogProfile'));
const EventResults = lazy(() => import('./pages/Events/EventResults'));
const SpeedRecords = lazy(() => import('./pages/SpeedRecords/index'));
const DoninoDogProfile = lazy(() => import('./pages/DoninoDogProfile'));
const Judges = lazy(() => import('./pages/Judges/index'));
const JudgeDetail = lazy(() => import('./pages/Judges/JudgeDetail'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/procoursing" element={<Procoursing />} />
        <Route path="/top" element={<TopDogs />} />
        <Route path="/dog/:id" element={<DogProfile />} />
        <Route path="/event/:id" element={<EventResults />} />
        <Route path="/speed-records" element={<SpeedRecords />} />
        <Route path="/donino-dog/:name/:breed" element={<DoninoDogProfile />} />
        <Route path="/judges" element={<Judges />} />
        <Route path="/judges/:judgeId" element={<JudgeDetail />} />
      </Routes>
    </Suspense>
  );
}
