/**
 * ARIA audit utility
 * Identifies elements missing ARIA labels or with insufficient labels
 */

export interface AriaIssue {
  element: string
  issue: string
  recommendation: string
}

export function auditAriaLabels(): AriaIssue[] {
  const issues: AriaIssue[] = []

  // Audit buttons without labels
  const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])')
  buttons.forEach(button => {
    if (!button.textContent?.trim()) {
      issues.push({
        element: button.outerHTML,
        issue: 'Button without text content and no aria-label',
        recommendation: 'Add aria-label or aria-labelledby',
      })
    }
  })

  // Audit inputs without labels
  const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby]):not([id])')
  inputs.forEach(input => {
    issues.push({
      element: input.outerHTML,
      issue: 'Input without label association',
      recommendation: 'Add id and corresponding label, or aria-label',
    })
  })

  // Audit images without alt (except decorative)
  const images = document.querySelectorAll('img:not([alt])')
  images.forEach(img => {
    if (!img.hasAttribute('role') || img.getAttribute('role') !== 'presentation') {
      issues.push({
        element: img.outerHTML,
        issue: 'Image without alt attribute',
        recommendation: 'Add alt text or role="presentation" for decorative images',
      })
    }
  })

  return issues
}
