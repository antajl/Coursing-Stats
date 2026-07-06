import { Icons } from '../../lib/icons'

interface ToolbarSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function ToolbarSearch({
  value,
  onChange,
  placeholder = 'Поиск…',
  className = '',
}: ToolbarSearchProps) {
  const SearchIcon = Icons.search

  return (
    <div
      className={`flex h-9 w-[280px] max-w-full shrink-0 items-center gap-2 rounded-[10px] border-[1.5px] border-old-money-300 bg-white px-3 dark:border-charcoal-600 dark:bg-charcoal-800 ${className}`}
    >
      <SearchIcon className="h-3.5 w-3.5 shrink-0 text-charcoal-500" strokeWidth={1.75} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 border-none bg-transparent text-xs font-medium text-charcoal-800 outline-none placeholder:text-charcoal-400 dark:text-charcoal-200"
      />
    </div>
  )
}
