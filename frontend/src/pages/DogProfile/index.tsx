import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isShowOnlyProfileId, showDogProfilePath } from '../../lib/showDogProfilePath'
import LoadingCard from '../../components/LoadingCard'
import NotFound from '../NotFound'
import { SEO } from '../../components/SEO'
import { JsonLd, breadcrumbListSchema, profilePageSchema } from '../../components/JsonLd'
import { DogProfileHeader } from './DogProfileHeader'
import { CoursingColumn } from './CoursingColumn'
import { RacingColumn } from './RacingColumn'
import { ShowsColumn } from './ShowsColumn'
import { EmptyDisciplineColumn } from './EmptyDisciplineColumn'
import { DoninoSpeedColumn } from './DoninoSpeedColumn'
import { DoninoCoursingColumn } from './DoninoCoursingColumn'
import { DogJudgesSection } from './DogJudgesSection'
import { DogDisciplinesMobileView } from './DogDisciplinesMobileView'
import { DogDisciplinesDesktopView } from './DogDisciplinesDesktopView'
import { useDogProfileData } from './useDogProfileData'
import type { DisciplineTabId } from './types'

export default function DogProfile() {
  const location = useLocation()
  const data = useDogProfileData()

  // Canonical redirect for show dog on legacy show route, alias ID, or linked sports profile
  if (!data.showsLoading && data.showDog) {
    if (
      data.showDog.competition_dog_id != null &&
      Number.isFinite(Number(data.showDog.competition_dog_id)) &&
      String(data.showDog.competition_dog_id) !== String(data.competitionId)
    ) {
      return <Navigate to={`/dog/${data.showDog.competition_dog_id}/`} replace />
    }
    if (
      !data.dog &&
      data.competitionId &&
      data.showDog.id &&
      String(data.showDog.id) !== String(data.competitionId)
    ) {
      return <Navigate to={`/dog/${data.showDog.id}/`} replace />
    }
  }

  // Legacy /shows/dog/{catalog}/{breed} → /dog/{stableId}
  if (!data.showsLoading && data.isLegacyShowRoute && data.showDog) {
    const canonical = showDogProfilePath(data.showDog)
    if (canonical.startsWith('/dog/') && isShowOnlyProfileId(canonical.slice('/dog/'.length))) {
      return <Navigate to={canonical} replace />
    }
    if (canonical !== location.pathname) {
      return <Navigate to={canonical} replace />
    }
  }

  const waitingCompetition = Boolean(data.competitionId) && data.loading
  if (waitingCompetition || data.showsLoading) {
    return <LoadingCard count={3} variant="profile" />
  }

  if (!data.dog && !data.showDog) {
    return <NotFound />
  }

  if (!data.headerDog) {
    return <NotFound />
  }

  const renderTabContent = (tabId: DisciplineTabId) => {
    switch (tabId) {
      case 'coursing':
        return data.showCoursingColumn ? (
          <>
            <CoursingColumn
              hasCoursingData={data.hasCoursingData}
              hasCourseMedals={data.hasCourseMedals}
              coursing={data.coursing}
              coursingEvents={data.coursingEvents}
              visibleCoursingEvents={data.visibleCoursingEvents}
              eventResultsUrls={data.eventResultsUrls}
              bestScoreEventId={data.bestScoreEventId}
              bestJudgeScoreEventId={data.bestJudgeScoreEventId}
              avgJudgeScoreEventId={data.avgJudgeScoreEventId}
              showAllCoursingEvents={data.showAllCoursingEvents}
              onToggleShowAll={() => data.setShowAllCoursingEvents((v) => !v)}
              rank={data.headerRanks.find((r) => r.key === 'coursing')}
              breed={data.headerBreed}
            />
            {data.judgeStats && (
              <div className="mt-6">
                <DogJudgesSection judgeStats={data.judgeStats} competitions={data.events} />
              </div>
            )}
          </>
        ) : (
          <EmptyDisciplineColumn title="Курсинг / БЗМП" theme="forest" />
        )
      case 'racing':
        return data.showRacingColumn ? (
          <RacingColumn
            hasRacingData={data.hasRacingData}
            hasRacingMedals={data.hasRacingMedals}
            racing={data.racing}
            racingEvents={data.racingEvents}
            visibleRacingEvents={data.visibleRacingEvents}
            eventResultsUrls={data.eventResultsUrls}
            bestSpeedEventId={data.bestSpeedEventId}
            avgSpeedEventId={data.avgSpeedEventId}
            showAllRacingEvents={data.showAllRacingEvents}
            onToggleShowAll={() => data.setShowAllRacingEvents((v) => !v)}
            rank={data.headerRanks.find((r) => r.key === 'racing')}
            breed={data.headerBreed}
          />
        ) : (
          <EmptyDisciplineColumn title="Бега борзых" theme="warm-blue" />
        )
      case 'shows':
        return data.showDog ? (
          <ShowsColumn
            dog={data.showDog}
            rank={data.headerRanks.find((r) => r.key === 'shows')}
            breed={data.headerBreed}
          />
        ) : (
          <EmptyDisciplineColumn title="Выставки" theme="camel" />
        )
      case 'donino':
        return (
          <div className="space-y-4">
            {data.hasSpeedRecords && data.speedStats ? (
              <DoninoSpeedColumn
                speedStats={data.speedStats}
                visibleSpeedHistory={data.visibleSpeedHistory}
                showAllSpeedHistory={data.showAllSpeedHistory}
                onToggleShowAll={() => data.setShowAllSpeedHistory((v) => !v)}
              />
            ) : null}

            {data.hasCoursingRecords && data.coursingStats ? (
              <DoninoCoursingColumn
                coursingStats={data.coursingStats}
                visibleCoursingDoninoHistory={data.visibleCoursingDoninoHistory}
                showAllCoursingDoninoHistory={data.showAllCoursingDoninoHistory}
                onToggleShowAll={() => data.setShowAllCoursingDoninoHistory((v) => !v)}
              />
            ) : null}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <SEO
        title={data.seoTitle}
        description={data.description}
        keywords={data.keywords}
        canonicalUrl={data.canonicalUrl}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            breadcrumbListSchema([
              { name: 'Главная', url: '/' },
              { name: 'Рейтинг', url: '/competitions?tab=ranking' },
              { name: data.dogName, url: data.profilePath },
            ]),
            profilePageSchema({
              url: data.canonicalUrl,
              name: data.displayName,
              alternateName:
                data.alternateNames.length === 1
                  ? data.alternateNames[0]
                  : data.alternateNames.length > 1
                    ? data.alternateNames
                    : null,
              breed: data.dogBreed,
              description: data.description,
            }),
          ],
        }}
      />
      <div ref={data.exportRef}>
        <DogProfileHeader
          dog={data.headerDog}
          showTitles={data.titleGroups.show}
          competitionTitles={data.titleGroups.competition}
          showRuName={Boolean(data.showRuName)}
          exporting={data.exporting}
          onExport={data.handleExport}
          ranks={data.headerRanks}
          explainers={{
            coursing: data.hasCoursingData
              ? {
                  gold: data.coursing.gold,
                  silver: data.coursing.silver,
                  bronze: data.coursing.bronze,
                  total_starts: data.coursing.total_starts,
                  avg_judge_score: data.coursing.avg_judge_score,
                  best_judge_score: data.coursing.best_judge_score,
                }
              : null,
            racing: data.hasRacingData
              ? {
                  best_speed: data.racing.best_speed,
                  avg_speed: data.racing.avg_speed,
                  racing_starts: data.racing.total_starts,
                  racing_gold: data.racing.gold,
                  racing_silver: data.racing.silver,
                  racing_bronze: data.racing.bronze,
                }
              : null,
            shows: data.showDog
              ? {
                  total_shows: data.showDog.total_shows,
                  rank_score: data.showDog.rank_score ?? null,
                  best_award: data.showDog.best_award ?? null,
                  best_grade: data.showDog.best_grade ?? null,
                }
              : null,
          }}
        />

        {/* Мобильный вид: вкладки и свайп-трек */}
        <DogDisciplinesMobileView
          availableTabs={data.availableTabs}
          activeDiscipline={data.activeDiscipline}
          setActiveDiscipline={data.setActiveDiscipline}
          renderTabContent={renderTabContent}
        />

        {/* Десктопный вид: 3 колонки рядом и рекорды Донино */}
        <DogDisciplinesDesktopView
          showCoursingColumn={data.showCoursingColumn}
          hasCoursingData={data.hasCoursingData}
          hasCourseMedals={data.hasCourseMedals}
          coursing={data.coursing}
          coursingEvents={data.coursingEvents}
          visibleCoursingEvents={data.visibleCoursingEvents}
          eventResultsUrls={data.eventResultsUrls}
          bestScoreEventId={data.bestScoreEventId}
          bestJudgeScoreEventId={data.bestJudgeScoreEventId}
          avgJudgeScoreEventId={data.avgJudgeScoreEventId}
          showAllCoursingEvents={data.showAllCoursingEvents}
          onToggleShowAllCoursingEvents={() => data.setShowAllCoursingEvents((v) => !v)}
          headerRanks={data.headerRanks}
          headerBreed={data.headerBreed}
          showRacingColumn={data.showRacingColumn}
          hasRacingData={data.hasRacingData}
          hasRacingMedals={data.hasRacingMedals}
          racing={data.racing}
          racingEvents={data.racingEvents}
          visibleRacingEvents={data.visibleRacingEvents}
          bestSpeedEventId={data.bestSpeedEventId}
          avgSpeedEventId={data.avgSpeedEventId}
          showAllRacingEvents={data.showAllRacingEvents}
          onToggleShowAllRacingEvents={() => data.setShowAllRacingEvents((v) => !v)}
          showDog={data.showDog}
          judgeStats={data.judgeStats}
          events={data.events}
          hasSpeedRecords={data.hasSpeedRecords}
          hasCoursingRecords={data.hasCoursingRecords}
          speedStats={data.speedStats}
          coursingStats={data.coursingStats}
          visibleSpeedHistory={data.visibleSpeedHistory}
          showAllSpeedHistory={data.showAllSpeedHistory}
          onToggleShowAllSpeedHistory={() => data.setShowAllSpeedHistory((v) => !v)}
          visibleCoursingDoninoHistory={data.visibleCoursingDoninoHistory}
          showAllCoursingDoninoHistory={data.showAllCoursingDoninoHistory}
          onToggleShowAllCoursingDoninoHistory={() => data.setShowAllCoursingDoninoHistory((v) => !v)}
        />

        {/* Дисклеймер об источниках спортивных результатов */}
        <footer className="mt-8 rounded-xl border border-old-money-100 bg-cream-50/30 p-3 text-center sm:text-left">
          <p className="text-[11px] sm:text-xs leading-relaxed text-charcoal-500">
            <strong>Примечание:</strong> спортивная статистика и результаты состязаний систематизированы на основе официальных протоколов организаторов, полевых секретариатов и материалов ProCoursing.ru. Сведения могут содержать ошибки или быть неполными из-за фрагментарности открытых источников и ручного ведения ранних баз организаторами.
          </p>
        </footer>
      </div>
    </>
  )
}
