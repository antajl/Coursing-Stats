import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../lib/icons'
import { SEO } from '../components/SEO'
import { JsonLd, organizationSchema, webSiteSchema } from '../components/JsonLd'
import type { HeroStats, HeroShowStats } from '../components/Hero'
import HomeEventRow from '../components/HomeEventRow'
import DoninoHomeRecordRow from '../components/DoninoHomeRecordRow'
import HomeSeasonTopRow from '../components/HomeSeasonTopRow'
import MedalTally from '../components/MedalTally'
import HomeRankingTabs, { type HomeRankingTab } from '../components/HomeRankingTabs'
import HomeDogSearch from '../components/HomeDogSearch'
import HomeHeroStage from '../components/HomeHeroStage'
import HomeShowEventRow, { pickFeaturedShows } from '../components/HomeShowEventRow'
import { parseDogName } from '../lib/dogName'
import { showDogProfilePath } from '../lib/showDogProfilePath'
import { api } from '../services/api'
import {
  getShowCalendar,
  getShowHomeTop,
  type ShowHomeTopDog,
  type ShowRkfCalendarEntry,
} from '../lib/staticData'
import { formatShowRankingReason } from '../../../backend/lib/show-award-ranking'
import { type CalendarEvent } from './Events/eventListUtils'
import StatCounter from '../components/StatCounter'
import { usePublicCalendarVisible } from '../hooks/useStaticData'
import { prefersReducedMotion, riseIn, useGSAP } from '../lib/motion'

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
const CONTACT_EMAIL = 'antajl@yandex.ru'
const DISCLAIMER =
  'Независимая статистика по открытым протоколам. Не является официальным рейтингом РКФ.'

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

function SectionHead({
  icon: Icon,
  title,
  href,
  linkLabel,
}: {
  icon: typeof Icons.calendar
  title: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="home-v2-section-head">
      <div className="home-v2-section-title">
        <Icon className="h-5 w-5 shrink-0 text-camel-500" strokeWidth={1.75} />
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

function formatStarts(n?: number | null): string | null {
  if (n == null || Number.isNaN(n)) return null
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return `${n} стартов`
  if (mod10 === 1) return `${n} старт`
  if (mod10 >= 2 && mod10 <= 4) return `${n} старта`
  return `${n} стартов`
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

function rankCoursingRecords(records: CoursingRecord[]): CoursingRecord[] {
  return [...records].sort((a, b) => a.time_seconds - b.time_seconds).slice(0, 3)
}

function competitionMetric(dog: TopDog, tab: RankingTab): ReactNode {
  if (tab === 'placement') {
    return (
      <MedalTally size="sm" nowrap gold={dog.gold} silver={dog.silver} bronze={dog.bronze} />
    )
  }
  if (tab === 'speed') {
    return `${formatSpeed(dog.best_speed)} км/ч`
  }
  return (
    <>
      {formatIndex(dog.rating_score ?? dog.avg_judge_score)}
      <span className="donino-home-metric-unit"> индекс</span>
    </>
  )
}

function competitionMeta(dog: TopDog, tab: RankingTab): string | undefined {
  if (tab === 'placement') return formatStarts(dog.total_starts) || undefined
  if (tab === 'speed') {
    const parts: string[] = []
    if (dog.avg_speed != null) parts.push(`средн. ${formatSpeed(dog.avg_speed)}`)
    const starts = formatStarts(dog.total_starts)
    if (starts) parts.push(starts)
    return parts.length ? parts.join(' · ') : undefined
  }
  const parts: string[] = []
  if (dog.avg_judge_score != null) parts.push(`средн. ${formatScore(dog.avg_judge_score)}`)
  const starts = formatStarts(dog.total_starts)
  if (starts) parts.push(starts)
  return parts.length ? parts.join(' · ') : undefined
}

function showHomeMetric(dog: ShowHomeTopDog): string {
  return formatShowRankingReason(dog.titles, 2) || dog.best_award || '—'
}

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null)
  const [stats, setStats] = useState<HeroStats | null>(null)
  const [showStats, setShowStats] = useState<HeroShowStats | null>(null)
  const [featuredEvents, setFeaturedEvents] = useState<CalendarEvent[]>([])
  const [featuredShows, setFeaturedShows] = useState<ShowRkfCalendarEntry[]>([])
  const [topPlacement, setTopPlacement] = useState<TopDog[]>([])
  const [topScore, setTopScore] = useState<TopDog[]>([])
  const [topSpeed, setTopSpeed] = useState<TopDog[]>([])
  const [doninoSpeedRecords, setDoninoSpeedRecords] = useState<SpeedRecord[]>([])
  const [doninoCoursingRecords, setDoninoCoursingRecords] = useState<CoursingRecord[]>([])
  const [topShowDogs, setTopShowDogs] = useState<ShowHomeTopDog[]>([])
  const [rankingTab, setRankingTab] = useState<RankingTab>('score')
  const [loading, setLoading] = useState(true)
  const [bodyReady, setBodyReady] = useState(() => prefersReducedMotion())
  const showsCalendarVisible = usePublicCalendarVisible('shows')

  const revealBody = () => setBodyReady(true)

  useEffect(() => {
    const root = document.documentElement
    if (bodyReady) {
      // Скролл разблокирует HomeHeroStage в конце settle;
      // при reduced-motion — сразу.
      if (prefersReducedMotion()) {
        root.classList.remove('home-hero-locked')
      }
      return
    }
    root.classList.add('home-hero-locked')
    window.scrollTo(0, 0)
    return () => root.classList.remove('home-hero-locked')
  }, [bodyReady])

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          statsData,
          showStatsData,
          eventsData,
          showsCalData,
          placementData,
          scoreData,
          seasonSpeedData,
          showHomeTopData,
          doninoSpeedData,
          doninoCoursingData,
        ] = await Promise.all([
          api.getStats(),
          api.getShowHeroStats(),
          api.getEvents(),
          getShowCalendar(String(CURRENT_SEASON)),
          api.getTopPlacement(String(CURRENT_SEASON), '', 0, 'gold', 3, 0),
          api.getTopScore(String(CURRENT_SEASON), '', 0, 'rating_score', 3, 0),
          api.getTopSpeed(String(CURRENT_SEASON), '', 0, 'best_speed', 3, 0),
          getShowHomeTop(String(CURRENT_SEASON)),
          api.getSpeedRecordsTopByBreed(3),
          api.getCoursingRecordsTopByBreed(3),
        ])

        if (statsData.success) {
          setStats(normalizeStats(statsData.data as Record<string, unknown>))
        }
        if (showStatsData.success && showStatsData.data) {
          const s = showStatsData.data as HeroShowStats
          setShowStats({
            exhibitions: Number(s.exhibitions) || 0,
            appearances: Number(s.appearances) || 0,
            dogs: Number(s.dogs) || 0,
            judges: Number(s.judges) || 0,
            breeds: Number(s.breeds) || 0,
          })
        }
        if (eventsData.success && Array.isArray(eventsData.data)) {
          setFeaturedEvents(pickFeaturedEvents(eventsData.data as CalendarEvent[]))
        }
        if (showsCalData.success && Array.isArray(showsCalData.data)) {
          setFeaturedShows(pickFeaturedShows(showsCalData.data, 3))
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
        if (showHomeTopData.success && Array.isArray(showHomeTopData.data)) {
          setTopShowDogs(showHomeTopData.data.slice(0, 3))
        }
        if (doninoSpeedData.success && Array.isArray(doninoSpeedData.data)) {
          setDoninoSpeedRecords(doninoSpeedData.data as SpeedRecord[])
        }
        if (doninoCoursingData.success && Array.isArray(doninoCoursingData.data)) {
          setDoninoCoursingRecords(doninoCoursingData.data as CoursingRecord[])
        }
      } catch (error) {
        console.error('Failed to fetch home preview data:', error)
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
  const showSeasonSection = loading || activeDogs.length > 0 || topShowDogs.length > 0

  useGSAP(
    () => {
      if (!bodyReady || !pageRef.current) return
      const sections = Array.from(
        pageRef.current.querySelectorAll<HTMLElement>('[data-home-reveal]'),
      ).filter((el) => el.dataset.homeAnimated !== '1')
      if (!sections.length) return
      sections.forEach((el) => {
        el.dataset.homeAnimated = '1'
      })

      riseIn(sections, {
        y: 28,
        duration: 0.55,
        stagger: 0.11,
        delay: 0,
        ease: 'power2.out',
      })
    },
    { scope: pageRef, dependencies: [bodyReady, loading, showSeasonSection, showDoninoSection] },
  )

  return (
    <div className={`home-v2${bodyReady ? ' home-v2--revealed' : ''}`} ref={pageRef}>
      <SEO
        title="Статистика курсинга, бегов и выставок собак"
        description="Coursing Stats — вся карьера вашей собаки в одном месте: выступления, награды, рейтинги и экспертные оценки. Курсинг, бега и выставки с 2015 года."
        canonicalUrl="https://coursing-stats.ru/"
        keywords="курсинг, бега борзых, статистика курсинга, рейтинг собак, выставки РКФ"
      />
      <JsonLd data={organizationSchema} />
      <JsonLd data={webSiteSchema} />

      <HomeHeroStage onSettleStart={revealBody}>
        <div className="home-v2-hero-copy">
          <p className="home-v2-eyebrow">
            <span>2015 — {CURRENT_SEASON}</span>
            <span className="home-v2-eyebrow-sep" aria-hidden>
              ·
            </span>
            <span>курсинг · БЗМП · бега · выставки</span>
          </p>
          <h1>
            Статистика курсинга, бегов и <em>выставок</em>
          </h1>
          <p className="home-v2-lead">
            Вся карьера вашей собаки — в одном месте. История выступлений, награды, рейтинги и
            оценки судей.
          </p>
          <HomeDogSearch />
        </div>
      </HomeHeroStage>

      <div className="wrap home-v2-body" aria-hidden={!bodyReady}>
      {/* 4. Events: competitions + shows */}
      <section id="home-v2-events" className="home-v2-block" data-home-reveal>
        <SectionHead icon={Icons.calendar} title="Ближайшие события" />
        <div className="home-v2-events-grid">
          <div className="home-v2-events-col">
            <div className="home-v2-col-head">Соревнования</div>
            <div className="home-v2-events">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="home-event-row home-event-row--skeleton animate-pulse"
                    aria-hidden
                  >
                    <div className="h-8 w-10 rounded bg-old-money-200 dark:bg-charcoal-600" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-4/5 rounded bg-old-money-200 dark:bg-charcoal-600" />
                      <div className="h-2.5 w-1/2 rounded bg-old-money-100 dark:bg-charcoal-700" />
                    </div>
                  </div>
                ))
              ) : featuredEvents.length > 0 ? (
                featuredEvents.map((event) => (
                  <HomeEventRow key={event.id} event={event} compact />
                ))
              ) : (
                <p className="home-v2-empty">Нет событий в календаре</p>
              )}
              <a
                href="http://procoursing.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="home-v2-external"
              >
                Календарь на procoursing.ru →
              </a>
            </div>
          </div>
          <div className="home-v2-events-col">
            <div className="home-v2-col-head">Выставки</div>
            <div className="home-v2-events">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={`s${i}`}
                    className="home-event-row home-event-row--skeleton animate-pulse"
                    aria-hidden
                  >
                    <div className="h-8 w-10 rounded bg-old-money-200 dark:bg-charcoal-600" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-4/5 rounded bg-old-money-200 dark:bg-charcoal-600" />
                      <div className="h-2.5 w-1/2 rounded bg-old-money-100 dark:bg-charcoal-700" />
                    </div>
                  </div>
                ))
              ) : featuredShows.length > 0 ? (
                featuredShows.map((ex) => (
                  <HomeShowEventRow key={ex.id} exhibition={ex} />
                ))
              ) : (
                <p className="home-v2-empty">Нет ближайших выставок</p>
              )}
              {showsCalendarVisible ? (
                <Link to="/shows?tab=calendar" className="home-v2-external">
                  Календарь выставок →
                </Link>
              ) : (
                <a
                  href="https://rkf.online/exhibitions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home-v2-external"
                >
                  Календарь на rkf.online →
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Compact scale */}
      <section className="home-v2-scale" aria-label="Масштаб базы" data-home-reveal>
        <div className="home-v2-scale-primary">
          <div className="home-v2-scale-item">
            <div className="home-v2-scale-num">
              {loading ? '—' : <StatCounter value={stats?.events ?? 0} />}
            </div>
            <div className="home-v2-scale-lbl">соревнований</div>
          </div>
          <div className="home-v2-scale-item">
            <div className="home-v2-scale-num">
              {loading ? '—' : <StatCounter value={showStats?.exhibitions ?? 0} />}
            </div>
            <div className="home-v2-scale-lbl">выставок</div>
          </div>
        </div>
        <p className="home-v2-scale-secondary">
          {!loading && stats ? (
            <>
              {stats.results.toLocaleString('ru-RU')} результатов ·{' '}
              {stats.dogs.toLocaleString('ru-RU')} собак · {stats.breeds} пород ·{' '}
              {stats.judges} судей
              {showStats
                ? ` · ${showStats.appearances.toLocaleString('ru-RU')} выставочных записей`
                : ''}
            </>
          ) : (
            'Загрузка…'
          )}
        </p>
      </section>

      {/* 6. Season top */}
      {showSeasonSection ? (
        <section className="home-v2-block" data-home-reveal>
          <SectionHead
            icon={Icons.medal}
            title={`Топ сезона ${CURRENT_SEASON}`}
            href="/competitions?tab=ranking"
            linkLabel="Весь рейтинг →"
          />
          {loading ? (
            <p className="home-v2-empty">Загрузка…</p>
          ) : activeDogs.length > 0 || topShowDogs.length > 0 ? (
            <div className="home-v2-columns">
              <div className="home-v2-col">
                <div className="home-v2-col-head home-v2-col-head--tabs">
                  <span>Соревнования</span>
                  <HomeRankingTabs value={rankingTab} onChange={setRankingTab} />
                </div>
                <div className="donino-home-list">
                  {activeDogs.length > 0 ? (
                    activeDogs.map((dog) => {
                      const { primary } = parseDogName(dog.name_lat, dog.name_ru)
                      return (
                        <HomeSeasonTopRow
                          key={`comp-${dog.dog_id}`}
                          to={`/dog/${dog.dog_id}`}
                          name={primary}
                          breed={dog.breed}
                          dogId={dog.dog_id}
                          meta={competitionMeta(dog, rankingTab)}
                          metric={competitionMetric(dog, rankingTab)}
                        />
                      )
                    })
                  ) : (
                    <p className="donino-home-empty">Нет данных</p>
                  )}
                </div>
              </div>
              <div className="home-v2-col">
                <div className="home-v2-col-head">Выставки</div>
                <div className="donino-home-list">
                  {topShowDogs.length > 0 ? (
                    topShowDogs.map((dog) => {
                      const { primary } = parseDogName(dog.name_lat, dog.name_ru)
                      const shows =
                        dog.total_shows > 0
                          ? `${dog.total_shows} ${dog.total_shows === 1 ? 'выставка' : dog.total_shows < 5 ? 'выставки' : 'выставок'}`
                          : undefined
                      return (
                        <HomeSeasonTopRow
                          key={`show-${dog.id}-${dog.breed}`}
                          to={showDogProfilePath(dog)}
                          name={primary}
                          breed={dog.breed}
                          sex={dog.sex}
                          dogId={dog.competition_dog_id}
                          meta={shows}
                          metric={showHomeMetric(dog)}
                        />
                      )
                    })
                  ) : (
                    <p className="donino-home-empty">Нет данных</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="home-v2-empty">
              Пока нет данных за {CURRENT_SEASON}.{' '}
              <Link to="/competitions?tab=ranking">Открыть рейтинг</Link>
            </p>
          )}
        </section>
      ) : null}

      {/* 7. Donino */}
      {showDoninoSection && (
        <section className="home-v2-block" data-home-reveal>
          <SectionHead
            icon={Icons.speed}
            title="Рекорды Донино"
            href="/speed-records"
            linkLabel="Все рекорды →"
          />
          {loading ? (
            <p className="home-v2-empty">Загрузка…</p>
          ) : doninoSpeedRecords.length > 0 || doninoCoursingRanked.length > 0 ? (
            <div className="home-v2-columns">
              <div className="home-v2-col">
                <div className="home-v2-col-head">Замер</div>
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
              <div className="home-v2-col">
                <div className="home-v2-col-head">Бега 350 м</div>
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
          ) : (
            <p className="home-v2-empty">
              Пока нет данных.{' '}
              <Link to="/speed-records">Открыть рекорды</Link>
            </p>
          )}
        </section>
      )}

      {/* 8. Footer contact */}
      <footer className="home-v2-foot" data-home-reveal>
        <p className="home-v2-disclaimer">{DISCLAIMER}</p>
        <p className="home-v2-contact">
          Вопросы и правки данных:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </footer>
      </div>
    </div>
  )
}
