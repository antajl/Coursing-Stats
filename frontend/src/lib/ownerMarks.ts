function norm(value: string): string {
  return value.trim().toUpperCase().replace(/Ё/g, 'Е')
}

function primaryName(name: string): string {
  return norm(name.split('/')[0])
}

/** Донино: домашняя кличка */
const OWNER_DONINO = [{ name: 'ТАЙГА', breed: 'САЛЮКИ' }]

/** Соревнования: dog_id и/или начало официальной клички */
const OWNER_COMPETITION_DOG_IDS = new Set([5782])
const OWNER_COMPETITION_NAMES = ['ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА']

export function isOwnerDoninoMark(name: string, breed: string): boolean {
  const n = norm(name)
  const b = norm(breed)
  return OWNER_DONINO.some((mark) => mark.name === n && mark.breed === b)
}

export function isOwnerCompetitionMark(
  dogId?: number | null,
  nameLat?: string | null,
): boolean {
  if (dogId != null && OWNER_COMPETITION_DOG_IDS.has(dogId)) return true
  if (!nameLat) return false
  const primary = primaryName(nameLat)
  return OWNER_COMPETITION_NAMES.some(
    (mark) => primary === mark || primary.startsWith(`${mark} `),
  )
}

export function hasOwnerCrown(
  kind: 'donino' | 'competition',
  opts: { name?: string; breed?: string; dogId?: number | null },
): boolean {
  if (kind === 'donino') {
    return isOwnerDoninoMark(opts.name ?? '', opts.breed ?? '')
  }
  return isOwnerCompetitionMark(opts.dogId, opts.name)
}
