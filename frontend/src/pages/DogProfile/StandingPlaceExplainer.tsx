import { Link } from 'react-router-dom'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { computeCoursingRatingScore } from '../../../../backend/lib/rating/coursing-rating-score'

export type RankDomain = 'coursing' | 'racing' | 'shows'

export type StandingExplainerScope = 'overall' | 'year' | 'breed' | 'yearBreed'

/** Shared snapshot of places in the header grid + domain stats. */
export type StandingExplainerInput = {
  rank?: number | null
  yearRank?: number | null
  breedRank?: number | null
  yearBreedRank?: number | null
  // coursing
  gold?: number
  silver?: number
  bronze?: number
  total_starts?: number
  avg_judge_score?: number | null
  best_judge_score?: number | null
  judge_eval_count?: number | null
  elo_rating?: number | null
  elo_races?: number | null
  // racing
  best_speed?: number | null
  avg_speed?: number | null
  racing_starts?: number
  racing_gold?: number
  racing_silver?: number
  racing_bronze?: number
  // shows
  total_shows?: number
  rank_score?: number | null
  best_award?: string | null
  best_grade?: string | null
}

function formatCs(input: StandingExplainerInput): string | null {
  const n =
    input.judge_eval_count != null && input.judge_eval_count > 0
      ? input.judge_eval_count
      : input.avg_judge_score != null && (input.total_starts ?? 0) > 0
        ? input.total_starts!
        : 0
  const cs = computeCoursingRatingScore({
    avg_judge_score: input.avg_judge_score,
    best_judge_score: input.best_judge_score,
    total_starts: input.total_starts,
    judge_eval_count: n,
  })
  return cs != null ? cs.toFixed(2) : null
}

function domainLabel(domain: RankDomain): string {
  if (domain === 'coursing') return 'курсинг/БЗМП'
  if (domain === 'racing') return 'беги'
  return 'выставки'
}

function scopeTitle(domain: RankDomain, scope: StandingExplainerScope, place: number): string {
  const d = domainLabel(domain)
  switch (scope) {
    case 'overall':
      return `Почему общее место #${place} (${d})`
    case 'year':
      return `Почему место за год #${place} (${d})`
    case 'breed':
      return `Почему место в породе #${place} (${d})`
    case 'yearBreed':
      return `Почему место в породе за год #${place} (${d})`
  }
}

function scopeLead(domain: RankDomain, scope: StandingExplainerScope): string {
  if (domain === 'coursing') {
    switch (scope) {
      case 'overall':
        return 'Общий список курсинга/БЗМП. Порядок задаёт зачёт сезона:'
      case 'year':
        return 'Список за год. Порядок — зачёт сезона в этом году:'
      case 'breed':
        return 'Только эта порода (все годы). Порядок тот же:'
      case 'yearBreed':
        return 'Порода + год. Порядок тот же:'
    }
  }
  if (domain === 'racing') {
    switch (scope) {
      case 'overall':
        return 'Рейтинг бегов — по лучшей скорости (км/ч), не по медалям курсинга:'
      case 'year':
        return 'Бега за год — по лучшей скорости в этом году:'
      case 'breed':
        return 'Бега в породе — по лучшей скорости среди своих:'
      case 'yearBreed':
        return 'Бега: порода + год — по лучшей скорости:'
    }
  }
  switch (scope) {
    case 'overall':
      return 'Рейтинг выставок строится по выставочным наградам (rank score), не по спорту:'
    case 'year':
      return 'Выставки за год — по наградам этого сезона:'
    case 'breed':
      return 'Выставки в породе — среди собак этой породы:'
    case 'yearBreed':
      return 'Выставки: порода + год:'
  }
}

function HeaderPlacesLine({ data }: { data: StandingExplainerInput }) {
  const parts: ReactNode[] = []
  if (data.rank != null) parts.push(<>общий <strong>#{data.rank}</strong></>)
  if (data.yearRank != null) parts.push(<>год <strong>#{data.yearRank}</strong></>)
  if (data.breedRank != null) parts.push(<>порода <strong>#{data.breedRank}</strong></>)
  if (data.yearBreedRank != null) parts.push(<>пор./год <strong>#{data.yearBreedRank}</strong></>)
  if (parts.length === 0) return null
  return (
    <p className="border-t border-old-money-200/80 pt-2 text-[11px] leading-snug text-charcoal-600 dark:border-charcoal-600 dark:text-charcoal-300">
      В шапке:{' '}
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 ? ' · ' : null}
          {p}
        </span>
      ))}
      .
    </p>
  )
}

function CoursingBody({ data, scope }: { data: StandingExplainerInput; scope: StandingExplainerScope }) {
  const gold = data.gold ?? 0
  const silver = data.silver ?? 0
  const bronze = data.bronze ?? 0
  const starts = data.total_starts ?? 0
  const cs = formatCs(data)
  const elo = data.elo_rating
  return (
    <ol className="list-decimal space-y-1.5 pl-4 text-[11px] leading-snug text-charcoal-700 dark:text-charcoal-200">
      <li>
        <strong>Медали</strong> — главный ключ: {gold} зол. / {silver} сер. / {bronze} бр.
        {starts > 0 ? (
          <>
            {' '}
            за <strong>{starts}</strong> стартов
            {scope === 'overall' || scope === 'breed' ? ' (карьера)' : ''}.
          </>
        ) : null}
      </li>
      <li>
        <strong>CS</strong> — тай-брейк при равных медалях
        {cs != null ? (
          <>
            {' '}
            (≈ <strong>{cs}</strong>)
          </>
        ) : null}
        .
      </li>
      <li>
        <strong>Elo</strong>
        {elo != null ? (
          <>
            {' '}
            <strong>{elo}</strong>
          </>
        ) : null}{' '}
        — справка, <strong>на место не влияет</strong>.
      </li>
    </ol>
  )
}

function RacingBody({ data }: { data: StandingExplainerInput }) {
  const best = data.best_speed
  const avg = data.avg_speed
  const starts = data.racing_starts ?? 0
  return (
    <ol className="list-decimal space-y-1.5 pl-4 text-[11px] leading-snug text-charcoal-700 dark:text-charcoal-200">
      <li>
        Место в бегах задаёт <strong>лучшая скорость</strong>
        {best != null ? (
          <>
            : сейчас <strong>{Number(best).toFixed(1)} км/ч</strong>
          </>
        ) : (
          <> (км/ч)</>
        )}
        .
      </li>
      {avg != null ? (
        <li>
          Средняя скорость: <strong>{Number(avg).toFixed(1)} км/ч</strong>
          {starts > 0 ? (
            <>
              {' '}
              · стартов: <strong>{starts}</strong>
            </>
          ) : null}
          .
        </li>
      ) : starts > 0 ? (
        <li>
          Стартов в бегах: <strong>{starts}</strong>.
        </li>
      ) : null}
      <li>Медали курсинга и Elo на порядок в колонке «Бега» не влияют.</li>
    </ol>
  )
}

function ShowsBody({ data }: { data: StandingExplainerInput }) {
  return (
    <ol className="list-decimal space-y-1.5 pl-4 text-[11px] leading-snug text-charcoal-700 dark:text-charcoal-200">
      <li>
        Место считается по <strong>выставочному rank score</strong> (награды CAC/CACIB и др.), отдельно от спорта.
      </li>
      {data.total_shows != null && data.total_shows > 0 ? (
        <li>
          Выставок в данных: <strong>{data.total_shows}</strong>
          {data.rank_score != null ? (
            <>
              {' '}
              · score ≈ <strong>{Number(data.rank_score).toFixed(1)}</strong>
            </>
          ) : null}
          .
        </li>
      ) : null}
      {(data.best_award || data.best_grade) && (
        <li>
          Лучшее в карточке:
          {data.best_award ? (
            <>
              {' '}
              награда <strong>{data.best_award}</strong>
            </>
          ) : null}
          {data.best_grade ? (
            <>
              {data.best_award ? ',' : ''} оценка <strong>{data.best_grade}</strong>
            </>
          ) : null}
          .
        </li>
      )}
      <li>Курсинг/беги на место в колонке «Выставки» не влияют.</li>
    </ol>
  )
}

function StandingExplainerBody({
  domain,
  data,
  scope,
  place,
  onClose,
}: {
  domain: RankDomain
  data: StandingExplainerInput
  scope: StandingExplainerScope
  place: number
  onClose: () => void
}) {
  const guideTab = domain === 'shows' ? 'titles' : 'rating'
  const guideLabel = domain === 'shows' ? 'Справочнике → Титулы' : 'Справочнике → Рейтинг'

  return (
    <div className="max-w-[19rem] space-y-2.5 text-left">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-semibold leading-tight text-charcoal-900 dark:text-charcoal-50">
          {scopeTitle(domain, scope, place)}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-0.5 text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-200"
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
      <p className="text-[11px] leading-snug text-charcoal-700 dark:text-charcoal-200">
        {scopeLead(domain, scope)}
      </p>
      {domain === 'coursing' ? (
        <CoursingBody data={data} scope={scope} />
      ) : domain === 'racing' ? (
        <RacingBody data={data} />
      ) : (
        <ShowsBody data={data} />
      )}
      <HeaderPlacesLine data={data} />
      <p className="text-[11px] leading-snug text-charcoal-600 dark:text-charcoal-300">
        Подробнее — в{' '}
        <Link
          to={`/guide?tab=${guideTab}`}
          onClick={onClose}
          className="font-semibold text-camel-700 underline underline-offset-2 hover:text-camel-800 dark:text-camel-400"
        >
          {guideLabel}
        </Link>
        .
      </p>
    </div>
  )
}

/** Клик по #N открывает панель (не hover). */
export default function StandingPlaceButton({
  value,
  className,
  data,
  scope,
  domain,
}: {
  value: number | null | undefined
  className?: string
  data: StandingExplainerInput
  scope: StandingExplainerScope
  domain: RankDomain
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const tipId = useId()

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (value == null) {
    return <span className={className}>—</span>
  }

  const updateCoords = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setCoords({ top: rect.bottom + 8, left: Math.min(rect.left + rect.width / 2, window.innerWidth - 160) })
  }

  const toggle = () => {
    if (!open) updateCoords()
    setOpen((v) => !v)
  }

  const panel =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={panelRef}
            id={tipId}
            role="dialog"
            aria-label={scopeTitle(domain, scope, value)}
            className="fixed min-w-[15.5rem] max-w-[19rem] -translate-x-1/2 rounded-lg border border-old-money-300 bg-cream-50 px-3 py-2.5 text-[11px] font-normal text-charcoal-800 shadow-lg dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-100"
            style={{ top: coords.top, left: coords.left, zIndex: 'var(--z-tooltip)' }}
          >
            <StandingExplainerBody
              domain={domain}
              data={data}
              scope={scope}
              place={value}
              onClose={() => setOpen(false)}
            />
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={open ? tipId : undefined}
        className={`rounded px-0.5 underline decoration-dotted decoration-charcoal-300 underline-offset-2 transition-colors hover:text-camel-700 dark:decoration-charcoal-500 dark:hover:text-camel-400 ${className ?? ''} ${
          open ? 'text-camel-700 dark:text-camel-400' : ''
        }`}
        aria-label={`Место ${value}: объяснить рейтинг (${domainLabel(domain)})`}
      >
        <span className="tabular-nums">#{value}</span>
      </button>
      {panel}
    </>
  )
}
