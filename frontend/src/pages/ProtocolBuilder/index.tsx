import React, { useState, useEffect } from 'react'
import {
  Plus,
  Trash2,
  Download,
  Printer,
  FileSpreadsheet,
  Trophy,
  FolderPlus,
  ChevronDown
} from 'lucide-react'
import type { CompetitionHeader, CategoryGroup, DogParticipant, CompetitionKind } from './types'
import {
  createNewCategory,
  createNewParticipant,
  calculateRoundSum,
  calculateTotalScore,
  formatCategoryTitle
} from './types'
import { exportToCSV, exportToJSON } from './exportHelpers'

const STORAGE_KEY = 'cs_protocol_builder_draft_v2'

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

  const [categories, setCategories] = useState<CategoryGroup[]>([
    createNewCategory('Басенджи', 'Стандартный', 'male', 2, 1)
  ])

  // Загрузка черновика из localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.header) setHeader(parsed.header)
        if (parsed.kind) setKind(parsed.kind)
        if (parsed.categories && parsed.categories.length > 0) {
          setCategories(parsed.categories)
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
    // Вычисляем следующий стартовый номер каталога
    let totalDogs = 0
    categories.forEach(c => { totalDogs += c.dogs.length })
    setCategories(prev => [...prev, createNewCategory('Уиппет', 'Стандартный', 'male', 2, totalDogs + 1)])
  }

  const removeCategory = (categoryId: string) => {
    if (categories.length <= 1) return
    setCategories(prev => prev.filter(c => c.id !== categoryId))
  }

  const updateCategoryMeta = (categoryId: string, updates: Partial<CategoryGroup>) => {
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, ...updates } : c))
  }

  // Добавление собаки в конкретную категорию
  const addDogToCategory = (categoryId: string) => {
    let totalDogs = 0
    categories.forEach(c => { totalDogs += c.dogs.length })

    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        dogs: [...cat.dogs, createNewParticipant(totalDogs + 1)]
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

  const updateRoundScores = (
    categoryId: string,
    dogId: string,
    round: 'run1_scores' | 'run2_scores',
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
          return {
            ...d,
            [round]: {
              ...d[round],
              [criterion]: num
            }
          }
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

  // Печать только результатов (через print stylesheet)
  const handlePrintResults = () => {
    window.print()
  }

  return (
    <div className="space-y-6 pb-20 pt-2">
      {/* ПАНЕЛЬ УПРАВЛЕНИЯ И ЭКСПОРТА (скрывается при печати) */}
      <div className="bg-cream-50/90 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-om-200 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-om-200/70 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-camel-800">
              Параметры турнира
            </span>
          </div>

          {/* Кнопки скачивания результатов */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrintResults}
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

          {/* Переключатель дисциплины */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-char-600 font-medium mb-1">Название соревнований</label>
            <input
              type="text"
              value={header.title}
              onChange={e => setHeader({ ...header, title: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 focus:outline-none focus:ring-1 focus:ring-camel-500"
              placeholder="Чемпионат РКФ по курсингу"
            />
          </div>

          <div>
            <label className="block text-char-600 font-medium mb-1">Ранг соревнований</label>
            <input
              type="text"
              value={header.rank}
              onChange={e => setHeader({ ...header, rank: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 focus:outline-none focus:ring-1 focus:ring-camel-500"
              placeholder="ЧРКФ / CACL / Квалификация"
            />
          </div>

          <div>
            <label className="block text-char-600 font-medium mb-1">Дата проведения</label>
            <input
              type="date"
              value={header.date}
              onChange={e => setHeader({ ...header, date: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 focus:outline-none focus:ring-1 focus:ring-camel-500"
            />
          </div>

          <div>
            <label className="block text-char-600 font-medium mb-1">Место / Регион</label>
            <input
              type="text"
              value={header.location}
              onChange={e => setHeader({ ...header, location: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 focus:outline-none focus:ring-1 focus:ring-camel-500"
              placeholder="Московская обл., Донино"
            />
          </div>

          <div>
            <label className="block text-char-600 font-medium mb-1">Организатор (Клуб)</label>
            <input
              type="text"
              value={header.club}
              onChange={e => setHeader({ ...header, club: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 focus:outline-none focus:ring-1 focus:ring-camel-500"
              placeholder="МКОО Клуб Спортивного Собаководства"
            />
          </div>

          <div>
            <label className="block text-char-600 font-medium mb-1">Судьи</label>
            <input
              type="text"
              value={header.judges}
              onChange={e => setHeader({ ...header, judges: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 focus:outline-none focus:ring-1 focus:ring-camel-500"
              placeholder="Иванов И.И., Петров П.П."
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

      {/* РАБОЧАЯ ОБЛАСТЬ КАТЕГОРИЙ (скрывается при печати, если мы печатаем чистые результаты) */}
      <div className="space-y-6 print:hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-char-900">
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
        <div className="space-y-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-cream-50/95 rounded-xl border border-om-200 shadow-xs overflow-hidden"
            >
              {/* Шапка категории: Порода, Класс, Пол */}
              <div className="bg-om-100/70 p-3.5 border-b border-om-200/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-camel-800 uppercase tracking-wider">
                    Категория:
                  </span>

                  {/* Выбор породы */}
                  <select
                    value={category.breed}
                    onChange={e => updateCategoryMeta(category.id, { breed: e.target.value })}
                    className="px-2.5 py-1 bg-cream-50 rounded border border-om-200 text-xs font-bold text-char-900"
                  >
                    {COMMON_BREEDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>

                  {/* Выбор класса */}
                  <select
                    value={category.className}
                    onChange={e => updateCategoryMeta(category.id, { className: e.target.value })}
                    className="px-2.5 py-1 bg-cream-50 rounded border border-om-200 text-xs font-semibold text-char-800"
                  >
                    {CLASSES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  {/* Выбор пола */}
                  <select
                    value={category.sex}
                    onChange={e => updateCategoryMeta(category.id, { sex: e.target.value as any })}
                    className="px-2.5 py-1 bg-cream-50 rounded border border-om-200 text-xs font-semibold text-char-800"
                  >
                    <option value="male">Кобели</option>
                    <option value="female">Суки</option>
                    <option value="mixed">Смешанный (Кобели и Суки)</option>
                  </select>
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
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Список собак в категории */}
              <div className="p-3.5 space-y-3">
                {category.dogs.map((dog) => {
                  const sum1 = calculateRoundSum(dog.run1_scores)
                  const sum2 = calculateRoundSum(dog.run2_scores)
                  const total = calculateTotalScore(dog)

                  return (
                    <div
                      key={dog.id}
                      className="bg-om-50/60 rounded-lg border border-om-200/80 p-3 space-y-2.5 hover:border-camel-300 transition-all"
                    >
                      {/* Строка идентификации собаки */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-om-200/50 pb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                          <input
                            type="text"
                            value={dog.catalogNumber}
                            onChange={e => updateDog(category.id, dog.id, { catalogNumber: e.target.value })}
                            className="w-12 px-1.5 py-1 text-center font-bold bg-cream-50 rounded border border-om-200 text-xs text-char-900"
                            placeholder="№"
                            title="Номер по каталогу"
                          />

                          <input
                            type="text"
                            value={dog.dogName}
                            onChange={e => updateDog(category.id, dog.id, { dogName: e.target.value })}
                            className="flex-1 px-2.5 py-1 bg-cream-50 rounded border border-om-200 text-xs font-semibold text-char-900 focus:ring-1 focus:ring-camel-500 focus:outline-none"
                            placeholder="Полная кличка собаки"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-camel-100/70 border border-camel-300 px-2.5 py-0.5 rounded-lg">
                            <span className="text-[10px] font-bold text-camel-800 uppercase tracking-wider">Всего:</span>
                            <span className="text-xs font-bold text-char-900 tabular-nums">
                              {dog.disqualified ? 'ДИСКВ.' : total}
                            </span>
                          </div>

                          <button
                            onClick={() => removeDogFromCategory(category.id, dog.id)}
                            disabled={category.dogs.length <= 1}
                            className="text-char-400 hover:text-terracotta-600 transition-colors p-1 disabled:opacity-30"
                            title="Удалить собаку"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Забеги и критерии (Курсинг) */}
                      {kind === 'coursing' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {/* 1-й круг */}
                          <div className="bg-cream-50/80 rounded p-2 border border-om-200/50 space-y-1.5">
                            <div className="flex items-center justify-between font-semibold text-char-700 text-[11px] pb-1 border-b border-om-200/40">
                              <div className="flex items-center gap-2">
                                <span>1 Круг</span>
                                <span className="text-char-400">Забег:</span>
                                <input
                                  type="text"
                                  value={dog.run1_heat}
                                  onChange={e => updateDog(category.id, dog.id, { run1_heat: e.target.value })}
                                  className="w-7 text-center bg-om-50 border border-om-200 rounded py-0.5 text-[10px]"
                                />
                                <span className="text-char-400">Попона:</span>
                                <select
                                  value={dog.run1_blanket}
                                  onChange={e => updateDog(category.id, dog.id, { run1_blanket: e.target.value as any })}
                                  className="bg-om-50 border border-om-200 rounded px-1 py-0.5 text-[10px]"
                                >
                                  <option value="red">Красная</option>
                                  <option value="white">Белая</option>
                                  <option value="blue">Синяя</option>
                                </select>
                              </div>
                              <span className="font-bold text-camel-800 tabular-nums">Сумма: {sum1}</span>
                            </div>

                            <div className="grid grid-cols-5 gap-1 text-center">
                              {(['speed', 'enthusiasm', 'intelligence', 'agility', 'endurance'] as const).map(c => (
                                <div key={c}>
                                  <label className="block text-[8px] text-char-400 uppercase mb-0.5">
                                    {c === 'speed' && 'Скор.'}
                                    {c === 'enthusiasm' && 'Энт.'}
                                    {c === 'intelligence' && 'Инт.'}
                                    {c === 'agility' && 'Ман.'}
                                    {c === 'endurance' && 'Вын.'}
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={20}
                                    value={dog.run1_scores[c]}
                                    onChange={e => updateRoundScores(category.id, dog.id, 'run1_scores', c, e.target.value)}
                                    className="w-full text-center py-0.5 bg-om-50 border border-om-200 rounded text-xs font-semibold tabular-nums"
                                    placeholder="0"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 2-й круг */}
                          <div className="bg-cream-50/80 rounded p-2 border border-om-200/50 space-y-1.5">
                            <div className="flex items-center justify-between font-semibold text-char-700 text-[11px] pb-1 border-b border-om-200/40">
                              <div className="flex items-center gap-2">
                                <span>2 Круг</span>
                                <span className="text-char-400">Забег:</span>
                                <input
                                  type="text"
                                  value={dog.run2_heat}
                                  onChange={e => updateDog(category.id, dog.id, { run2_heat: e.target.value })}
                                  className="w-7 text-center bg-om-50 border border-om-200 rounded py-0.5 text-[10px]"
                                />
                                <span className="text-char-400">Попона:</span>
                                <select
                                  value={dog.run2_blanket}
                                  onChange={e => updateDog(category.id, dog.id, { run2_blanket: e.target.value as any })}
                                  className="bg-om-50 border border-om-200 rounded px-1 py-0.5 text-[10px]"
                                >
                                  <option value="red">Красная</option>
                                  <option value="white">Белая</option>
                                  <option value="blue">Синяя</option>
                                </select>
                              </div>
                              <span className="font-bold text-camel-800 tabular-nums">Сумма: {sum2}</span>
                            </div>

                            <div className="grid grid-cols-5 gap-1 text-center">
                              {(['speed', 'enthusiasm', 'intelligence', 'agility', 'endurance'] as const).map(c => (
                                <div key={c}>
                                  <label className="block text-[8px] text-char-400 uppercase mb-0.5">
                                    {c === 'speed' && 'Скор.'}
                                    {c === 'enthusiasm' && 'Энт.'}
                                    {c === 'intelligence' && 'Инт.'}
                                    {c === 'agility' && 'Ман.'}
                                    {c === 'endurance' && 'Вын.'}
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={20}
                                    value={dog.run2_scores[c]}
                                    onChange={e => updateRoundScores(category.id, dog.id, 'run2_scores', c, e.target.value)}
                                    className="w-full text-center py-0.5 bg-om-50 border border-om-200 rounded text-xs font-semibold tabular-nums"
                                    placeholder="0"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Забеги для рейсинга */
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-cream-50/80 p-2 rounded border border-om-200/50">
                          <div>
                            <label className="block text-[9px] text-char-500 mb-0.5">Бокс</label>
                            <input
                              type="text"
                              value={dog.racing_box}
                              onChange={e => updateDog(category.id, dog.id, { racing_box: e.target.value })}
                              className="w-full px-2 py-0.5 bg-om-50 border border-om-200 rounded text-xs text-center"
                              placeholder="1"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-char-500 mb-0.5">1-й Заезд (сек)</label>
                            <input
                              type="text"
                              value={dog.racing_time1}
                              onChange={e => updateDog(category.id, dog.id, { racing_time1: e.target.value })}
                              className="w-full px-2 py-0.5 bg-om-50 border border-om-200 rounded text-xs text-center font-mono"
                              placeholder="22.45"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-char-500 mb-0.5">2-й Заезд (сек)</label>
                            <input
                              type="text"
                              value={dog.racing_time2}
                              onChange={e => updateDog(category.id, dog.id, { racing_time2: e.target.value })}
                              className="w-full px-2 py-0.5 bg-om-50 border border-om-200 rounded text-xs text-center font-mono"
                              placeholder="22.30"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-char-500 mb-0.5 font-bold text-camel-800">Финал (сек)</label>
                            <input
                              type="text"
                              value={dog.racing_final_time}
                              onChange={e => updateDog(category.id, dog.id, { racing_final_time: e.target.value })}
                              className="w-full px-2 py-0.5 bg-om-50 border border-camel-300 rounded text-xs text-center font-mono font-bold"
                              placeholder="22.15"
                            />
                          </div>
                        </div>
                      )}

                      {/* Титулы собаки */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[9px] text-char-400 font-bold uppercase tracking-wider mr-1">
                          Титулы:
                        </span>
                        {TITLES_LIST.map(title => {
                          const active = dog.awards.includes(title)
                          return (
                            <button
                              key={title}
                              type="button"
                              onClick={() => toggleAward(category.id, dog.id, title)}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                                active
                                  ? 'bg-camel-600 text-white border-camel-700 shadow-xs'
                                  : 'bg-cream-50 text-char-600 border-om-200 hover:border-camel-300'
                              }`}
                            >
                              {title}
                            </button>
                          )
                        })}
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
      <div className="space-y-6">
        <div className="border-b border-om-200 pb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-char-900 flex items-center gap-2">
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
            return calculateTotalScore(b) - calculateTotalScore(a)
          })

          return (
            <div
              key={cat.id}
              className="bg-cream-50 rounded-xl border border-om-200 p-4 shadow-xs space-y-3 print:border-none print:shadow-none print:p-0 print:mb-6"
            >
              <div className="flex items-center justify-between border-b border-om-200/80 pb-2">
                <h3 className="text-sm font-serif font-bold text-char-900">
                  {formatCategoryTitle(cat)}
                </h3>
                <span className="text-xs text-char-500">
                  Участников: {cat.dogs.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-om-200 text-[10px] uppercase font-bold text-char-500">
                      <th className="py-2 px-2 w-12">Место</th>
                      <th className="py-2 px-2 w-12">№ кат.</th>
                      <th className="py-2 px-3">Кличка собаки</th>
                      {kind === 'coursing' ? (
                        <>
                          <th className="py-2 px-2 text-center">1 Круг</th>
                          <th className="py-2 px-2 text-center">2 Круг</th>
                          <th className="py-2 px-2 text-right">Итого баллов</th>
                        </>
                      ) : (
                        <>
                          <th className="py-2 px-2 text-center">Заезд 1</th>
                          <th className="py-2 px-2 text-center">Заезд 2</th>
                          <th className="py-2 px-2 text-right">Итоговое время</th>
                        </>
                      )}
                      <th className="py-2 px-3 text-right">Титулы и сертификаты</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-om-200/60">
                    {sortedDogs.map((d, idx) => (
                      <tr key={d.id} className="hover:bg-om-50/50">
                        <td className="py-2 px-2 font-bold text-camel-800">
                          {d.disqualified ? '—' : `${idx + 1}`}
                        </td>
                        <td className="py-2 px-2 text-char-500 font-mono">{d.catalogNumber}</td>
                        <td className="py-2 px-3 font-semibold text-char-900">{d.dogName || '—'}</td>
                        {kind === 'coursing' ? (
                          <>
                            <td className="py-2 px-2 text-center tabular-nums text-char-700">
                              {calculateRoundSum(d.run1_scores) || '—'}
                            </td>
                            <td className="py-2 px-2 text-center tabular-nums text-char-700">
                              {calculateRoundSum(d.run2_scores) || '—'}
                            </td>
                            <td className="py-2 px-2 text-right font-bold tabular-nums text-char-900">
                              {d.disqualified ? 'ДИСКВ.' : calculateTotalScore(d)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-2 text-center font-mono text-char-700">
                              {d.racing_time1 || '—'}
                            </td>
                            <td className="py-2 px-2 text-center font-mono text-char-700">
                              {d.racing_time2 || '—'}
                            </td>
                            <td className="py-2 px-2 text-right font-bold font-mono text-char-900">
                              {d.disqualified ? 'ДИСКВ.' : (d.racing_final_time || '—')}
                            </td>
                          </>
                        )}
                        <td className="py-2 px-3 text-right font-semibold text-camel-700">
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
