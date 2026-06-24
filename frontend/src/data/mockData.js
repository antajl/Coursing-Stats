export const mockDogProfileData = {
  '1': {
    dog_id: '1',
    name_lat: 'Saluki Desert Wind',
    name_ru: 'Салюки Пустынный Ветер',
    breed: 'Saluki',
    gold: 5,
    silver: 3,
    bronze: 2,
    total_starts: 10,
    best_score: 95.5,
    avg_score: 82.34,
    best_speed: 58.5,
    avg_speed: 52.3,
    owner: 'Иванов И.И.'
  },
  '2': {
    dog_id: '2',
    name_lat: 'Afghan Hound Golden Star',
    name_ru: 'Афганская Борзая Золотая Звезда',
    breed: 'Afghan Hound',
    gold: 4,
    silver: 4,
    bronze: 3,
    total_starts: 11,
    best_score: 91.8,
    avg_score: 79.23,
    best_speed: 55.2,
    avg_speed: 48.7,
    owner: 'Петров П.П.'
  },
  '3': {
    dog_id: '3',
    name_lat: 'Borzoi Winter Knight',
    name_ru: 'Борзая Зимний Рыцарь',
    breed: 'Borzoi',
    gold: 6,
    silver: 2,
    bronze: 1,
    total_starts: 9,
    best_score: 98.0,
    avg_score: 88.76,
    best_speed: 62.1,
    avg_speed: 55.8,
    owner: 'Сидоров С.С.'
  },
  '4': {
    dog_id: '4',
    name_lat: 'Whippet Swift Runner',
    name_ru: 'Уиппет Быстрый Бегун',
    breed: 'Whippet',
    gold: 3,
    silver: 5,
    bronze: 4,
    total_starts: 12,
    best_score: 87.5,
    avg_score: 76.32,
    best_speed: 60.3,
    avg_speed: 54.2,
    owner: 'Козлов К.К.'
  },
  '5': {
    dog_id: '5',
    name_lat: 'Greyhound Thunder',
    name_ru: 'Грейхаунд Гром',
    breed: 'Greyhound',
    gold: 7,
    silver: 1,
    bronze: 2,
    total_starts: 10,
    best_score: 93.2,
    avg_score: 81.54,
    best_speed: 65.8,
    avg_speed: 58.9,
    owner: 'Новиков Н.Н.'
  }
};

export const mockTopPlacementData = [
  {
    dog_id: '1',
    name_lat: 'Saluki Desert Wind',
    name_ru: 'Салюки Пустынный Ветер',
    breed: 'Saluki',
    gold: 5,
    silver: 3,
    bronze: 2,
    total_starts: 10,
    year: 2026
  },
  {
    dog_id: '2',
    name_lat: 'Afghan Hound Golden Star',
    name_ru: 'Афганская Борзая Золотая Звезда',
    breed: 'Afghan Hound',
    gold: 4,
    silver: 4,
    bronze: 3,
    total_starts: 11,
    year: 2026
  },
  {
    dog_id: '3',
    name_lat: 'Borzoi Winter Knight',
    name_ru: 'Борзая Зимний Рыцарь',
    breed: 'Borzoi',
    gold: 6,
    silver: 2,
    bronze: 1,
    total_starts: 9,
    year: 2026
  },
  {
    dog_id: '4',
    name_lat: 'Whippet Swift Runner',
    name_ru: 'Уиппет Быстрый Бегун',
    breed: 'Whippet',
    gold: 3,
    silver: 5,
    bronze: 4,
    total_starts: 12,
    year: 2026
  },
  {
    dog_id: '5',
    name_lat: 'Greyhound Thunder',
    name_ru: 'Грейхаунд Гром',
    breed: 'Greyhound',
    gold: 7,
    silver: 1,
    bronze: 2,
    total_starts: 10,
    year: 2026
  }
];

export const mockTopScoreData = [
  {
    dog_id: '1',
    name_lat: 'Saluki Desert Wind',
    name_ru: 'Салюки Пустынный Ветер',
    breed: 'Saluki',
    best_score: 95.5,
    avg_score: 82.3,
    total_starts: 10,
    year: 2026
  },
  {
    dog_id: '3',
    name_lat: 'Borzoi Winter Knight',
    name_ru: 'Борзая Зимний Рыцарь',
    breed: 'Borzoi',
    best_score: 98.0,
    avg_score: 88.7,
    total_starts: 9,
    year: 2026
  },
  {
    dog_id: '5',
    name_lat: 'Greyhound Thunder',
    name_ru: 'Грейхаунд Гром',
    breed: 'Greyhound',
    best_score: 93.2,
    avg_score: 81.5,
    total_starts: 10,
    year: 2026
  },
  {
    dog_id: '2',
    name_lat: 'Afghan Hound Golden Star',
    name_ru: 'Афганская Борзая Золотая Звезда',
    breed: 'Afghan Hound',
    best_score: 91.8,
    avg_score: 79.2,
    total_starts: 11,
    year: 2026
  },
  {
    dog_id: '4',
    name_lat: 'Whippet Swift Runner',
    name_ru: 'Уиппет Быстрый Бегун',
    breed: 'Whippet',
    best_score: 87.5,
    avg_score: 76.3,
    total_starts: 12,
    year: 2026
  }
];

export const mockBreeds = [
  { breed: 'Saluki' },
  { breed: 'Afghan Hound' },
  { breed: 'Borzoi' },
  { breed: 'Whippet' },
  { breed: 'Greyhound' },
  { breed: 'Italian Greyhound' },
  { breed: 'Scottish Deerhound' },
  { breed: 'Sloughi' }
];

export const mockYears = [
  { year: 2026 },
  { year: 2025 },
  { year: 2024 },
  { year: 2023 },
  { year: 2022 }
];

export const mockEvents = [
  {
    id: '1',
    title: 'Русский Национальный Чемпионат',
    host_club: 'РКФ',
    location: 'Москва',
    date_start: '2026-06-15',
    date_end: '2026-06-17',
    event_type: 'coursing',
    competition_kind: 'Чемпионат',
    competition_type: 'Монопородный',
    year: 2026,
    results_url: 'https://procoursing.ru/results'
  },
  {
    id: '2',
    title: 'Открытый Чемпионат Московской Области',
    host_club: 'МЧК Салюки',
    location: 'Подмосковье',
    date_start: '2026-05-10',
    date_end: '2026-05-12',
    event_type: 'coursing',
    competition_kind: 'Чемпионат',
    competition_type: 'Смешанный',
    year: 2026,
    results_url: 'https://procoursing.ru/results'
  },
  {
    id: '3',
    title: 'Кубок России по Бегам',
    host_club: 'РКФ',
    location: 'Санкт-Петербург',
    date_start: '2026-04-20',
    date_end: '2026-04-22',
    event_type: 'racing',
    competition_kind: 'Кубок',
    competition_type: 'Беговые Испытания',
    year: 2026,
    results_url: 'https://procoursing.ru/results'
  }
];
