/**
 * Coursing/BZMP: separate sex classes require ≥3 dogs of that sex
 * in the same breed + size class. Otherwise the run is mixed (Микс).
 *
 * Rules per (breed + class):
 * - both sexes ≥3 → keep Кобели / Суки
 * - only one sex present and count ≥3 → keep that sex label
 * - otherwise → all rows become «… - Микс» (нераздельный зачёт)
 *
 * Individual `sex` on the dog stays as in the catalog; only `breed_class` grouping changes.
 */

const MALE = /^(кобели|кобель|male|males)$/i
const FEMALE = /^(суки|сука|female|females)$/i
const MIX = /^(микс|mix|mixed)$/i

export const MIN_DOGS_FOR_SEPARATE_SEX = 3

export type MixableResult = {
  breed_class: string
  sex?: string | null
}

export function parseBreedClassParts(breedClass: string): {
  breedClassKey: string
  sexLabel: string | null
} {
  const parts = breedClass
    .split(' - ')
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length < 2) {
    return { breedClassKey: breedClass.trim(), sexLabel: null }
  }
  const last = parts[parts.length - 1]
  if (MALE.test(last) || FEMALE.test(last) || MIX.test(last)) {
    return {
      breedClassKey: parts.slice(0, -1).join(' - '),
      sexLabel: last,
    }
  }
  return { breedClassKey: breedClass.trim(), sexLabel: null }
}

function sexBucket(sexLabel: string | null | undefined, sexField?: string | null): 'male' | 'female' | 'other' {
  const candidates = [sexLabel, sexField].filter(Boolean) as string[]
  for (const c of candidates) {
    if (MALE.test(c)) return 'male'
    if (FEMALE.test(c)) return 'female'
  }
  return 'other'
}

function buildBreedClass(breedClassKey: string, sexOut: string): string {
  if (!breedClassKey) return sexOut
  return `${breedClassKey} - ${sexOut}`
}

/**
 * Mutates results in place: rewrite breed_class sex segment to Микс when
 * the breed+class cannot run separate sex classes.
 */
export function applyMixBreedClasses<T extends MixableResult>(results: T[]): T[] {
  type Acc = { male: T[]; female: T[]; other: T[] }
  const byKey = new Map<string, Acc>()

  for (const r of results) {
    // DNS / non-arrived stay out of sex-class mix math
    if ((r as { status?: string | null }).status === 'dns') continue
    const { breedClassKey, sexLabel } = parseBreedClassParts(r.breed_class || '')
    if (!breedClassKey) continue
    if (/неприбыв|неявив/i.test(breedClassKey)) continue
    let acc = byKey.get(breedClassKey)
    if (!acc) {
      acc = { male: [], female: [], other: [] }
      byKey.set(breedClassKey, acc)
    }
    const bucket = sexBucket(sexLabel, r.sex)
    if (bucket === 'male') acc.male.push(r)
    else if (bucket === 'female') acc.female.push(r)
    else acc.other.push(r)
  }

  for (const [breedClassKey, acc] of byKey) {
    const m = acc.male.length
    const f = acc.female.length
    const bothSexes = m > 0 && f > 0
    const keepSeparate =
      (bothSexes && m >= MIN_DOGS_FOR_SEPARATE_SEX && f >= MIN_DOGS_FOR_SEPARATE_SEX) ||
      (!bothSexes && m >= MIN_DOGS_FOR_SEPARATE_SEX && f === 0) ||
      (!bothSexes && f >= MIN_DOGS_FOR_SEPARATE_SEX && m === 0)

    if (keepSeparate) continue

    for (const r of [...acc.male, ...acc.female, ...acc.other]) {
      const { breedClassKey: key } = parseBreedClassParts(r.breed_class || '')
      r.breed_class = buildBreedClass(key || breedClassKey, 'Микс')
    }
  }

  return results
}
