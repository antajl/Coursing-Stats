import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../lib/icons'
import { SEO } from '../components/SEO'
import { JsonLd, organizationSchema, webSiteSchema } from '../components/JsonLd'
import HeroIntro, { HeroStatsBar, type HeroStats } from '../components/Hero'
import HomeEventRow from '../components/HomeEventRow'
import DoninoHomeRecordRow from '../components/DoninoHomeRecordRow'
import MedalTally from '../components/MedalTally'
import OwnerCrownName from '../components/OwnerCrownName'
import PodiumRankMark, { type PodiumPlace } from '../components/PodiumRankMark'
import HomePodiumSectionHead from '../components/HomePodiumSectionHead'
import { type HomeRankingTab } from '../components/HomeRankingTabs'
import { parseDogName } from '../lib/dogName'
import { api } from '../services/api'
import { type CalendarEvent } from './Events/eventListUtils'
import { useGsapRiseIn } from '../hooks/useGsapRiseIn'

interface TopDog {
  dog_id: number
  name_lat: string
  name_ru?: string | null
  breed?: string
  gold?: number
  silver?: number
  bronze?: number
  best_score?: number
  best_judge_score?: number
  rating_score?: number
  avg_judge_score?: number
  best_speed?: number
  avg_speed?: number
  total_starts?: number
}

interface SpeedRecord {
  name: string
  breed: string
  sex?: string
  speed_km_h: number
  date?: string
  status?: string
  history?: unknown
}

interface CoursingRecord {
  name: string
  breed: string
  sex?: string
  time_seconds: number
  date?: string
  status?: string
  history?: unknown
}

type RankingTab = HomeRankingTab

const CURRENT_SEASON = new Date().getFullYear()

function normalizeStats(raw: Record<string, unknown> | null | undefined): HeroStats | null {
  if (!raw) return null
  return {
    events: Number(raw.events) || 0,
    results: Number(raw.results) || 0,
    dogs: Number(raw.dogs) || 0,
    judges: Number(raw.judges) || 0,
    breeds: Number(raw.breeds) || 0,
    donino_records: Number(raw.donino_records) || 0,
  }
}

function extractTopDogs(data: unknown): TopDog[] {
  if (!data) return []
  if (Array.isArray(data)) return data as TopDog[]
  if (typeof data === 'object' && data !== null && 'items' in data && Array.isArray(data.items)) {
    return data.items as TopDog[]
  }
  return []
}

function pickFeaturedEvents(events: CalendarEvent[], count = 3): CalendarEvent[] {
  const dated = events
    .filter((e) => e.date_start)
    .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = dated.filter((e) => new Date(e.date_start) >= today)
  const past = dated.filter((e) => new Date(e.date_start) < today).reverse()

  const combined = [...upcoming]
  for (const event of past) {
    if (combined.length >= count) break
    combined.push(event)
  }
  return combined.slice(0, count)
}

function SectionDivider({
  icon: Icon,
  title,
}: {
  icon: typeof Icons.calendar
  title: string
}) {
  return (
    <div className="home-section-head" data-rise>
      <div className="divider home-divider">
        <Icon className="h-5 w-5 shrink-0 text-camel-500" strokeWidth={1.75} />
        <div className="home-divider-text">
          <h2>{title}</h2>
        </div>
        <div className="line" />
      </div>
    </div>
  )
}

function podiumSlots<T>(items: T[]): { item: T; place: number; isGold: boolean }[] {
  if (items.length >= 3) {
    return [
      { item: items[1], place: 2, isGold: false },
      { item: items[0], place: 1, isGold: true },
      { item: items[2], place: 3, isGold: false },
    ]
  }
  return items.map((item, i) => ({ item, place: i + 1, isGold: i === 0 }))
}

function rankCoursingRecords(records: CoursingRecord[]): CoursingRecord[] {
  return [...records].sort((a, b) => a.time_seconds - b.time_seconds).slice(0, 3)
}

function formatStarts(n?: number | null): string | null {
  if (n == null || Number.isNaN(n)) return null
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return `${n} стартов`
  if (mod10 === 1) return `${n} старт`
  if (mod10 >= 2 && mod10 <= 4) return `${n} старта`
  return `${n} стартов`
}

function PodiumSkeleton() {
  return (
    <div className="podium-preview">
      {[2, 1, 3].map((place) => (
        <div
          key={place}
          className={`pod-card animate-pulse place-${place} ${place === 1 ? 'gold' : ''}`}
          aria-hidden
        >
          <PodiumRankMark place={place as PodiumPlace} size={place === 1 ? 'lg' : 'md'} muted />
          <div className="mx-auto mt-2 h-4 w-3/4 rounded bg-old-money-200 dark:bg-charcoal-600" />
          <div className="mx-auto mt-2 h-3 w-1/2 rounded bg-old-money-100 dark:bg-charcoal-700" />
          <div className="mx-auto mt-3 h-3 w-2/3 rounded bg-old-money-100 dark:bg-charcoal-700" />
        </div>
      ))}
    </div>
  )
}

function DoninoListSkeleton() {
  return (
    <div className="donino-home-columns">
      {['Замер', 'Бега 350 м'].map((title) => (
        <div key={title} className="donino-home-col">
          <div className="donino-home-col-panel">
            <div className="donino-home-col-title">{title}</div>
            <div className="donino-home-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="donino-home-row donino-home-row--skeleton animate-pulse" aria-hidden>
                <div className="h-5 w-12 rounded bg-old-money-200 dark:bg-charcoal-600" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-2/3 rounded bg-old-money-200 dark:bg-charcoal-600" />
                  <div className="h-3 w-1/3 rounded bg-old-money-100 dark:bg-charcoal-700" />
                </div>
                <div className="h-7 w-16 rounded-full bg-old-money-200 dark:bg-charcoal-600" />
              </div>
            ))}
          </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatScore(value?: number | null): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(1)
}

function formatIndex(value?: number | null): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(2)
}

function formatSpeed(value?: number | string | null): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(1)
}

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null)
  const [stats, setStats] = useState<HeroStats | null>(null)
  const [featuredEvents, setFeaturedEvents] = useState<CalendarEvent[]>([])
  const [topPlacement, setTopPlacement] = useState<TopDog[]>([])
  const [topScore, setTopScore] = useState<TopDog[]>([])
  const [topSpeed, setTopSpeed] = useState<TopDog[]>([])
  const [doninoSpeedRecords, setDoninoSpeedRecords] = useState<SpeedRecord[]>([])
  const [doninoCoursingRecords, setDoninoCoursingRecords] = useState<CoursingRecord[]>([])
  const [rankingTab, setRankingTab] = useState<RankingTab>('score')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          statsData,
          eventsData,
          placementData,
          scoreData,
          seasonSpeedData,
          doninoSpeedData,
          doninoCoursingData,
        ] = await Promise.all([
          api.getStats(),
          api.getEvents(),
          api.getTopPlacement(String(CURRENT_SEASON), '', 0, 'gold', 3, 0),
          api.getTopScore(String(CURRENT_SEASON), '', 0, 'rating_score', 3, 0),
          api.getTopSpeed(String(CURRENT_SEASON), '', 0, 'best_speed', 3, 0),
          api.getSpeedRecordsTopByBreed(3),
          api.getCoursingRecordsTopByBreed(3),
        ])

        if (statsData.success) {
          setStats(normalizeStats(statsData.data as Record<string, unknown>))
        }

        if (eventsData.success && Array.isArray(eventsData.data)) {
          setFeaturedEvents(pickFeaturedEvents(eventsData.data as CalendarEvent[]))
        }

        if (placementData.success) {
          setTopPlacement(extractTopDogs(placementData.data).slice(0, 3))
        }

        if (scoreData.success) {
          setTopScore(extractTopDogs(scoreData.data).slice(0, 3))
        }

        if (seasonSpeedData.success) {
          setTopSpeed(extractTopDogs(seasonSpeedData.data).slice(0, 3))
        }

        if (doninoSpeedData.success && Array.isArray(doninoSpeedData.data)) {
          setDoninoSpeedRecords(doninoSpeedData.data as SpeedRecord[])
        }

        if (doninoCoursingData.success && Array.isArray(doninoCoursingData.data)) {
          setDoninoCoursingRecords(doninoCoursingData.data as CoursingRecord[])
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const activeDogs =
    rankingTab === 'placement' ? topPlacement : rankingTab === 'score' ? topScore : topSpeed
  const doninoCoursingRanked = rankCoursingRecords(doninoCoursingRecords)
  const showDoninoSection =
    loading || doninoSpeedRecords.length > 0 || doninoCoursingRecords.length > 0

  // Wave 1: hero block on mount (eyebrow → CTA → events)
  useGsapRiseIn({
    scope: pageRef,
    selector: '.hero-dashboard [data-rise]',
    stagger: 0.055,
    duration: 0.36,
  })

  // Wave 2: sections below once data is ready (single pass, no re-run on tab switch)
  useGsapRiseIn({
    scope: pageRef,
    selector: '.home-below-fold [data-rise]',
    enabled: !loading,
    delay: 0.08,
    stagger: 0.05,
    duration: 0.36,
    dependencies: [loading],
  })

  return (
    <div className="wrap" ref={pageRef}>
      <SEO
        title="Главная"
        description="Coursing Stats — статистика соревнований по курсингу и бегам борзых в России. Календарь событий, результаты, рейтинги собак, рекорды скорости, статистика судей. Полная база данных соревнований 2015-2026."
        canonicalUrl="https://coursing-stats.ru/"
      />
      <JsonLd data={organizationSchema} />
      <JsonLd data={webSiteSchema} />
      <section className="hero-dashboard">
        <HeroIntro />
        <div className="hero-events" data-rise>
          <div className="hero-events-head">
            <h3>Ближайшие события</h3>
            <a
              href="http://procoursing.ru/"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-events-link"
            >
              Календарь на procoursing.ru →
            </a>
          </div>
          <div className="hero-events-list">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="home-event-row home-event-row--skeleton animate-pulse" aria-hidden>
                    <div className="h-8 w-10 rounded bg-old-money-200 dark:bg-charcoal-600" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-4/5 rounded bg-old-money-200 dark:bg-charcoal-600" />
                      <div className="h-2.5 w-1/2 rounded bg-old-money-100 dark:bg-charcoal-700" />
                    </div>
                  </div>
                ))}
              </>
            ) : featuredEvents.length > 0 ? (
              featuredEvents.map((event) => (
                <HomeEventRow key={event.id} event={event} compact />
              ))
            ) : (
              <p className="hero-events-empty">Нет событий в календаре</p>
            )}
          </div>
        </div>
        <HeroStatsBar stats={stats} loading={loading} />
      </section>

      <div className="home-below-fold">
      <HomePodiumSectionHead
        title={`Топ сезона ${CURRENT_SEASON}`}
        value={rankingTab}
        onChange={setRankingTab}
      />

      {loading ? (
        <PodiumSkeleton />
      ) : activeDogs.length > 0 ? (
        <>
          <div className="podium-preview" data-rise>
            {podiumSlots(activeDogs).map(({ item: dog, place, isGold }) => (
              <Link
                key={dog.dog_id}
                to={`/dog/${dog.dog_id}`}
                className={`pod-card place-${place} flex flex-col items-center no-underline text-inherit ${isGold ? 'gold order-first sm:order-none' : ''}`}
              >
                <PodiumRankMark place={place as PodiumPlace} size={isGold ? 'lg' : 'md'} />
                {(() => {
                  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
                  return (
                    <>
                      <OwnerCrownName
                        name={primary}
                        dogId={dog.dog_id}
                        kind="competition"
                      >
                        <div className="dog-lat" title={primary}>{primary}</div>
                      </OwnerCrownName>
                      {secondary && <div className="dog-ru text-charcoal-400 dark:text-charcoal-500">{secondary}</div>}
                    </>
                  )
                })()}
                {dog.breed && <div className="pod-sub">{dog.breed}</div>}
                {rankingTab === 'placement' ? (
                  <>
                    <MedalTally
                      className="score pod-medals"
                      size="xl"
                      nowrap
                      gold={dog.gold}
                      silver={dog.silver}
                      bronze={dog.bronze}
                    />
                    {formatStarts(dog.total_starts) && (
                      <div className="pod-foot">{formatStarts(dog.total_starts)}</div>
                    )}
                  </>
                ) : rankingTab === 'score' ? (
                  <>
                    <div className="score">
                      {formatIndex(dog.rating_score ?? dog.avg_judge_score)}
                      <span className="score-unit">индекс</span>
                    </div>
                    <div className="pod-foot pod-foot--grouped">
                      {(dog.avg_judge_score != null || dog.best_judge_score != null) && (
                        <span className="pod-foot-group">
                          {dog.avg_judge_score != null && (
                            <span>средн. <b>{formatScore(dog.avg_judge_score)}</b></span>
                          )}
                          {dog.avg_judge_score != null && dog.best_judge_score != null && (
                            <span className="pod-foot-dot">·</span>
                          )}
                          {dog.best_judge_score != null && (
                            <span>лучш. <b>{formatScore(dog.best_judge_score)}</b></span>
                          )}
                        </span>
                      )}
                      {formatStarts(dog.total_starts) && (
                        <>
                          <span className="pod-foot-divider" aria-hidden="true" />
                          <span>старты <b>{dog.total_starts}</b></span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="score">
                      {formatSpeed(dog.best_speed)}
                      <span className="score-unit">км/ч</span>
                    </div>
                    <div className="pod-foot pod-foot--grouped">
                      {dog.avg_speed != null && (
                        <span>средн. <b>{formatSpeed(dog.avg_speed)}</b></span>
                      )}
                      {formatStarts(dog.total_starts) && (
                        <>
                          {dog.avg_speed != null && <span className="pod-foot-divider" aria-hidden="true" />}
                          <span>старты <b>{dog.total_starts}</b></span>
                        </>
                      )}
                    </div>
                  </>
                )}
              </Link>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
          Пока нет данных за {CURRENT_SEASON}.{' '}
          <Link
            to="/competitions?tab=ranking"
            className="font-semibold text-camel-700 hover:underline dark:text-camel-400"
          >
            Открыть рейтинг
          </Link>
        </p>
      )}

      {showDoninoSection && (
        <>
          <SectionDivider icon={Icons.speed} title="Рекорды Донино" />
          {loading ? (
            <DoninoListSkeleton />
          ) : doninoSpeedRecords.length > 0 || doninoCoursingRanked.length > 0 ? (
            <>
              <div>
                <div className="donino-home-columns" data-rise>
                  <div className="donino-home-col">
                    <div className="donino-home-col-panel">
                      <div className="donino-home-col-title">Замер</div>
                      <div className="donino-home-list">
                      {doninoSpeedRecords.length > 0 ? (
                        doninoSpeedRecords.map((record) => (
                          <DoninoHomeRecordRow
                            key={`speed-${record.breed}-${record.name}`}
                            mode="speed"
                            name={record.name}
                            breed={record.breed}
                            sex={record.sex}
                            date={record.date}
                            status={record.status}
                            history={record.history}
                            speedKmh={record.speed_km_h}
                          />
                        ))
                      ) : (
                        <p className="donino-home-empty">Нет данных</p>
                      )}
                      </div>
                    </div>
                  </div>
                  <div className="donino-home-col">
                    <div className="donino-home-col-panel">
                      <div className="donino-home-col-title">Бега 350 м</div>
                      <div className="donino-home-list">
                      {doninoCoursingRanked.length > 0 ? (
                        doninoCoursingRanked.map((record) => (
                          <DoninoHomeRecordRow
                            key={`coursing-${record.breed}-${record.name}`}
                            mode="coursing"
                            name={record.name}
                            breed={record.breed}
                            sex={record.sex}
                            date={record.date}
                            status={record.status}
                            history={record.history}
                            timeSeconds={record.time_seconds}
                          />
                        ))
                      ) : (
                        <p className="donino-home-empty">Нет данных</p>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
              Пока нет данных по рекордам Донино.{' '}
              <Link
                to="/speed-records"
                className="font-semibold text-camel-700 hover:underline dark:text-camel-400"
              >
                Открыть рекорды
              </Link>
            </p>
          )}
        </>
      )}
      </div>
    </div>
  )
}
