import { createPortal } from 'react-dom'
import { X, ExternalLink } from 'lucide-react'

interface JudgePhotoModalProps {
  isOpen: boolean
  onClose: () => void
  photoUrl: string
  displayName: string
  konuraUrl?: string | null
}

export function JudgePhotoModal({
  isOpen,
  onClose,
  photoUrl,
  displayName,
  konuraUrl,
}: JudgePhotoModalProps) {
  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 select-none animate-in fade-in duration-200"
      style={{ transform: 'translateZ(0)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Фотография судьи ${displayName}`}
    >
      {/* Полноэкранный кликабельный оверлей для надежного закрытия по тапу в любом месте фона */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-pointer bg-transparent border-none p-0 -z-10 focus:outline-hidden"
        aria-label="Закрыть фото"
        tabIndex={-1}
      />

      {/* Fixed close button */}
      <button
        type="button"
        onClick={onClose}
        className="fixed z-[110] flex items-center justify-center gap-1.5 rounded-full border border-white/25 bg-black/80 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-sm transition-transform active:scale-95 hover:bg-black/95 cursor-pointer min-h-[44px] min-w-[44px]"
        style={{
          top: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))',
          right: 'max(0.75rem, env(safe-area-inset-right, 0.75rem))',
        }}
        aria-label="Закрыть фото"
      >
        <X className="h-5 w-5 text-white" aria-hidden />
        <span className="hidden sm:inline">Закрыть</span>
      </button>

      <div
        className="relative max-h-[85dvh] max-w-[95vw] sm:max-w-xl flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Крупное портретное фото судьи */}
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-charcoal-900 shadow-2xl flex items-center justify-center">
          <img
            src={photoUrl}
            alt={displayName}
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="async"
            className="w-[min(88vw,320px)] sm:w-[380px] md:w-[440px] h-auto max-h-[72dvh] sm:max-h-[78dvh] object-contain select-none block"
          />
        </div>

        {/* 2-line caption: Line 1 = Judge Name, Line 2 = Photo Source */}
        <div className="mt-3.5 flex flex-col items-center text-center gap-1 w-full px-2">
          <span className="font-semibold text-base sm:text-lg text-white tracking-tight drop-shadow-sm">
            {displayName}
          </span>
          {konuraUrl && (
            <a
              href={konuraUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-camel-300 hover:text-white transition-colors underline-offset-2 hover:underline"
            >
              <span>Источник фото: konura.info</span>
              <ExternalLink className="h-3.5 w-3.5 text-camel-400" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
