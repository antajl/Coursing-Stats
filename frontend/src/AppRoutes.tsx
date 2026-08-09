import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import PageLoader from './components/PageLoader';
import { isLocalDev } from './lib/env';
import { usePublicCalendarVisible } from './hooks/useStaticData';

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
const ShowJudgeDetail = lazy(() => import('./pages/Shows/ShowJudgeDetail'));
const EventResults = lazy(() => import('./pages/Events/EventResults'));
const AdminEventsList = lazy(() => import('./pages/Admin/AdminEventsList'));
const AdminEventEditor = lazy(() => import('./pages/Admin/AdminEventEditor'));
const NotFound = lazy(() => import('./pages/NotFound'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AccountPage = lazy(() => import('./pages/Account'));
const AccountSettingsPage = lazy(() => import('./pages/Account/AccountSettings'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));

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
  if (!isLocalDev) return <Navigate to="/shows" replace />;
  return <Navigate to={`/shows/exhibition/${id}`} replace />;
}

function AdminCalendarRedirect() {
  const calendarVisible = usePublicCalendarVisible('competitions');
  return (
    <Navigate
      to={calendarVisible ? '/competitions?tab=calendar' : '/competitions?tab=ranking'}
      replace
    />
  );
}

function ShowDogIdRedirect() {
  const { id } = useParams<{ id: string }>();
  const [redirectId, setRedirectId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!id) return;
    
    let cancelled = false;
    
    // Load migrations and check if this ID needs redirect
    fetch('/data/v1/shows/id-migrations.json')
      .then(res => res.json())
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
    return <Navigate to={`/dog/${redirectId}`} replace />;
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
        <Route path="/admin" element={<AdminEventsList />} />
        <Route path="/admin/calendar" element={<AdminCalendarRedirect />} />
        <Route path="/admin/event/:id" element={<AdminEventEditor />} />
        <Route path="/speed-records" element={<SpeedRecords />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/donino-dog/:name/:breed" element={<DoninoDogProfile />} />
        <Route path="/judges" element={<LegacyJudgesListRedirect />} />
        <Route path="/judges/:judgeId" element={<JudgeDetail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/settings" element={<AccountSettingsPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
