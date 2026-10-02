import React, { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Trash2,
  Download,
  Printer,
  FileSpreadsheet,
  Trophy,
  FolderPlus,
  Search,
  X,
  Award,
  ChevronDown,
  Check
} from 'lucide-react'
import type { CompetitionHeader, CategoryGroup, DogParticipant, CompetitionKind } from './types'
import {
  createNewCategory,
  createNewParticipant,
  createRunData,
  calculateRoundSum,
  calculateTotalScore,
  formatCategoryTitle
} from './types'
import { exportToCSV, exportToJSON } from './exportHelpers'

const STORAGE_KEY = 'cs_protocol_builder_draft_v3'

const COMMON_BREEDS = [
  'Басенджи',
  'Уиппет',
  'Русская псовая борзая',
  'Салюки',
  'Грейхаунд',
  'Левретка',
  'Афганская борзая',
  'Родезийский риджбек',
  'Фараонова собака',
  'Чирнеко дель Этна',
  'Ирландский волкодав',
  'Дирхаунд'
]

const CLASSES = ['Стандартный', 'Спринтер', 'Юниоры', 'Ветераны', 'Открытый']
const TITLES_LIST = ['CACL', 'ЧРКФ', 'CACIT', 'Ю.CACL', 'Вет.CACL', 'Best in Field', 'Res.CACL']

interface ExistingDog {
  name: string
  breed: string
}

export default function ProtocolBuilder() {
  const [kind, setKind] = useState<CompetitionKind>('coursing')
  const [header, setHeader] = useState<CompetitionHeader>({
    title: 'Чемпионат РКФ по курсингу',
    rank: 'ЧРКФ',
    date: new Date().toISOString().substring(0, 10),
    location: 'Московская обл., Донино',
    club: 'МКОО Клуб Спортивного Собаководства',
    judges: ''
  })

  // Категории: по умолчанию 1 забег
  const [categories, setCategories] = useState<CategoryGroup[]>([
    createNewCategory('Басенджи', 'Стандартный', 'male', 2, 1, 1)
  ])

  // База существующих собак для автокомплита
  const [allExistingDogs, setAllExistingDogs] = useState<ExistingDog[]>([])
  const [activeSearchDogId, setActiveSearchDogId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeAwardsDogId, setActiveAwardsDogId] = useState<string | null>(null)

  // Загрузка индекса собак сайта для быстрого автозаполнения
  useEffect(() => {
    fetch('/data/v1/indexes/dogs-index.json')
      .then(res => res.json())
      .then((data: Array<{ name_ru?: string; name_lat?: string; breed?: string }>) => {
        if (!Array.isArray(data)) return
        const map = new Map<string, string>()
        data.forEach(d => {
          const name = (d.name_ru || d.name_lat || '').trim()
          const breed = (d.breed || '').trim()
          if (name && !map.has(name.toLowerCase())) {
            map.set(name.toLowerCase(), breed)
          }
        })
        const list: ExistingDog[] = Array.from(map.entries()).map(([k, breed]) => ({
          name: k.toUpperCase(),
          breed
        }))
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
        if (parsed.header) setHeader(parsed.header)
        if (parsed.kind) setKind(parsed.kind)
        if (parsed.categories && parsed.categories.length > 0) {
          // Нормализация runs
          const normCats = parsed.categories.map((c: any) => ({
            ...c,
            runsCount: c.runsCount || 1,
            dogs: (c.dogs || []).map((d: any) => ({
              ...d,
              runs: Array.isArray(d.runs) && d.runs.length > 0 ? d.runs : [
                d.run1_scores ? { heat: d.run1_heat || '1', blanket: d.run1_blanket || 'red', scores: d.run1_scores } : createRunData('1', 'red'),
                d.run2_scores ? { heat: d.run2_heat || '1', blanket: d.run2_blanket || 'white', scores: d.run2_scores } : createRunData('1', 'white')
              ]
            }))
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
    setCategories(prev => [...prev, createNewCategory('Уиппет', 'Стандартный', 'male', 2, totalDogs + 1, 1)])
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
          if (!runs[runIndex]) runs[runIndex] = createRunData()
          runs[runIndex] = { ...runs[runIndex], [field]: value }
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

  const toggleAward = (categoryId: string, dogId: string, award: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        dogs: cat.dogs.map(d => {
          if (d.id !== dogId) return d
          const exists = d.awards.includes(award)
          return {
            ...d,
            awards: exists ? d.awards.filter(a => a !== award) : [...d.awards, award]
          }
        })
      }
    }))
  }

  // Фильтр автокомплита для клички
  const filteredExistingDogs = searchQuery.trim().length >= 2
    ? allExistingDogs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8)
    : []

  const selectExistingDog = (categoryId: string, dogId: string, dog: ExistingDog) => {
    updateDog(categoryId, dogId, { dogName: dog.name })
    setActiveSearchDogId(null)
    setSearchQuery('')
  }

  return (
    <div className="space-y-5 pb-20 pt-2">
      {/* ПАНЕЛЬ ПАРАМЕТРОВ ТУРНИРА (скрывается при печати) */}
      <div className="bg-cream-50/90 backdrop-blur-sm rounded-xl p-3.5 md:p-4 border border-om-200 shadow-sm space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-om-200/70 pb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-camel-800">
            Параметры турнира
          </span>

          {/* Кнопки скачивания результатов */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cream-50 hover:bg-cream-100 text-char-800 text-xs font-medium rounded-lg border border-om-200 shadow-xs transition-all"
              title="Печать или сохранение чистого протокола результатов в PDF"
            >
              <Printer className="w-3.5 h-3.5 text-camel-700" />
              <span>Печать результатов (PDF)</span>
            </button>

            <button
              onClick={() => exportToCSV(header, kind, categories)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cream-50 hover:bg-cream-100 text-char-800 text-xs font-medium rounded-lg border border-om-200 shadow-xs transition-all"
              title="Скачать таблицу результатов в Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-forest-600" />
              <span>Скачать результаты (Excel)</span>
            </button>

            <button
              onClick={() => exportToJSON(header, kind, categories)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-camel-600 hover:bg-camel-700 text-white text-xs font-medium rounded-lg shadow-xs transition-all"
              title="Скачать структурированный файл результатов JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать результаты (JSON)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-char-600">
            Метаданные
          </span>

          <div className="flex items-center bg-om-100 p-0.5 rounded-lg border border-om-200 text-xs">
            <button
              onClick={() => setKind('coursing')}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                kind === 'coursing'
                  ? 'bg-cream-50 text-char-900 shadow-xs font-semibold'
                  : 'text-char-500 hover:text-char-800'
              }`}
            >
              Курсинг (баллы)
            </button>
            <button
              onClick={() => setKind('racing')}
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
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 focus:outline-none focus:ring-1 focus:ring-camel-500"
            />
          </div>

          <div>
            <label className="block text-char-600 font-medium mb-0.5">Ранг соревнований</label>
            <input
              type="text"
              value={header.rank}
              onChange={e => setHeader({ ...header, rank: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 focus:outline-none focus:ring-1 focus:ring-camel-500"
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
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 focus:outline-none focus:ring-1 focus:ring-camel-500"
            />
          </div>

          <div>
            <label className="block text-char-600 font-medium mb-0.5">Организатор (Клуб)</label>
            <input
              type="text"
              value={header.club}
              onChange={e => setHeader({ ...header, club: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 focus:outline-none focus:ring-1 focus:ring-camel-500"
            />
          </div>

          <div>
            <label className="block text-char-600 font-medium mb-0.5">Судьи</label>
            <input
              type="text"
              value={header.judges}
              onChange={e => setHeader({ ...header, judges: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 focus:outline-none focus:ring-1 focus:ring-camel-500"
            />
          </div>
        </div>
      </div>

      {/* ОФИЦИАЛЬНАЯ ШАПКА РЕЗУЛЬТАТОВ (отображается при печати) */}
      <div className="hidden print:block text-center space-y-1 mb-6 border-b-2 border-char-900 pb-4">
        <h1 className="text-xl font-bold uppercase">{header.title}</h1>
        <p className="text-xs font-semibold">Ранг: {header.rank} | Дата: {header.date} | Место: {header.location}</p>
        <p className="text-xs">Организатор: {header.club} {header.judges ? `| Судьи: ${header.judges}` : ''}</p>
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
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-cream-50/95 rounded-xl border border-om-200 shadow-xs overflow-hidden"
            >
              {/* Шапка категории: Порода, Класс, Пол + Управление количеством забегов (1, 2, 3) */}
              <div className="bg-om-100/70 px-3 py-2.5 border-b border-om-200/80 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-camel-800 uppercase tracking-wider">
                    Категория:
                  </span>

                  <select
                    value={category.breed}
                    onChange={e => updateCategoryMeta(category.id, { breed: e.target.value })}
                    className="px-2 py-0.5 bg-cream-50 rounded border border-om-200 text-xs font-bold text-char-900"
                  >
                    {COMMON_BREEDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>

                  <select
                    value={category.className}
                    onChange={e => updateCategoryMeta(category.id, { className: e.target.value })}
                    className="px-2 py-0.5 bg-cream-50 rounded border border-om-200 text-xs font-semibold text-char-800"
                  >
                    {CLASSES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    value={category.sex}
                    onChange={e => updateCategoryMeta(category.id, { sex: e.target.value as any })}
                    className="px-2 py-0.5 bg-cream-50 rounded border border-om-200 text-xs font-semibold text-char-800"
                  >
                    <option value="male">Кобели</option>
                    <option value="female">Суки</option>
                    <option value="mixed">Смешанный</option>
                  </select>

                  {/* Переключатель количества забегов: 1, 2, 3 забега */}
                  {kind === 'coursing' && (
                    <div className="flex items-center gap-1 ml-2 bg-om-200/50 p-0.5 rounded border border-om-300/40 text-[10px]">
                      <span className="text-char-500 font-medium px-1">Забегов:</span>
                      {([1, 2, 3] as const).map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setCategoryRunsCount(category.id, n)}
                          className={`px-2 py-0.5 rounded font-bold transition-all ${
                            category.runsCount === n
                              ? 'bg-camel-600 text-white shadow-2xs'
                              : 'text-char-600 hover:text-char-900 bg-cream-50/70'
                          }`}
                        >
                          {n} {n === 1 ? 'круг' : 'круга'}
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
              <div className="p-2 space-y-1.5">
                {category.dogs.map((dog) => {
                  const total = calculateTotalScore(dog, category.runsCount)
                  const isAutocompleteOpen = activeSearchDogId === dog.id

                  return (
                    <div
                      key={dog.id}
                      className="bg-om-50/70 hover:bg-cream-50 rounded-lg border border-om-200/70 p-2 space-y-1.5 transition-all shadow-2xs"
                    >
                      {/* Строка собаки */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        {/* Номер по каталогу + Компактное поле клички собаки с автокомплитом */}
                        <div className="relative flex items-center gap-1.5 w-full sm:w-auto sm:max-w-xs md:max-w-sm flex-1">
                          <input
                            type="text"
                            value={dog.catalogNumber}
                            onChange={e => updateDog(category.id, dog.id, { catalogNumber: e.target.value })}
                            className="w-9 px-1 py-1 text-center font-bold bg-cream-50 rounded border border-om-200 text-xs text-char-900"
                            placeholder="№"
                            title="Номер по каталогу"
                          />

                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={dog.dogName}
                              onChange={e => {
                                updateDog(category.id, dog.id, { dogName: e.target.value })
                                setSearchQuery(e.target.value)
                                setActiveSearchDogId(dog.id)
                              }}
                              onFocus={() => {
                                setSearchQuery(dog.dogName)
                                setActiveSearchDogId(dog.id)
                              }}
                              className="w-full px-2 py-1 bg-cream-50 rounded border border-om-200 text-xs font-semibold text-char-900 focus:ring-1 focus:ring-camel-500 focus:outline-none"
                              placeholder="Кличка собаки"
                            />

                            {/* Всплывающий список существующих собак из базы сайта */}
                            {isAutocompleteOpen && filteredExistingDogs.length > 0 && (
                              <div className="absolute left-0 top-full mt-1 w-72 bg-cream-50 rounded-lg border border-om-300 shadow-lg z-50 py-1 divide-y divide-om-100 max-h-48 overflow-y-auto">
                                <div className="px-2 py-0.5 text-[9px] font-bold text-camel-800 uppercase tracking-wider bg-om-100/60 flex justify-between items-center">
                                  <span>Собаки из базы сайта</span>
                                  <button
                                    onClick={() => setActiveSearchDogId(null)}
                                    className="text-char-400 hover:text-char-800"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                {filteredExistingDogs.map((exDog, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => selectExistingDog(category.id, dog.id, exDog)}
                                    className="w-full text-left px-2 py-1 hover:bg-camel-100/70 text-xs flex justify-between items-center transition-colors"
                                  >
                                    <span className="font-semibold text-char-900 truncate">{exDog.name}</span>
                                    <span className="text-[10px] text-char-400 ml-1 shrink-0">{exDog.breed}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Компактный блок баллов забегов (динамически 1, 2 или 3) */}
                        {kind === 'coursing' ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {dog.runs.slice(0, category.runsCount).map((run, rIdx) => {
                              const sum = calculateRoundSum(run.scores)
                              return (
                                <div key={rIdx} className="flex items-center gap-1 bg-cream-50 px-1.5 py-0.5 rounded border border-om-200">
                                  <span className="text-[10px] text-char-500 font-bold">К{rIdx + 1}:</span>
                                  <input
                                    type="text"
                                    value={run.heat}
                                    onChange={e => updateRunField(category.id, dog.id, rIdx, 'heat', e.target.value)}
                                    className="w-5 text-center bg-om-50 border border-om-200 rounded py-0.5 text-[10px]"
                                    title={`Забег круга ${rIdx + 1}`}
                                  />
                                  <select
                                    value={run.blanket}
                                    onChange={e => updateRunField(category.id, dog.id, rIdx, 'blanket', e.target.value)}
                                    className="bg-om-50 border border-om-200 rounded px-1 py-0.5 text-[9px]"
                                    title="Попона"
                                  >
                                    <option value="red">Красн.</option>
                                    <option value="white">Бел.</option>
                                    <option value="blue">Син.</option>
                                  </select>

                                  {/* 5 критериев */}
                                  <div className="flex items-center gap-0.5 ml-0.5">
                                    {(['speed', 'enthusiasm', 'intelligence', 'agility', 'endurance'] as const).map(c => (
                                      <input
                                        key={c}
                                        type="number"
                                        min={0}
                                        max={20}
                                        value={run.scores[c]}
                                        onChange={e => updateRunScore(category.id, dog.id, rIdx, c, e.target.value)}
                                        className="w-6 text-center py-0.5 bg-om-50 border border-om-200 rounded text-[10px] font-semibold tabular-nums"
                                        placeholder="0"
                                        title={c === 'speed' ? 'Скорость' : c === 'enthusiasm' ? 'Энтузиазм' : c === 'intelligence' ? 'Интеллект' : c === 'agility' ? 'Маневренность' : 'Выносливость'}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[10px] font-bold text-camel-800 ml-1 min-w-[18px] text-right">
                                    {sum}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          /* Рейсинг */
                          <div className="flex items-center gap-1.5 bg-cream-50 px-2 py-0.5 rounded border border-om-200 text-xs">
                            <input
                              type="text"
                              value={dog.racing_box}
                              onChange={e => updateDog(category.id, dog.id, { racing_box: e.target.value })}
                              className="w-7 px-1 py-0.5 bg-om-50 border border-om-200 rounded text-center text-[11px]"
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

                        {/* Правая часть: Титулы (кнопка с меню), Итог и Удаление */}
                        <div className="flex items-center gap-1.5 ml-auto">
                          {/* Кнопка с выбором титулов на одной строке */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveAwardsDogId(activeAwardsDogId === dog.id ? null : dog.id)}
                              className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-semibold transition-all ${
                                dog.awards.length > 0
                                  ? 'bg-camel-600 text-white border-camel-700 shadow-2xs'
                                  : 'bg-cream-50 text-char-600 border-om-200 hover:border-camel-400'
                              }`}
                              title="Назначить титулы и сертификаты"
                            >
                              <Award className="w-3 h-3" />
                              <span>{dog.awards.length > 0 ? dog.awards.join(', ') : 'Титулы'}</span>
                              <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                            </button>

                            {/* Выпадающее меню с выбором нескольких титулов */}
                            {activeAwardsDogId === dog.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-cream-50 rounded-lg border border-om-300 shadow-xl z-50 py-1 divide-y divide-om-100">
                                <div className="px-2.5 py-1 text-[9px] font-bold text-camel-800 uppercase tracking-wider bg-om-100/60 flex justify-between items-center">
                                  <span>Выбор титулов</span>
                                  <button
                                    onClick={() => setActiveAwardsDogId(null)}
                                    className="text-char-400 hover:text-char-800"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                <div className="p-1 space-y-0.5">
                                  {TITLES_LIST.map(title => {
                                    const active = dog.awards.includes(title)
                                    return (
                                      <button
                                        key={title}
                                        type="button"
                                        onClick={() => toggleAward(category.id, dog.id, title)}
                                        className={`w-full text-left px-2 py-1 rounded text-xs flex justify-between items-center transition-colors ${
                                          active
                                            ? 'bg-camel-100 text-camel-900 font-bold'
                                            : 'hover:bg-om-100 text-char-700'
                                        }`}
                                      >
                                        <span>{title}</span>
                                        {active && <Check className="w-3 h-3 text-camel-700" />}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Итоговая сумма */}
                          <div className="bg-camel-100/80 border border-camel-300 px-2 py-0.5 rounded text-center min-w-[46px]">
                            <span className="text-xs font-bold text-char-900 tabular-nums">
                              {dog.disqualified ? 'ДИСКВ' : total}
                            </span>
                          </div>

                          {/* Удаление */}
                          <button
                            onClick={() => removeDogFromCategory(category.id, dog.id)}
                            disabled={category.dogs.length <= 1}
                            className="text-char-400 hover:text-terracotta-600 transition-colors p-1 disabled:opacity-20"
                            title="Удалить собаку"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ОФИЦИАЛЬНАЯ СВОДНАЯ ВЕДОМОСТЬ РЕЗУЛЬТАТОВ (ИМЕННО ЭТО ИДЁТ В ПЕЧАТЬ И PDF) */}
      <div className="space-y-4">
        <div className="border-b border-om-200 pb-2 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-char-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-camel-700" />
            Итоговые результаты по категориям
          </h2>
          <span className="text-xs text-char-500 print:hidden">
            (Отображение чистого официального протокола)
          </span>
        </div>

        {categories.map((cat) => {
          const sortedDogs = [...cat.dogs].sort((a, b) => {
            if (a.disqualified && !b.disqualified) return 1
            if (!a.disqualified && b.disqualified) return -1
            return calculateTotalScore(b, cat.runsCount) - calculateTotalScore(a, cat.runsCount)
          })

          return (
            <div
              key={cat.id}
              className="bg-cream-50 rounded-xl border border-om-200 p-3.5 shadow-xs space-y-2.5 print:border-none print:shadow-none print:p-0 print:mb-6"
            >
              <div className="flex items-center justify-between border-b border-om-200/80 pb-2">
                <h3 className="text-xs font-serif font-bold text-char-900">
                  {formatCategoryTitle(cat)}
                </h3>
                <span className="text-[11px] text-char-500">
                  Забегов: {cat.runsCount} | Участников: {cat.dogs.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-om-200 text-[10px] uppercase font-bold text-char-500">
                      <th className="py-1.5 px-2 w-12">Место</th>
                      <th className="py-1.5 px-2 w-12">№ кат.</th>
                      <th className="py-1.5 px-2">Кличка собаки</th>
                      {kind === 'coursing' ? (
                        <>
                          {Array.from({ length: cat.runsCount }).map((_, r) => (
                            <th key={r} className="py-1.5 px-2 text-center">{r + 1} Круг</th>
                          ))}
                          <th className="py-1.5 px-2 text-right">Итого баллов</th>
                        </>
                      ) : (
                        <>
                          <th className="py-1.5 px-2 text-center">Заезд 1</th>
                          <th className="py-1.5 px-2 text-center">Заезд 2</th>
                          <th className="py-1.5 px-2 text-right">Итоговое время</th>
                        </>
                      )}
                      <th className="py-1.5 px-2 text-right">Титулы и сертификаты</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-om-200/60">
                    {sortedDogs.map((d, idx) => (
                      <tr key={d.id} className="hover:bg-om-50/50">
                        <td className="py-1.5 px-2 font-bold text-camel-800">
                          {d.disqualified ? '—' : `${idx + 1}`}
                        </td>
                        <td className="py-1.5 px-2 text-char-500 font-mono">{d.catalogNumber}</td>
                        <td className="py-1.5 px-2 font-semibold text-char-900">{d.dogName || '—'}</td>
                        {kind === 'coursing' ? (
                          <>
                            {Array.from({ length: cat.runsCount }).map((_, r) => (
                              <td key={r} className="py-1.5 px-2 text-center tabular-nums text-char-700">
                                {d.runs[r] ? calculateRoundSum(d.runs[r].scores) || '—' : '—'}
                              </td>
                            ))}
                            <td className="py-1.5 px-2 text-right font-bold tabular-nums text-char-900">
                              {d.disqualified ? 'ДИСКВ.' : calculateTotalScore(d, cat.runsCount)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-1.5 px-2 text-center font-mono text-char-700">
                              {d.racing_time1 || '—'}
                            </td>
                            <td className="py-1.5 px-2 text-center font-mono text-char-700">
                              {d.racing_time2 || '—'}
                            </td>
                            <td className="py-1.5 px-2 text-right font-bold font-mono text-char-900">
                              {d.disqualified ? 'ДИСКВ.' : (d.racing_final_time || '—')}
                            </td>
                          </>
                        )}
                        <td className="py-1.5 px-2 text-right font-semibold text-camel-700">
                          {d.awards.join(', ') || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}

        {/* Подписи судей в печатной версии */}
        <div className="hidden print:block pt-8 text-xs">
          <div className="flex justify-between border-t border-char-900 pt-3">
            <span>Главный судья соревнований: __________________</span>
            <span>Секретарь: __________________</span>
          </div>
        </div>
      </div>
    </div>
  )
}
