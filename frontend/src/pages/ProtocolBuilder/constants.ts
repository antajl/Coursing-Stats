import { CORE_BREED_HUBS } from '../../lib/breed-hubs-data'
import { FCI_GROUPS, getBreedFciGroup } from '../../lib/fciGroups'
import type { CompetitionHeader, CategoryGroup } from './types'
import { createNewCategory } from './types'

export const STORAGE_KEY = 'cs_protocol_builder_draft_v3'

export interface BreedGroupItem {
  groupName: string
  breeds: string[]
}

function buildUnifiedBreedGroups(): BreedGroupItem[] {
  const grouped = new Map<number, string[]>()
  for (const hub of CORE_BREED_HUBS) {
    const groupId = getBreedFciGroup(hub.slug)
    const list = grouped.get(groupId) || []
    list.push(hub.nameRu)
    grouped.set(groupId, list)
  }

  const orderedGroupInfos = Object.values(FCI_GROUPS).sort((a, b) => a.order - b.order)
  const result: BreedGroupItem[] = []

  for (const info of orderedGroupInfos) {
    const breeds = grouped.get(info.id)
    if (breeds && breeds.length > 0) {
      result.push({
        groupName: info.name,
        breeds,
      })
    }
  }

  result.push({
    groupName: 'Открытый класс / без породы',
    breeds: ['Метис', 'Без породы'],
  })

  return result
}

export const BREED_GROUPS: BreedGroupItem[] = buildUnifiedBreedGroups()

export const ALL_KNOWN_BREEDS = BREED_GROUPS.flatMap((g) => g.breeds)

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
  'Бэби',
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
  'CC',
]

export interface ExistingDog {
  id?: string
  name: string
  name_ru?: string
  name_lat?: string
  breed: string
  sex?: 'male' | 'female' | null
  source?: 'sport' | 'show' | 'donino'
}

export const DEFAULT_HEADER: CompetitionHeader = {
  title: 'Соревнования по курсингу',
  rank: 'Сертификатные',
  date: new Date().toISOString().substring(0, 10),
  location: '',
  club: '',
  judges: '',
}

export const SAMPLE_HEADER: CompetitionHeader = {
  title: 'Чемпионат РКФ по курсингу (пример)',
  rank: 'ЧРКФ',
  date: new Date().toISOString().substring(0, 10),
  location: 'Московская обл.',
  club: 'Клуб спортивного собаководства',
  judges: 'Иванова Е.А., Смирнов Д.В.',
}

export const createDefaultCategories = (): CategoryGroup[] => [
  createNewCategory('Уиппет', 'Стандартный', 'male', 1, 1, 2),
]

export const createSampleCategories = (): CategoryGroup[] => [
  {
    id: 'cat_sample_1',
    breed: 'Уиппет',
    className: 'Стандартный',
    sex: 'male',
    runsCount: 2,
    dogs: [
      {
        id: 'dog_sample_1',
        catalogNumber: '1',
        dogName: 'Ветер Северных Полей',
        sex: 'male',
        runs: [
          {
            heat: '1',
            blanket: 'red',
            scores: { agility: 18, speed: 19, endurance: 18, intelligence: 19, enthusiasm: 20 },
            status: 'normal',
            reason: '',
          },
          {
            heat: '4',
            blanket: 'white',
            scores: { agility: 19, speed: 18, endurance: 18, intelligence: 19, enthusiasm: 19 },
            status: 'normal',
            reason: '',
          },
        ],
        racing_box: '1',
        racing_time1: '',
        racing_time2: '',
        racing_final_time: '',
        disqualified: false,
        comment: '',
        awards: ['CACL', 'Best in Field'],
      },
      {
        id: 'dog_sample_2',
        catalogNumber: '2',
        dogName: 'Стремительный Луч',
        sex: 'male',
        runs: [
          {
            heat: '1',
            blanket: 'white',
            scores: { agility: 17, speed: 18, endurance: 17, intelligence: 18, enthusiasm: 18 },
            status: 'normal',
            reason: '',
          },
          {
            heat: '5',
            blanket: 'blue',
            scores: { agility: 17, speed: 17, endurance: 16, intelligence: 18, enthusiasm: 18 },
            status: 'normal',
            reason: '',
          },
        ],
        racing_box: '2',
        racing_time1: '',
        racing_time2: '',
        racing_final_time: '',
        disqualified: false,
        comment: '',
        awards: ['R.CACL'],
      },
    ],
  },
]
