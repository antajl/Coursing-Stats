import { useState, useCallback } from 'react'
import { Check, Copy } from 'lucide-react'
import { TOOLBAR_CHIP } from '../../lib/toolbar'

interface CopySeasonSummaryButtonProps {
  text: string
  label?: string
  title?: string
}

/**
 * Компактная кнопка копирования текстовой сводки Топ-3 сезона/породы в один клик.
 */
export function CopySeasonSummaryButton({
  text,
  label = 'Топ-3',
  title = 'Скопировать сводку Топ-3 для чата',
}: CopySeasonSummaryButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!text) return
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      }
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback ignored if clipboard blocked
    }
  }, [text])

  if (!text) return null

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={`${TOOLBAR_CHIP} shrink-0 whitespace-nowrap ${
        copied
          ? '!border-forest-400 !bg-forest-50 !text-forest-800'
          : 'cs-glass-pill text-charcoal-700 hover:text-charcoal-950'
      }`}
      title={copied ? 'Сводка скопирована' : title}
      aria-label={copied ? 'Сводка скопирована' : title}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-forest-700" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 text-camel-700" aria-hidden />
      )}
      <span>{copied ? 'Скопировано' : label}</span>
    </button>
  )
}
