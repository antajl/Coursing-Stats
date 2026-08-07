export type {
  DogTitle,
  CompetitionTitleKey,
} from '../../lib/competition-titles'
export {
  COMPETITION_TITLE_RANK,
  COMPETITION_TITLE_BADGE,
  COMPETITION_TITLE_LABELS,
  competitionTitleKey,
  competitionTitleDisplayName,
  competitionTitleLabel,
  isKnownCompetitionTitleKey,
  competitionTitleRank,
  compareCompetitionTitles,
  splitQualification,
  aggregateQualificationTitles,
} from '../../lib/competition-titles'

/** @deprecated use competitionTitleKey */
export { competitionTitleKey as titleKey } from '../../lib/competition-titles'
