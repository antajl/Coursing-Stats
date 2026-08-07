import { describe, expect, it } from 'vitest'
import { collectDogNameParts, dogsLikelySame } from '../lib/dog-identity-match'

/**
 * Номер каталога RKF `(5538)` — не стабильный id собаки.
 * На Евразии-2019 и Кубке Президента-2024 ring 5538 принадлежал разным псам одной породы.
 */
describe('show catalog ring numbers', () => {
  it('does not treat same ring+breed as same dog across names', () => {
    const quil = {
      id: '5538',
      name_lat: 'TANTEZAMPE QUILIN',
      breed: 'РУССКАЯ ПСОВАЯ БОРЗАЯ',
    }
    const sev = {
      id: '5538',
      name_lat: 'VRAZOVSKIH SEVASTIAN',
      breed: 'РУССКАЯ ПСОВАЯ БОРЗАЯ',
    }
    expect(dogsLikelySame(quil, sev)).toBe(false)
    expect(collectDogNameParts(quil.name_lat)[0]).not.toBe(collectDogNameParts(sev.name_lat)[0])
  })
})
