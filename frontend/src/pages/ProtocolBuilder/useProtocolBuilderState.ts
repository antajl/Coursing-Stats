import { useState, useEffect, useRef } from 'react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import type {
  CompetitionHeader,
  CategoryGroup,
  DogParticipant,
  CompetitionKind,
  RunStatus,
  ActiveRunMenuState,
  ActiveSearchDogState,
  ActiveAwardsMenuState,
  ActiveCategoryMenuState,
  ActiveDogSexMenuState
} from './types'
import {
  createNewCategory,
  createNewParticipant,
  createRunData,
  createEmptyScores
} from './types'
import {
  STORAGE_KEY,
  DEFAULT_HEADER,
  createDefaultCategories,
  type ExistingDog
} from './constants'

export function useProtocolBuilderState() {
  const [kind, setKind] = useState<CompetitionKind>('coursing')
  const [header, setHeader] = useState<CompetitionHeader>(DEFAULT_HEADER)

  // Категории: по умолчанию 2 забега
  const [categories, setCategories] = useState<CategoryGroup[]>(createDefaultCategories)

  // База существующих собак для автокомплита
  const [allExistingDogs, setAllExistingDogs] = useState<ExistingDog[]>([])
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
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [customBreedCatIds, setCustomBreedCatIds] = useState<Record<string, boolean>>({})
  const [customClassCatIds, setCustomClassCatIds] = useState<Record<string, boolean>>({})
  const downloadMenuRef = useRef<HTMLDivElement>(null)
  const printableRef = useRef<HTMLDivElement>(null)

  // Закрытие выпадающего меню "Скачать" при клике вне его
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setIsDownloadOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Закрытие меню статуса забега, титулов, категорий и автокомплита при скролле окна или Escape
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement | null
      // Не закрывать меню, если пользователь прокручивает сам выпадающий список (титулы, порода, автокомплит)
      if (target && target.closest && target.closest('[data-portal-menu]')) {
        return
      }
      setActiveRunMenu(null)
      setActiveAwardsMenu(null)
      setActiveSearchDog(null)
      setActiveBreedMenu(null)
      setActiveClassMenu(null)
      setActiveCategorySexMenu(null)
      setActiveDogSexMenu(null)
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveRunMenu(null)
        setActiveAwardsMenu(null)
        setActiveSearchDog(null)
        setActiveBreedMenu(null)
        setActiveClassMenu(null)
        setActiveCategorySexMenu(null)
        setActiveDogSexMenu(null)
      }
    }
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Загрузка индекса собак сайта для быстрого автозаполнения
  useEffect(() => {
    fetch('/data/v1/indexes/dogs-index.json')
      .then((res) => res.json())
      .then(
        (
          data: Array<{
            name_ru?: string
            name_lat?: string
            breed?: string
            sex?: 'male' | 'female' | null
          }>
        ) => {
          if (!Array.isArray(data)) return
          const list: ExistingDog[] = []
          const seen = new Set<string>()
          data.forEach((d) => {
            const nameRu = (d.name_ru || '').trim()
            const nameLat = (d.name_lat || '').trim()
            const primaryName = (nameRu || nameLat).toUpperCase()
            const breed = (d.breed || '').trim()
            const key = `${primaryName}::${breed.toUpperCase()}`
            if (primaryName && !seen.has(key)) {
              seen.add(key)
              list.push({
                name: primaryName,
                name_ru: nameRu,
                name_lat: nameLat,
                breed,
                sex: d.sex || null
              })
            }
          })
          setAllExistingDogs(list)
        }
      )
      .catch(() => {})
  }, [])

  // Загрузка черновика из localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.header) {
          const raw = parsed.header
          setHeader({
            ...DEFAULT_HEADER,
            ...raw,
            title:
              raw.title === 'Чемпионат РКФ по курсингу'
                ? DEFAULT_HEADER.title
                : raw.title || DEFAULT_HEADER.title,
            rank: raw.rank === 'ЧРКФ' ? DEFAULT_HEADER.rank : raw.rank || DEFAULT_HEADER.rank,
            location:
              raw.location === 'Московская обл., Донино'
                ? DEFAULT_HEADER.location
                : raw.location || DEFAULT_HEADER.location,
            club:
              raw.club === 'МКОО Клуб Спортивного Собаководства'
                ? DEFAULT_HEADER.club
                : raw.club || DEFAULT_HEADER.club
          })
        }
        if (parsed.kind) setKind(parsed.kind)
        if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
          // Нормализация runs и awards с защитой от повреждённых/устаревших черновиков
          const normCats = parsed.categories.map((c: any) => ({
            ...c,
            id: c.id || 'cat_' + Math.random().toString(36).substring(2, 9),
            breed: c.breed || 'Басенджи',
            className: c.className || 'Стандартный',
            sex: c.sex || 'male',
            runsCount: c.runsCount === 1 || c.runsCount === 2 || c.runsCount === 3 ? c.runsCount : 2,
            dogs: (c.dogs || []).map((d: any, dIdx: number) => {
              const rawRuns =
                Array.isArray(d.runs) && d.runs.length > 0
                  ? d.runs
                  : [
                      d.run1_scores
                        ? {
                            heat: d.run1_heat || '1',
                            blanket: d.run1_blanket || 'red',
                            scores: d.run1_scores
                          }
                        : createRunData('1', 'red'),
                      d.run2_scores
                        ? {
                            heat: d.run2_heat || '1',
                            blanket: d.run2_blanket || 'white',
                            scores: d.run2_scores
                          }
                        : createRunData('1', 'white')
                    ]

              const runs = rawRuns.map((r: any, rIdx: number) => ({
                heat:
                  String(r?.heat || String(rIdx + 1))
                    .replace(/\D/g, '')
                    .slice(0, 3) || String(rIdx + 1),
                blanket: r?.blanket || (rIdx === 0 ? 'red' : rIdx === 1 ? 'white' : 'blue'),
                scores: r?.scores
                  ? {
                      speed: typeof r.scores.speed === 'number' ? r.scores.speed : '',
                      enthusiasm: typeof r.scores.enthusiasm === 'number' ? r.scores.enthusiasm : '',
                      intelligence:
                        typeof r.scores.intelligence === 'number' ? r.scores.intelligence : '',
                      agility: typeof r.scores.agility === 'number' ? r.scores.agility : '',
                      endurance: typeof r.scores.endurance === 'number' ? r.scores.endurance : ''
                    }
                  : createEmptyScores(),
                status: r?.status || 'normal',
                reason: r?.reason || ''
              }))

              return {
                id: d.id || 'dog_' + Math.random().toString(36).substring(2, 9),
                catalogNumber: d.catalogNumber ?? String(dIdx + 1),
                dogName: d.dogName || '',
                sex: d.sex || 'male',
                runs,
                racing_box: d.racing_box || '1',
                racing_time1: d.racing_time1 || '',
                racing_time2: d.racing_time2 || '',
                racing_final_time: d.racing_final_time || '',
                disqualified: Boolean(d.disqualified),
                comment: d.comment || '',
                awards: Array.isArray(d.awards) ? d.awards : []
              }
            })
          }))
          setCategories(normCats)
        }
      }
    } catch {}
  }, [])

  // Автосохранение черновика
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ header, kind, categories }))
    } catch {}
  }, [header, kind, categories])

  // Добавление новой категории
  const addCategory = () => {
    let totalDogs = 0
    categories.forEach((c) => {
      totalDogs += c.dogs.length
    })
    const lastCat = categories[categories.length - 1]
    const nextBreed = lastCat ? lastCat.breed : 'Уиппет'
    const nextClass = lastCat ? lastCat.className : 'Стандартный'
    const nextSex = lastCat ? (lastCat.sex === 'male' ? 'female' : 'male') : 'male'
    const nextRuns = lastCat ? lastCat.runsCount : 2
    setCategories((prev) => [
      ...prev,
      createNewCategory(nextBreed, nextClass, nextSex, 2, totalDogs + 1, nextRuns)
    ])
  }

  const removeCategory = (categoryId: string) => {
    if (categories.length <= 1) return
    setCategories((prev) => prev.filter((c) => c.id !== categoryId))
  }

  const updateCategoryMeta = (categoryId: string, updates: Partial<CategoryGroup>) => {
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, ...updates } : c)))
  }

  // Изменение количества забегов в категории (1, 2 или 3)
  const setCategoryRunsCount = (categoryId: string, count: 1 | 2 | 3) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        const updatedDogs = cat.dogs.map((dog) => {
          const currentRuns = [...dog.runs]
          while (currentRuns.length < count) {
            const nextIdx = currentRuns.length
            const bColors: Array<'red' | 'white' | 'blue'> = ['red', 'white', 'blue']
            currentRuns.push(createRunData('1', bColors[nextIdx % 3]))
          }
          return {
            ...dog,
            runs: currentRuns
          }
        })
        return {
          ...cat,
          runsCount: count,
          dogs: updatedDogs
        }
      })
    )
  }

  // Добавление собаки в категорию
  const addDogToCategory = (categoryId: string) => {
    let totalDogs = 0
    categories.forEach((c) => {
      totalDogs += c.dogs.length
    })

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          dogs: [...cat.dogs, createNewParticipant(totalDogs + 1, cat.runsCount)]
        }
      })
    )
  }

  const removeDogFromCategory = (categoryId: string, dogId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        if (cat.dogs.length <= 1) return cat
        return {
          ...cat,
          dogs: cat.dogs.filter((d) => d.id !== dogId)
        }
      })
    )
  }

  const updateDog = (categoryId: string, dogId: string, updates: Partial<DogParticipant>) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          dogs: cat.dogs.map((d) => (d.id === dogId ? { ...d, ...updates } : d))
        }
      })
    )
  }

  const updateRunField = (
    categoryId: string,
    dogId: string,
    runIndex: number,
    field: 'heat' | 'blanket',
    value: string
  ) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          dogs: cat.dogs.map((d) => {
            if (d.id !== dogId) return d
            const runs = [...d.runs]
            const sanitized = field === 'heat' ? String(value || '').replace(/\D/g, '').slice(0, 3) : value
            runs[runIndex] = { ...runs[runIndex], [field]: sanitized }
            return { ...d, runs }
          })
        }
      })
    )
  }

  const BLANKET_CYCLE: Array<'red' | 'white' | 'blue'> = ['red', 'white', 'blue']

  const cycleBlanket = (categoryId: string, dogId: string, runIndex: number) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          dogs: cat.dogs.map((d) => {
            if (d.id !== dogId) return d
            const runs = [...d.runs]
            if (!runs[runIndex]) runs[runIndex] = createRunData()
            const current = (runs[runIndex].blanket || 'red') as 'red' | 'white' | 'blue'
            const nextIdx = (BLANKET_CYCLE.indexOf(current) + 1) % BLANKET_CYCLE.length
            runs[runIndex] = { ...runs[runIndex], blanket: BLANKET_CYCLE[nextIdx] }
            return { ...d, runs }
          })
        }
      })
    )
  }

  const updateRunScore = (
    categoryId: string,
    dogId: string,
    runIndex: number,
    criterion: 'speed' | 'enthusiasm' | 'intelligence' | 'agility' | 'endurance',
    value: string
  ) => {
    const num = value === '' ? '' : Math.min(20, Math.max(0, Number(value)))
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          dogs: cat.dogs.map((d) => {
            if (d.id !== dogId) return d
            const runs = [...d.runs]
            if (!runs[runIndex]) runs[runIndex] = createRunData()
            runs[runIndex] = {
              ...runs[runIndex],
              scores: {
                ...runs[runIndex].scores,
                [criterion]: num
              }
            }
            return { ...d, runs }
          })
        }
      })
    )
  }

  const setRunStatus = (
    categoryId: string,
    dogId: string,
    runIndex: number,
    status: RunStatus,
    reason?: string
  ) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        let targetDog: DogParticipant | null = null
        const updatedDogs = cat.dogs.map((d) => {
          if (d.id !== dogId) return d
          const runs = [...d.runs]
          if (!runs[runIndex]) runs[runIndex] = createRunData()
          runs[runIndex] = {
            ...runs[runIndex],
            status,
            reason: reason !== undefined ? reason : runs[runIndex].reason || ''
          }
          // Если на этом забеге дисквалификация или неявка, следующие забеги очищаются
          if (status !== 'normal') {
            for (let next = runIndex + 1; next < runs.length; next++) {
              runs[next] = createRunData(runs[next]?.heat || '1', runs[next]?.blanket || 'white', 'normal', '')
            }
          }
          targetDog = { ...d, runs }
          return targetDog
        })

        // Если у собаки неявка, перемещаем эту собаку в самый низ списка категории
        if (status === 'absent' && targetDog) {
          const otherDogs = updatedDogs.filter((d) => d.id !== dogId)
          return {
            ...cat,
            dogs: [...otherDogs, targetDog]
          }
        }

        return {
          ...cat,
          dogs: updatedDogs
        }
      })
    )
  }

  const updateRunReason = (
    categoryId: string,
    dogId: string,
    runIndex: number,
    reason: string
  ) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          dogs: cat.dogs.map((d) => {
            if (d.id !== dogId) return d
            const runs = [...d.runs]
            if (!runs[runIndex]) runs[runIndex] = createRunData()
            runs[runIndex] = { ...runs[runIndex], reason }
            return { ...d, runs }
          })
        }
      })
    )
  }

  const toggleAward = (categoryId: string, dogId: string, award: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          dogs: cat.dogs.map((d) => {
            if (d.id !== dogId) return d
            const currentAwards = d.awards || []
            const exists = currentAwards.includes(award)
            return {
              ...d,
              awards: exists ? currentAwards.filter((a) => a !== award) : [...currentAwards, award]
            }
          })
        }
      })
    )
  }

  // Фильтр автокомплита для клички
  const filteredExistingDogs =
    searchQuery.trim().length >= 2
      ? allExistingDogs
          .filter((d) => {
            const q = searchQuery.toLowerCase().trim()
            return (
              d.name.toLowerCase().includes(q) ||
              (d.name_ru && d.name_ru.toLowerCase().includes(q)) ||
              (d.name_lat && d.name_lat.toLowerCase().includes(q))
            )
          })
          .slice(0, 10)
      : []

  const selectExistingDog = (categoryId: string, dogId: string, dog: ExistingDog) => {
    const updates: Partial<DogParticipant> = { dogName: dog.name }
    if (dog.sex) {
      updates.sex = dog.sex
    }
    updateDog(categoryId, dogId, updates)
    if (dog.breed) {
      const cat = categories.find((c) => c.id === categoryId)
      if (cat && (cat.dogs.length <= 1 || cat.dogs.every((d) => d.id === dogId || !d.dogName))) {
        updateCategoryMeta(categoryId, { breed: dog.breed })
      }
    }
    setActiveSearchDog(null)
    setSearchQuery('')
  }

  const handlePrint = () => {
    const originalTitle = document.title
    document.title = header.title ? `${header.title} — Результаты` : 'Протокол соревнований'
    window.print()
    setTimeout(() => {
      document.title = originalTitle
    }, 1000)
  }

  const handleDownloadPDF = async () => {
    if (!printableRef.current || isExportingPDF) return
    setIsDownloadOpen(false)
    setIsExportingPDF(true)
    try {
      const element = printableRef.current
      const canvas = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      })

      const img = new Image()
      img.src = canvas
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true)
        img.onerror = reject
      })

      // Альбомная ориентация для широких таблиц результатов
      const isLandscape = img.width > img.height * 1.15
      const orientation = isLandscape ? 'landscape' : 'portrait'
      const pdf = new jsPDF(orientation, 'mm', 'a4')

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 8
      const contentWidth = pageWidth - margin * 2
      const contentHeight = (img.height * contentWidth) / img.width
      const usableHeight = pageHeight - margin * 2

      if (contentHeight <= usableHeight) {
        pdf.addImage(canvas, 'PNG', margin, margin, contentWidth, contentHeight)
      } else {
        let heightLeft = contentHeight
        let position = margin

        pdf.addImage(canvas, 'PNG', margin, position, contentWidth, contentHeight)
        heightLeft -= usableHeight

        while (heightLeft > 0) {
          position -= usableHeight
          pdf.addPage()
          pdf.addImage(canvas, 'PNG', margin, position, contentWidth, contentHeight)
          heightLeft -= usableHeight
        }
      }

      const safeName = (header.title || 'protocol')
        .toLowerCase()
        .replace(/[^a-zа-яё0-9]+/gi, '_')
        .replace(/^_+|_+$/g, '')
      pdf.save(`${safeName || 'protocol'}_${header.date || 'results'}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
      handlePrint()
    } finally {
      setIsExportingPDF(false)
    }
  }

  const handleResetToDefault = () => {
    if (window.confirm('Стереть все внесённые данные и сбросить протокол до начального состояния?')) {
      localStorage.removeItem(STORAGE_KEY)
      setHeader({
        ...DEFAULT_HEADER,
        date: new Date().toISOString().substring(0, 10)
      })
      setKind('coursing')
      setCategories(createDefaultCategories())
      setActiveAwardsMenu(null)
      setActiveSearchDog(null)
      setActiveRunMenu(null)
      setActiveBreedMenu(null)
      setActiveClassMenu(null)
      setActiveCategorySexMenu(null)
      setActiveDogSexMenu(null)
      setBreedSearch('')
      setSearchQuery('')
    }
  }

  return {
    kind,
    setKind,
    header,
    setHeader,
    categories,
    setCategories,
    allExistingDogs,
    filteredExistingDogs,
    searchQuery,
    setSearchQuery,
    activeSearchDog,
    setActiveSearchDog,
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
    isExportingPDF,
    customBreedCatIds,
    setCustomBreedCatIds,
    customClassCatIds,
    setCustomClassCatIds,
    downloadMenuRef,
    printableRef,
    addCategory,
    removeCategory,
    updateCategoryMeta,
    setCategoryRunsCount,
    addDogToCategory,
    removeDogFromCategory,
    updateDog,
    updateRunField,
    cycleBlanket,
    updateRunScore,
    setRunStatus,
    updateRunReason,
    toggleAward,
    selectExistingDog,
    handlePrint,
    handleDownloadPDF,
    handleResetToDefault
  }
}
