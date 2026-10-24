export interface BreedSpeedItem {
  breed: string
  peakSprint: string
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
    peakSprint: 'до 67–72 км/ч',
    doninoRadar: '—',
    rkfTrackAvg: '59,4 км/ч (360 м за 21,83 с, Держава)',
    specialty: 'Абсолютный мировой спринтер',
    description:
      'Абсолютный рекордсмен по скорости среди всех собак в мире на коротких дистанциях (официальный рекорд Книги Гиннесса — 67,32 км/ч, Star Title). За счёт глубокой груди, гибкого позвоночника и двойного фазного галопа развивает предельную скорость на первых 100 метрах.',
    competitionsUrl: '/competitions?tab=ranking',
    doninoUrl: '/speed-records',
  },
  {
    breed: 'Уиппет',
    peakSprint: 'до 64–70 км/ч',
    doninoRadar: '64 км/ч (Драм)',
    rkfTrackAvg: '54,7 км/ч (360 м за 23,67 с, Урал Спирит Сторм)',
    specialty: 'Взрывной старт (быстрее лошади)',
    description:
      'Компактный атлет с непревзойденной динамикой разгона. На первых метрах дистанции стартовое ускорение уиппета превосходит скаковую лошадь. По данным полевых радарных замеров полигона Донино рекорд породы составляет 64 км/ч.',
    competitionsUrl: '/competitions?tab=ranking',
    doninoUrl: '/speed-records',
  },
  {
    breed: 'Русская псовая борзая (РПБ)',
    peakSprint: 'до 60–65 км/ч',
    doninoRadar: '56 км/ч (Флёна)',
    rkfTrackAvg: '49,1 км/ч (360 м за 26,41 с, Драгун)',
    specialty: 'Взрывной охотничий «бросок»',
    description:
      'Историческая русская охотничья порода, веками отбиравшаяся для стремительной скачки и резкого броска на зверя. На прямых дистанциях при рывке за приманкой скорость доходит до 65 км/ч, а на круговых бегах средний темп держится в районе 49–50 км/ч.',
    competitionsUrl: '/competitions?tab=ranking',
    doninoUrl: '/speed-records',
  },
  {
    breed: 'Салюки (персидская борзая)',
    peakSprint: 'до 68,8 км/ч',
    doninoRadar: '55 км/ч (Тайга)',
    rkfTrackAvg: '47,2 км/ч (360 м за 27,45 с, Алеазис Садик)',
    specialty: 'Марафонец на длинные дистанции',
    description:
      'Официальный мировой рекордсмен Книги Гиннесса (1996 г.) на длинных дистанциях (свыше 800 м) со скоростью 68,8 км/ч. В отличие от спринтеров-грейхаундов, салюки выведена для пустынной охоты и способна удерживать темп выше 50 км/ч на протяжении нескольких километров.',
    competitionsUrl: '/competitions?tab=ranking',
    doninoUrl: '/speed-records',
  },
  {
    breed: 'Малая итальянская борзая (левретка)',
    peakSprint: 'до 45–50 км/ч',
    doninoRadar: '49 км/ч (Айвенго)',
    rkfTrackAvg: '~40–42 км/ч (350 м за 29,84 с)',
    specialty: 'Маневренность при весе до 5 кг',
    description:
      'Самая миниатюрная борзая в мире. При весе всего 3–5 кг обладает поразительной частотой махов и гибкостью, разгоняясь на коротких прямых отрезках до 49–50 км/ч.',
    competitionsUrl: '/competitions?tab=ranking',
    doninoUrl: '/speed-records',
  },
  {
    breed: 'Басенджи',
    peakSprint: 'до 41–42 км/ч',
    doninoRadar: '41 км/ч',
    rkfTrackAvg: '40,3 км/ч (360 м за 32,12 с, Ангаву Маиша Чимека)',
    specialty: 'Африканская охотничья собака',
    description:
      'Представитель 5-й группы FCI с великолепными охотничьими инстинктами. В бегах борзых и курсинге демонстрирует стабильный и ровный темп около 40 км/ч на дистанциях 350–500 м.',
    competitionsUrl: '/competitions?tab=ranking',
    doninoUrl: '/speed-records',
  },
]
