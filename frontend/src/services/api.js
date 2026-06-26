import {
  mockTopPlacementData,
  mockTopScoreData,
  mockBreeds,
  mockYears,
  mockEvents
} from '../data/mockData';

const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://procoursing-stats.antajltube.workers.dev'
    : 'http://127.0.0.1:8787');

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
    return { success: true, data };
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

  if (result.success) {
    return result;
  }

  // In production, don't fallback to mock data
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

export const api = {
  async getTopPlacement(year = '', breed = '', minStarts = 0, limit = null, offset = 0) {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (breed) params.append('breed', breed);
    if (minStarts > 0) params.append('minStarts', minStarts);
    if (limit !== null) {
      params.append('limit', limit);
      params.append('offset', offset);
    }

    const url = `${API_URL}/api/top/placement?${params}`;
    const mockData = filterMockData(mockTopPlacementData, year, breed, minStarts);

    return fetchWithFallback(url, mockData);
  },

  async getTopScore(year = '', breed = '', minStarts = 0, limit = null, offset = 0) {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (breed) params.append('breed', breed);
    if (minStarts > 0) params.append('minStarts', minStarts);
    if (limit !== null) {
      params.append('limit', limit);
      params.append('offset', offset);
    }

    const url = `${API_URL}/api/top/score?${params}`;
    const mockData = filterMockData(mockTopScoreData, year, breed, minStarts);

    return fetchWithFallback(url, mockData);
  },

  async getTopSpeed(year = '', breed = '', minStarts = 0, limit = null, offset = 0) {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (breed) params.append('breed', breed);
    if (minStarts > 0) params.append('minStarts', minStarts);
    if (limit !== null) {
      params.append('limit', limit);
      params.append('offset', offset);
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
    const url = `${API_URL}/api/events?${params}`;
    const mockData = year ? mockEvents.filter(e => e.year === parseInt(year)) : mockEvents;

    return fetchWithFallback(url, mockData);
  },

  async getDogProfile(dogId) {
    return fetchWithFallback(`${API_URL}/api/dogs/${dogId}`, null);
  },

  async getDogEvents(dogId) {
    return fetchWithFallback(`${API_URL}/api/dogs/${dogId}/events`, []);
  },

  async getEvent(eventId) {
    return fetchWithFallback(`${API_URL}/api/events/${eventId}`, null);
  },

  async getEventResults(eventId) {
    return fetchWithFallback(`${API_URL}/api/events/${eventId}/results`, []);
  },

  async getSpeedRecords(breed = '', sex = '', limit = 100, search = '', year = '') {
    const params = new URLSearchParams();
    if (breed) params.append('breed', breed);
    if (sex) params.append('sex', sex);
    if (search) params.append('search', search);
    if (year) params.append('year', year);
    params.append('limit', limit);
    const url = `${API_URL}/api/speed-records?${params}`;
    return fetchWithFallback(url, []);
  }
};
