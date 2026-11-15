import { describe, it, expect } from 'vitest'
import { getBreedArchiveSubdomain, getBreedArchiveUrl } from './breedArchive'

describe('breedArchive', () => {
  it('resolves correct subdomains by slug', () => {
    expect(getBreedArchiveSubdomain('whippet')).toBe('whippet')
    expect(getBreedArchiveSubdomain('saluki')).toBe('saluki')
    expect(getBreedArchiveSubdomain('borzoi')).toBe('borzoi')
    expect(getBreedArchiveSubdomain('italian-greyhound')).toBe('italiangreyhound')
    expect(getBreedArchiveSubdomain('pharaoh-hound')).toBe('pharaohhound')
    expect(getBreedArchiveSubdomain('cirneco-delletna')).toBe('cirneco')
    expect(getBreedArchiveSubdomain('xoloitzcuintli')).toBe('xolo')
    expect(getBreedArchiveSubdomain('chart-polski')).toBe('chartpolski')
  })

  it('resolves correct subdomains by Russian canonical key', () => {
    expect(getBreedArchiveSubdomain('УИППЕТ')).toBe('whippet')
    expect(getBreedArchiveSubdomain('САЛЮКИ')).toBe('saluki')
    expect(getBreedArchiveSubdomain('РУССКАЯ ПСОВАЯ БОРЗАЯ')).toBe('borzoi')
    expect(getBreedArchiveSubdomain('ЛЕВРЕТКА')).toBe('italiangreyhound')
    expect(getBreedArchiveSubdomain('ФАРАОНОВА СОБАКА')).toBe('pharaohhound')
  })

  it('builds full URL correctly', () => {
    expect(getBreedArchiveUrl('whippet')).toBe('https://whippet.breedarchive.com')
    expect(getBreedArchiveUrl('saluki')).toBe('https://saluki.breedarchive.com')
    expect(getBreedArchiveUrl('borzoi')).toBe('https://borzoi.breedarchive.com')
  })

  it('returns null for breeds without dedicated Breed Archive', () => {
    expect(getBreedArchiveSubdomain('basenji')).toBeNull()
    expect(getBreedArchiveSubdomain('irish-wolfhound')).toBeNull()
    expect(getBreedArchiveSubdomain('mixed-breed')).toBeNull()
    expect(getBreedArchiveUrl('basenji')).toBeNull()
    expect(getBreedArchiveUrl('')).toBeNull()
    expect(getBreedArchiveUrl(undefined)).toBeNull()
  })
})
