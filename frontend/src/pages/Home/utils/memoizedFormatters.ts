import { useCallback } from 'react'
import {
  formatStarts,
  formatScore,
  formatIndex,
  formatSpeed,
  formatDate,
} from './formatters'

export function useMemoizedFormatters() {
  return {
    formatStarts: useCallback(formatStarts, []),
    formatScore: useCallback(formatScore, []),
    formatIndex: useCallback(formatIndex, []),
    formatSpeed: useCallback(formatSpeed, []),
    formatDate: useCallback(formatDate, []),
  }
}
