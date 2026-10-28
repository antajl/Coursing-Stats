import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import ModernDropdown from '../ui/ModernDropdown'

interface ToolbarSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  width?: string
}

export default function ToolbarSearch({
  value,
  onChange,
  placeholder = 'Поиск…',
  className = '',
  width = '280px',
}: ToolbarSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasValue = Boolean(value)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
        if (value) {
          inputRef.current?.select()
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen, value])

  const trigger = (
    <button
      type="button"
      className={`inline-flex h-8 shrink-0 items-center justify-center rounded-full border transition-all cursor-pointer shadow-2xs ${
        hasValue
          ? 'border-camel-500 bg-camel-500 text-charcoal-900 px-3 gap-1.5 font-semibold'
          : isOpen
            ? 'border-camel-500 bg-cream-100 text-charcoal-900 w-8'
            : 'border-old-money-200 bg-cream-50 text-charcoal-700 hover:border-camel-500 hover:bg-old-money-50 w-8'
      } ${className}`}
      title={hasValue ? `Поиск: ${value}` : 'Поиск'}
      aria-label={hasValue ? `Поиск: ${value}` : 'Поиск'}
    >
      <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      {hasValue && (
        <>
          <span className="text-xs font-semibold max-w-[110px] truncate">{value}</span>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              onChange('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
                onChange('')
              }
            }}
            className="ml-0.5 -mr-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full hover:bg-black/10 text-charcoal-800 transition-colors"
            title="Очистить"
            aria-label="Очистить"
          >
            <X className="h-3 w-3" strokeWidth={2.5} />
          </span>
        </>
      )}
    </button>
  )

  return (
    <div className="shrink-0">
      <ModernDropdown
        trigger={trigger}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        width={width}
        portal
      >
        <div className="p-2 min-w-[240px]">
          <div className="flex h-9 items-center gap-2 rounded-lg border border-old-money-300 bg-white px-2.5 focus-within:border-camel-500 focus-within:ring-1 focus-within:ring-camel-500/30 transition-all">
            <Search className="h-4 w-4 shrink-0 text-charcoal-400" strokeWidth={2} />
            <input
              ref={inputRef}
              type="text"
              autoFocus
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full min-w-0 border-none bg-transparent text-xs font-medium text-charcoal-800 outline-none placeholder:text-charcoal-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsOpen(false)
                }
              }}
            />
            {hasValue && (
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  inputRef.current?.focus()
                }}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-charcoal-400 hover:bg-old-money-100 hover:text-charcoal-800 transition-colors cursor-pointer"
                title="Очистить поле"
                aria-label="Очистить поле"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </ModernDropdown>
    </div>
  )
}
