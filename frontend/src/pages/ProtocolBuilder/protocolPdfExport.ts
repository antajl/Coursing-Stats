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

/**
 * Computes safe vertical image-pixel slice intervals so PDF page breaks
 * land strictly between [data-pdf-block] elements (table rows / headers),
 * never cutting a participant row horizontally across pages.
 */
export function computeSafePdfPageSlices(
  totalHeightPx: number,
  maxPageHeightPx: number,
  blockBoundsPx: Array<{ top: number; bottom: number }>
): Array<{ startY: number; endY: number }> {
  if (totalHeightPx <= maxPageHeightPx || totalHeightPx <= 0) {
    return [{ startY: 0, endY: Math.max(1, totalHeightPx) }]
  }

  const safeBoundaries = Array.from(
    new Set([0, ...blockBoundsPx.map((b) => Math.round(b.bottom)), totalHeightPx])
  )
    .filter((y) => y >= 0 && y <= totalHeightPx)
    .sort((a, b) => a - b)

  const slices: Array<{ startY: number; endY: number }> = []
  let currentStart = 0

  while (currentStart < totalHeightPx - 1) {
    const targetEnd = currentStart + maxPageHeightPx
    if (targetEnd >= totalHeightPx) {
      slices.push({ startY: currentStart, endY: totalHeightPx })
      break
    }

    let chosenCut = -1
    for (let i = safeBoundaries.length - 1; i >= 0; i--) {
      const y = safeBoundaries[i]
      if (y > currentStart + 24 && y <= targetEnd) {
        chosenCut = y
        break
      }
    }

    if (chosenCut <= currentStart) {
      chosenCut = Math.min(totalHeightPx, Math.round(targetEnd))
    }

    slices.push({ startY: currentStart, endY: chosenCut })
    currentStart = chosenCut
  }

  return slices
}

export async function exportToPDF(
  element: HTMLElement,
  header: CompetitionHeader,
  onFallbackPrint: () => void
): Promise<void> {
  try {
    const rootRect = element.getBoundingClientRect()
    const domBlocks = Array.from(element.querySelectorAll<HTMLElement>('[data-pdf-block]')).map((el) => {
      const r = el.getBoundingClientRect()
      return {
        top: r.top - rootRect.top,
        bottom: r.bottom - rootRect.top,
      }
    })

    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    })

    const img = new Image()
    img.src = dataUrl
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(true)
      img.onerror = reject
    })

    const scale = rootRect.height > 0 ? img.height / rootRect.height : 2
    const scaledBlocks = domBlocks.map((b) => ({
      top: b.top * scale,
      bottom: b.bottom * scale,
    }))

    const isLandscape = img.width > img.height * 1.15
    const orientation = isLandscape ? 'landscape' : 'portrait'
    const pdf = new jsPDF(orientation, 'mm', 'a4')

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 8
    const contentWidth = pageWidth - margin * 2
    const usableHeightMm = pageHeight - margin * 2
    const mmPerImgPx = contentWidth / img.width
    const maxPageHeightPx = usableHeightMm / mmPerImgPx

    const slices = computeSafePdfPageSlices(img.height, maxPageHeightPx, scaledBlocks)
    const sliceCanvas = document.createElement('canvas')
    const ctx = sliceCanvas.getContext('2d')

    slices.forEach((slice, idx) => {
      if (idx > 0) pdf.addPage()
      const sliceH = Math.max(1, Math.round(slice.endY - slice.startY))
      sliceCanvas.width = img.width
      sliceCanvas.height = sliceH

      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, img.width, sliceH)
        ctx.drawImage(img, 0, slice.startY, img.width, sliceH, 0, 0, img.width, sliceH)
        const sliceDataUrl = sliceCanvas.toDataURL('image/png')
        const sliceMmH = sliceH * mmPerImgPx
        pdf.addImage(sliceDataUrl, 'PNG', margin, margin, contentWidth, sliceMmH)
      }
    })

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
