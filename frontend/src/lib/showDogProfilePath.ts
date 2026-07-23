/**
 * Public profile URL for a show-ranking dog.
 * Never use catalog/ring # as `/dog/{n}` — that collides with procoursing ids.
 */
import {
  SHOW_PROFILE_ID_BASE,
  isShowOnlyProfileId,
  stableShowProfileId,
} from '../../../backend/lib/show-dog-profile-id'
import type { ShowDogCardData } from '../pages/Shows/ShowDogCard'

export { isShowOnlyProfileId, SHOW_PROFILE_ID_BASE, stableShowProfileId }

export function showDogProfilePath(dog: Pick<ShowDogCardData, 'id' | 'name_lat' | 'breed' | 'competition_dog_id'>): string {
  if (dog.competition_dog_id != null && Number.isFinite(Number(dog.competition_dog_id))) {
    return `/dog/${dog.competition_dog_id}`
  }
  if (isShowOnlyProfileId(dog.id)) {
    return `/dog/${dog.id}`
  }
  // Indexes still have catalog # as id — derive stable profile id client-side
  const stable = stableShowProfileId(dog.name_lat || '', dog.breed || '')
  if (stable >= SHOW_PROFILE_ID_BASE) return `/dog/${stable}`
  // Last resort (should not happen)
  return `/shows/dog/${encodeURIComponent(String(dog.id))}/${encodeURIComponent(dog.breed || '')}`
}

/** Resolve show dog from ranking by public /dog/:id (competition or stable show id). */
export function findShowDogByProfileId(
  profileId: string,
  dogs: ShowDogCardData[],
): ShowDogCardData | null {
  const direct =
    dogs.find((d) => String(d.id) === String(profileId)) ??
    dogs.find((d) => String(d.competition_dog_id) === String(profileId))
  if (direct) return direct

  if (!isShowOnlyProfileId(profileId)) return null

  return (
    dogs.find(
      (d) =>
        d.competition_dog_id == null &&
        String(stableShowProfileId(d.name_lat || '', d.breed || '')) === String(profileId),
    ) ?? null
  )
}
