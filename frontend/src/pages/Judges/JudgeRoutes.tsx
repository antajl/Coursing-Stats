import { lazy } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { resolveShowJudgeNumericId, resolveSportJudgeNumericId } from '../../lib/judgeIdMap.generated';

const Shows = lazy(() => import('../Shows'));
const ShowJudgeDetail = lazy(() => import('../Shows/ShowJudgeDetail'));
const JudgeDetail = lazy(() => import('./JudgeDetail'));

export function ShowJudgeRoute() {
  const { judgeId } = useParams<{ judgeId: string }>();
  const location = useLocation();
  if (judgeId === 'all' || (judgeId && /^20\d\d$/.test(judgeId))) {
    return <Shows defaultTab="judges" urlYear={judgeId} />;
  }
  const numericId = resolveShowJudgeNumericId(judgeId);
  if (numericId != null && String(numericId) !== judgeId) {
    return <Navigate to={`/shows/judges/${numericId}/${location.search}`} replace />;
  }
  return <ShowJudgeDetail />;
}

export function SportJudgeRoute() {
  const { judgeId } = useParams<{ judgeId: string }>();
  const location = useLocation();
  const numericId = resolveSportJudgeNumericId(judgeId);
  if (numericId != null && String(numericId) !== judgeId) {
    return <Navigate to={`/judges/${numericId}/${location.search}`} replace />;
  }
  return <JudgeDetail />;
}
