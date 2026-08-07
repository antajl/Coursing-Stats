import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../../../lib/icons'

interface SectionHeadProps {
  icon: typeof Icons.calendar
  title: string
  href?: string
  linkLabel?: string
}

function SectionHeadInner({ icon: Icon, title, href, linkLabel }: SectionHeadProps) {
  return (
    <div className="home-v2-section-head">
      <div className="home-v2-section-title">
        <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
        <h2>{title}</h2>
      </div>
      {href && linkLabel ? (
        <Link to={href} className="home-v2-section-link">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  )
}

export const SectionHead = memo(SectionHeadInner)
