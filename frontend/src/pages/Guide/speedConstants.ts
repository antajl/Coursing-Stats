export type BreedSpeedCategory = 'sprinter' | 'distance' | 'giant_mini'

export interface BreedSpeedCategoryFilter {
  id: 'all' | BreedSpeedCategory
  label: string
  sublabel: string
  count: number
}

export const SPEED_CATEGORY_FILTERS: readonly BreedSpeedCategoryFilter[] = [
  { id: 'all', label: 'Все породы', sublabel: '10 пород', count: 10 },
  { id: 'sprinter', label: 'Спринтеры', sublabel: 'до 72 км/ч', count: 4 },
  { id: 'distance', label: 'Марафонцы', sublabel: 'выносливость', count: 3 },
  { id: 'giant_mini', label: 'Гиганты и мини', sublabel: 'от 5 до 70 кг', count: 3 },
] as const

export interface BreedSpeedItem {
  breed: string
  category: BreedSpeedCategory
  peakSprint: string
  peakSpeedNum: number // Для горизонтальной диаграммы
  doninoRadar: string
  rkfTrackAvg: string
  specialty: string
  description: string
  competitionsUrl: string
  doninoUrl: string
}

export const BREED_SPEEDS_DATA: BreedSpeedItem[] = [
  {
    breed: 'Грейхаунд',
    category: 'sprinter',
    peakSprint: 'до 67–72 км/ч',
    peakSpeedNum: 72,
    doninoRadar: '—',
    rkfTrackAvg: '59,4 км/ч (360 м за 21,83 с, Держава)',
    specialty: 'Абсолютный мировой спринтер',
    description:
      'Абсолютный рекордсмен по скорости среди всех собак в мире на коротких дистанциях (официальный рекорд Книги Гиннесса — 67,32 км/ч, Star Title). За счёт глубокой груди, гибкого позвоночника и двойного фазного галопа развивает предельную скорость на первых 100 метрах.',
    competitionsUrl: '/competitions?tab=ranking&breed=Грейхаунд',
    doninoUrl: '/speed-records?breed=Грейхаунд',
  },
  {
    breed: 'Уиппет',
    category: 'sprinter',
    peakSprint: 'до 64–70 км/ч',
    peakSpeedNum: 70,
    doninoRadar: '64 км/ч (Драм)',
    rkfTrackAvg: '54,7 км/ч (360 м за 23,67 с, Урал Спирит Сторм)',
    specialty: 'Взрывной старт (быстрее лошади)',
    description:
      'Компактный атлет с непревзойденной динамикой разгона. На первых метрах дистанции стартовое ускорение уиппета превосходит скаковую лошадь. По данным полевых радарных замеров полигона Донино рекорд породы составляет 64 км/ч.',
    competitionsUrl: '/competitions?tab=ranking&breed=Уиппет',
    doninoUrl: '/speed-records?breed=Уиппет',
  },
  {
    breed: 'Салюки (персидская борзая)',
    category: 'distance',
    peakSprint: 'до 68,8 км/ч',
    peakSpeedNum: 68.8,
    doninoRadar: '55 км/ч (Тайга)',
    rkfTrackAvg: '47,2 км/ч (360 м за 27,45 с, Алеазис Садик)',
    specialty: 'Марафонец на длинные дистанции',
    description:
      'Официальный мировой рекордсмен Книги Гиннесса (1996 г.) на длинных дистанциях (свыше 800 м) со скоростью 68,8 км/ч. В отличие от спринтеров-грейхаундов, салюки выведена для пустынной охоты и способна удерживать темп выше 50 км/ч на протяжении нескольких километров.',
    competitionsUrl: '/competitions?tab=ranking&breed=Салюки',
    doninoUrl: '/speed-records?breed=Салюки',
  },
  {
    breed: 'Русская псовая борзая (РПБ)',
    category: 'sprinter',
    peakSprint: 'до 60–65 км/ч',
    peakSpeedNum: 65,
    doninoRadar: '56 км/ч (Флёна)',
    rkfTrackAvg: '49,1 км/ч (360 м за 26,41 с, Драгун)',
    specialty: 'Взрывной охотничий бросок',
    description:
      'Историческая русская охотничья порода, веками отбиравшаяся для стремительной скачки и резкого броска на зверя. На прямых дистанциях при рывке за приманкой скорость доходит до 65 км/ч, а на круговых бегах средний темп держится в районе 49–50 км/ч.',
    competitionsUrl: '/competitions?tab=ranking&breed=Русская+псовая+борзая',
    doninoUrl: '/speed-records?breed=Русская+псовая+борзая',
  },
  {
    breed: 'Азавак',
    category: 'sprinter',
    peakSprint: 'до 60–64 км/ч',
    peakSpeedNum: 64,
    doninoRadar: '—',
    rkfTrackAvg: '~48–50 км/ч',
    specialty: 'Африканский охотник Сахеля',
    description:
      'Древняя высоконоговая борзая кочевников Сахары. Обладает исключительной теплоотдачей, сухой конституцией и мощным толчком, позволяющим стремительно ускоряться на песчаном грунте.',
    competitionsUrl: '/competitions?tab=ranking&breed=Азавак',
    doninoUrl: '/speed-records?breed=Азавак',
  },
  {
    breed: 'Испанский гальго',
    category: 'distance',
    peakSprint: 'до 58–60 км/ч',
    peakSpeedNum: 60,
    doninoRadar: '—',
    rkfTrackAvg: '~47–49 км/ч',
    specialty: 'Полевая выносливость на пересечёнке',
    description:
      'Традиционная охотничья борзая Пиренеев. В отличие от коротких трековых спринтов, гальго славится способностью скакать по пересечённой местности на дистанциях более 1,5–2 километров без потери маневренности.',
    competitionsUrl: '/competitions?tab=ranking&breed=Испанский+гальго',
    doninoUrl: '/speed-records?breed=Испанский+гальго',
  },
  {
    breed: 'Афганская борзая',
    category: 'distance',
    peakSprint: 'до 55–58 км/ч',
    peakSpeedNum: 58,
    doninoRadar: '—',
    rkfTrackAvg: '~45–48 км/ч',
    specialty: 'Горный скакун с мощным толчком',
    description:
      'Обладает уникальным строением тазовых костей, дающим свободу вращения в суставах для резких разворотов на крутых горных склонах. Развивает на прямых отрезках до 58 км/ч.',
    competitionsUrl: '/competitions?tab=ranking&breed=Афганская+борзая',
    doninoUrl: '/speed-records?breed=Афганская+борзая',
  },
  {
    breed: 'Ирландский волкодав / Дирхаунд',
    category: 'giant_mini',
    peakSprint: 'до 48–52 км/ч',
    peakSpeedNum: 52,
    doninoRadar: '—',
    rkfTrackAvg: '~42–45 км/ч',
    specialty: 'Атлетическая мощь при весе до 70 кг',
    description:
      'Гиганты собачьего мира. Несмотря на вес 50–70 кг и рост в холке до 85–90 см, развивают на прямом отрезке скорость свыше 50 км/ч за счёт огромной длины маха галопа.',
    competitionsUrl: '/competitions?tab=ranking&breed=Ирландский+волкодав',
    doninoUrl: '/speed-records?breed=Ирландский+волкодав',
  },
  {
    breed: 'Малая итальянская борзая (левретка)',
    category: 'giant_mini',
    peakSprint: 'до 45–50 км/ч',
    peakSpeedNum: 50,
    doninoRadar: '49 км/ч (Айвенго)',
    rkfTrackAvg: '~40–42 км/ч (350 м за 29,84 с)',
    specialty: 'Маневренность при весе до 5 кг',
    description:
      'Самая миниатюрная борзая в мире. При весе всего 3–5 кг обладает поразительной частотой махов и гибкостью, разгоняясь на коротких прямых отрезках до 49–50 км/ч.',
    competitionsUrl: '/competitions?tab=ranking&breed=Левретка',
    doninoUrl: '/speed-records?breed=Левретка',
  },
  {
    breed: 'Басенджи',
    category: 'giant_mini',
    peakSprint: 'до 41–42 км/ч',
    peakSpeedNum: 42,
    doninoRadar: '41 км/ч',
    rkfTrackAvg: '40,3 км/ч (360 м за 32,12 с, Ангаву Маиша Чимека)',
    specialty: 'Африканская охотничья собака (5 группа)',
    description:
      'Представитель 5-й группы FCI с великолепными охотничьими инстинктами. В бегах борзых и курсинге демонстрирует стабильный и ровный темп около 40 км/ч на дистанциях 350–500 м.',
    competitionsUrl: '/competitions?tab=ranking&breed=Басенджи',
    doninoUrl: '/speed-records?breed=Басенджи',
  },
]
