import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useTopPlacement(year = '', breed = '', minStarts = 0, limit = null, offset = 0) {
  return useQuery({
    queryKey: ['topPlacement', year, breed, minStarts, limit, offset],
    queryFn: () => api.getTopPlacement(year, breed, minStarts, limit, offset),
  });
}

export function useTopScore(year = '', breed = '', minStarts = 0, limit = null, offset = 0) {
  return useQuery({
    queryKey: ['topScore', year, breed, minStarts, limit, offset],
    queryFn: () => api.getTopScore(year, breed, minStarts, limit, offset),
  });
}

export function useTopSpeed(year = '', breed = '', minStarts = 0, limit = null, offset = 0) {
  return useQuery({
    queryKey: ['topSpeed', year, breed, minStarts, limit, offset],
    queryFn: () => api.getTopSpeed(year, breed, minStarts, limit, offset),
  });
}

export function useBreeds() {
  return useQuery({
    queryKey: ['breeds'],
    queryFn: () => api.getBreeds(),
  });
}

export function useYears() {
  return useQuery({
    queryKey: ['years'],
    queryFn: () => api.getYears(),
  });
}

export function useEvents(year = '') {
  return useQuery({
    queryKey: ['events', year],
    queryFn: () => api.getEvents(year),
  });
}

export function useDogProfile(dogId: string) {
  return useQuery({
    queryKey: ['dogProfile', dogId],
    queryFn: () => api.getDogProfile(dogId),
    enabled: !!dogId,
  });
}

export function useDogEvents(dogId: string) {
  return useQuery({
    queryKey: ['dogEvents', dogId],
    queryFn: () => api.getDogEvents(dogId),
    enabled: !!dogId,
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => api.getEvent(eventId),
    enabled: !!eventId,
  });
}

export function useEventResults(eventId: string) {
  return useQuery({
    queryKey: ['eventResults', eventId],
    queryFn: () => api.getEventResults(eventId),
    enabled: !!eventId,
  });
}

export function useSpeedRecords(breed = '', sex = '', limit = 100, search = '', year = '') {
  return useQuery({
    queryKey: ['speedRecords', breed, sex, limit, search, year],
    queryFn: () => api.getSpeedRecords(breed, sex, limit, search, year),
  });
}

export function useDogSpeedRecords(dogId: string) {
  return useQuery({
    queryKey: ['dogSpeedRecords', dogId],
    queryFn: () => api.getSpeedRecords('', '', 1000, '', '', dogId),
    enabled: !!dogId,
  });
}

export function useSpeedRecordsByBreed(breed: string) {
  return useQuery({
    queryKey: ['speedRecordsByBreed', breed],
    queryFn: () => api.getSpeedRecords(breed, '', 10000, '', ''),
    enabled: !!breed,
  });
}

export function useCoursingRecords(breed = '', limit = 100, search = '', year = '') {
  return useQuery({
    queryKey: ['coursingRecords', breed, limit, search, year],
    queryFn: () => api.getCoursingRecords(breed, limit, search, year),
  });
}

export function useDogCoursingRecords(dogId: string) {
  return useQuery({
    queryKey: ['dogCoursingRecords', dogId],
    queryFn: () => api.getCoursingRecords('', 1000, '', '', dogId),
    enabled: !!dogId,
  });
}

export function useJudges(breed = '', discipline = '') {
  return useQuery({
    queryKey: ['judges', breed, discipline],
    queryFn: () => api.getJudges(breed, discipline),
  });
}

export function useJudgeDetails(judgeId: string, breed = '', discipline = '') {
  return useQuery({
    queryKey: ['judgeDetails', judgeId, breed, discipline],
    queryFn: () => api.getJudgeDetails(judgeId, breed, discipline),
    enabled: !!judgeId,
  });
}
