import type { ReactNode } from 'react'
import {
  SHOW_AWARD_BADGE,
  SHOW_AWARD_LABELS,
  displayShowAwardToken,
  matchShowAwardToken,
  type ShowAwardKey,
} from '../../../backend/lib/show-award-ranking'
import {
  competitionTitleDisplayName,
  competitionTitleKey,
  competitionTitleLabel,
  isKnownCompetitionTitleKey,
} from '../../../backend/lib/competition-titles'
import { showAwardBadgeClass, titleBadgeClass } from './qualificationTitles'

/** Окошко тултипа: бейдж + полное название (как в справке). */
export function AwardTooltipRow({
  badge,
  label,
  badgeClass,
}: {
  badge: string
  label: string
  badgeClass: string
}): ReactNode {
  return (
    <div className="flex items-start gap-2 text-left">
      <span
        className={`mt-0.5 inline-flex shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${badgeClass}`}
      >
        {badge}
      </span>
      <span className="min-w-0 text-[11px] leading-snug text-charcoal-800">
        {label}
      </span>
    </div>
  )
}

export function awardTooltipForKey(key: ShowAwardKey, count?: number): ReactNode {
  const badge =
    count != null && count > 1 ? `${SHOW_AWARD_BADGE[key]} ×${count}` : SHOW_AWARD_BADGE[key]
  return (
    <AwardTooltipRow
      badge={badge}
      label={SHOW_AWARD_LABELS[key]}
      badgeClass={showAwardBadgeClass(key)}
    />
  )
}

/** Тултип рабочего титула (курсинг / БЗМП / бега) — тот же layout, что у выставок. */
export function awardTooltipForCompetitionTitle(raw: string, count?: number): ReactNode {
  const key = competitionTitleKey(raw)
  const badgeBase = competitionTitleDisplayName(raw, key)
  const badge = count != null && count > 1 ? `${badgeBase} ×${count}` : badgeBase
  return (
    <AwardTooltipRow
      badge={badge}
      label={(raw.trim().toUpperCase() === 'CC' || raw.trim().toUpperCase() === 'СС') ? 'СС — сертификат соответствия высшей квалификации (≥75% баллов во всех забегах)' : competitionTitleLabel(raw, key)}
      badgeClass={titleBadgeClass(badgeBase)}
    />
  )
}

export function awardTooltipForToken(token: string): ReactNode {
  const showKey = matchShowAwardToken(token)
  if (showKey) return awardTooltipForKey(showKey)
  const key = competitionTitleKey(token)
  if (isKnownCompetitionTitleKey(key)) return awardTooltipForCompetitionTitle(token)
  const badge = displayShowAwardToken(token)
  return (
    <AwardTooltipRow badge={badge} label={token} badgeClass={titleBadgeClass(token)} />
  )
}

/** Полная официальная расшифровка титула без бейджа (для заголовка тултипа). */
export function getFullTitleLabel(title: string, isShow?: boolean): string {
  const clean = title.replace(/\s*\((?:КБ|ББ|БЗМП|LC|LR)\)/gi, '').trim()
  if (clean === 'АЧР') return 'Абсолютный чемпион России'
  if (clean === 'ГЧР РК') return 'Гранд чемпион России по рабочим качествам собак'
  if (clean === 'ГЧРКФ РК' || clean === 'ГЧРКФ') return 'Гранд чемпион РКФ по рабочим качествам собак'
  if (clean === 'ГЧР') return 'Гранд чемпион России по красоте'
  if (clean === 'C.I.C.') return 'Интернациональный чемпион по рабочим качествам (FCI)'
  if (clean === 'C.I.B.') return 'Интернациональный чемпион по красоте (FCI)'
  if (clean === 'C.I.E.') return 'Интернациональный выставочный чемпион (FCI)'
  if (clean === 'ЧР') return isShow ? 'Чемпион России по красоте' : 'Чемпион России по рабочим качествам собак'
  if (clean === 'ЧР РК') return 'Чемпион России по рабочим качествам собак'
  if (clean === 'НЧ РК' || clean === 'НЧ') return 'Национальный чемпион по рабочим качествам собак'
  if (clean === 'ПКР РК' || clean === 'ПКР') return 'Победитель Кубка России по рабочим качествам собак'
  if (clean === 'ЧРКФ РК') return 'Чемпион РКФ по рабочим качествам собак'
  if (clean === 'ЧРКФ') return 'Чемпион РКФ по красоте'
  if (clean === 'ПЧРКФ РК') return 'Чемпион РКФ по рабочим качествам в породе'
  if (clean === 'ПЧ РК' || clean === 'ПЧ') return 'Породный чемпион по рабочим качествам собак'
  if (clean === 'ЧНКП') return 'Чемпион Национального клуба породы'
  if (clean === 'ЧП') return 'Чемпион породы'
  if (clean === 'ЮЧР') return 'Юный чемпион России'
  if (clean === 'ВЧР') return 'Ветеран-чемпион России'
  if (clean === 'ЮЧРКФ') return 'Юный чемпион РКФ'
  if (clean === 'ВЧРКФ') return 'Ветеран-чемпион РКФ'
  if (clean === 'ЮЧНКП') return 'Юный чемпион Национального клуба породы'
  if (clean === 'ВЧНКП') return 'Ветеран-чемпион Национального клуба породы'

  const showKey = matchShowAwardToken(clean)
  if (showKey && SHOW_AWARD_LABELS[showKey]) return SHOW_AWARD_LABELS[showKey]
  const compKey = competitionTitleKey(clean)
  if (COMPETITION_TITLE_LABELS[compKey]) return COMPETITION_TITLE_LABELS[compKey]

  return clean
}

/** Тултип чипа шапки профиля (выставка или курсинг/беги). */
export function awardTooltipForDogTitle(title: string, count?: number, isShow?: boolean): ReactNode {
  if (isShow && title === 'ЧР') {
    return (
      <AwardTooltipRow
        badge="ЧР"
        label="Чемпион России по красоте (выполнена норма РКФ: 6+ CAC от разных судей)"
        badgeClass="border border-camel-500 bg-camel-100 text-camel-800 font-bold"
      />
    )
  }
  if (isShow && title === 'ЧРКФ') {
    return (
      <AwardTooltipRow
        badge="ЧРКФ"
        label="Чемпион РКФ по красоте"
        badgeClass="border border-camel-400 bg-camel-100 text-camel-700 font-semibold"
      />
    )
  }
  if (title === 'ЧР') {
    return (
      <AwardTooltipRow
        badge="ЧР"
        label="Чемпион России (выполнена норма РКФ)"
        badgeClass="border border-camel-500 bg-camel-100 text-camel-800 font-bold"
      />
    )
  }
  const showKey = matchShowAwardToken(title)
  if (showKey && isShow) return awardTooltipForKey(showKey, count)
  return awardTooltipForCompetitionTitle(title, count)
}

export function awardTooltipList(
  items: Array<{ key?: ShowAwardKey; token?: string; count?: number }>,
): ReactNode {
  return (
    <div className="flex min-w-[14rem] max-w-[20rem] flex-col gap-2">
      {items.map((item, i) => {
        if (item.key) {
          return <div key={`${item.key}-${i}`}>{awardTooltipForKey(item.key, item.count)}</div>
        }
        return (
          <div key={`${item.token}-${i}`}>{awardTooltipForToken(item.token || '')}</div>
        )
      })}
    </div>
  )
}
