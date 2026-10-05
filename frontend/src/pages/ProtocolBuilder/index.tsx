import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus,
  Trash2,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  FileCode,
  Trophy,
  FolderPlus,
  X,
  ChevronDown,
  Check,
  RotateCcw,
  Ban,
  Clock,
  MoreVertical,
  Search
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import { toPng } from 'html-to-image'
import type { CompetitionHeader, CategoryGroup, DogParticipant, CompetitionKind, RunStatus } from './types'
import {
  createNewCategory,
  createNewParticipant,
  createRunData,
  createEmptyScores,
  calculateRoundSum,
  hasRoundScores,
  calculateTotalScore,
  formatCategoryTitle,
  getDogOverallStatus
} from './types'
import { exportToCSV, exportToJSON } from './exportHelpers'
import DogSexIcon from '../../components/DogSexIcon'

const STORAGE_KEY = 'cs_protocol_builder_draft_v3'

export interface BreedGroupItem {
  groupName: string
  breeds: string[]
}

export const BREED_GROUPS: BreedGroupItem[] = [
  {
    groupName: 'Борзые (FCI 10 и национальные)',
    breeds: [
      'Уиппет',
      'Русская псовая борзая',
      'Салюки',
      'Малая итальянская борзая (Левретка)',
      'Грейхаунд',
      'Афганская борзая',
      'Ирландский волкодав',
      'Дирхаунд',
      'Тазы',
      'Хортая борзая',
      'Испанский гальго',
      'Слюги',
      'Азавак',
      'Афганская аборигенная борзая'
    ]
  },
  {
    groupName: 'Примитивные породы и риджбеки (FCI 5 / 6)',
    breeds: [
      'Басенджи',
      'Родезийский риджбек',
      'Чирнеко дель Этна',
      'Фараонова собака',
      'Поденко Ибиценко',
      'Поденко Канарио',
      'Тайский риджбек',
      'Ксолоитцкуинтли',
      'Сибирский хаски',
      'Самоед',
      'Якутская лайка',
      'Акита'
    ]
  },
  {
    groupName: 'Терьеры и спортивные породы',
    breeds: [
      'Американский стаффордширский терьер',
      'Американский голый терьер',
      'Ирландский терьер',
      'Джек Рассел Терьер',
      'Бультерьер миниатюрный',
      'Питбультерьер',
      'Вельштерьер',
      'Эрдельтерьер',
      'Бедлингтон терьер'
    ]
  },
  {
    groupName: 'Служебные, подружейные и овчарки',
    breeds: [
      'Бельгийская овчарка (Малинуа)',
      'Бордер Колли',
      'Доберман',
      'Немецкая овчарка',
      'Белая швейцарская овчарка',
      'Голландская овчарка',
      'Австралийская овчарка',
      'Австралийский хилер',
      'Вельш корги пемброк',
      'Венгерская выжла',
      'Лабрадор ретривер',
      'Веймаранер',
      'Немецкая короткошёрстная легавая (курцхаар)',
      'Бигль',
      'Цвергпинчер',
      'Немецкий пинчер',
      'Шнауцер',
      'Миттельшнауцер',
      'Немецкий дог',
      'Ротвейлер',
      'Далматин',
      'Аргентинский дог',
      'Итальянская короткошерстная гончая',
      'Ганноверская гончая'
    ]
  },
  {
    groupName: 'Компаньоны, таксы и метисы',
    breeds: [
      'Континентальный той спаниель (Папийон)',
      'Русская цветная болонка',
      'Такса миниатюрная',
      'Метис',
      'Без породы'
    ]
  }
]

export const ALL_KNOWN_BREEDS = BREED_GROUPS.flatMap(g => g.breeds)

export const CLASSES = [
  'Стандартный',
  'Спринтер',
  'Стандартный-спринтеры',
  'Юниоры',
  'Ветераны',
  'Ветераны-спринтеры',
  'Супер-Ветераны',
  'Выше стандарта',
  'Открытый',
  'Рабочий',
  'Чемпионы',
  'Прогресс',
  'Щенки',
  'Бэби'
]

export const TITLES_LIST = [
  'CACL',
  'ЧРКФ',
  'CACIT',
  'CACMB',
  'Ю.CACL',
  'Вет.CACL',
  'R.CACL',
  'R.CACMB',
  'Best in Field',
  'Res.CACL',
  'Чемпион России',
  'ПЧРКФ РК',
  'Победитель Кубка России',
  'Лучший юниор',
  'Лучший ветеран',
  'CC'
]

interface ExistingDog {
  name: string
  name_ru?: string
  name_lat?: string
  breed: string
  sex?: 'male' | 'female' | null
}

const DEFAULT_HEADER: CompetitionHeader = {
  title: 'Соревнования по курсингу',
  rank: 'Сертификатные',
  date: new Date().toISOString().substring(0, 10),
  location: 'Город, место проведения',
  club: 'Кинологический клуб',
  judges: ''
}

const createDefaultCategories = (): CategoryGroup[] => [
  createNewCategory('Басенджи', 'Стандартный', 'male', 2, 1, 2)
]

interface ActiveRunMenuState {
  catId: string
  dogId: string
  rIdx: number
  rect: { top: number; bottom: number; left: number; right: number }
}

interface ActiveSearchDogState {
  catId: string
  dogId: string
  rect: { top: number; bottom: number; left: number; width: number }
}

interface ActiveAwardsMenuState {
  catId: string
  dogId: string
  rect: { top: number; bottom: number; left: number; right: number; width: number }
}

interface ActiveCategoryMenuState {
  catId: string
  rect: { top: number; bottom: number; left: number; right: number; width: number }
}

interface ActiveDogSexMenuState {
  catId: string
  dogId: string
  rect: { top: number; bottom: number; left: number; right: number; width: number }
}

export default function ProtocolBuilder() {
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
      .then(res => res.json())
      .then((data: Array<{ name_ru?: string; name_lat?: string; breed?: string; sex?: 'male' | 'female' | null }>) => {
        if (!Array.isArray(data)) return
        const list: ExistingDog[] = []
        const seen = new Set<string>()
        data.forEach(d => {
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
      })
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
            title: raw.title === 'Чемпионат РКФ по курсингу' ? DEFAULT_HEADER.title : (raw.title || DEFAULT_HEADER.title),
            rank: raw.rank === 'ЧРКФ' ? DEFAULT_HEADER.rank : (raw.rank || DEFAULT_HEADER.rank),
            location: raw.location === 'Московская обл., Донино' ? DEFAULT_HEADER.location : (raw.location || DEFAULT_HEADER.location),
            club: raw.club === 'МКОО Клуб Спортивного Собаководства' ? DEFAULT_HEADER.club : (raw.club || DEFAULT_HEADER.club)
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
            runsCount: (c.runsCount === 1 || c.runsCount === 2 || c.runsCount === 3) ? c.runsCount : 2,
            dogs: (c.dogs || []).map((d: any, dIdx: number) => {
              const rawRuns = Array.isArray(d.runs) && d.runs.length > 0 ? d.runs : [
                d.run1_scores ? { heat: d.run1_heat || '1', blanket: d.run1_blanket || 'red', scores: d.run1_scores } : createRunData('1', 'red'),
                d.run2_scores ? { heat: d.run2_heat || '1', blanket: d.run2_blanket || 'white', scores: d.run2_scores } : createRunData('1', 'white')
              ]

              const runs = rawRuns.map((r: any, rIdx: number) => ({
                heat: String(r?.heat || String(rIdx + 1)).replace(/\D/g, '').slice(0, 3) || String(rIdx + 1),
                blanket: r?.blanket || (rIdx === 0 ? 'red' : rIdx === 1 ? 'white' : 'blue'),
                scores: r?.scores ? {
                  speed: typeof r.scores.speed === 'number' ? r.scores.speed : '',
                  enthusiasm: typeof r.scores.enthusiasm === 'number' ? r.scores.enthusiasm : '',
                  intelligence: typeof r.scores.intelligence === 'number' ? r.scores.intelligence : '',
                  agility: typeof r.scores.agility === 'number' ? r.scores.agility : '',
                  endurance: typeof r.scores.endurance === 'number' ? r.scores.endurance : ''
                } : createEmptyScores(),
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
    categories.forEach(c => { totalDogs += c.dogs.length })
    const lastCat = categories[categories.length - 1]
    const nextBreed = lastCat ? lastCat.breed : 'Уиппет'
    const nextClass = lastCat ? lastCat.className : 'Стандартный'
    const nextSex = lastCat ? (lastCat.sex === 'male' ? 'female' : 'male') : 'male'
    const nextRuns = lastCat ? lastCat.runsCount : 2
    setCategories(prev => [...prev, createNewCategory(nextBreed, nextClass, nextSex, 2, totalDogs + 1, nextRuns)])
  }

  const removeCategory = (categoryId: string) => {
    if (categories.length <= 1) return
    setCategories(prev => prev.filter(c => c.id !== categoryId))
  }

  const updateCategoryMeta = (categoryId: string, updates: Partial<CategoryGroup>) => {
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, ...updates } : c))
  }

  // Изменение количества забегов в категории (1, 2 или 3)
  const setCategoryRunsCount = (categoryId: string, count: 1 | 2 | 3) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      const updatedDogs = cat.dogs.map(dog => {
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
    }))
  }

  // Добавление собаки в категорию
  const addDogToCategory = (categoryId: string) => {
    let totalDogs = 0
    categories.forEach(c => { totalDogs += c.dogs.length })

    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        dogs: [...cat.dogs, createNewParticipant(totalDogs + 1, cat.runsCount)]
      }
    }))
  }

  const removeDogFromCategory = (categoryId: string, dogId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      if (cat.dogs.length <= 1) return cat
      return {
        ...cat,
        dogs: cat.dogs.filter(d => d.id !== dogId)
      }
    }))
  }

  const updateDog = (categoryId: string, dogId: string, updates: Partial<DogParticipant>) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        dogs: cat.dogs.map(d => d.id === dogId ? { ...d, ...updates } : d)
      }
    }))
  }

  const updateRunField = (
    categoryId: string,
    dogId: string,
    runIndex: number,
    field: 'heat' | 'blanket',
    value: string
  ) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        dogs: cat.dogs.map(d => {
          if (d.id !== dogId) return d
          const runs = [...d.runs]
          const sanitized = field === 'heat' ? String(value || '').replace(/\D/g, '').slice(0, 3) : value
          runs[runIndex] = { ...runs[runIndex], [field]: sanitized }
          return { ...d, runs }
        })
      }
    }))
  }

  const BLANKET_CYCLE: Array<'red' | 'white' | 'blue'> = ['red', 'white', 'blue']

  const cycleBlanket = (categoryId: string, dogId: string, runIndex: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        dogs: cat.dogs.map(d => {
          if (d.id !== dogId) return d
          const runs = [...d.runs]
          if (!runs[runIndex]) runs[runIndex] = createRunData()
          const current = (runs[runIndex].blanket || 'red') as 'red' | 'white' | 'blue'
          const nextIdx = (BLANKET_CYCLE.indexOf(current) + 1) % BLANKET_CYCLE.length
          runs[runIndex] = { ...runs[runIndex], blanket: BLANKET_CYCLE[nextIdx] }
          return { ...d, runs }
        })
      }
    }))
  }

  const updateRunScore = (
    categoryId: string,
    dogId: string,
    runIndex: number,
    criterion: 'speed' | 'enthusiasm' | 'intelligence' | 'agility' | 'endurance',
    value: string
  ) => {
    const num = value === '' ? '' : Math.min(20, Math.max(0, Number(value)))
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        dogs: cat.dogs.map(d => {
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
    }))
  }

  const setRunStatus = (
    categoryId: string,
    dogId: string,
    runIndex: number,
    status: RunStatus,
    reason?: string
  ) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      let targetDog: DogParticipant | null = null
      const updatedDogs = cat.dogs.map(d => {
        if (d.id !== dogId) return d
        const runs = [...d.runs]
        if (!runs[runIndex]) runs[runIndex] = createRunData()
        runs[runIndex] = {
          ...runs[runIndex],
          status,
          reason: reason !== undefined ? reason : (runs[runIndex].reason || '')
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
        const otherDogs = updatedDogs.filter(d => d.id !== dogId)
        return {
          ...cat,
          dogs: [...otherDogs, targetDog]
        }
      }

      return {
        ...cat,
        dogs: updatedDogs
      }
    }))
  }

  const updateRunReason = (
    categoryId: string,
    dogId: string,
    runIndex: number,
    reason: string
  ) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        dogs: cat.dogs.map(d => {
          if (d.id !== dogId) return d
          const runs = [...d.runs]
          if (!runs[runIndex]) runs[runIndex] = createRunData()
          runs[runIndex] = { ...runs[runIndex], reason }
          return { ...d, runs }
        })
      }
    }))
  }

  const toggleAward = (categoryId: string, dogId: string, award: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        dogs: cat.dogs.map(d => {
          if (d.id !== dogId) return d
          const currentAwards = d.awards || []
          const exists = currentAwards.includes(award)
          return {
            ...d,
            awards: exists ? currentAwards.filter(a => a !== award) : [...currentAwards, award]
          }
        })
      }
    }))
  }

  // Фильтр автокомплита для клички
  const filteredExistingDogs = searchQuery.trim().length >= 2
    ? allExistingDogs.filter(d => {
        const q = searchQuery.toLowerCase().trim()
        return d.name.toLowerCase().includes(q) ||
          (d.name_ru && d.name_ru.toLowerCase().includes(q)) ||
          (d.name_lat && d.name_lat.toLowerCase().includes(q))
      }).slice(0, 10)
    : []

  const selectExistingDog = (categoryId: string, dogId: string, dog: ExistingDog) => {
    const updates: Partial<DogParticipant> = { dogName: dog.name }
    if (dog.sex) {
      updates.sex = dog.sex
    }
    updateDog(categoryId, dogId, updates)
    if (dog.breed) {
      const cat = categories.find(c => c.id === categoryId)
      if (cat && (cat.dogs.length <= 1 || cat.dogs.every(d => d.id === dogId || !d.dogName))) {
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

  return (
    <div className="space-y-5 pb-20 pt-2">
      {/* ПАНЕЛЬ ПАРАМЕТРОВ ТУРНИРА (скрывается при печати) */}
      <div className="bg-cream-50/90 backdrop-blur-sm rounded-xl p-3.5 md:p-4 border border-om-200 shadow-sm space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-om-200/70 pb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-camel-800">
            Параметры турнира
          </span>

          {/* Единая кнопка скачивания и меню форматов */}
          <div className="flex items-center gap-2">
            <div className="relative inline-block text-left" ref={downloadMenuRef}>
              <button
                type="button"
                onClick={() => setIsDownloadOpen(prev => !prev)}
                disabled={isExportingPDF}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-camel-600 hover:bg-camel-700 active:bg-camel-800 disabled:opacity-75 text-white text-xs font-semibold rounded-lg shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-camel-500/40 cursor-pointer"
              >
                <Download className={`w-3.5 h-3.5 ${isExportingPDF ? 'animate-bounce' : ''}`} />
                <span>{isExportingPDF ? 'Формирование PDF...' : 'Скачать'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isDownloadOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDownloadOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-cream-50 rounded-xl border border-om-300 shadow-xl z-50 py-1 divide-y divide-om-100 ring-1 ring-char-900/10 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-camel-800 uppercase tracking-wider bg-om-100/60">
                    Формат для скачивания
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      className="w-full text-left px-3 py-2 hover:bg-camel-100/70 text-xs flex items-center gap-2.5 transition-colors group cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded bg-terracotta-100 text-terracotta-700 flex items-center justify-center shrink-0 group-hover:bg-terracotta-200">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-char-900">PDF документ (.pdf)</div>
                        <div className="text-[10px] text-char-500">Скачать файл протокола</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDownloadOpen(false)
                        exportToCSV(header, kind, categories)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-camel-100/70 text-xs flex items-center gap-2.5 transition-colors group cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded bg-forest-100 text-forest-700 flex items-center justify-center shrink-0 group-hover:bg-forest-200">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-char-900">Таблица Excel (.csv)</div>
                        <div className="text-[10px] text-char-500">Для Excel и Google Таблиц</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsDownloadOpen(false)
                        exportToJSON(header, kind, categories)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-camel-100/70 text-xs flex items-center gap-2.5 transition-colors group cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded bg-camel-100 text-camel-800 flex items-center justify-center shrink-0 group-hover:bg-camel-200">
                        <FileCode className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-char-900">Данные JSON (.json)</div>
                        <div className="text-[10px] text-char-500">Структурированный экспорт</div>
                      </div>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDownloadOpen(false)
                        handlePrint()
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-cream-100 text-xs flex items-center gap-2.5 text-char-700 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-char-400 ml-1.5 mr-0.5" />
                      <span>Печать на принтер (Ctrl+P)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cream-50 hover:bg-terracotta-50 text-char-600 hover:text-terracotta-700 text-xs font-medium rounded-lg border border-om-200 hover:border-terracotta-300 shadow-xs transition-all ml-auto sm:ml-2"
              title="Стереть все введённые данные и вернуть шаблон по умолчанию"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить всё</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-char-600">
            Метаданные
          </span>

          <div className="flex items-center bg-om-100 p-0.5 rounded-lg border border-om-200 text-xs">
            <button
              onClick={() => {
                setKind('coursing')
                if (header.title === 'Соревнования по рейсингу') {
                  setHeader(prev => ({ ...prev, title: 'Соревнования по курсингу' }))
                }
              }}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                kind === 'coursing'
                  ? 'bg-cream-50 text-char-900 shadow-xs font-semibold'
                  : 'text-char-500 hover:text-char-800'
              }`}
            >
              Курсинг (баллы)
            </button>
            <button
              onClick={() => {
                setKind('racing')
                if (header.title === 'Соревнования по курсингу') {
                  setHeader(prev => ({ ...prev, title: 'Соревнования по рейсингу' }))
                }
              }}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                kind === 'racing'
                  ? 'bg-cream-50 text-char-900 shadow-xs font-semibold'
                  : 'text-char-500 hover:text-char-800'
              }`}
            >
              Рейсинг (время)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          <div>
            <label className="block text-char-600 font-medium mb-0.5">Название соревнований</label>
            <input
              type="text"
              value={header.title}
              onChange={e => setHeader({ ...header, title: e.target.value })}
              placeholder="Название соревнований"
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 placeholder:text-char-400 focus:outline-none focus:ring-1 focus:ring-camel-500"
            />
          </div>

          <div>
            <label className="block text-char-600 font-medium mb-0.5">Ранг соревнований</label>
            <input
              type="text"
              value={header.rank}
              onChange={e => setHeader({ ...header, rank: e.target.value })}
              placeholder="Ранг соревнований (Сертификатные, ЧРКФ и т.д.)"
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 placeholder:text-char-400 focus:outline-none focus:ring-1 focus:ring-camel-500"
            />
          </div>

          <div>
            <label className="block text-char-600 font-medium mb-0.5">Дата проведения</label>
            <input
              type="date"
              value={header.date}
              onChange={e => setHeader({ ...header, date: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 focus:outline-none focus:ring-1 focus:ring-camel-500"
            />
          </div>

          <div>
            <label className="block text-char-600 font-medium mb-0.5">Место / Регион</label>
            <input
              type="text"
              value={header.location}
              onChange={e => setHeader({ ...header, location: e.target.value })}
              placeholder="Город, место проведения"
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 placeholder:text-char-400 focus:outline-none focus:ring-1 focus:ring-camel-500"
            />
          </div>

          <div>
            <label className="block text-char-600 font-medium mb-0.5">Организатор (Клуб)</label>
            <input
              type="text"
              value={header.club}
              onChange={e => setHeader({ ...header, club: e.target.value })}
              placeholder="Кинологический клуб / Организатор"
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 placeholder:text-char-400 focus:outline-none focus:ring-1 focus:ring-camel-500"
            />
          </div>

          <div>
            <label className="block text-char-600 font-medium mb-0.5">Судьи</label>
            <input
              type="text"
              value={header.judges}
              onChange={e => setHeader({ ...header, judges: e.target.value })}
              placeholder="Судейская коллегия / ФИО судей"
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 placeholder:text-char-400 focus:outline-none focus:ring-1 focus:ring-camel-500"
            />
          </div>
        </div>
      </div>

      {/* РАБОЧАЯ ОБЛАСТЬ КАТЕГОРИЙ (скрывается при печати) */}
      <div className="space-y-4 print:hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-char-900">
            Категории соревнований ({categories.length})
          </h2>

          <button
            onClick={addCategory}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-camel-600 hover:bg-camel-700 text-white rounded-lg text-xs font-medium shadow-xs transition-all"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            Добавить категорию
          </button>
        </div>

        {/* СПИСОК КАТЕГОРИЙ */}
        <div className="space-y-4">
          {categories.map((category) => {
            const isCategoryActive = (category.dogs || []).some(
              d => d.id === activeAwardsMenu?.dogId || d.id === activeSearchDog?.dogId || activeRunMenu?.dogId === d.id
            )
            return (
              <div
                key={category.id}
                className={`bg-cream-50/95 rounded-xl border border-om-200 shadow-xs ${isCategoryActive ? 'relative z-20' : 'relative z-0'}`}
              >
              {/* Шапка категории: Порода, Класс, Пол + Управление количеством забегов (1, 2, 3) */}
              <div className="bg-om-100/70 px-3 py-2.5 border-b border-om-200/80 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-camel-800 uppercase tracking-wider">
                    Категория:
                  </span>

                  {/* Выбор породы: группированный список всех пород из базы + ручной ввод */}
                  {customBreedCatIds[category.id] ? (
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={category.breed}
                        onChange={e => updateCategoryMeta(category.id, { breed: e.target.value })}
                        className="px-2 py-0.5 bg-cream-50 rounded border border-om-200 text-xs font-bold text-char-900 w-44 focus:ring-1 focus:ring-camel-500 focus:outline-none"
                        placeholder="Название породы"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setCustomBreedCatIds(prev => ({ ...prev, [category.id]: false }))}
                        className="p-1 text-char-500 hover:text-char-900 rounded hover:bg-om-200/50"
                        title="Готово (сохранить породу)"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setActiveBreedMenu({
                          catId: category.id,
                          rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width }
                        })
                        setBreedSearch('')
                      }}
                      className="px-2 py-0.5 bg-cream-50 hover:bg-cream-100 rounded border border-om-200 text-xs font-bold text-char-900 max-w-[210px] flex items-center justify-between gap-1.5 transition-colors cursor-pointer"
                      title="Выбрать породу"
                    >
                      <span className="truncate">{category.breed || ALL_KNOWN_BREEDS[0]}</span>
                      <ChevronDown className="w-3 h-3 text-char-400 shrink-0" />
                    </button>
                  )}

                  {/* Выбор класса: расширенный список классов соревнований + ручной ввод */}
                  {customClassCatIds[category.id] ? (
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={category.className}
                        onChange={e => updateCategoryMeta(category.id, { className: e.target.value })}
                        className="px-2 py-0.5 bg-cream-50 rounded border border-om-200 text-xs font-semibold text-char-800 w-36 focus:ring-1 focus:ring-camel-500 focus:outline-none"
                        placeholder="Название класса"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setCustomClassCatIds(prev => ({ ...prev, [category.id]: false }))}
                        className="p-1 text-char-500 hover:text-char-900 rounded hover:bg-om-200/50"
                        title="Готово (сохранить класс)"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setActiveClassMenu({
                          catId: category.id,
                          rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width }
                        })
                      }}
                      className="px-2 py-0.5 bg-cream-50 hover:bg-cream-100 rounded border border-om-200 text-xs font-semibold text-char-800 flex items-center justify-between gap-1.5 transition-colors cursor-pointer"
                      title="Выбрать класс"
                    >
                      <span className="truncate">{category.className || CLASSES[0]}</span>
                      <ChevronDown className="w-3 h-3 text-char-400 shrink-0" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setActiveCategorySexMenu({
                        catId: category.id,
                        rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width }
                      })
                    }}
                    className="px-2 py-0.5 bg-cream-50 hover:bg-cream-100 rounded border border-om-200 text-xs font-semibold text-char-800 flex items-center justify-between gap-1.5 transition-colors cursor-pointer"
                    title="Пол собак в категории"
                  >
                    <span>{category.sex === 'male' ? 'Кобели' : category.sex === 'female' ? 'Суки' : 'Микс'}</span>
                    <ChevronDown className="w-3 h-3 text-char-400 shrink-0" />
                  </button>

                  {/* Переключатель количества забегов: 1, 2, 3 */}
                  {kind === 'coursing' && (
                    <div className="flex items-center gap-1 ml-2 bg-om-200/50 p-0.5 rounded border border-om-300/40 text-[10px]">
                      <span className="text-char-500 font-medium px-1">Забегов:</span>
                      {([1, 2, 3] as const).map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setCategoryRunsCount(category.id, n)}
                          className={`w-6 py-0.5 rounded font-bold text-center transition-all ${
                            category.runsCount === n
                              ? 'bg-camel-600 text-white shadow-2xs'
                              : 'text-char-600 hover:text-char-900 bg-cream-50/70'
                          }`}
                          title={n === 1 ? '1 забег' : `${n} забега`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addDogToCategory(category.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-cream-50 hover:bg-cream-100 text-char-800 border border-om-200 rounded text-xs font-medium transition-all"
                  >
                    <Plus className="w-3 h-3 text-camel-600" />
                    Добавить собаку
                  </button>

                  <button
                    onClick={() => removeCategory(category.id)}
                    disabled={categories.length <= 1}
                    className="p-1 text-char-400 hover:text-terracotta-600 transition-colors disabled:opacity-30"
                    title="Удалить всю категорию"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* СПИСОК СОБАК В КАТЕГОРИИ */}
              <div className="p-2 space-y-1.5 overflow-x-auto">
                {/* Заголовок колонок для идеального выравнивания */}
                <div className="hidden lg:flex items-center gap-3 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-char-400 select-none min-w-max border-b border-om-200/50 mb-1">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-9 text-center shrink-0">№</span>
                    <span className="w-56 sm:w-60 md:w-64 lg:w-72 px-2 text-left shrink-0">Кличка собаки</span>
                    <span className="w-[92px] text-center shrink-0">Пол</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {kind === 'coursing' ? (
                      Array.from({ length: category.runsCount }).map((_, r) => (
                        <span
                          key={r}
                          className="text-center font-bold text-camel-800 shrink-0"
                          style={{ width: category.runsCount === 3 ? 236 : category.runsCount === 1 ? 300 : 264 }}
                        >
                          {r + 1} Забег
                        </span>
                      ))
                    ) : (
                      <span className="text-center font-bold text-camel-800 shrink-0" style={{ width: 264 }}>
                        Заезды (Бокс / 1 / 2 / Финал)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    <span className="w-20 text-center shrink-0">Итог</span>
                    <span className="w-28 text-center shrink-0">Титулы</span>
                    <span className="w-7 shrink-0" />
                  </div>
                </div>

                {(() => {
                  const sortedCategoryDogs = [...(category.dogs || [])].sort((a, b) => {
                    const aAbsent = (a.runs || []).slice(0, category.runsCount).some(r => r?.status === 'absent')
                    const bAbsent = (b.runs || []).slice(0, category.runsCount).some(r => r?.status === 'absent')
                    return (aAbsent ? 1 : 0) - (bAbsent ? 1 : 0)
                  })

                  return sortedCategoryDogs.map((dog) => {
                    const isDogAbsent = (dog.runs || []).slice(0, category.runsCount).some(r => r?.status === 'absent')

                    const isDogActive =
                      activeAwardsMenu?.dogId === dog.id ||
                      activeSearchDog?.dogId === dog.id ||
                      (activeRunMenu?.dogId === dog.id)

                    const runSlotWidth = category.runsCount === 3 ? 236 : category.runsCount === 1 ? 300 : 264

                    return (
                      <div
                        key={dog.id}
                        className={`bg-om-50/70 hover:bg-cream-50 rounded-lg border border-om-200/70 p-2 transition-all shadow-2xs min-w-max ${
                          isDogActive ? 'relative z-30' : 'relative z-0'
                        }`}
                      >
                        {/* Строка собаки — строго фиксированные колонки с гарантированным выравниванием */}
                        <div className="flex items-center gap-3 text-xs min-w-max">
                          {/* Номер по каталогу + Компактное поле клички собаки с автокомплитом + Пол */}
                          <div className="relative flex items-center gap-1.5 shrink-0">
                            <input
                              type="text"
                              value={dog.catalogNumber}
                              onChange={e => updateDog(category.id, dog.id, { catalogNumber: e.target.value })}
                              className="w-9 px-1 py-1 text-center font-bold bg-cream-50 rounded border border-om-200 text-xs text-char-900 shrink-0"
                              placeholder="№"
                              title="Номер по каталогу"
                            />

                            <div className="relative w-56 sm:w-60 md:w-64 lg:w-72 shrink-0">
                              <input
                                type="text"
                                value={dog.dogName}
                                onChange={e => {
                                  updateDog(category.id, dog.id, { dogName: e.target.value })
                                  setSearchQuery(e.target.value)
                                  const rect = e.currentTarget.getBoundingClientRect()
                                  setActiveSearchDog({
                                    catId: category.id,
                                    dogId: dog.id,
                                    rect: { top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width }
                                  })
                                }}
                                onFocus={e => {
                                  setSearchQuery(dog.dogName)
                                  const rect = e.currentTarget.getBoundingClientRect()
                                  setActiveSearchDog({
                                    catId: category.id,
                                    dogId: dog.id,
                                    rect: { top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width }
                                  })
                                }}
                                className="w-full px-2 py-1 bg-cream-50 rounded border border-om-200 text-xs font-semibold text-char-900 focus:ring-1 focus:ring-camel-500 focus:outline-none"
                                placeholder="Кличка собаки"
                              />
                            </div>

                          {/* Выбор пола сразу после клички */}
                          <button
                            type="button"
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              setActiveDogSexMenu({
                                catId: category.id,
                                dogId: dog.id,
                                rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width }
                              })
                            }}
                            className="w-[92px] px-2 py-1 bg-cream-50 hover:bg-cream-100 rounded border border-om-200 text-xs text-char-800 shrink-0 font-medium flex items-center justify-between transition-colors cursor-pointer"
                            title="Пол собаки"
                          >
                            <span className="truncate">{dog.sex === 'male' ? 'Кобель' : 'Сука'}</span>
                            <ChevronDown className="w-3 h-3 text-char-400 shrink-0" />
                          </button>
                        </div>

                        {/* Компактный блок баллов забегов (динамически 1, 2 или 3) с фиксированной шириной */}
                        {kind === 'coursing' ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {Array.from({ length: category.runsCount }).map((_, rIdx) => {
                              // Если у собаки неявка, забеги 2 и 3 визуально не отображаются (пустое место)
                              if (isDogAbsent && rIdx > 0) {
                                return (
                                  <div
                                    key={rIdx}
                                    style={{ width: runSlotWidth }}
                                    className="shrink-0"
                                  />
                                )
                              }

                              const prevCancelled = (dog.runs || []).slice(0, rIdx).some(pr => pr?.status === 'withdrawn')
                              if (prevCancelled) {
                                return (
                                  <div
                                    key={rIdx}
                                    style={{ width: runSlotWidth }}
                                    className="shrink-0"
                                  />
                                )
                              }

                              const run = dog.runs[rIdx] || createRunData()
                              const sum = calculateRoundSum(run.scores)
                              const blanketColor = run.blanket || 'red'
                              const blanketTitle = blanketColor === 'red' ? 'Красная' : blanketColor === 'blue' ? 'Синяя' : 'Белая'
                              const blanketBg = blanketColor === 'red'
                                ? 'bg-rose-50 border-rose-300 text-rose-950 focus-within:ring-rose-400'
                                : blanketColor === 'blue'
                                ? 'bg-sky-50 border-sky-300 text-sky-950 focus-within:ring-sky-400'
                                : 'bg-white border-om-300 text-char-900 focus-within:ring-camel-400'

                              const isWithdrawn = run.status === 'withdrawn'
                              const isAbsent = run.status === 'absent'

                              return (
                                <div
                                  key={rIdx}
                                  className="flex items-center rounded border border-om-200 transition-all bg-cream-50 px-1.5 py-0.5 gap-1 shrink-0"
                                  style={{ width: runSlotWidth }}
                                >
                                  {isAbsent ? (
                                    /* Если неявка — собака не пришла, поэтому нет ни попоны, ни номера забега */
                                    <div className="flex items-center justify-between gap-1 bg-om-100/70 border border-om-200 rounded px-2.5 py-1 flex-1 min-w-0">
                                      <span className="text-xs font-normal text-char-500">
                                        Неявка
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setRunStatus(category.id, dog.id, rIdx, 'normal')}
                                        className="text-char-400 hover:text-char-700 text-xs px-1 py-0.5 rounded hover:bg-om-200/50 cursor-pointer"
                                        title="Вернуть ввод оценок"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      {/* Номер забега с переключателем цвета попоны */}
                                      <div
                                        className={`flex items-center rounded border px-1 py-0.5 gap-1 transition-all shrink-0 ${blanketBg}`}
                                        title={`Забег ${rIdx + 1}. Попона: ${blanketTitle}. Нажмите на кружок для смены цвета`}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => cycleBlanket(category.id, dog.id, rIdx)}
                                          className="w-3 h-3 rounded-full shrink-0 ring-1 cursor-pointer transition-transform hover:scale-115 active:scale-90"
                                          style={{ backgroundColor: blanketColor === 'red' ? '#e11d48' : blanketColor === 'blue' ? '#0284c7' : '#ffffff' }}
                                          title={`Попона: ${blanketTitle}. Нажмите для смены цвета`}
                                        />
                                        <input
                                          type="text"
                                          inputMode="numeric"
                                          pattern="[0-9]*"
                                          value={run.heat}
                                          onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 3)
                                            updateRunField(category.id, dog.id, rIdx, 'heat', val)
                                          }}
                                          maxLength={3}
                                          className="w-6 text-[11px] text-center bg-transparent font-bold focus:outline-none"
                                          placeholder="№"
                                          title={`Номер забега (${blanketTitle} попона)`}
                                        />
                                      </div>

                                      {/* Если забег с дисквалификацией */}
                                      {isWithdrawn ? (
                                        <div className="flex items-center gap-1 bg-om-100/60 border border-om-200 rounded px-1.5 py-0.5 flex-1 min-w-0">
                                          <span className="text-[10px] font-medium text-char-600 uppercase tracking-wide shrink-0">
                                            Дискв:
                                          </span>
                                          <input
                                            type="text"
                                            value={run.reason || ''}
                                            onChange={e => updateRunReason(category.id, dog.id, rIdx, e.target.value)}
                                            className="w-full px-1 py-0.2 bg-white border border-om-200 rounded text-[11px] text-char-800 focus:outline-none focus:ring-1 focus:ring-camel-500 font-medium truncate"
                                            placeholder="Причина (травма...)"
                                            title="Причина дисквалификации"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => setRunStatus(category.id, dog.id, rIdx, 'normal')}
                                            className="text-char-400 hover:text-char-700 text-xs px-0.5 shrink-0 cursor-pointer"
                                            title="Вернуть ввод оценок"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ) : null}
                                    </>
                                  )}

                                  {!isWithdrawn && !isAbsent && (
                                    <div className="flex items-center gap-0.5 shrink-0">
                                      {(['speed', 'enthusiasm', 'intelligence', 'agility', 'endurance'] as const).map(c => (
                                        <input
                                          key={c}
                                          type="number"
                                          min={0}
                                          max={20}
                                          value={run.scores[c]}
                                          onChange={e => updateRunScore(category.id, dog.id, rIdx, c, e.target.value)}
                                          className={`${
                                            category.runsCount === 3 ? 'w-[22px] text-[10px]' : 'w-[26px] text-[11px]'
                                          } text-center py-0.5 px-0 bg-om-50 border border-om-200 rounded font-bold tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-1 focus:ring-camel-500`}
                                          placeholder="0"
                                          title={c === 'speed' ? 'Скорость (0-20)' : c === 'enthusiasm' ? 'Энтузиазм (0-20)' : c === 'intelligence' ? 'Интеллект (0-20)' : c === 'agility' ? 'Маневренность (0-20)' : 'Выносливость (0-20)'}
                                        />
                                      ))}
                                    </div>
                                  )}

                                  {!isWithdrawn && !isAbsent && (
                                    <span
                                      className="text-[10px] font-bold text-camel-800 text-center w-5 shrink-0"
                                      title={`Сумма баллов за забег ${rIdx + 1}`}
                                    >
                                      {sum}
                                    </span>
                                  )}

                                  {/* Троеточие — смена статуса забега (баллы, дисквалификация, неявка) */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (activeRunMenu && activeRunMenu.dogId === dog.id && activeRunMenu.rIdx === rIdx) {
                                        setActiveRunMenu(null)
                                      } else {
                                        const rect = e.currentTarget.getBoundingClientRect()
                                        setActiveRunMenu({
                                          catId: category.id,
                                          dogId: dog.id,
                                          rIdx,
                                          rect: {
                                            top: rect.top,
                                            bottom: rect.bottom,
                                            left: rect.left,
                                            right: rect.right
                                          }
                                        })
                                      }
                                    }}
                                    className="text-char-500 hover:text-char-900 hover:bg-om-200/80 p-0.5 rounded transition-colors focus:outline-none cursor-pointer shrink-0"
                                    title="Опции забега (баллы, дисквалификация, неявка)"
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          /* Рейсинг */
                          <div className="flex items-center gap-1.5 bg-cream-50 px-2 py-1 rounded border border-om-200 text-xs shrink-0" style={{ width: 264 }}>
                            <input
                              type="text"
                              value={dog.racing_box}
                              onChange={e => updateDog(category.id, dog.id, { racing_box: e.target.value })}
                              className="w-8 px-1 py-0.5 bg-om-50 border border-om-200 rounded text-center text-[11px]"
                              placeholder="Бокс"
                              title="Бокс"
                            />
                            <input
                              type="text"
                              value={dog.racing_time1}
                              onChange={e => updateDog(category.id, dog.id, { racing_time1: e.target.value })}
                              className="w-14 px-1 py-0.5 bg-om-50 border border-om-200 rounded text-center font-mono text-[11px]"
                              placeholder="Заезд 1"
                              title="Время заезда 1"
                            />
                            <input
                              type="text"
                              value={dog.racing_time2}
                              onChange={e => updateDog(category.id, dog.id, { racing_time2: e.target.value })}
                              className="w-14 px-1 py-0.5 bg-om-50 border border-om-200 rounded text-center font-mono text-[11px]"
                              placeholder="Заезд 2"
                              title="Время заезда 2"
                            />
                            <input
                              type="text"
                              value={dog.racing_final_time}
                              onChange={e => updateDog(category.id, dog.id, { racing_final_time: e.target.value })}
                              className="w-16 px-1 py-0.5 bg-om-50 border border-camel-300 rounded text-center font-mono font-bold text-xs"
                              placeholder="Финал"
                              title="Итоговое время"
                            />
                          </div>
                        )}

                        {/* Правая часть: Итог (перед титулами), Титулы (кнопка с меню) и Удаление */}
                        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                          {/* Итоговая сумма перед титулами */}
                          {(() => {
                            const overall = getDogOverallStatus(dog, category.runsCount)
                            return (
                              <div
                                className={`border px-1.5 py-0.5 rounded text-center w-20 shrink-0 ${
                                  overall.type === 'withdrawn' ? 'bg-om-100/80 border-om-200 text-char-600' :
                                  overall.type === 'absent' ? 'bg-om-100/60 border-om-200 text-char-400' :
                                  overall.type === 'disqualified' ? 'bg-om-100/80 border-om-200 text-char-600' :
                                  'bg-camel-100/80 border-camel-300 text-char-900'
                                }`}
                                title={overall.reason ? `Статус: ${overall.label} (${overall.reason})` : 'Итоговая сумма баллов'}
                              >
                                <span className={`text-xs tabular-nums truncate block ${overall.type === 'normal' ? 'font-bold' : 'font-medium'}`}>
                                  {overall.type === 'absent' ? 'Неявка' : (overall.type === 'withdrawn' || overall.type === 'disqualified') ? 'Дискв.' : overall.label}
                                </span>
                              </div>
                            )
                          })()}

                          {/* Кнопка с выбором титулов (для неявки скрываем — просто пустое место) */}
                          {isDogAbsent ? (
                            <div className="w-28 shrink-0" />
                          ) : (
                            <div className="relative w-28 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (activeAwardsMenu && activeAwardsMenu.dogId === dog.id) {
                                    setActiveAwardsMenu(null)
                                  } else {
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    setActiveAwardsMenu({
                                      catId: category.id,
                                      dogId: dog.id,
                                      rect: {
                                        top: rect.top,
                                        bottom: rect.bottom,
                                        left: rect.left,
                                        right: rect.right,
                                        width: rect.width
                                      }
                                    })
                                  }
                                }}
                                className={`w-full flex items-center justify-between gap-1 px-2 py-1 rounded border text-[11px] font-semibold transition-all cursor-pointer ${
                                  (dog.awards || []).length > 0
                                    ? 'bg-camel-600 text-white border-camel-700 shadow-2xs'
                                    : 'bg-cream-50 text-char-600 border-om-200 hover:border-camel-400'
                                }`}
                                title={(dog.awards || []).length > 0 ? `Титулы: ${(dog.awards || []).join(', ')}` : 'Назначить титулы и сертификаты'}
                              >
                                <span className="truncate flex-1 text-left">
                                  {(dog.awards || []).length > 0 ? (dog.awards || []).join(', ') : 'Титулы'}
                                </span>
                                <ChevronDown className="w-2.5 h-2.5 opacity-70 shrink-0" />
                              </button>
                            </div>
                          )}

                          {/* Удаление */}
                          <button
                            onClick={() => removeDogFromCategory(category.id, dog.id)}
                            disabled={category.dogs.length <= 1}
                            className="w-7 h-7 flex items-center justify-center text-char-400 hover:text-terracotta-600 transition-colors rounded disabled:opacity-20 shrink-0"
                            title="Удалить собаку"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              })()}
              </div>
            </div>
          )
        })}
        </div>
      </div>

      {/* ОФИЦИАЛЬНАЯ СВОДНАЯ ВЕДОМОСТЬ РЕЗУЛЬТАТОВ (ИМЕННО ЭТО ИДЁТ В ПЕЧАТЬ И PDF) */}
      <div className="space-y-4">
        <div className="border-b border-om-200 pb-2 flex items-center justify-between print:hidden">
          <h2 className="text-xs font-bold uppercase tracking-wider text-char-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-camel-700" />
            Итоговые результаты по категориям
          </h2>
          <span className="text-xs text-char-500">
            (Отображение чистого официального протокола)
          </span>
        </div>

        {/* Лист официального протокола (для скачивания в PDF и печати) */}
        <div
          ref={printableRef}
          className="bg-white p-4 md:p-6 rounded-xl border border-om-200 shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 space-y-5"
        >
          {/* ОФИЦИАЛЬНАЯ ШАПКА РЕЗУЛЬТАТОВ */}
          <div className="border-b-2 border-char-900 pb-3 mb-4 flex items-center justify-between gap-4">
            <div className="shrink-0 flex items-center">
              <img
                src="/assets/brand/logo.webp"
                alt="Coursing Stats"
                className="h-11 sm:h-12 w-auto object-contain"
              />
            </div>

            <div className="text-right min-w-0 space-y-0.5">
              <h1 className="text-base sm:text-lg font-bold uppercase tracking-wide text-char-900 leading-tight">
                {header.title || 'Протокол соревнований'}
              </h1>
              <p className="text-xs font-semibold text-char-800">
                {[
                  header.rank && `Ранг: ${header.rank}`,
                  header.date && `Дата: ${header.date}`,
                  header.location && `Место: ${header.location}`,
                ].filter(Boolean).join(' | ')}
              </p>
              {(header.club || header.judges) && (
                <p className="text-xs text-char-600">
                  {[
                    header.club && `Организатор: ${header.club}`,
                    header.judges && `Судьи: ${header.judges}`,
                  ].filter(Boolean).join(' | ')}
                </p>
              )}
            </div>
          </div>

        {categories.map((cat) => {
          const sortedDogs = [...(cat.dogs || [])].sort((a, b) => {
            const statusA = getDogOverallStatus(a, cat.runsCount)
            const statusB = getDogOverallStatus(b, cat.runsCount)
            const isFinA = statusA.type === 'normal'
            const isFinB = statusB.type === 'normal'
            if (isFinA && !isFinB) return -1
            if (!isFinA && isFinB) return 1
            if (!isFinA && !isFinB) {
              if (statusA.type === 'withdrawn' && statusB.type === 'absent') return -1
              if (statusA.type === 'absent' && statusB.type === 'withdrawn') return 1
              return 0
            }
            return calculateTotalScore(b, cat.runsCount) - calculateTotalScore(a, cat.runsCount)
          })

          return (
            <div
              key={cat.id}
              className="bg-cream-50 rounded-xl border border-om-200 p-3.5 shadow-xs space-y-2.5 print:bg-white print:border-b-2 print:border-char-800 print:rounded-none print:shadow-none print:p-0 print:mb-6 print:break-inside-avoid"
            >
              <div className="flex items-center justify-between border-b border-om-200/80 pb-2">
                <h3 className="text-xs font-serif font-bold text-char-900">
                  {formatCategoryTitle(cat)}
                </h3>
                <span className="text-[11px] text-char-500">
                  Забегов: {cat.runsCount} | Участников: {cat.dogs?.length || 0}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse table-fixed">
                  {kind === 'racing' ? (
                    <colgroup>
                      <col style={{ width: '5%' }} />
                      <col style={{ width: '4%' }} />
                      <col style={{ width: '36%' }} />
                      <col style={{ width: '6%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '13%' }} />
                    </colgroup>
                  ) : cat.runsCount === 1 ? (
                    <colgroup>
                      <col style={{ width: '4.5%' }} />
                      <col style={{ width: '3.5%' }} />
                      <col style={{ width: '28%' }} />
                      <col style={{ width: '4%' }} />
                      <col style={{ width: '4%' }} />
                      <col style={{ width: '4%' }} />
                      <col style={{ width: '4%' }} />
                      <col style={{ width: '4%' }} />
                      <col style={{ width: '4%' }} />
                      <col style={{ width: '6%' }} />
                      <col style={{ width: '7%' }} />
                      <col style={{ width: '27%' }} />
                    </colgroup>
                  ) : cat.runsCount === 3 ? (
                    <colgroup>
                      <col style={{ width: '4.5%' }} />
                      <col style={{ width: '3.5%' }} />
                      <col style={{ width: '26%' }} />
                      {Array.from({ length: 3 }).map((_, r) => (
                        <React.Fragment key={r}>
                          <col style={{ width: '2.4%' }} />
                          <col style={{ width: '2.2%' }} />
                          <col style={{ width: '2.2%' }} />
                          <col style={{ width: '2.2%' }} />
                          <col style={{ width: '2.2%' }} />
                          <col style={{ width: '2.2%' }} />
                          <col style={{ width: '3.6%' }} />
                        </React.Fragment>
                      ))}
                      <col style={{ width: '5%' }} />
                      <col style={{ width: '10%' }} />
                    </colgroup>
                  ) : (
                    <colgroup>
                      <col style={{ width: '4.5%' }} />
                      <col style={{ width: '3.5%' }} />
                      <col style={{ width: '28%' }} />
                      {Array.from({ length: 2 }).map((_, r) => (
                        <React.Fragment key={r}>
                          <col style={{ width: '3%' }} />
                          <col style={{ width: '2.8%' }} />
                          <col style={{ width: '2.8%' }} />
                          <col style={{ width: '2.8%' }} />
                          <col style={{ width: '2.8%' }} />
                          <col style={{ width: '2.8%' }} />
                          <col style={{ width: '4%' }} />
                        </React.Fragment>
                      ))}
                      <col style={{ width: '5%' }} />
                      <col style={{ width: '17%' }} />
                    </colgroup>
                  )}
                  <thead>
                    <tr className="border-b border-om-200 text-[10px] uppercase font-bold text-char-500 bg-om-100/60">
                      <th rowSpan={kind === 'coursing' ? 2 : 1} className="py-1.5 px-1 text-center border-r border-om-200/60">
                        Место
                      </th>
                      <th rowSpan={kind === 'coursing' ? 2 : 1} className="py-1.5 px-1 text-center font-mono border-r border-om-200/60">
                        №
                      </th>
                      <th rowSpan={kind === 'coursing' ? 2 : 1} className="py-1.5 px-2 border-r border-om-200/60">
                        Кличка собаки
                      </th>
                      {kind === 'coursing' ? (
                        <>
                          {Array.from({ length: cat.runsCount }).map((_, r) => (
                            <th
                              key={r}
                              colSpan={7}
                              className="py-1 px-1 text-center border-r border-om-200/80 bg-camel-100/40 text-camel-950 font-bold"
                            >
                              {r + 1} Забег
                            </th>
                          ))}
                          <th rowSpan={2} className="py-1.5 px-1 text-right border-r border-om-200/60 bg-camel-100/60 text-camel-950 font-bold">
                            Итого
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="py-1.5 px-1 text-center border-r border-om-200/60">Бокс</th>
                          <th className="py-1.5 px-1 text-center border-r border-om-200/60">Заезд 1</th>
                          <th className="py-1.5 px-1 text-center border-r border-om-200/60">Заезд 2</th>
                          <th className="py-1.5 px-1 text-right border-r border-om-200/60 font-bold">Итоговое время</th>
                        </>
                      )}
                      <th rowSpan={kind === 'coursing' ? 2 : 1} className="py-1.5 px-2 text-right">
                        Титулы и сертификаты
                      </th>
                    </tr>
                    {kind === 'coursing' && (
                      <tr className="border-b border-om-200 text-[9px] uppercase font-semibold text-char-600 bg-om-50/80">
                        {Array.from({ length: cat.runsCount }).map((_, r) => (
                          <React.Fragment key={r}>
                            <th className="py-1 px-0.5 text-center" title="Забег и попона">Заб.</th>
                            <th className="py-1 px-0.5 text-center" title="Скорость (0-20)">Скор</th>
                            <th className="py-1 px-0.5 text-center" title="Энтузиазм (0-20)">Энт</th>
                            <th className="py-1 px-0.5 text-center" title="Интеллект (0-20)">Инт</th>
                            <th className="py-1 px-0.5 text-center" title="Маневренность (0-20)">Ман</th>
                            <th className="py-1 px-0.5 text-center" title="Выносливость (0-20)">Вын</th>
                            <th className="py-1 px-0.5 text-center font-bold text-char-900 border-r border-om-200/80 bg-camel-100/30" title="Сумма баллов за забег">Сумма</th>
                          </React.Fragment>
                        ))}
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-om-200/60">
                    {(() => {
                      let placeCounter = 0
                      const anyDogHasScores = kind === 'coursing'
                        ? (cat.dogs || []).some(dog => (dog.runs || []).slice(0, cat.runsCount).some(r => (!r?.status || r.status === 'normal') && hasRoundScores(r?.scores)))
                        : (cat.dogs || []).some(dog => Boolean(dog.racing_time1 || dog.racing_time2))

                      return sortedDogs.map((d) => {
                        const overall = getDogOverallStatus(d, cat.runsCount)
                        const place = overall.type === 'normal'
                          ? (anyDogHasScores ? (++placeCounter) : '—')
                          : '—'
                        const hasAnyScores = (d.runs || []).slice(0, cat.runsCount).some(r => (!r?.status || r.status === 'normal') && hasRoundScores(r?.scores))

                        return (
                          <tr key={d.id} className="hover:bg-om-50/50">
                            <td className="py-1.5 px-1 font-bold text-camel-800 text-center border-r border-om-200/60">
                              {place}
                            </td>
                            <td className="py-1.5 px-1 text-char-500 font-mono text-center border-r border-om-200/60">{d.catalogNumber}</td>
                            <td className="py-1.5 px-2 font-semibold text-char-900 border-r border-om-200/60 break-words">
                              <div className="flex items-start gap-1.5 min-w-0">
                                <span className="break-words leading-tight">{d.dogName || '—'}</span>
                                {(() => {
                                  const effectiveSex = d.sex || (cat.sex !== 'mixed' ? cat.sex : '')
                                  return effectiveSex ? (
                                    <DogSexIcon sex={effectiveSex} size={12} className="shrink-0 mt-0.5 inline-block" />
                                  ) : null
                                })()}
                              </div>
                              {overall.type === 'withdrawn' && overall.reason && (
                                <div className="text-[10px] text-char-500 font-normal leading-tight mt-0.5">
                                  Дискв.: {overall.reason}
                                </div>
                              )}
                            </td>
                            {kind === 'coursing' ? (
                              <>
                                {overall.type === 'absent' ? (
                                  <td
                                    colSpan={cat.runsCount * 7}
                                    className="py-2 px-3 text-center text-char-400 text-xs font-normal border-r border-om-200/60 bg-om-50/30"
                                  >
                                    Неявка
                                  </td>
                                ) : (
                                  Array.from({ length: cat.runsCount }).map((_, r) => {
                                    const prevCancelled = (d.runs || []).slice(0, r).some(pr => pr?.status === 'withdrawn')
                                    if (prevCancelled) {
                                      return (
                                        <td
                                          key={r}
                                          colSpan={7}
                                          className="py-1 px-1 border-r border-om-200/60"
                                        />
                                      )
                                    }
                                    const run = d.runs?.[r]
                                    if (!run) {
                                      return (
                                        <React.Fragment key={r}>
                                          <td className="py-1 px-0.5 text-center text-char-400">—</td>
                                          <td className="py-1 px-0.5 text-center text-char-400">—</td>
                                          <td className="py-1 px-0.5 text-center text-char-400">—</td>
                                          <td className="py-1 px-0.5 text-center text-char-400">—</td>
                                          <td className="py-1 px-0.5 text-center text-char-400">—</td>
                                          <td className="py-1 px-0.5 text-center text-char-400">—</td>
                                          <td className="py-1 px-1 text-center text-char-400 border-r border-om-200/60">—</td>
                                        </React.Fragment>
                                      )
                                    }

                                    const blanketColor = run.blanket || 'red'
                                    const blanketTitle = blanketColor === 'red' ? 'Красная' : blanketColor === 'blue' ? 'Синяя' : 'Белая'
                                    const bgStyle: React.CSSProperties =
                                      blanketColor === 'red'
                                        ? { backgroundColor: '#dc2626', color: '#ffffff' }
                                        : blanketColor === 'blue'
                                        ? { backgroundColor: '#2563eb', color: '#ffffff' }
                                        : { backgroundColor: '#ffffff', color: '#111827', border: '1px solid #9ca3af' }

                                    if (run.status === 'withdrawn') {
                                      return (
                                        <React.Fragment key={r}>
                                          <td className="py-1 px-0.5 text-center">
                                            <span
                                              className="inline-flex items-center justify-center min-w-[18px] max-w-[28px] h-4.5 px-0.5 rounded text-[10px] font-bold shadow-2xs truncate"
                                              style={bgStyle}
                                              title={`${blanketTitle} попона, забег №${run.heat || '1'}`}
                                            >
                                              {(run.heat || '1').slice(0, 3)}
                                            </span>
                                          </td>
                                          <td colSpan={6} className="py-1 px-1 text-center text-char-600 font-medium text-[11px] border-r border-om-200/60 bg-om-100/30">
                                            {run.reason ? `Дискв. (${run.reason})` : 'Дисквалификация'}
                                          </td>
                                        </React.Fragment>
                                      )
                                    }

                                    const scores = run.scores || createEmptyScores()
                                    const sum = calculateRoundSum(scores)
                                    const hasScores = hasRoundScores(scores)
                                    return (
                                      <React.Fragment key={r}>
                                        <td className="py-1 px-0.5 text-center">
                                          <span
                                            className="inline-flex items-center justify-center min-w-[18px] max-w-[28px] h-4.5 px-0.5 rounded text-[10px] font-bold shadow-2xs truncate"
                                            style={bgStyle}
                                            title={`${blanketTitle} попона, забег №${run.heat || '1'}`}
                                          >
                                            {(run.heat || '1').slice(0, 3)}
                                          </span>
                                        </td>
                                        <td className="py-1 px-0.5 text-center tabular-nums text-char-700 text-xs">
                                          {typeof scores.speed === 'number' ? scores.speed : '—'}
                                        </td>
                                        <td className="py-1 px-0.5 text-center tabular-nums text-char-700 text-xs">
                                          {typeof scores.enthusiasm === 'number' ? scores.enthusiasm : '—'}
                                        </td>
                                        <td className="py-1 px-0.5 text-center tabular-nums text-char-700 text-xs">
                                          {typeof scores.intelligence === 'number' ? scores.intelligence : '—'}
                                        </td>
                                        <td className="py-1 px-0.5 text-center tabular-nums text-char-700 text-xs">
                                          {typeof scores.agility === 'number' ? scores.agility : '—'}
                                        </td>
                                        <td className="py-1 px-0.5 text-center tabular-nums text-char-700 text-xs">
                                          {typeof scores.endurance === 'number' ? scores.endurance : '—'}
                                        </td>
                                        <td className="py-1 px-1 text-center tabular-nums font-bold text-char-900 text-xs border-r border-om-200/60 bg-camel-50/50">
                                          {hasScores ? sum : '—'}
                                        </td>
                                      </React.Fragment>
                                    )
                                  })
                                )}
                                <td className={`py-1.5 px-2 text-right tabular-nums border-r border-om-200/60 ${
                                  overall.type === 'absent'
                                    ? 'text-char-400 font-normal text-xs'
                                    : overall.type !== 'normal'
                                    ? 'text-char-600 font-medium text-xs'
                                    : 'font-bold text-char-900 bg-camel-100/30'
                                }`}>
                                  {overall.type === 'absent' ? '—' : overall.type !== 'normal' ? 'Дискв.' : (hasAnyScores ? calculateTotalScore(d, cat.runsCount) : '—')}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-1.5 px-2 text-center font-mono font-bold text-char-700 border-r border-om-200/60">
                                  {d.racing_box || '—'}
                                </td>
                                <td className="py-1.5 px-2 text-center font-mono text-char-700 border-r border-om-200/60">
                                  {d.racing_time1 || '—'}
                                </td>
                                <td className="py-1.5 px-2 text-center font-mono text-char-700 border-r border-om-200/60">
                                  {d.racing_time2 || '—'}
                                </td>
                                <td className={`py-1.5 px-2 text-right font-mono border-r border-om-200/60 ${
                                  overall.type === 'absent'
                                    ? 'text-char-400 font-normal text-xs'
                                    : overall.type !== 'normal'
                                    ? 'text-char-600 font-medium text-xs'
                                    : 'font-bold text-char-900'
                                }`}>
                                  {overall.type === 'absent' ? '—' : overall.type !== 'normal' ? 'Дискв.' : (d.racing_final_time || '—')}
                                </td>
                              </>
                            )}
                            <td className="py-1.5 px-2 text-right font-semibold text-camel-700">
                              {overall.type === 'absent' ? '—' : (((d.awards || []).join(', ')) || '—')}
                            </td>
                          </tr>
                        )
                      })
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
        </div>
      </div>

      {/* Портал выпадающего меню статуса забега (вне overflow-контейнеров таблицы) */}
      {activeRunMenu && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setActiveRunMenu(null)}
          />
          <div
            data-portal-menu
            className="fixed z-50 w-52 bg-cream-50 rounded-xl border border-om-300 shadow-2xl p-1 text-xs ring-1 ring-char-900/10 animate-in fade-in zoom-in-95 duration-100"
            style={{
              top: window.innerHeight - activeRunMenu.rect.bottom < 130
                ? Math.max(10, activeRunMenu.rect.top - 110)
                : activeRunMenu.rect.bottom + 4,
              left: Math.max(10, Math.min(activeRunMenu.rect.right - 208, window.innerWidth - 220))
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-2.5 py-1 text-[10px] font-bold text-camel-800 uppercase tracking-wider border-b border-om-200/70 mb-1 flex items-center justify-between">
              <span>Статус забега</span>
              <button
                type="button"
                onClick={() => setActiveRunMenu(null)}
                className="text-char-400 hover:text-char-700 p-0.5 rounded focus:outline-none cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {(() => {
              const activeCat = categories.find(c => c.id === activeRunMenu.catId)
              const activeDog = activeCat?.dogs.find(d => d.id === activeRunMenu.dogId)
              const currentRunStatus = activeDog?.runs[activeRunMenu.rIdx]?.status || 'normal'

              return (
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setRunStatus(activeRunMenu.catId, activeRunMenu.dogId, activeRunMenu.rIdx, 'normal')
                      setActiveRunMenu(null)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between transition-colors cursor-pointer text-xs ${
                      currentRunStatus === 'normal' ? 'bg-camel-100/70 text-camel-900' : 'hover:bg-om-100 text-char-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold leading-tight">Оценки (баллы)</div>
                      <div className="text-[10px] text-char-400 font-normal">Баллы по 5 критериям</div>
                    </div>
                    {currentRunStatus === 'normal' && <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRunStatus(activeRunMenu.catId, activeRunMenu.dogId, activeRunMenu.rIdx, 'withdrawn')
                      setActiveRunMenu(null)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between transition-colors cursor-pointer text-xs ${
                      currentRunStatus === 'withdrawn' ? 'bg-terracotta-100/70 text-terracotta-900' : 'hover:bg-terracotta-50 text-terracotta-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Ban className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
                      <div>
                        <div className="font-semibold leading-tight">Дисквалификация</div>
                        <div className="text-[10px] text-char-400 font-normal">Собака снята с забега</div>
                      </div>
                    </div>
                    {currentRunStatus === 'withdrawn' && <Check className="w-3.5 h-3.5 text-terracotta-700 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRunStatus(activeRunMenu.catId, activeRunMenu.dogId, activeRunMenu.rIdx, 'absent')
                      setActiveRunMenu(null)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center justify-between transition-colors cursor-pointer text-xs ${
                      currentRunStatus === 'absent' ? 'bg-om-200/80 text-char-900' : 'hover:bg-om-100 text-char-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-3.5 h-3.5 text-char-400 shrink-0" />
                      <div>
                        <div className="font-semibold leading-tight">Неявка</div>
                        <div className="text-[10px] text-char-400 font-normal">Не явилась на старт</div>
                      </div>
                    </div>
                    {currentRunStatus === 'absent' && <Check className="w-3.5 h-3.5 text-char-700 shrink-0" />}
                  </button>
                </div>
              )
            })()}
          </div>
        </>,
        document.body
      )}

      {/* Портал автокомплита клички собаки из базы сайта */}
      {activeSearchDog && filteredExistingDogs.length > 0 && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setActiveSearchDog(null)}
          />
          <div
            data-portal-menu
            className="fixed z-50 bg-cream-50 rounded-xl border border-om-300 shadow-2xl py-1 divide-y divide-om-100 max-h-56 overflow-y-auto ring-1 ring-char-900/10 text-xs animate-in fade-in zoom-in-95 duration-100"
            style={{
              top: window.innerHeight - activeSearchDog.rect.bottom < 180
                ? Math.max(10, activeSearchDog.rect.top - 180)
                : activeSearchDog.rect.bottom + 4,
              left: Math.max(10, Math.min(window.innerWidth - 300, activeSearchDog.rect.left)),
              width: Math.max(280, activeSearchDog.rect.width)
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-2.5 py-1 text-[9px] font-bold text-camel-800 uppercase tracking-wider bg-om-100/90 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xs border-b border-om-200/60">
              <span>Собаки из базы сайта</span>
              <button
                type="button"
                onClick={() => setActiveSearchDog(null)}
                className="text-char-400 hover:text-char-800 p-0.5 rounded cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
            {filteredExistingDogs.map((exDog, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectExistingDog(activeSearchDog.catId, activeSearchDog.dogId, exDog)}
                className="w-full text-left px-2.5 py-1.5 hover:bg-camel-100/70 text-xs flex justify-between items-center transition-colors cursor-pointer"
              >
                <span className="font-semibold text-char-900 truncate">{exDog.name}</span>
                <div className="flex items-center gap-1.5 ml-2 shrink-0">
                  <span className="text-[10px] text-char-400">{exDog.breed}</span>
                  {exDog.sex && (
                    <DogSexIcon sex={exDog.sex} size={11} className="inline-block" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </>,
        document.body
      )}

      {/* Портал выпадающего меню выбора титулов */}
      {activeAwardsMenu && typeof document !== 'undefined' && (() => {
        const targetCat = categories.find(c => c.id === activeAwardsMenu.catId)
        const targetDog = targetCat?.dogs.find(d => d.id === activeAwardsMenu.dogId)
        if (!targetDog) return null

        return createPortal(
          <>
            <div
              className="fixed inset-0 z-50"
              onClick={() => setActiveAwardsMenu(null)}
            />
            <div
              data-portal-menu
              className="fixed z-50 w-52 bg-cream-50 rounded-xl border border-om-300 shadow-2xl p-1 text-xs ring-1 ring-char-900/10 animate-in fade-in zoom-in-95 duration-100"
              style={{
                top: window.innerHeight - activeAwardsMenu.rect.bottom < 240
                  ? Math.max(10, activeAwardsMenu.rect.top - 230)
                  : activeAwardsMenu.rect.bottom + 4,
                left: Math.max(10, Math.min(activeAwardsMenu.rect.right - 208, window.innerWidth - 220))
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-2.5 py-1 text-[10px] font-bold text-camel-800 uppercase tracking-wider border-b border-om-200/70 mb-1 flex items-center justify-between">
                <span>Выбор титулов</span>
                <button
                  type="button"
                  onClick={() => setActiveAwardsMenu(null)}
                  className="text-char-400 hover:text-char-700 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="p-0.5 space-y-0.5 max-h-56 overflow-y-auto">
                {TITLES_LIST.map(title => {
                  const active = (targetDog.awards || []).includes(title)
                  return (
                    <button
                      key={title}
                      type="button"
                      onClick={() => toggleAward(activeAwardsMenu.catId, activeAwardsMenu.dogId, title)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition-colors cursor-pointer ${
                        active
                          ? 'bg-camel-100 text-camel-900 font-bold'
                          : 'hover:bg-om-100 text-char-700'
                      }`}
                    >
                      <span>{title}</span>
                      {active && <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </>,
          document.body
        )
      })()}

      {/* Портал выпадающего меню выбора породы */}
      {activeBreedMenu && typeof document !== 'undefined' && (() => {
        const cat = categories.find(c => c.id === activeBreedMenu.catId)
        if (!cat) return null

        const query = breedSearch.toLowerCase().trim()
        const filteredGroups = BREED_GROUPS.map(group => ({
          ...group,
          breeds: group.breeds.filter(b => !query || b.toLowerCase().includes(query))
        })).filter(g => g.breeds.length > 0)

        return createPortal(
          <>
            <div className="fixed inset-0 z-50" onClick={() => setActiveBreedMenu(null)} />
            <div
              data-portal-menu
              className="fixed z-50 w-72 bg-cream-50 rounded-xl border border-om-300 shadow-2xl p-1 text-xs ring-1 ring-char-900/10 animate-in fade-in zoom-in-95 duration-100"
              style={{
                top: window.innerHeight - activeBreedMenu.rect.bottom < 280
                  ? Math.max(10, activeBreedMenu.rect.top - 270)
                  : activeBreedMenu.rect.bottom + 4,
                left: Math.max(10, Math.min(activeBreedMenu.rect.left, window.innerWidth - 300))
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-1 border-b border-om-200/70 mb-1 flex items-center gap-1.5">
                <div className="flex-1 flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-om-200 focus-within:ring-1 focus-within:ring-camel-500">
                  <Search className="w-3.5 h-3.5 text-char-400 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    value={breedSearch}
                    onChange={e => setBreedSearch(e.target.value)}
                    placeholder="Поиск породы..."
                    className="w-full text-xs text-char-900 bg-transparent focus:outline-none placeholder:text-char-400"
                  />
                  {breedSearch && (
                    <button
                      type="button"
                      onClick={() => setBreedSearch('')}
                      className="text-char-400 hover:text-char-700 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveBreedMenu(null)}
                  className="text-char-400 hover:text-char-700 p-1 rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="p-0.5 space-y-1 max-h-60 overflow-y-auto">
                {filteredGroups.map(group => (
                  <div key={group.groupName} className="space-y-0.5">
                    <div className="px-2 pt-1.5 pb-0.5 text-[9px] font-bold uppercase tracking-wider text-camel-800">
                      {group.groupName}
                    </div>
                    {group.breeds.map(b => {
                      const isSelected = cat.breed === b
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            updateCategoryMeta(cat.id, { breed: b })
                            setActiveBreedMenu(null)
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-camel-100 text-camel-900 font-bold'
                              : 'hover:bg-om-100 text-char-700'
                          }`}
                        >
                          <span>{b}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                ))}

                {filteredGroups.length === 0 && (
                  <div className="px-3 py-3 text-center text-xs text-char-400">
                    Порода не найдена
                  </div>
                )}

                <div className="pt-1 mt-1 border-t border-om-200/70">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomBreedCatIds(prev => ({ ...prev, [cat.id]: true }))
                      setActiveBreedMenu(null)
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-camel-800 font-semibold hover:bg-om-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-camel-600" />
                    <span>Другая порода (ввести вручную)</span>
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )
      })()}

      {/* Портал выпадающего меню выбора класса */}
      {activeClassMenu && typeof document !== 'undefined' && (() => {
        const cat = categories.find(c => c.id === activeClassMenu.catId)
        if (!cat) return null

        return createPortal(
          <>
            <div className="fixed inset-0 z-50" onClick={() => setActiveClassMenu(null)} />
            <div
              data-portal-menu
              className="fixed z-50 w-52 bg-cream-50 rounded-xl border border-om-300 shadow-2xl p-1 text-xs ring-1 ring-char-900/10 animate-in fade-in zoom-in-95 duration-100"
              style={{
                top: window.innerHeight - activeClassMenu.rect.bottom < 240
                  ? Math.max(10, activeClassMenu.rect.top - 230)
                  : activeClassMenu.rect.bottom + 4,
                left: Math.max(10, Math.min(activeClassMenu.rect.left, window.innerWidth - 220))
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-2.5 py-1 text-[10px] font-bold text-camel-800 uppercase tracking-wider border-b border-om-200/70 mb-1 flex items-center justify-between">
                <span>Выбор класса</span>
                <button
                  type="button"
                  onClick={() => setActiveClassMenu(null)}
                  className="text-char-400 hover:text-char-700 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="p-0.5 space-y-0.5 max-h-56 overflow-y-auto">
                {CLASSES.map(c => {
                  const isSelected = cat.className === c
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        updateCategoryMeta(cat.id, { className: c })
                        setActiveClassMenu(null)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-camel-100 text-camel-900 font-bold'
                          : 'hover:bg-om-100 text-char-700'
                      }`}
                    >
                      <span>{c}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />}
                    </button>
                  )
                })}
                {!CLASSES.includes(cat.className) && cat.className && (
                  <button
                    type="button"
                    onClick={() => setActiveClassMenu(null)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center bg-camel-100 text-camel-900 font-bold"
                  >
                    <span>{cat.className}</span>
                    <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />
                  </button>
                )}
                <div className="pt-1 mt-1 border-t border-om-200/70">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomClassCatIds(prev => ({ ...prev, [cat.id]: true }))
                      setActiveClassMenu(null)
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-camel-800 font-semibold hover:bg-om-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-camel-600" />
                    <span>Другой класс...</span>
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )
      })()}

      {/* Портал выпадающего меню выбора пола в категории */}
      {activeCategorySexMenu && typeof document !== 'undefined' && (() => {
        const cat = categories.find(c => c.id === activeCategorySexMenu.catId)
        if (!cat) return null

        const sexOptions: Array<{ value: 'male' | 'female' | 'mixed'; label: string }> = [
          { value: 'male', label: 'Кобели' },
          { value: 'female', label: 'Суки' },
          { value: 'mixed', label: 'Микс' }
        ]

        return createPortal(
          <>
            <div className="fixed inset-0 z-50" onClick={() => setActiveCategorySexMenu(null)} />
            <div
              data-portal-menu
              className="fixed z-50 w-36 bg-cream-50 rounded-xl border border-om-300 shadow-2xl p-1 text-xs ring-1 ring-char-900/10 animate-in fade-in zoom-in-95 duration-100"
              style={{
                top: window.innerHeight - activeCategorySexMenu.rect.bottom < 150
                  ? Math.max(10, activeCategorySexMenu.rect.top - 140)
                  : activeCategorySexMenu.rect.bottom + 4,
                left: Math.max(10, Math.min(activeCategorySexMenu.rect.left, window.innerWidth - 160))
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-0.5 space-y-0.5">
                {sexOptions.map(opt => {
                  const isSelected = cat.sex === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        updateCategoryMeta(cat.id, { sex: opt.value })
                        setActiveCategorySexMenu(null)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-camel-100 text-camel-900 font-bold'
                          : 'hover:bg-om-100 text-char-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </>,
          document.body
        )
      })()}

      {/* Портал выпадающего меню выбора пола в строке собаки */}
      {activeDogSexMenu && typeof document !== 'undefined' && (() => {
        const cat = categories.find(c => c.id === activeDogSexMenu.catId)
        const dog = cat?.dogs.find(d => d.id === activeDogSexMenu.dogId)
        if (!cat || !dog) return null

        const sexOptions: Array<{ value: 'male' | 'female'; label: string }> = [
          { value: 'male', label: 'Кобель' },
          { value: 'female', label: 'Сука' }
        ]

        return createPortal(
          <>
            <div className="fixed inset-0 z-50" onClick={() => setActiveDogSexMenu(null)} />
            <div
              data-portal-menu
              className="fixed z-50 w-32 bg-cream-50 rounded-xl border border-om-300 shadow-2xl p-1 text-xs ring-1 ring-char-900/10 animate-in fade-in zoom-in-95 duration-100"
              style={{
                top: window.innerHeight - activeDogSexMenu.rect.bottom < 120
                  ? Math.max(10, activeDogSexMenu.rect.top - 110)
                  : activeDogSexMenu.rect.bottom + 4,
                left: Math.max(10, Math.min(activeDogSexMenu.rect.left, window.innerWidth - 140))
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-0.5 space-y-0.5">
                {sexOptions.map(opt => {
                  const isSelected = dog.sex === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        updateDog(cat.id, dog.id, { sex: opt.value })
                        setActiveDogSexMenu(null)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-camel-100 text-camel-900 font-bold'
                          : 'hover:bg-om-100 text-char-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-camel-700 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </>,
          document.body
        )
      })()}
    </div>
  )
}
