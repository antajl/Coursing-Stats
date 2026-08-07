/**
 * Parse RKF «Итоговый отчет» PDF into lean dog rows.
 * Uses column X positions so wrapped cells (breed / judge patronymic) stay correct.
 * Stops before «ВЕДОМОСТЬ ГЛАВНОГО РИНГА» (parsed later separately).
 *
 * Implementation lives in ./rkf-cert/ — this file is the stable public barrel.
 */

export type { ParsedCertDog, ParseCertificatePdfResult } from './rkf-cert/types'
export { normalizeCertLookalikes } from '../../lib/show-award-ranking'
export {
  isBreedContinuationLine,
  isBreedFragment,
} from './rkf-cert/breed-carry'
export {
  glueWrappedClassAbbrev,
  disentangleClassAndGrade,
} from './rkf-cert/class-grade'
export {
  isPlausibleJudgeName,
  parseCertificateTokens,
  parseCertificatePdf,
} from './rkf-cert/catalog-dogs'
export type { MainRingCompetitionKey, MainRingRow } from './rkf-cert/main-ring'
export { parseMainRingPdf, parseBisPdf } from './rkf-cert/main-ring'
