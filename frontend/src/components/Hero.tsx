import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../lib/icons'
import { useGsapRiseIn } from '../hooks/useGsapRiseIn'

export interface HeroStats {
  events: number
  dogs: number
  results: number
  breeds: number
}

export default function HeroIntro() {
  const scope = useRef<HTMLDivElement>(null)
  const StatsIcon = Icons.achievement

  useGsapRiseIn({
    scope,
    selector: '[data-rise]',
    stagger: 0.07,
  })

  return (
    <div className="hero-intro" ref={scope}>
      <div className="eyebrow" data-rise>
        <Icons.achievement className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        <span>
          <span>2015 — 2026</span>
          {' · '}
          <span>курсинг · БЗМП · бега борзых</span>
        </span>
      </div>

      <h1 data-rise>
        Статистика курсинга и <em>бегов борзых</em> в одном месте
      </h1>

      <p className="lead" data-rise>
        Результаты procoursing.ru и рекорды Донино — по собакам, судьям и соревнованиям.
      </p>

      <div className="cta-row" data-rise>
        <Link to="/competitions?tab=ranking" className="btn btn-primary">
          <StatsIcon className="h-4 w-4" strokeWidth={1.75} />
          Статистика
        </Link>
        <Link to="/competitions?tab=judges" className="btn btn-ghost">
          <Icons.award className="h-4 w-4" strokeWidth={1.75} />
          Судьи
        </Link>
        <Link to="/speed-records" className="btn btn-ghost">
          <Icons.speed className="h-4 w-4" strokeWidth={1.75} />
          Курсинг Донино
        </Link>
      </div>
    </div>
  )
}
