/** Ornamental divider under breed class title (─── ◆ ───) */
export default function BreedGroupDivider() {
  return (
    <div className="my-3 flex items-center gap-3" aria-hidden>
      <span className="h-px flex-1 bg-old-money-200" />
      <span className="text-[10px] text-old-money-400">◆</span>
      <span className="h-px flex-1 bg-old-money-200" />
    </div>
  )
}
