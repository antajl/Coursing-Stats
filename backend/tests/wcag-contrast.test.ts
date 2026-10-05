import { describe, it, expect } from 'vitest'

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

function luminance(r: number, g: number, b: number): number {
  const [a, bNorm, c] = [r, g, b].map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a * 0.2126 + bNorm * 0.7152 + c * 0.0722
}

function contrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)
  const lum1 = luminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = luminance(rgb2.r, rgb2.g, rgb2.b)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

describe('Design Tokens WCAG AA Compliance', () => {
  const colors = {
    om100: '#f3ede4',
    cream100: '#f7f2ea',
    char900: '#252320',
    char800: '#38342f',
    char700: '#4d4740',
    char100: '#ecebe7',
    char300: '#bcb7ad',
    camel300: '#d8b57a',
    camel400: '#c79c56',
    camel500: '#b68231',
    camel600: '#9b6720',
    camel700: '#7b511c',
  }

  it('light mode: primary text (charcoal-900 on om-100) satisfies WCAG AA (>= 4.5:1)', () => {
    const ratio = contrastRatio(colors.char900, colors.om100)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('light mode: accessible links (camel-700 on om-100) satisfies WCAG AA (>= 4.5:1)', () => {
    const ratio = contrastRatio(colors.camel700, colors.om100)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('light mode: focus indicator (camel-600 on om-100) satisfies WCAG 2.1 Non-Text (>= 3.0:1)', () => {
    const ratio = contrastRatio(colors.camel600, colors.om100)
    expect(ratio).toBeGreaterThanOrEqual(3.0)
  })

  it('dark mode: primary text (char-100 on char-900) satisfies WCAG AA (>= 4.5:1)', () => {
    const ratio = contrastRatio(colors.char100, colors.char900)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('dark mode: secondary text (char-300 on char-900) satisfies WCAG AA (>= 4.5:1)', () => {
    const ratio = contrastRatio(colors.char300, colors.char900)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('dark mode: accent text (camel-400 on char-900) satisfies WCAG AA (>= 4.5:1)', () => {
    const ratio = contrastRatio(colors.camel400, colors.char900)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })
})
