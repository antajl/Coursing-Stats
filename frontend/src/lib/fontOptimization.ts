/**
 * Font optimization utilities
 * Preloads only the font weights actually used in the application
 */

export function preloadOptimizedFonts() {
  if (typeof document === 'undefined') return

  // Based on audit, we use Montserrat with weights: 400, 500, 600, 700
  // Weight 300 (light) is not used in the codebase
  const fonts = [
    {
      href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Montserrat:ital,wght@1,400&display=swap',
      as: 'style',
      type: 'text/css',
      crossorigin: 'anonymous',
    },
  ]

  fonts.forEach(font => {
    // Check if link already exists
    const existing = document.querySelector(`link[href="${font.href}"]`)
    if (existing) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = font.href
    link.as = font.as
    if (font.type) link.type = font.type
    if (font.crossorigin) link.crossOrigin = font.crossorigin
    document.head.appendChild(link)
  })
}

export function waitForFontsToLoad(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()

  // Use native browser API instead of FontFaceObserver library
  return document.fonts.ready.then(() => {
    // All fonts are loaded
  })
}
