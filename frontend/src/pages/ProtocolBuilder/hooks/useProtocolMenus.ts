import { useEffect, useRef, useState } from 'react'
import type {
  ActiveAwardsMenuState,
  ActiveCategoryMenuState,
  ActiveDogSexMenuState,
  ActiveRunMenuState,
  ActiveSearchDogState,
} from '../types'

export function useProtocolMenus() {
  const [activeSearchDog, setActiveSearchDog] = useState<ActiveSearchDogState | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeAwardsMenu, setActiveAwardsMenu] = useState<ActiveAwardsMenuState | null>(null)
  const [activeRunMenu, setActiveRunMenu] = useState<ActiveRunMenuState | null>(null)
  const [activeBreedMenu, setActiveBreedMenu] = useState<ActiveCategoryMenuState | null>(null)
  const [breedSearch, setBreedSearch] = useState('')
  const [activeClassMenu, setActiveClassMenu] = useState<ActiveCategoryMenuState | null>(null)
  const [activeCategorySexMenu, setActiveCategorySexMenu] = useState<ActiveCategoryMenuState | null>(null)
  const [activeDogSexMenu, setActiveDogSexMenu] = useState<ActiveDogSexMenuState | null>(null)
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)
  const downloadMenuRef = useRef<HTMLDivElement>(null)

  const closeAllDropdowns = () => {
    setActiveRunMenu(null)
    setActiveAwardsMenu(null)
    setActiveSearchDog(null)
    setActiveBreedMenu(null)
    setActiveClassMenu(null)
    setActiveCategorySexMenu(null)
    setActiveDogSexMenu(null)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setIsDownloadOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement | null
      if (target?.closest && target.closest('[data-portal-menu]')) {
        return
      }
      closeAllDropdowns()
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllDropdowns()
        setIsDownloadOpen(false)
      }
    }
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const resetAllMenus = () => {
    closeAllDropdowns()
    setBreedSearch('')
    setSearchQuery('')
  }

  return {
    activeSearchDog,
    setActiveSearchDog,
    searchQuery,
    setSearchQuery,
    activeAwardsMenu,
    setActiveAwardsMenu,
    activeRunMenu,
    setActiveRunMenu,
    activeBreedMenu,
    setActiveBreedMenu,
    breedSearch,
    setBreedSearch,
    activeClassMenu,
    setActiveClassMenu,
    activeCategorySexMenu,
    setActiveCategorySexMenu,
    activeDogSexMenu,
    setActiveDogSexMenu,
    isDownloadOpen,
    setIsDownloadOpen,
    downloadMenuRef,
    resetAllMenus,
  }
}
