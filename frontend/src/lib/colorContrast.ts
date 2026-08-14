/**
 * Color contrast verification for WCAG AA compliance
 * AA requires 4.5:1 for normal text, 3:1 for large text
 */

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

export function luminance(r: number, g: number, b: number): number {
  const [a, bNorm, c] = [r, g, b].map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a * 0.2126 + bNorm * 0.7152 + c * 0.0722
}

export function contrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)
  const lum1 = luminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = luminance(rgb2.r, rgb2.g, rgb2.b)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

export function verifyWCAGAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = contrastRatio(foreground, background)
  const required = isLargeText ? 3 : 4.5
  return ratio >= required
}
