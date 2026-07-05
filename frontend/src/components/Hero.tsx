import { Link } from 'react-router-dom'
import { Icons } from '../lib/icons'

export interface HeroStats {
  events: number
  dogs: number
  results: number
  breeds: number
}

export default function HeroIntro() {
  const CalendarIcon = Icons.calendar
  const MedalIcon = Icons.medal

  return (
    <div className="hero-intro">
      <div className="eyebrow">
        <Icons.achievement className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span>2015 — 2026 · курсинг · БЗМП · бега борзых</span>
      </div>

      <h1>
        Статистика курсинга и <em>бегов борзых</em> в одном месте
      </h1>

      <p className="lead">
        Результаты procoursing.ru и рекорды Донино — по собакам, судьям и соревнованиям.
      </p>

      <div className="cta-row">
        <Link to="/competitions?tab=calendar" className="btn btn-primary">
          <CalendarIcon className="h-4 w-4" strokeWidth={1.75} />
          Календарь
        </Link>
        <Link to="/competitions?tab=ranking" className="btn btn-ghost">
          <MedalIcon className="h-4 w-4" strokeWidth={1.75} />
          Рейтинг
        </Link>
        <Link to="/speed-records" className="btn btn-ghost">
          <Icons.speed className="h-4 w-4" strokeWidth={1.75} />
          Донино
        </Link>
      </div>
    </div>
  )
}
