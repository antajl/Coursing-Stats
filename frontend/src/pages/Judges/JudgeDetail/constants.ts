import {
  Compass,
  Zap,
  HeartPulse,
  Target,
  Flame
} from 'lucide-react'

export const DISCIPLINES = [
  { value: '', label: 'Все' },
  { value: 'coursing', label: 'Курсинг' },
  { value: 'bzmp', label: 'БЗМП' },
  { value: 'racing', label: 'Рейсинг' },
] as const

export const CRITERIA_META = [
  {
    id: '0',
    name: 'Манёвренность',
    desc: 'Способность резко менять направление в поворотах за приманкой',
    icon: Compass,
    color: 'bg-emerald-500',
    barBg: 'bg-emerald-100',
    accentBorder: 'border-emerald-200/80',
    textCol: 'text-emerald-800',
    dot: 'bg-emerald-500',
  },
  {
    id: '1',
    name: 'Резвость',
    desc: 'Скорость собаки и стремительность догона движущейся приманки',
    icon: Zap,
    color: 'bg-amber-500',
    barBg: 'bg-amber-100',
    accentBorder: 'border-amber-200/80',
    textCol: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  {
    id: '2',
    name: 'Выносливость',
    desc: 'Физическое состояние и сохранение максимального темпа на трассе',
    icon: HeartPulse,
    color: 'bg-rose-500',
    barBg: 'bg-rose-100',
    accentBorder: 'border-rose-200/80',
    textCol: 'text-rose-800',
    dot: 'bg-rose-500',
  },
  {
    id: '3',
    name: 'Преследование',
    desc: 'Неотступное следование траектории и правильное чтение приманки',
    icon: Target,
    color: 'bg-sky-500',
    barBg: 'bg-sky-100',
    accentBorder: 'border-sky-200/80',
    textCol: 'text-sky-800',
    dot: 'bg-sky-500',
  },
  {
    id: '4',
    name: 'Энтузиазм',
    desc: 'Азарт, неукротимое желание поймать цель и концентрация на ней',
    icon: Flame,
    color: 'bg-orange-500',
    barBg: 'bg-orange-100',
    accentBorder: 'border-orange-200/80',
    textCol: 'text-orange-800',
    dot: 'bg-orange-500',
  },
] as const
