import {
  mockTopPlacementData,
  mockTopScoreData,
  mockBreeds,
  mockYears,
  mockEvents
} from '../data/mockData';

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? '' // Use relative paths on production for Pages Functions
    : 'http://127.0.0.1:8787');

const FORCE_MOCK = false;

async function fetchWithFallback(url, mockData, timeout = 5000) {
  if (FORCE_MOCK) {
    console.log(`[MOCK] ${url}`);
    return { success: true, data: mockData, source: 'mock' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data, source: 'api' };
  } catch (error) {
    console.warn(`[API ERROR] ${url}: ${error.message}`);
    console.warn(`[FALLBACK] Using mock data for: ${url}`);
    
    return {
      success: false,
      data: mockData,
      source: 'mock',
      error: error.message
    };
  }
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
    let mockData = mockTopPlacementData;
    
    if (year) {
      mockData = mockData.filter(d => d.year === parseInt(year));
    }
    if (breed) {
      mockData = mockData.filter(d => d.breed === breed);
    }
    if (minStarts > 0) {
      mockData = mockData.filter(d => d.total_starts >= minStarts);
    }

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
    let mockData = mockTopScoreData;
    
    if (year) {
      mockData = mockData.filter(d => d.year === parseInt(year));
    }
    if (breed) {
      mockData = mockData.filter(d => d.breed === breed);
    }
    if (minStarts > 0) {
      mockData = mockData.filter(d => d.total_starts >= minStarts);
    }

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
    // Mock data for speed - will be replaced with actual API data
    let mockData = mockTopScoreData.map(d => ({
      ...d,
      best_speed: (Math.random() * 20 + 40).toFixed(2), // Mock speed in km/h
      avg_speed: (Math.random() * 15 + 35).toFixed(2)
    }));
    
    if (year) {
      mockData = mockData.filter(d => d.year === parseInt(year));
    }
    if (breed) {
      mockData = mockData.filter(d => d.breed === breed);
    }
    if (minStarts > 0) {
      mockData = mockData.filter(d => d.total_starts >= minStarts);
    }

    return fetchWithFallback(url, mockData);
  },

  async getBreeds() {
    return fetchWithFallback(
      `${API_URL}/api/breeds`,
      mockBreeds
    );
  },

  async getYears() {
    return fetchWithFallback(
      `${API_URL}/api/years`,
      mockYears
    );
  },

  async getEvents(year = '') {
    const params = new URLSearchParams();
    if (year) params.append('year', year);

    const url = `${API_URL}/api/events?${params}`;
    let mockData = mockEvents;
    
    if (year) {
      mockData = mockData.filter(e => e.year === parseInt(year));
    }

    return fetchWithFallback(url, mockData);
  },

  async getDogProfile(dogId) {
    // Try to fetch from real API first
    const result = await fetchWithFallback(
      `${API_URL}/api/dogs/${dogId}`,
      null
    );

    // If API returned data, use it
    if (result.success && result.data) {
      return result;
    }

    // Fallback: Generate profile data dynamically from existing mock data
    const placementDog = mockTopPlacementData.find(d => d.dog_id === dogId);
    const scoreDog = mockTopScoreData.find(d => d.dog_id === dogId);
    
    if (!placementDog && !scoreDog) {
      return result;
    }

    const baseDog = placementDog || scoreDog;
    const mockData = {
      dog_id: dogId,
      name_lat: baseDog.name_lat,
      name_ru: baseDog.name_ru,
      breed: baseDog.breed,
      sex: baseDog.sex || null,
      owner: 'Владелец',
      coursing_stats: {
        total_starts: placementDog?.total_starts || 0,
        best_score: scoreDog?.best_score || null,
        avg_score: scoreDog?.avg_score || null,
        gold: placementDog?.gold || 0,
        silver: placementDog?.silver || 0,
        bronze: placementDog?.bronze || 0
      },
      racing_stats: {
        total_starts: 0,
        best_speed: null,
        avg_speed: null
      }
    };

    return {
      success: true,
      data: mockData,
      source: 'mock'
    };
  },

  async getDogEvents(dogId) {
    return fetchWithFallback(
      `${API_URL}/api/dogs/${dogId}/events`,
      []
    );
  }
};
