import React, { useState, useEffect } from 'react'
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Printer,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import type { CompetitionHeader, DogParticipant, CompetitionKind } from './types'
import { createNewParticipant, calculateRoundSum, calculateTotalScore } from './types'
import { exportToCSV, exportToJSON } from './exportHelpers'

const STORAGE_KEY = 'cs_protocol_builder_draft_v1'

const COMMON_BREEDS = [
  'Уиппет',
  'Русская псовая борзая',
  'Салюки',
  'Грейхаунд',
  'Басенджи',
  'Левретка',
  'Афганская борзая',
  'Родезийский риджбек',
  'Фараонова собака',
  'Чирнеко дель Этна',
  'Ирландский волкодав',
  'Дирхаунд'
]

const TITLES_LIST = ['CACL', 'ЧРКФ', 'CACIT', 'Ю.CACL', 'Вет.CACL', 'Best in Field', 'Res.CACL']

export default function ProtocolBuilder() {
  const [kind, setKind] = useState<CompetitionKind>('coursing')
  const [header, setHeader] = useState<CompetitionHeader>({
    title: 'Чемпионат РКФ по курсингу',
    rank: 'ЧРКФ',
    date: new Date().toISOString().substring(0, 10),
    location: 'Московская обл.',
    club: '',
    judges: ''
  })

  const [participants, setParticipants] = useState<DogParticipant[]>([
    createNewParticipant(1),
    createNewParticipant(2)
  ])

  const [copiedNotification, setCopiedNotification] = useState(false)

  // Загрузка черновика из localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.header) setHeader(parsed.header)
        if (parsed.kind) setKind(parsed.kind)
        if (parsed.participants && parsed.participants.length > 0) {
          setParticipants(parsed.participants)
        }
      }
    } catch {}
  }, [])

  // Автосохранение черновика
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ header, kind, participants }))
    } catch {}
  }, [header, kind, participants])

  const addParticipant = () => {
    setParticipants(prev => [...prev, createNewParticipant(prev.length + 1)])
  }

  const removeParticipant = (id: string) => {
    if (participants.length <= 1) return
    setParticipants(prev => prev.filter(p => p.id !== id))
  }

  const updateParticipant = (id: string, updates: Partial<DogParticipant>) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const updateRoundScores = (
    id: string,
    round: 'run1_scores' | 'run2_scores',
    criterion: 'speed' | 'enthusiasm' | 'intelligence' | 'agility' | 'endurance',
    value: string
  ) => {
    const num = value === '' ? '' : Math.min(20, Math.max(0, Number(value)))
    setParticipants(prev => prev.map(p => {
      if (p.id !== id) return p
      return {
        ...p,
        [round]: {
          ...p[round],
          [criterion]: num
        }
      }
    }))
  }

  const toggleAward = (id: string, award: string) => {
    setParticipants(prev => prev.map(p => {
      if (p.id !== id) return p
      const exists = p.awards.includes(award)
      return {
        ...p,
        awards: exists ? p.awards.filter(a => a !== award) : [...p.awards, award]
      }
    }))
  }

  const handlePrint = () => {
    window.print()
  }

  const sortedParticipants = [...participants].sort((a, b) => {
    return calculateTotalScore(b) - calculateTotalScore(a)
  })

  return (
    <div className="space-y-6 pb-16 pt-2">
      {/* Форма метаданных турнира */}
      <div className="bg-cream-50/90 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-om-200 shadow-sm space-y-4 print:border-none print:shadow-none print:p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-om-200/70 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-camel-800">
              Протокол соревнований
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cream-50 hover:bg-cream-100 text-char-800 text-xs font-medium rounded-lg border border-om-200 shadow-xs transition-all"
              title="Печать или сохранение в PDF"
            >
              <Printer className="w-3.5 h-3.5 text-camel-700" />
              <span>Печать / PDF</span>
            </button>

            <button
              onClick={() => exportToCSV(header, kind, participants)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cream-50 hover:bg-cream-100 text-char-800 text-xs font-medium rounded-lg border border-om-200 shadow-xs transition-all"
              title="Экспорт таблицы в Excel/CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-forest-600" />
              <span>Экспорт в Excel</span>
            </button>

            <button
              onClick={() => exportToJSON(header, kind, participants)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-camel-600 hover:bg-camel-700 text-white text-xs font-medium rounded-lg shadow-xs transition-all"
              title="Экспорт в формате JSON для сайта"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать JSON</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-char-600">
            Данные турнира
          </span>

          {/* Переключатель дисциплины */}
          <div className="flex items-center bg-om-100 p-0.5 rounded-lg border border-om-200 print:hidden text-xs">
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
              placeholder="д. Донино, Раменский р-н"
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

      {/* Таблица заполнения результатов */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-serif font-bold text-char-900">
            Участники и результаты ({participants.length})
          </h2>

          <button
            onClick={addParticipant}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-camel-600 hover:bg-camel-700 text-white rounded-lg text-xs font-medium shadow-xs transition-all print:hidden"
          >
            <Plus className="w-3.5 h-3.5" />
            Добавить собаку
          </button>
        </div>

        {/* Карточки собак */}
        <div className="space-y-3">
          {participants.map((p, index) => {
            const sum1 = calculateRoundSum(p.run1_scores)
            const sum2 = calculateRoundSum(p.run2_scores)
            const total = calculateTotalScore(p)

            return (
              <div
                key={p.id}
                className="bg-cream-50/95 rounded-xl border border-om-200 p-3.5 shadow-xs transition-all hover:border-camel-300 space-y-3"
              >
                {/* Верхняя строка собаки: каталог, кличка, порода, пол */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-om-200/60 pb-2.5">
                  <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                    <div className="w-12">
                      <input
                        type="text"
                        value={p.catalogNumber}
                        onChange={e => updateParticipant(p.id, { catalogNumber: e.target.value })}
                        className="w-full px-2 py-1 text-center font-bold bg-om-100 rounded border border-om-200 text-xs text-char-900"
                        title="Номер по каталогу"
                        placeholder="№"
                      />
                    </div>

                    <input
                      type="text"
                      value={p.dogName}
                      onChange={e => updateParticipant(p.id, { dogName: e.target.value })}
                      className="flex-1 px-2.5 py-1 bg-om-50 rounded border border-om-200 text-xs font-semibold text-char-900 focus:outline-none focus:ring-1 focus:ring-camel-500"
                      placeholder="Полная кличка собаки"
                    />

                    <select
                      value={p.breed}
                      onChange={e => updateParticipant(p.id, { breed: e.target.value })}
                      className="px-2 py-1 bg-om-50 rounded border border-om-200 text-xs text-char-800"
                    >
                      {COMMON_BREEDS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>

                    <select
                      value={p.sex}
                      onChange={e => updateParticipant(p.id, { sex: e.target.value as any })}
                      className="px-2 py-1 bg-om-50 rounded border border-om-200 text-xs text-char-800"
                    >
                      <option value="male">Кобель</option>
                      <option value="female">Сука</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Общая сумма баллов собаки */}
                    <div className="flex items-center gap-1.5 bg-camel-100/70 border border-camel-300 px-3 py-1 rounded-lg">
                      <span className="text-[11px] font-bold text-camel-800 uppercase tracking-wider">Всего:</span>
                      <span className="text-sm font-bold text-char-900 tabular-nums">
                        {p.disqualified ? 'ДИСКВ.' : total}
                      </span>
                    </div>

                    <button
                      onClick={() => removeParticipant(p.id)}
                      className="text-char-400 hover:text-terracotta-600 transition-colors p-1 print:hidden"
                      title="Удалить собаку"
                      disabled={participants.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Блок заездов и баллов для курсинга */}
                {kind === 'coursing' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* 1-й круг */}
                    <div className="bg-om-50/70 rounded-lg p-2.5 border border-om-200/60 space-y-2">
                      <div className="flex items-center justify-between font-semibold text-char-800 border-b border-om-200/50 pb-1">
                        <div className="flex items-center gap-2">
                          <span>1-й Круг</span>
                          <span className="text-[10px] text-char-400">Забег:</span>
                          <input
                            type="text"
                            value={p.run1_heat}
                            onChange={e => updateParticipant(p.id, { run1_heat: e.target.value })}
                            className="w-8 px-1 py-0.5 text-center bg-cream-50 border border-om-200 rounded text-[11px]"
                          />
                          <span className="text-[10px] text-char-400">Попона:</span>
                          <select
                            value={p.run1_blanket}
                            onChange={e => updateParticipant(p.id, { run1_blanket: e.target.value as any })}
                            className="px-1.5 py-0.5 bg-cream-50 border border-om-200 rounded text-[10px]"
                          >
                            <option value="red">Красная</option>
                            <option value="white">Белая</option>
                            <option value="blue">Синяя</option>
                          </select>
                        </div>
                        <span className="font-bold text-camel-800 tabular-nums">Сумма: {sum1}</span>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5 text-center">
                        {(['speed', 'enthusiasm', 'intelligence', 'agility', 'endurance'] as const).map(c => (
                          <div key={c}>
                            <label className="block text-[9px] text-char-400 uppercase tracking-tighter mb-0.5">
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
                              value={p.run1_scores[c]}
                              onChange={e => updateRoundScores(p.id, 'run1_scores', c, e.target.value)}
                              className="w-full text-center py-1 bg-cream-50 border border-om-200 rounded text-xs font-semibold tabular-nums focus:ring-1 focus:ring-camel-500 focus:outline-none"
                              placeholder="0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2-й круг */}
                    <div className="bg-om-50/70 rounded-lg p-2.5 border border-om-200/60 space-y-2">
                      <div className="flex items-center justify-between font-semibold text-char-800 border-b border-om-200/50 pb-1">
                        <div className="flex items-center gap-2">
                          <span>2-й Круг</span>
                          <span className="text-[10px] text-char-400">Забег:</span>
                          <input
                            type="text"
                            value={p.run2_heat}
                            onChange={e => updateParticipant(p.id, { run2_heat: e.target.value })}
                            className="w-8 px-1 py-0.5 text-center bg-cream-50 border border-om-200 rounded text-[11px]"
                          />
                          <span className="text-[10px] text-char-400">Попона:</span>
                          <select
                            value={p.run2_blanket}
                            onChange={e => updateParticipant(p.id, { run2_blanket: e.target.value as any })}
                            className="px-1.5 py-0.5 bg-cream-50 border border-om-200 rounded text-[10px]"
                          >
                            <option value="red">Красная</option>
                            <option value="white">Белая</option>
                            <option value="blue">Синяя</option>
                          </select>
                        </div>
                        <span className="font-bold text-camel-800 tabular-nums">Сумма: {sum2}</span>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5 text-center">
                        {(['speed', 'enthusiasm', 'intelligence', 'agility', 'endurance'] as const).map(c => (
                          <div key={c}>
                            <label className="block text-[9px] text-char-400 uppercase tracking-tighter mb-0.5">
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
                              value={p.run2_scores[c]}
                              onChange={e => updateRoundScores(p.id, 'run2_scores', c, e.target.value)}
                              className="w-full text-center py-1 bg-cream-50 border border-om-200 rounded text-xs font-semibold tabular-nums focus:ring-1 focus:ring-camel-500 focus:outline-none"
                              placeholder="0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Блок для рейсинга (секунды, бокс) */
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-om-50/70 p-2.5 rounded-lg border border-om-200/60">
                    <div>
                      <label className="block text-[10px] text-char-500 mb-0.5">Бокс / Дорожка</label>
                      <input
                        type="text"
                        value={p.racing_box}
                        onChange={e => updateParticipant(p.id, { racing_box: e.target.value })}
                        className="w-full px-2 py-1 bg-cream-50 border border-om-200 rounded text-xs text-center"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-char-500 mb-0.5">1-й Забег (сек)</label>
                      <input
                        type="text"
                        value={p.racing_time1}
                        onChange={e => updateParticipant(p.id, { racing_time1: e.target.value })}
                        className="w-full px-2 py-1 bg-cream-50 border border-om-200 rounded text-xs text-center font-mono"
                        placeholder="22.45"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-char-500 mb-0.5">2-й Забег (сек)</label>
                      <input
                        type="text"
                        value={p.racing_time2}
                        onChange={e => updateParticipant(p.id, { racing_time2: e.target.value })}
                        className="w-full px-2 py-1 bg-cream-50 border border-om-200 rounded text-xs text-center font-mono"
                        placeholder="22.30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-char-500 mb-0.5 font-bold text-camel-800">Финал (сек)</label>
                      <input
                        type="text"
                        value={p.racing_final_time}
                        onChange={e => updateParticipant(p.id, { racing_final_time: e.target.value })}
                        className="w-full px-2 py-1 bg-cream-50 border border-camel-300 rounded text-xs text-center font-mono font-bold"
                        placeholder="22.15"
                      />
                    </div>
                  </div>
                )}

                {/* Назначение титулов и сертификатов */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-char-400 font-semibold uppercase tracking-wider mr-1">
                    Титулы:
                  </span>
                  {TITLES_LIST.map(title => {
                    const active = p.awards.includes(title)
                    return (
                      <button
                        key={title}
                        type="button"
                        onClick={() => toggleAward(p.id, title)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                          active
                            ? 'bg-camel-600 text-white border-camel-700 shadow-xs'
                            : 'bg-om-50 text-char-600 border-om-200 hover:border-camel-300'
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

      {/* Сводная таблица распределения мест */}
      <div className="bg-cream-50 rounded-xl border border-om-200 p-4 shadow-sm space-y-3 print:border-none print:shadow-none print:p-0">
        <h3 className="text-sm font-serif font-bold text-char-900 border-b border-om-200/70 pb-2">
          Предварительное распределение мест
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-om-200 text-[10px] uppercase font-bold text-char-500">
                <th className="py-1.5 px-2">Место</th>
                <th className="py-1.5 px-2">№</th>
                <th className="py-1.5 px-2">Кличка</th>
                <th className="py-1.5 px-2">Порода</th>
                <th className="py-1.5 px-2 text-right">Итоговый балл</th>
                <th className="py-1.5 px-2 text-right">Титулы</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-om-200/50">
              {sortedParticipants.map((p, idx) => (
                <tr key={p.id} className="hover:bg-om-50/50">
                  <td className="py-1.5 px-2 font-bold text-camel-800">
                    {p.disqualified ? '-' : `${idx + 1}`}
                  </td>
                  <td className="py-1.5 px-2 text-char-500">{p.catalogNumber}</td>
                  <td className="py-1.5 px-2 font-semibold text-char-900">{p.dogName || '—'}</td>
                  <td className="py-1.5 px-2 text-char-600">{p.breed}</td>
                  <td className="py-1.5 px-2 text-right font-bold tabular-nums">
                    {p.disqualified ? 'ДИСКВ.' : calculateTotalScore(p)}
                  </td>
                  <td className="py-1.5 px-2 text-right text-camel-700 font-semibold">
                    {p.awards.join(', ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
