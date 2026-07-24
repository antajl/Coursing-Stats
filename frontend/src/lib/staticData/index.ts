/**
 * Публичный слой чтения статических JSON с CDN (`/data/v1`) — без Worker/D1.
 *
 * В dev эти же пути отдаёт Vite (см. vite.config.ts, serveDataV1) из `../data/v1`.
 * В prod — Cloudflare Pages (копия data/v1 в frontend/public/data/v1 при build-all-data).
 *
 * Разбит по доменам: core / competitions / rankings / donino / judges / dogs / shows.
 * Импорт снаружи: `from '../lib/staticData'` (barrel).
 */

export {
  DATA_BASE,
  type ApiResult,
  fetchJson,
  clearStaticJsonCache,
  paginateItems,
  judgeDetailKey,
  sortPlacementItems,
  sortScoreItems,
} from './core'

export {
  getStats,
  getBreeds,
  getYears,
  getEvents,
  getEvent,
  getEventResults,
} from './competitions'

export { getTopPlacement, getTopScore, getTopSpeed } from './rankings'

export {
  getSpeedRecords,
  getCoursingRecords,
  getSpeedRecordsTopByBreed,
  getCoursingRecordsTopByBreed,
  getDoninoDog,
} from './donino'

export { getJudges, getJudgeDetails } from './judges'

export { getDogProfile, getDogEvents } from './dogs'

export {
  getShowCalendar,
  getShowRkfCalendar,
  getShowRkfCalendarYears,
  getShowExhibition,
  getShowDogRanking,
  getShowDogDetail,
  resolveShowDogDetail,
  getShowJudges,
  getShowJudgeDetails,
  getShowJudgesStrictnessBaseline,
  getShowHeroStats,
  getShowHomeTop,
  type ShowJudge,
  type ShowJudgeDetail,
  type ShowHeroStats,
  type ShowHomeTopDog,
  type ShowRkfCalendarEntry,
  type ShowJudgesStrictnessBaseline,
} from './shows'
