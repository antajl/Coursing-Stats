import { useState, useRef } from 'react'
import { toPng } from 'html-to-image'

export interface UseDogProfileExportProps {
  dogNameLat?: string
  showDogNameLat?: string
}

export function useDogProfileExport({
  dogNameLat,
  showDogNameLat,
}: UseDogProfileExportProps = {}) {
  const [exporting, setExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const handleExport = async () => {
    if (!exportRef.current || exporting) return
    try {
      setExporting(true)
      const dataUrl = await toPng(exportRef.current, {
        quality: 1,
        pixelRatio: 2,
        filter: (node) =>
          !(node instanceof HTMLElement && node.dataset.exportIgnore !== undefined),
      })
      const link = document.createElement('a')
      link.download = `${(dogNameLat || showDogNameLat || 'dog').replace(/\s+/g, '_')}_profile.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  return {
    exporting,
    exportRef,
    handleExport,
  }
}
