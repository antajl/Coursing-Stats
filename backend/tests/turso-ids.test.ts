import { describe, expect, it } from 'vitest'
import { normalizeShowIdentity, stableTursoId } from '../lib/shows/turso-ids'

describe('Turso show identifiers', () => {
  it('normalizes whitespace, case and Cyrillic ё before identity hashing', () => {
    expect(normalizeShowIdentity('  Ёлка---Dog ')).toBe('ЕЛКА DOG')
    expect(stableTursoId('dog', 'Ёлка Dog', 'Уиппет')).toBe(
      stableTursoId('dog', ' елка  dog ', 'уиппет'),
    )
  })

  it('keeps entity namespaces and source rows separate', () => {
    expect(stableTursoId('dog', 'Name', 'Breed')).not.toBe(stableTursoId('judge', 'Name', 'Breed'))
    expect(stableTursoId('entry', 'source-a', 'row:1')).not.toBe(stableTursoId('entry', 'source-a', 'row:2'))
  })

  it('emits opaque fixed-length SHA-derived IDs', () => {
    expect(stableTursoId('dog', 'Name', 'Breed')).toMatch(/^dog_[a-f0-9]{32}$/)
  })
})
