import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { resolveShowDogDetail } from '../../lib/staticData'
import SkeletonLoader from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import { SEO } from '../../components/SEO'
import { ShowsColumn } from '../DogProfile/ShowsColumn'
import { EmptyDisciplineColumn } from '../DogProfile/EmptyDisciplineColumn'
import { DogProfileHeader, type ProfileHeaderRank } from '../DogProfile/DogProfileHeader'
import type { ShowDogCardData } from './ShowDogCard'
import type { DogTitle } from '../../lib/qualificationTitles'

export default function ShowDogProfile() {
  const params = useParams<{ showDogId: string }>()
  const showDogId = params.showDogId || ''
  
  const [dog, setDog] = useState<ShowDogCardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [headerRanks, setHeaderRanks] = useState<ProfileHeaderRank[]>([])
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    async function loadShowDog() {
      if (!showDogId) {
        setError('Missing show dog ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const result = await resolveShowDogDetail({ profileId: showDogId })
        
        if (!result || !result.success || !result.data) {
          setError('Show dog not found')
          setLoading(false)
          return
        }

        setDog(result.data as ShowDogCardData)
        
        // Build header ranks for show profile
        const ranks: ProfileHeaderRank[] = []
        if (result.data.rank) {
          ranks.push({
            key: 'shows',
            label: 'Рейтинг выставок',
            rank: result.data.rank,
            href: `/shows?tab=ranking`,
          })
        }
        setHeaderRanks(ranks)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load show dog')
      } finally {
        setLoading(false)
      }
    }

    loadShowDog()
  }, [showDogId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SkeletonLoader />
      </div>
    )
  }

  if (error || !dog) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState message={error || 'Show dog not found'} />
      </div>
    )
  }

  // If this show dog has a competition link, redirect to competition profile
  if (dog.competition_dog_id && Number.isFinite(Number(dog.competition_dog_id))) {
    return <Navigate to={`/dog/${dog.competition_dog_id}`} replace />
  }

  const title = `${dog.name_lat || dog.name_ru || ''} - ${dog.breed || ''}`
  const description = `Выставочная история собаки ${dog.name_lat || dog.name_ru || ''} породы ${dog.breed || ''}. Рейтинг: ${dog.rank || 'N/A'}, выставок: ${dog.total_shows || 0}.`

  const handleBack = () => {
    window.history.back()
  }

  const handleExport = () => {
    setExporting(true)
    setTimeout(() => setExporting(false), 1000)
  }

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonicalUrl={`/shows/dog/${showDogId}`}
      />
      
      <div className="container mx-auto px-4 py-8">
        <DogProfileHeader
          dog={dog}
          showTitles={[]}
          competitionTitles={[]}
          showRuName={false}
          exporting={exporting}
          onBack={handleBack}
          onExport={handleExport}
          ranks={headerRanks}
        />

        {/* Competition link block */}
        {dog.competition_dog_id && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Эта собака также участвует в соревнованиях.{' '}
              <Link 
                to={`/dog/${dog.competition_dog_id}`}
                className="font-semibold underline hover:text-blue-600 dark:hover:text-blue-300"
              >
                Посмотреть спортивный профиль
              </Link>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Empty columns for coursing and racing */}
          <EmptyDisciplineColumn 
            title="Курсинг"
            theme="camel"
          />
          <EmptyDisciplineColumn 
            title="Бег с механическим зайцем"
            theme="camel"
          />
          
          {/* Shows column */}
          <ShowsColumn dog={dog} />
        </div>
      </div>
    </>
  )
}
