import { useQuery } from '@tanstack/react-query';

const STALE_MS = 5 * 60 * 1000;
const STALE_LONG_MS = 60 * 60 * 1000;

async function fetchStaticData<T>(path: string): Promise<{ success: true; data: T }> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }
  const data = await response.json();
  return { success: true, data };
}

export function useTopPlacement(year: string) {
  const fileName = year === 'all' ? 'top-placement-all.json' : `top-placement-${year}.json`;
  return useQuery({
    queryKey: ['topPlacement', year],
    queryFn: () => fetchStaticData<{ items: any[]; count: number }>(`/data/v1/indexes/${fileName}`),
    staleTime: STALE_MS,
  });
}

export function useTopScore(year: string) {
  const fileName = year === 'all' ? 'top-score-all.json' : `top-score-${year}.json`;
  return useQuery({
    queryKey: ['topScore', year],
    queryFn: () => fetchStaticData<{ items: any[]; count: number }>(`/data/v1/indexes/${fileName}`),
    staleTime: STALE_MS,
  });
}

export function useTopSpeed(year: string) {
  const fileName = year === 'all' ? 'top-speed-all.json' : `top-speed-${year}.json`;
  return useQuery({
    queryKey: ['topSpeed', year],
    queryFn: () => fetchStaticData<{ items: any[]; count: number }>(`/data/v1/indexes/${fileName}`),
    staleTime: STALE_MS,
  });
}

export function useBreeds() {
  return useQuery({
    queryKey: ['breeds'],
    queryFn: () => fetchStaticData<{ breeds: string[]; count: number }>('/data/v1/breeds.json'),
    staleTime: STALE_LONG_MS,
  });
}

export function useYears() {
  return useQuery({
    queryKey: ['years'],
    queryFn: () => fetchStaticData<{ years: number[]; count: number }>('/data/v1/indexes/years.json'),
    staleTime: STALE_LONG_MS,
  });
}

export function useJudges(breed: string, discipline: string) {
  return useQuery({
    queryKey: ['judges', breed, discipline],
    queryFn: () => fetchStaticData<{ judges: any[]; count: number }>('/data/v1/indexes/judges-summary.json'),
    staleTime: STALE_MS,
  });
}

export function useJudgeDetails(judgeId: string, breed: string, discipline: string) {
  return useQuery({
    queryKey: ['judgeDetails', judgeId, breed, discipline],
    queryFn: () => fetchStaticData<any>(`/data/v1/indexes/judge-details/${judgeId}.json`),
    enabled: !!judgeId,
    staleTime: STALE_MS,
  });
}

export function useSpeedRecords(breed: string, sex: string, limit: number, search: string, year: string) {
  return useQuery({
    queryKey: ['speedRecords', breed, sex, limit, search, year],
    queryFn: () => fetchStaticData<{ records: any[]; count: number }>('/data/v1/donino/speed_records.json'),
    staleTime: STALE_MS,
  });
}

export function useCoursingRecords(breed: string, limit: number, search: string, year: string) {
  return useQuery({
    queryKey: ['coursingRecords', breed, limit, search, year],
    queryFn: () => fetchStaticData<{ records: any[]; count: number }>('/data/v1/donino/coursing_records.json'),
    staleTime: STALE_MS,
  });
}
