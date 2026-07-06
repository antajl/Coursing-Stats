import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../lib/icons'
import HeroIntro, { type HeroStats } from '../components/Hero'
import StatsStrip from '../components/StatsStrip'
import HomeEventRow from '../components/HomeEventRow'
import MedalTally from '../components/MedalTally'
import PodiumRankMark, { type PodiumPlace } from '../components/PodiumRankMark'
import { formatRecordDate } from '../lib/recordDates'
import { parseDogName } from '../lib/dogName'
import { api } from '../services/api'
import { type CalendarEvent } from './Events/eventListUtils'

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
}

interface CoursingRecord {
  name: string
  breed: string
  time_seconds: number
  date?: string
}

type RankingTab = 'placement' | 'score' | 'speed'
type DoninoTab = 'speed' | 'coursing'

const CURRENT_SEASON = new Date().getFullYear()

function normalizeStats(raw: Record<string, unknown> | null | undefined): HeroStats | null {
  if (!raw) return null
  return {
    events: Number(raw.events) || 0,
    dogs: Number(raw.dogs) || 0,
    results: Number(raw.results) || 0,
    breeds: Number(raw.breeds) || 0,
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
  action,
}: {
  icon: typeof Icons.calendar
  title: string
  action?: ReactNode
}) {
  return (
    <div className="divider">
      <Icon className="h-5 w-5 text-camel-500" strokeWidth={1.75} />
      <h2>{title}</h2>
      <div className="line" />
      {action}
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

function HomeMiniTabs<T extends string>({
  tabs,
  active,
  onChange,
  ariaLabel,
}: {
  tabs: { id: T; label: string }[]
  active: T
  onChange: (tab: T) => void
  ariaLabel: string
}) {
  return (
    <div className="home-ranking-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`home-ranking-tab ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
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

function PodiumSkeleton() {
  return (
    <div className="podium-preview">
      {[2, 1, 3].map((place) => (
        <div
          key={place}
          className={`pod-card animate-pulse ${place === 1 ? 'gold' : ''}`}
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

function RankingTabs({
  active,
  onChange,
}: {
  active: RankingTab
  onChange: (tab: RankingTab) => void
}) {
  return (
    <HomeMiniTabs
      ariaLabel="Тип рейтинга"
      active={active}
      onChange={onChange}
      tabs={[
        { id: 'placement', label: 'Медали' },
        { id: 'score', label: 'Очки' },
        { id: 'speed', label: 'Скорость' },
      ]}
    />
  )
}

function DoninoTabs({
  active,
  onChange,
}: {
  active: DoninoTab
  onChange: (tab: DoninoTab) => void
}) {
  return (
    <HomeMiniTabs
      ariaLabel="Дисциплина Донино"
      active={active}
      onChange={onChange}
      tabs={[
        { id: 'speed', label: 'Замер' },
        { id: 'coursing', label: 'Бега 350 м' },
      ]}
    />
  )
}

function formatScore(value?: number | null): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(1)
}

function formatSpeed(value?: number | string | null): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(1)
}

function formatTime(value?: number | string | null): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(2)
}

export default function Home() {
  const [stats, setStats] = useState<HeroStats | null>(null)
  const [featuredEvents, setFeaturedEvents] = useState<CalendarEvent[]>([])
  const [topPlacement, setTopPlacement] = useState<TopDog[]>([])
  const [topScore, setTopScore] = useState<TopDog[]>([])
  const [topSpeed, setTopSpeed] = useState<TopDog[]>([])
  const [doninoSpeedRecords, setDoninoSpeedRecords] = useState<SpeedRecord[]>([])
  const [doninoCoursingRecords, setDoninoCoursingRecords] = useState<CoursingRecord[]>([])
  const [rankingTab, setRankingTab] = useState<RankingTab>('placement')
  const [doninoTab, setDoninoTab] = useState<DoninoTab>('speed')
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
          api.getTopScore(String(CURRENT_SEASON), '', 0, 'best_score', 3, 0),
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
  const activeDoninoRecords =
    doninoTab === 'speed' ? doninoSpeedRecords : rankCoursingRecords(doninoCoursingRecords)
  const doninoLink =
    doninoTab === 'speed' ? '/speed-records?tab=table' : '/speed-records?tab=coursing'
  const showDoninoSection =
    loading || doninoSpeedRecords.length > 0 || doninoCoursingRecords.length > 0

  return (
    <div className="wrap">
      <section className="hero-dashboard">
        <HeroIntro />
        <div className="hero-events">
          <div className="hero-events-head">
            <h3>Ближайшие события</h3>
            <Link to="/competitions?tab=calendar" className="hero-events-link">
              Весь календарь →
            </Link>
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
      </section>

      <StatsStrip stats={stats} loading={loading} />

      <SectionDivider
        icon={Icons.medal}
        title={`Топ сезона ${CURRENT_SEASON}`}
        action={<RankingTabs active={rankingTab} onChange={setRankingTab} />}
      />

      {loading ? (
        <PodiumSkeleton />
      ) : activeDogs.length > 0 ? (
        <div className="podium-preview">
          {podiumSlots(activeDogs).map(({ item: dog, place, isGold }) => (
            <Link
              key={`${rankingTab}-${dog.dog_id}`}
              to={`/dog/${dog.dog_id}`}
              className={`pod-card flex flex-col items-center no-underline text-inherit ${isGold ? 'gold' : ''}`}
            >
              <PodiumRankMark place={place as PodiumPlace} size={isGold ? 'lg' : 'md'} />
              {(() => {
                const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
                return (
                  <>
                    <div className="dog-lat">{primary}</div>
                    {secondary && <div className="dog-ru">{secondary}</div>}
                  </>
                )
              })()}
              {dog.breed && <div className="pod-sub">{dog.breed}</div>}
              {rankingTab === 'placement' ? (
                <>
                  <MedalTally
                    className="score"
                    size="xl"
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
                    {formatScore(dog.best_score)}
                    <span className="score-unit">баллов</span>
                  </div>
                  <div className="pod-foot">
                    {dog.avg_judge_score != null && (
                      <span>средн. оценка {formatScore(dog.avg_judge_score)}</span>
                    )}
                    {formatStarts(dog.total_starts) && (
                      <span>{formatStarts(dog.total_starts)}</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="score">
                    {formatSpeed(dog.best_speed)}
                    <span className="score-unit">км/ч</span>
                  </div>
                  <div className="pod-foot">
                    {dog.avg_speed != null && (
                      <span>средн. {formatSpeed(dog.avg_speed)}</span>
                    )}
                    {formatStarts(dog.total_starts) && (
                      <span>{formatStarts(dog.total_starts)}</span>
                    )}
                  </div>
                </>
              )}
            </Link>
          ))}
        </div>
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
          <SectionDivider
            icon={Icons.speed}
            title="Рекорды Донино · лучшие по породам"
            action={<DoninoTabs active={doninoTab} onChange={setDoninoTab} />}
          />
          {loading ? (
            <PodiumSkeleton />
          ) : activeDoninoRecords.length > 0 ? (
            <div className="podium-preview">
              {doninoTab === 'speed'
                ? podiumSlots(activeDoninoRecords as SpeedRecord[]).map(({ item: record, place, isGold }) => (
                    <Link
                      key={`speed-${record.breed}-${record.name}-${record.date ?? place}`}
                      to={`/donino-dog/${encodeURIComponent(record.name)}/${encodeURIComponent(record.breed)}`}
                      className={`pod-card flex flex-col items-center no-underline text-inherit ${isGold ? 'gold' : ''}`}
                    >
                      <PodiumRankMark place={place as PodiumPlace} size={isGold ? 'lg' : 'md'} />
                      <div className="dog-lat">{record.name}</div>
                      <div className="pod-sub">{record.breed}</div>
                      <div className="score">
                        {formatSpeed(record.speed_km_h)}
                        <span className="score-unit">км/ч</span>
                      </div>
                      <div className="pod-foot">
                        {record.date && (
                          <span className="pod-date">{formatRecordDate(record.date)}</span>
                        )}
                      </div>
                    </Link>
                  ))
                : podiumSlots(activeDoninoRecords as CoursingRecord[]).map(({ item: record, place, isGold }) => (
                    <Link
                      key={`coursing-${record.breed}-${record.name}-${record.date ?? place}`}
                      to={`/donino-dog/${encodeURIComponent(record.name)}/${encodeURIComponent(record.breed)}`}
                      className={`pod-card flex flex-col items-center no-underline text-inherit ${isGold ? 'gold' : ''}`}
                    >
                      <PodiumRankMark place={place as PodiumPlace} size={isGold ? 'lg' : 'md'} />
                      <div className="dog-lat">{record.name}</div>
                      <div className="pod-sub">{record.breed}</div>
                      <div className="score">
                        {formatTime(record.time_seconds)}
                        <span className="score-unit">сек</span>
                      </div>
                      <div className="pod-foot">
                        {record.date && (
                          <span className="pod-date">{formatRecordDate(record.date)}</span>
                        )}
                      </div>
                    </Link>
                  ))}
            </div>
          ) : (
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
              Пока нет данных по{' '}
              {doninoTab === 'speed' ? 'замеру скорости' : 'бегам 350 м'}.{' '}
              <Link to={doninoLink} className="font-semibold text-camel-700 hover:underline dark:text-camel-400">
                Открыть рекорды
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  )
}
