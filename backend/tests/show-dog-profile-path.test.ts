import { describe, expect, it } from 'vitest'
import { SHOW_PROFILE_ID_BASE } from '../lib/show-dog-profile-id'
import {
  findShowDogByProfileId,
  showDogProfilePath,
} from '../../frontend/src/lib/showDogProfilePath'

describe('showDogProfilePath', () => {
  it('never sends catalog ring # to /dog/{n} under 1e6', () => {
    const href = showDogProfilePath({
      id: '14',
      name_lat: 'SANDAURI YURAI HEEPP',
      breed: 'БОРОДАТЫЙ КОЛЛИ',
      competition_dog_id: null,
    })
    expect(href.startsWith('/dog/')).toBe(true)
    const id = Number(href.slice('/dog/'.length))
    expect(id).toBeGreaterThanOrEqual(SHOW_PROFILE_ID_BASE)
    expect(id).not.toBe(14)
  })

  it('uses competition_dog_id when linked', () => {
    expect(
      showDogProfilePath({
        id: '14',
        name_lat: 'X',
        breed: 'Y',
        competition_dog_id: 5711,
      }),
    ).toBe('/dog/5711')
  })

  it('resolves stable id back to the same dog', () => {
    const dog = {
      id: '14',
      name_lat: 'SANDAURI YURAI HEEPP',
      name_ru: '',
      breed: 'БОРОДАТЫЙ КОЛЛИ',
      sex: '',
      total_shows: 1,
      titles: {} as never,
      competition_dog_id: null,
    }
    const href = showDogProfilePath(dog)
    const profileId = href.slice('/dog/'.length)
    const found = findShowDogByProfileId(profileId, [dog])
    expect(found?.name_lat).toBe('SANDAURI YURAI HEEPP')
  })
})
