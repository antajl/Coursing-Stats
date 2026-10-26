import { memo, type ComponentType } from 'react'
import { Link } from 'react-router-dom'

interface SectionHeadProps {
  icon?: ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean }>
  title: string
  href?: string
  linkLabel?: string
}

function SectionHeadInner({ icon: Icon, title, href, linkLabel }: SectionHeadProps) {
  return (
    <div className="home-v2-section-head">
      <div className="home-v2-section-title">
        {Icon ? <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden /> : null}
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
