import {
  mockTopPlacementData,
  mockTopScoreData,
  mockBreeds,
  mockYears,
  mockEvents
} from '../data/mockData';
import {
  TopPlacementResponseSchema,
  TopScoreResponseSchema,
  BreedsResponseSchema,
  YearsResponseSchema,
  EventsResponseSchema,
  DogProfileResponseSchema,
  DogEventsResponseSchema,
  EventResponseSchema,
  EventResultsResponseSchema,
  SpeedRecordsResponseSchema,
  JudgesResponseSchema,
  JudgeDetailResponseSchema,
} from '../schemas/api';

const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://api.coursing-stats.ru'
    : ''); // dev: Vite proxy → wrangler :8787

export { API_URL };

const IS_DEV = import.meta.env.DEV;

async function fetchAPI(url, timeout = 5000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[API ERROR] ${url}: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

async function fetchWithFallback(url, mockData, timeout = 5000) {
  const result = await fetchAPI(url, timeout);

  // Если результат уже имеет поле success, возвращаем как есть
  if (result.success !== undefined) {
    return result;
  }

  // В production, don't fallback to mock data
  if (!IS_DEV) {
    return result;
  }

  // In development, fallback to mock data on error
  console.warn(`[FALLBACK] Using mock data for: ${url}`);
  return {
    success: true,
    data: mockData,
    source: 'mock',
    error: result.error
  };
}

function filterMockData(mockData, year, breed, minStarts) {
  let filtered = mockData;
  if (year) filtered = filtered.filter(d => d.year === parseInt(year));
  if (breed) filtered = filtered.filter(d => d.breed === breed);
  if (minStarts > 0) filtered = filtered.filter(d => d.total_starts >= minStarts);
  return filtered;
}

function pickTopSpeedByBreed(records, limit) {
  const bestByBreed = new Map();
  for (const record of records) {
    const speed = Number(record.speed_km_h);
    const existing = bestByBreed.get(record.breed);
    if (!existing || speed > Number(existing.speed_km_h)) {
      bestByBreed.set(record.breed, record);
    }
  }
  return [...bestByBreed.values()]
    .sort((a, b) => Number(b.speed_km_h) - Number(a.speed_km_h))
    .slice(0, limit);
}

function pickTopCoursingByBreed(
  records: { name: string; breed: string; time_seconds: number | string; date?: string }[],
  limit: number
) {
  const bestByBreed = new Map<string, (typeof records)[number]>()
  for (const record of records) {
    const time = Number(record.time_seconds)
    const existing = bestByBreed.get(record.breed)
    if (!existing || time < Number(existing.time_seconds)) {
      bestByBreed.set(record.breed, record)
    }
  }
  return [...bestByBreed.values()]
    .sort((a, b) => Number(a.time_seconds) - Number(b.time_seconds))
    .slice(0, limit)
}

const mockCoursingRecords = [
  { name: 'Swift Wind', breed: 'Whippet', time_seconds: 22.5, date: '03.04.2025' },
  { name: 'Desert Storm', breed: 'Saluki', time_seconds: 23.1, date: '18.06.2025' },
  { name: 'Thunder Bolt', breed: 'Greyhound', time_seconds: 21.8, date: '12.05.2025' },
]

const mockSpeedRecords = [
  { name: 'Thunder Bolt', breed: 'Greyhound', speed_km_h: 68.2, date: '12.05.2025' },
  { name: 'Swift Wind', breed: 'Whippet', speed_km_h: 62.4, date: '03.04.2025' },
  { name: 'Desert Storm', breed: 'Saluki', speed_km_h: 59.1, date: '18.06.2025' },
  { name: 'Fast Whippet', breed: 'Whippet', speed_km_h: 60.0, date: '01.01.2025' },
];

export const api = {
  async getStats() {
    return fetchAPI(`${API_URL}/api/stats`)
  },

  async getTopPlacement(year = '', breed = '', minStarts = 0, sortBy = 'gold', limit = null, offset = 0) {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (breed) params.append('breed', breed);
    if (minStarts > 0) params.append('minStarts', minStarts.toString());
    if (sortBy) params.append('sortBy', sortBy);
    if (limit !== null) {
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
    }

    const url = `${API_URL}/api/top/placement?${params}`;
    const mockData = filterMockData(mockTopPlacementData, year, breed, minStarts);

    return fetchWithFallback(url, mockData);
  },

  async getTopScore(year = '', breed = '', minStarts = 0, sortBy = 'best_score', limit = null, offset = 0) {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (breed) params.append('breed', breed);
    if (minStarts > 0) params.append('minStarts', minStarts.toString());
    if (sortBy) params.append('sortBy', sortBy);
    if (limit !== null) {
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
    }

    const url = `${API_URL}/api/top/score?${params}`;
    const mockData = filterMockData(mockTopScoreData, year, breed, minStarts);

    return fetchWithFallback(url, mockData);
  },

  async getTopSpeed(year = '', breed = '', minStarts = 0, sortBy = 'best_speed', limit = null, offset = 0) {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (breed) params.append('breed', breed);
    if (minStarts > 0) params.append('minStarts', minStarts.toString());
    if (sortBy) params.append('sortBy', sortBy);
    if (limit !== null) {
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
    }

    const url = `${API_URL}/api/top/speed?${params}`;
    const mockData = filterMockData(mockTopScoreData, year, breed, minStarts).map(d => ({
      ...d,
      best_speed: (Math.random() * 20 + 40).toFixed(2),
      avg_speed: (Math.random() * 15 + 35).toFixed(2)
    }));

    return fetchWithFallback(url, mockData);
  },

  async getBreeds() {
    return fetchWithFallback(`${API_URL}/api/breeds`, mockBreeds);
  },

  async getYears() {
    return fetchWithFallback(`${API_URL}/api/years`, mockYears);
  },

  async getEvents(year = '') {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    const url = `${API_URL}/api/competitions?${params}`;
    const mockData = year ? mockEvents.filter(e => e.year === parseInt(year)) : mockEvents;

    return fetchWithFallback(url, mockData);
  },

  async getDogProfile(dogId) {
    return fetchWithFallback(`${API_URL}/api/dogs/${dogId}`, null);
  },

  async getDogEvents(dogId) {
    return fetchWithFallback(`${API_URL}/api/dogs/${dogId}/competitions`, []);
  },

  async getEvent(eventId) {
    return fetchWithFallback(`${API_URL}/api/competitions/${eventId}`, null);
  },

  async getEventResults(eventId) {
    return fetchWithFallback(`${API_URL}/api/competitions/${eventId}/results`, []);
  },

  async getSpeedRecords(breed = '', sex = '', limit = 100, search = '', year = '', dogId = '') {
    const params = new URLSearchParams();
    if (breed) params.append('breed', breed);
    if (sex) params.append('sex', sex);
    if (search) params.append('search', search);
    if (year) params.append('year', year);
    if (dogId) params.append('dog_id', dogId);
    params.append('limit', limit.toString());
    const url = `${API_URL}/api/speed-records?${params}`;
    return fetchWithFallback(url, []);
  },

  async getSpeedRecordsTopByBreed(limit = 3) {
    const params = new URLSearchParams();
    params.append('limit', String(limit));
    const url = `${API_URL}/api/speed-records/top-by-breed?${params}`;
    return fetchWithFallback(url, pickTopSpeedByBreed(mockSpeedRecords, limit));
  },

  async getCoursingRecords(breed = '', limit = 100, search = '', year = '', dogId = '') {
    const params = new URLSearchParams();
    if (breed) params.append('breed', breed);
    if (search) params.append('search', search);
    if (year) params.append('year', year);
    if (dogId) params.append('dog_id', dogId);
    params.append('limit', limit.toString());
    const url = `${API_URL}/api/coursing-records?${params}`;
    return fetchWithFallback(url, []);
  },

  async getCoursingRecordsTopByBreed(limit = 3) {
    const params = new URLSearchParams();
    params.append('limit', String(limit));
    const url = `${API_URL}/api/coursing-records/top-by-breed?${params}`;
    return fetchWithFallback(url, pickTopCoursingByBreed(mockCoursingRecords, limit));
  },

  async getJudges(breed = '', discipline = '') {
    const params = new URLSearchParams();
    if (breed) params.append('breed', breed);
    if (discipline) params.append('discipline', discipline);
    const url = `${API_URL}/api/judges?${params}`;
    return fetchWithFallback(url, []);
  },

  async getJudgeDetails(judgeId, breed = '', discipline = '') {
    const params = new URLSearchParams();
    if (breed) params.append('breed', breed);
    if (discipline) params.append('discipline', discipline);
    const url = `${API_URL}/api/judges/${encodeURIComponent(judgeId)}/details?${params}`;
    return fetchWithFallback(url, null);
  },

  async getDoninoDog(name: string, breed: string) {
    const url = `${API_URL}/api/donino-dog/${encodeURIComponent(name)}/${encodeURIComponent(breed)}`;
    return fetchAPI(url);
  },
};
