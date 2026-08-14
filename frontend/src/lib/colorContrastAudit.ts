/**
 * Color contrast audit for common UI combinations
 * Run in browser console: import('./lib/colorContrastAudit').then(m => m.runAudit())
 */

import { verifyWCAGAA, contrastRatio } from './colorContrast'

interface ColorPair {
  fg: string
  bg: string
  label: string
  isLargeText?: boolean
}

const colorPairs: ColorPair[] = [
  // Light mode - primary text combinations
  { fg: '#433a31', bg: '#f3ede4', label: 'charcoal-900 on om-100' },
  { fg: '#81796e', bg: '#f3ede4', label: 'charcoal-500 on om-100' },
  { fg: '#b68231', bg: '#f3ede4', label: 'camel-500 on om-100' },
  { fg: '#9b6720', bg: '#f3ede4', label: 'camel-600 on om-100' },
  { fg: '#7b511c', bg: '#f3ede4', label: 'camel-700 on om-100' },

  // Light mode - secondary text
  { fg: '#81796e', bg: '#f7f2ea', label: 'charcoal-500 on cream-100' },
  { fg: '#433a31', bg: '#f7f2ea', label: 'charcoal-900 on cream-100' },

  // Dark mode - primary text combinations
  { fg: '#ecebe7', bg: '#252320', label: 'char-100 on char-900' },
  { fg: '#bcb7ad', bg: '#252320', label: 'char-300 on char-900' },
  { fg: '#d8b57a', bg: '#252320', label: 'camel-300 on char-900' },
  { fg: '#c79c56', bg: '#252320', label: 'camel-400 on char-900' },
  { fg: '#b68231', bg: '#252320', label: 'camel-500 on char-900' },

  // Dark mode - secondary text
  { fg: '#bcb7ad', bg: '#38342f', label: 'char-300 on char-800' },
  { fg: '#81796e', bg: '#38342f', label: 'charcoal-500 on char-800' },

  // Focus indicators
  { fg: '#9b6720', bg: '#f3ede4', label: 'camel-600 focus on om-100' },
  { fg: '#c79c56', bg: '#252320', label: 'camel-400 focus on char-900' },

  // Links
  { fg: '#b68231', bg: '#f3ede4', label: 'camel-500 link on om-100' },
  { fg: '#c79c56', bg: '#252320', label: 'camel-400 link on char-900' },
]

export function runAudit() {
  console.group('Color Contrast Audit (WCAG AA)')
  let failures = 0

  colorPairs.forEach(pair => {
    const ratio = contrastRatio(pair.fg, pair.bg)
    const required = pair.isLargeText ? 3 : 4.5
    const passes = ratio >= required

    if (!passes) {
      failures++
      console.warn(`❌ ${pair.label}: ${ratio.toFixed(2)}:1 (required ${required}:1)`)
    } else {
      console.log(`✅ ${pair.label}: ${ratio.toFixed(2)}:1 (required ${required}:1)`)
    }
  })

  console.log(`\nTotal: ${colorPairs.length}, Passed: ${colorPairs.length - failures}, Failed: ${failures}`)
  console.groupEnd()

  return { total: colorPairs.length, passed: colorPairs.length - failures, failed: failures }
}

// Auto-run in development
if (import.meta.env.DEV) {
  window.addEventListener('load', () => {
    setTimeout(() => runAudit(), 1000)
  })
}
