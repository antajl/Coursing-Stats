import { OAUTH_PASSWORD_SENTINEL } from '../env'

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits'])
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    key,
    256,
  )
  const combined = new Uint8Array(salt.length + derivedBits.byteLength)
  combined.set(salt)
  combined.set(new Uint8Array(derivedBits), salt.length)
  return Array.from(combined)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash || hash === OAUTH_PASSWORD_SENTINEL || hash.length < 64) return false
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const pairs = hash.match(/.{1,2}/g)
  if (!pairs) return false
  const combined = new Uint8Array(pairs.map((b) => parseInt(b, 16)))
  if (combined.length < 32) return false
  const salt = combined.slice(0, 16)
  const storedHash = combined.slice(16)
  const key = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits'])
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    key,
    256,
  )
  const derivedHash = new Uint8Array(derivedBits)
  if (derivedHash.length !== storedHash.length) return false
  let ok = true
  for (let i = 0; i < derivedHash.length; i++) {
    if (derivedHash[i] !== storedHash[i]) ok = false
  }
  return ok
}

export function generateSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
