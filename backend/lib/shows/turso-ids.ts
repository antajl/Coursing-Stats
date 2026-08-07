import crypto from 'node:crypto'

export function normalizeShowIdentity(value: string): string {
  return value.normalize('NFKC').toUpperCase().replace(/Ё/g, 'Е').replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\s+/g, ' ').trim()
}

/** Opaque, deterministic IDs avoid numeric hash collisions and never expose source text. */
export function stableTursoId(kind: string, ...parts: Array<string | number | null | undefined>): string {
  const body = parts.map((part) => normalizeShowIdentity(String(part ?? ''))).join('|')
  return `${kind}_${crypto.createHash('sha256').update(`${kind}|${body}`).digest('hex').slice(0, 32)}`
}
