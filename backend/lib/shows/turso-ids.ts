import crypto from 'node:crypto'
import { normalizeShowIdentity as _normalizeShowIdentity } from '../show-normalization.js'

// Re-export for backward compatibility with tests and import scripts
export const normalizeShowIdentity = _normalizeShowIdentity

/** Opaque, deterministic IDs avoid numeric hash collisions and never expose source text. */
export function stableTursoId(kind: string, ...parts: Array<string | number | null | undefined>): string {
  const body = parts.map((part) => normalizeShowIdentity(String(part ?? ''))).join('|')
  return `${kind}_${crypto.createHash('sha256').update(`${kind}|${body}`).digest('hex').slice(0, 32)}`
}
