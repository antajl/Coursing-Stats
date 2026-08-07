/**
 * Discipline split for detail panels:
 * - racing: separate RacingDetail (time/speed heats)
 * - coursing + bzmp: shared ScoringDetail (judge scores — identical UI)
 * - other/unknown: returns null when raw scores have no displayable content
 *
 * Do NOT split coursing vs bzmp into separate files — their judge-score UI is the same.
 */
import type { RawScores, Result } from '../types'
import { hasDisplayableRawScores, isRacingFormat } from '../utils'
import RacingDetail from './RacingDetail'
import ScoringDetail from './ScoringDetail'

interface DetailPanelProps {
  rawScores: RawScores | null
  result: Result
}

export default function DetailPanel({ rawScores, result }: DetailPanelProps) {
  if (!hasDisplayableRawScores(rawScores)) {
    return null
  }

  if (isRacingFormat(rawScores)) {
    return <RacingDetail rawScores={rawScores!} />
  }

  return <ScoringDetail rawScores={rawScores!} result={result} />
}
