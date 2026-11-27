import { toPng } from 'html-to-image'
import type { PassportFormat } from './passportTypes'

export function cleanPassportFileBase(namePrimary?: string | null): string {
  return (namePrimary || 'dog').toLowerCase().replace(/[^a-zа-я0-9]/gi, '_')
}

export async function renderPassportPng(
  node: HTMLElement,
  baseWidth: number,
  quality: number,
): Promise<string> {
  return toPng(node, {
    quality,
    pixelRatio: 2,
    cacheBust: true,
    width: baseWidth,
    height: node.offsetHeight || undefined,
  })
}

export function triggerPngDownload(dataUrl: string, namePrimary: string, format: PassportFormat) {
  const link = document.createElement('a')
  link.download = `${cleanPassportFileBase(namePrimary)}_passport_${format}.png`
  link.href = dataUrl
  link.click()
}
