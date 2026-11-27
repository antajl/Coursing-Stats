import React from 'react'
import { Download, Share2, Check, Copy } from 'lucide-react'

interface PassportFooterActionsProps {
  exporting: boolean
  copied: boolean
  downloaded: boolean
  onCopy: () => void
  onShare: () => void
  onDownload: () => void
}

export const PassportFooterActions: React.FC<PassportFooterActionsProps> = ({
  exporting,
  copied,
  downloaded,
  onCopy,
  onShare,
  onDownload,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-old-money-200 px-4 sm:px-6 py-3 bg-white shrink-0">
      <div className="text-xs text-charcoal-500">
        Изображение формируется локально в высоком разрешении (2x Retina)
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCopy}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 rounded-xl border border-old-money-300 bg-cream-50 px-3 sm:px-4 py-2 text-xs font-semibold text-charcoal-900 hover:bg-cream-100 transition-all disabled:opacity-50 cursor-pointer min-h-[44px] sm:min-h-[38px] touch-manipulation"
          title="Скопировать изображение в буфер обмена для быстрой отправки в Telegram или чаты"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-forest-700" aria-hidden />
              <span className="text-forest-700">Скопировано!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-camel-700" aria-hidden />
              <span>Скопировать</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onShare}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 rounded-xl border border-old-money-300 bg-cream-50 px-3 sm:px-4 py-2 text-xs font-semibold text-charcoal-900 hover:bg-cream-100 transition-all disabled:opacity-50 cursor-pointer min-h-[44px] sm:min-h-[38px] touch-manipulation"
          title="Поделиться в Telegram или сохранить файл"
        >
          <Share2 className="h-3.5 w-3.5 text-camel-700" aria-hidden />
          <span>Поделиться</span>
        </button>

        <button
          type="button"
          onClick={onDownload}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 rounded-xl border border-camel-700 bg-camel-700 px-4 sm:px-5 py-2 text-xs font-semibold text-white hover:bg-camel-800 transition-all disabled:opacity-50 shadow-xs cursor-pointer min-h-[44px] sm:min-h-[38px] touch-manipulation"
          title="Скачать PNG на устройство"
        >
          {downloaded ? (
            <>
              <Check className="h-3.5 w-3.5 text-white" aria-hidden />
              <span>Сохранено</span>
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5 text-white" aria-hidden />
              <span>{exporting ? 'Сохранение...' : 'Скачать PNG'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
