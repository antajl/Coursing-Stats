import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useFavorites } from '../../contexts/FavoritesContext'
import { authApi } from '../../lib/authApi'
import { createLogger } from '../../lib/logging'
import { AccountHeader } from './AccountHeader'
import { ActiveDogHero } from './ActiveDogHero'
import { BreedSummary } from './BreedSummary'
import { EventHighlights } from './EventHighlights'
import { FavoritesSection } from './FavoritesSection'
import { FavoritesStatsStrip } from './FavoritesStatsStrip'
import { LinkAccountModal } from './AccountModals'
import {
  loadFavoriteDog,
  recentStartsFromFavorites,
  summarizeBreeds,
  summarizeFavoritesStats,
  type FavoriteDog,
} from './accountFavorites'
import {
  loadUpcomingCalendarEvents,
  pickNearestUpcoming,
  type UpcomingCalendarEvent,
} from './upcomingCalendar'

const log = createLogger('account')

export default function AccountPage() {
  const { user, isAuthenticated, setUser } = useAuth()
  const { favoriteIds, ready: favoritesReady, removeFavorites, activeId, setActive } =
    useFavorites()

  const [dogs, setDogs] = useState<FavoriteDog[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [missingCount, setMissingCount] = useState(0)
  const profilesLoadedOnce = useRef(false)

  const [upcoming, setUpcoming] = useState<UpcomingCalendarEvent | null>(null)
  const [calendarLoading, setCalendarLoading] = useState(false)

  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkEmail, setLinkEmail] = useState('')
  const [linkProvider, setLinkProvider] = useState('')
  const [linkProviderUserId, setLinkProviderUserId] = useState('')
  const [linkPassword, setLinkPassword] = useState('')
  const [linking, setLinking] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const linkAccount = params.get('link_account')

    if (linkAccount === 'true') {
      setLinkEmail(params.get('email') || '')
      setLinkProvider(params.get('provider') || '')
      setLinkProviderUserId(params.get('provider_user_id') || '')
      setShowLinkModal(true)
      window.history.replaceState({}, '', '/account')
    } else if (token) {
      authApi.setTokenFromOAuth(token)
      window.history.replaceState({}, '', '/account')
      void authApi.refreshSession().then((userData) => {
        if (userData) setUser(userData)
        else log.warn('OAuth session refresh returned null')
      })
    }
  }, [setUser])

  useEffect(() => {
    if (!isAuthenticated || !favoritesReady) return

    let cancelled = false
    const load = async () => {
      if (!profilesLoadedOnce.current) setLoadingProfiles(true)

      const known = new Map(dogs.map((d) => [d.id, d]))
      const profiles = await Promise.all(
        favoriteIds.map(async (id) => {
          const existing = known.get(id)
          if (existing) return existing
          try {
            return await loadFavoriteDog(id)
          } catch {
            return null
          }
        }),
      )
      if (cancelled) return
      const loaded = profiles.filter((d): d is FavoriteDog => d !== null)
      setDogs(loaded)
      setMissingCount(favoriteIds.length - loaded.length)
      profilesLoadedOnce.current = true
      setLoadingProfiles(false)
    }

    void load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, favoritesReady, favoriteIds])

  const breedKey = useMemo(
    () =>
      [...new Set(dogs.flatMap((d) => [d.breed, d.breedDisplay].filter(Boolean)))]
        .sort()
        .join('|'),
    [dogs],
  )

  useEffect(() => {
    if (!isAuthenticated || dogs.length === 0) {
      setUpcoming(null)
      return
    }
    let cancelled = false
    setCalendarLoading(true)
    const breeds = breedKey ? breedKey.split('|') : []
    void loadUpcomingCalendarEvents()
      .then((events) => {
        if (cancelled) return
        setUpcoming(pickNearestUpcoming(events, { breeds, withinDays: 45 }))
      })
      .catch(() => {
        if (!cancelled) setUpcoming(null)
      })
      .finally(() => {
        if (!cancelled) setCalendarLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, dogs.length, breedKey])

  const breedSummary = useMemo(() => summarizeBreeds(dogs), [dogs])
  const aggregateStats = useMemo(() => summarizeFavoritesStats(dogs), [dogs])
  const recentStarts = useMemo(() => recentStartsFromFavorites(dogs, 1), [dogs])
  const activeDog = useMemo(() => {
    if (dogs.length === 0) return null
    return dogs.find((d) => d.id === activeId) ?? dogs[0]
  }, [dogs, activeId])

  const lastHighlight = useMemo(() => {
    if (activeDog?.lastEvent) return { dog: activeDog, event: activeDog.lastEvent }
    return recentStarts[0] ?? null
  }, [activeDog, recentStarts])

  const showHero = favoritesReady && !loadingProfiles && !!activeDog
  const showBreedSummary = !loadingProfiles && dogs.length >= 2
  const showStats = !loadingProfiles && dogs.length > 0 && aggregateStats.starts > 0
  const showEvents = !loadingProfiles && dogs.length > 0

  const handleRemoveOne = async (id: string) => {
    try {
      await removeFavorites([id])
      setDogs((prev) => prev.filter((d) => d.id !== id))
    } catch (error) {
      log.error('Failed to remove favorite', error as Error, { dogId: id })
    }
  }

  const handleRemoveMany = async (ids: string[]) => {
    try {
      await removeFavorites(ids)
      const idSet = new Set(ids)
      setDogs((prev) => prev.filter((d) => !idSet.has(d.id)))
    } catch (error) {
      log.error('Failed to bulk-remove favorites', error as Error, { count: ids.length })
    }
  }

  const handleLinkAccount = async () => {
    setLinking(true)
    try {
      const response = await fetch('https://auth-worker.antajltube.workers.dev/v1/oauth/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: linkEmail,
          password: linkPassword,
          provider: linkProvider,
          provider_user_id: linkProviderUserId,
        }),
      })

      if (!response.ok) {
        const errBody = (await response.json()) as { error?: string }
        throw new Error(errBody.error || 'Failed to link account')
      }

      const data = (await response.json()) as { token: string }
      authApi.setTokenFromOAuth(data.token)
      setShowLinkModal(false)
      window.location.reload()
    } catch (error) {
      log.error('Failed to link account', error as Error)
      alert('Не удалось связать аккаунт: ' + (error as Error).message)
    } finally {
      setLinking(false)
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-charcoal-900 dark:text-cream-100 mb-3">
            Войдите, чтобы следить за собаками
          </h1>
          <p className="text-charcoal-600 dark:text-cream-300 mb-6">
            Избранные собаки, участия и результаты — в одном месте.
          </p>
          <Link
            to="/login"
            className="inline-block bg-camel-700 hover:bg-camel-800 text-cream-50 font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            Войти
          </Link>
        </div>
      </div>
    )
  }

  const loading = !favoritesReady || loadingProfiles

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
      <AccountHeader
        user={user}
        setUser={setUser}
        dogCount={dogs.length}
        participationCount={aggregateStats.starts}
      />

      {showHero && activeDog ? <ActiveDogHero dog={activeDog} /> : null}

      {showEvents ? (
        <EventHighlights
          upcoming={upcoming}
          last={lastHighlight}
          calendarLoading={calendarLoading}
        />
      ) : null}

      <FavoritesSection
        dogs={dogs}
        idOrder={favoriteIds}
        activeId={activeDog?.id ?? activeId}
        loading={loading}
        missingCount={missingCount}
        onRemoveOne={handleRemoveOne}
        onRemoveMany={handleRemoveMany}
        onSetActive={setActive}
      />

      {showBreedSummary ? <BreedSummary items={breedSummary} /> : null}

      {showStats ? <FavoritesStatsStrip stats={aggregateStats} /> : null}

      <div className="mt-2 mb-4">
        <Link
          to="/account/settings"
          className="inline-flex items-center text-sm text-charcoal-500 dark:text-charcoal-400 hover:text-charcoal-800 dark:hover:text-cream-100"
        >
          Настройки аккаунта
        </Link>
      </div>

      <LinkAccountModal
        open={showLinkModal}
        email={linkEmail}
        provider={linkProvider}
        password={linkPassword}
        linking={linking}
        onPasswordChange={setLinkPassword}
        onConfirm={() => void handleLinkAccount()}
        onCancel={() => setShowLinkModal(false)}
      />
    </div>
  )
}
