/**
 * Stable numeric profile ids for show dogs (URL `/dog/{id}`).
 * Unlinked show dogs use ≥ SHOW_PROFILE_ID_BASE so they never collide with procoursing ids.
 */

export const SHOW_PROFILE_ID_BASE = 1_000_000

function normalizeKeyPart(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
}

/** Deterministic FNV-1a → id in [SHOW_PROFILE_ID_BASE, SHOW_PROFILE_ID_BASE + 2^31). */
export function stableShowProfileId(nameLat: string, breed: string): number {
  const key = `${normalizeKeyPart(nameLat)}|${normalizeKeyPart(breed)}`
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return SHOW_PROFILE_ID_BASE + ((h >>> 0) % 2_000_000_000)
}

export function isShowOnlyProfileId(id: number | string | null | undefined): boolean {
  const n = Number(id)
  return Number.isFinite(n) && n >= SHOW_PROFILE_ID_BASE
}
