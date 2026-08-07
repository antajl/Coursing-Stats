/** Ornamental divider under breed class title (─── ◆ ───) */
export default function BreedGroupDivider() {
  return (
    <div className="my-3 flex items-center gap-3" aria-hidden>
      <span className="h-px flex-1 bg-old-money-200 dark:bg-charcoal-600" />
      <span className="text-[10px] text-old-money-400 dark:text-old-money-500">◆</span>
      <span className="h-px flex-1 bg-old-money-200 dark:bg-charcoal-600" />
    </div>
  )
}
