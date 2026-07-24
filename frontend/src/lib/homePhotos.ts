/**
 * Фото hero на главной.
 * Список берётся из `homePhotos.generated.ts` (скан `public/images/home/**` при vite).
 * Кидай jpg/png/webp/avif в папку или подпапки — попадёт в случайный слайдшоу.
 */
import { HOME_PHOTOS_GENERATED, type HomePhotoGenerated } from './homePhotos.generated'

export type HomePhoto = HomePhotoGenerated

export const HOME_PHOTOS: HomePhoto[] = HOME_PHOTOS_GENERATED

/** Все найденные фото (порядок фиксирован в манифесте; shuffle — в HomeHeroStage). */
export function listHomePhotos(): HomePhoto[] {
  return HOME_PHOTOS
}

export function shuffleHomePhotos(pool: readonly HomePhoto[] = HOME_PHOTOS): HomePhoto[] {
  const next = [...pool]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}
