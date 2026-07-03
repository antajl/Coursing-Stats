export type PodiumPlace = 1 | 2 | 3

const ROMAN: Record<PodiumPlace, string> = { 1: 'I', 2: 'II', 3: 'III' }

const SIZES = { md: 34, lg: 40 } as const

function RomanPaths({ place }: { place: PodiumPlace }) {
  const sw = 2.4
  const cap = 'round' as const

  if (place === 1) {
    return (
      <path
        d="M24 14.5v19"
        fill="none"
        stroke="var(--pr-glyph)"
        strokeWidth={sw}
        strokeLinecap={cap}
      />
    )
  }

  if (place === 2) {
    return (
      <>
        <path
          d="M19 14.5v19"
          fill="none"
          stroke="var(--pr-glyph)"
          strokeWidth={sw}
          strokeLinecap={cap}
        />
        <path
          d="M29 14.5v19"
          fill="none"
          stroke="var(--pr-glyph)"
          strokeWidth={sw}
          strokeLinecap={cap}
        />
      </>
    )
  }

  return (
    <>
      <path d="M15 17h18" fill="none" stroke="var(--pr-glyph)" strokeWidth={sw} strokeLinecap={cap} />
      <path d="M15 24h18" fill="none" stroke="var(--pr-glyph)" strokeWidth={sw} strokeLinecap={cap} />
      <path d="M15 31h18" fill="none" stroke="var(--pr-glyph)" strokeWidth={sw} strokeLinecap={cap} />
    </>
  )
}

export default function PodiumRankMark({
  place,
  size = 'md',
  className = '',
  muted = false,
}: {
  place: PodiumPlace
  size?: keyof typeof SIZES
  className?: string
  muted?: boolean
}) {
  const px = SIZES[size]

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 48 48"
      className={`podium-rank-mark podium-rank-mark--${place} shrink-0 ${muted ? 'opacity-25' : ''} ${className}`.trim()}
      role="img"
      aria-label={`${place}-е место`}
    >
      <title>{ROMAN[place]}</title>
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="9"
        fill="var(--pr-face)"
        stroke="var(--pr-rim)"
        strokeWidth="1.75"
      />
      <rect
        x="7.5"
        y="7.5"
        width="33"
        height="33"
        rx="6"
        fill="none"
        stroke="var(--pr-inner)"
        strokeWidth="1"
        opacity="0.85"
      />
      <RomanPaths place={place} />
    </svg>
  )
}
