import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getShowExhibition } from '../../lib/staticData'
import type { ShowExhibition, BreedCatalogRow, BreedTitleRow, ClassResultGroup, ShowResultRow } from '../showExhibitionUtils'

export function useShowExhibitionData() {
  const { id } = useParams<{ id: string }>()
  const [exhibition, setExhibition] = useState<ShowExhibition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setError('Exhibition ID not found')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await getShowExhibition(id)
        if (!data) {
          setError('Exhibition not found')
        } else {
          setExhibition(data)
        }
      } catch (err) {
        setError('Failed to load exhibition')
        console.error('Failed to load exhibition:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  return { exhibition, loading, error, exhibitionId: id }
}
