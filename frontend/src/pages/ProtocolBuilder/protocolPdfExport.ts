import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import type { CompetitionHeader } from './types'

export function printProtocol(title?: string): void {
  const originalTitle = document.title
  document.title = title ? `${title} — Результаты` : 'Протокол соревнований'
  window.print()
  setTimeout(() => {
    document.title = originalTitle
  }, 1000)
}

export async function exportToPDF(
  element: HTMLElement,
  header: CompetitionHeader,
  onFallbackPrint: () => void
): Promise<void> {
  try {
    const canvas = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff'
    })

    const img = new Image()
    img.src = canvas
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(true)
      img.onerror = reject
    })

    // Альбомная ориентация для широких таблиц результатов
    const isLandscape = img.width > img.height * 1.15
    const orientation = isLandscape ? 'landscape' : 'portrait'
    const pdf = new jsPDF(orientation, 'mm', 'a4')

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 8
    const contentWidth = pageWidth - margin * 2
    const contentHeight = (img.height * contentWidth) / img.width
    const usableHeight = pageHeight - margin * 2

    if (contentHeight <= usableHeight) {
      pdf.addImage(canvas, 'PNG', margin, margin, contentWidth, contentHeight)
    } else {
      let heightLeft = contentHeight
      let position = margin

      pdf.addImage(canvas, 'PNG', margin, position, contentWidth, contentHeight)
      heightLeft -= usableHeight

      while (heightLeft > 0) {
        position -= usableHeight
        pdf.addPage()
        pdf.addImage(canvas, 'PNG', margin, position, contentWidth, contentHeight)
        heightLeft -= usableHeight
      }
    }

    const safeName = (header.title || 'protocol')
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]+/gi, '_')
      .replace(/^_+|_+$/g, '')
    pdf.save(`${safeName || 'protocol'}_${header.date || 'results'}.pdf`)
  } catch (err) {
    console.error('PDF export failed:', err)
    onFallbackPrint()
  }
}
