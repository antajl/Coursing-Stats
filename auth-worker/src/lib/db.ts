import type { UserRow } from '../env'
import { normalizeEmail } from '../env'

export async function getUserByEmail(db: D1Database, email: string): Promise<UserRow | null> {
  const normalized = normalizeEmail(email)
  const result = await db
    .prepare(
      `SELECT id, email, password_hash, display_name, email_verified, created_at
       FROM users WHERE lower(email) = ? LIMIT 1`,
    )
    .bind(normalized)
    .first<UserRow>()
  return result ?? null
}

export async function createUser(
  db: D1Database,
  params: {
    email: string
    password_hash: string
    display_name: string
    email_verified?: boolean
  },
): Promise<string> {
  const userId = crypto.randomUUID()
  const email = normalizeEmail(params.email)
  await db
    .prepare(
      `INSERT INTO users (id, email, password_hash, display_name, email_verified, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      userId,
      email,
      params.password_hash,
      params.display_name,
      params.email_verified ? 1 : 0,
      Date.now(),
    )
    .run()
  return userId
}

export async function createSession(
  db: D1Database,
  params: { user_id: string; token_hash: string },
): Promise<string> {
  const sessionId = crypto.randomUUID()
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000
  await db
    .prepare(
      `INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(sessionId, params.user_id, params.token_hash, expiresAt, Date.now())
    .run()
  return sessionId
}

export async function deleteSession(db: D1Database, tokenHash: string): Promise<void> {
  await db.prepare(`DELETE FROM sessions WHERE token_hash = ?`).bind(tokenHash).run()
}

export async function getUserBySessionToken(
  db: D1Database,
  tokenHash: string,
): Promise<(Pick<UserRow, 'id' | 'email' | 'display_name' | 'created_at'> & { password_hash?: string }) | null> {
  const now = Date.now()
  const result = await db
    .prepare(
      `SELECT u.id, u.email, u.display_name, u.created_at, u.password_hash
       FROM users u
       INNER JOIN sessions s ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .bind(tokenHash, now)
    .first()
  return (result as any) ?? null
}

export async function updateUserDisplayName(
  db: D1Database,
  userId: string,
  displayName: string,
): Promise<void> {
  await db.prepare(`UPDATE users SET display_name = ? WHERE id = ?`).bind(displayName, userId).run()
}

export async function updateUserPassword(
  db: D1Database,
  userId: string,
  passwordHash: string,
): Promise<void> {
  await db
    .prepare(`UPDATE users SET password_hash = ?, email_verified = 1 WHERE id = ?`)
    .bind(passwordHash, userId)
    .run()
}

export async function getFavorites(db: D1Database, userId: string): Promise<string[]> {
  const result = await db
    .prepare(`SELECT dog_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC`)
    .bind(userId)
    .all<{ dog_id: string }>()
  return (result.results ?? []).map((row) => row.dog_id)
}

export async function addFavorite(db: D1Database, userId: string, dogId: string): Promise<void> {
  await db
    .prepare(`INSERT OR IGNORE INTO favorites (user_id, dog_id, created_at) VALUES (?, ?, ?)`)
    .bind(userId, dogId, Date.now())
    .run()
}

export async function removeFavorite(db: D1Database, userId: string, dogId: string): Promise<void> {
  await db.prepare(`DELETE FROM favorites WHERE user_id = ? AND dog_id = ?`).bind(userId, dogId).run()
}

export async function getOAuthProvider(
  db: D1Database,
  provider: string,
  providerUserId: string,
): Promise<{ user_id: string; email: string } | null> {
  const result = await db
    .prepare(`SELECT user_id, email FROM oauth_providers WHERE provider = ? AND provider_user_id = ?`)
    .bind(provider, providerUserId)
    .first<{ user_id: string; email: string }>()
  return result ?? null
}

export async function createOAuthProvider(
  db: D1Database,
  params: { user_id: string; provider: string; provider_user_id: string; email: string },
): Promise<string> {
  const providerId = crypto.randomUUID()
  await db
    .prepare(
      `INSERT INTO oauth_providers (id, user_id, provider, provider_user_id, email, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      providerId,
      params.user_id,
      params.provider,
      params.provider_user_id,
      normalizeEmail(params.email),
      Date.now(),
    )
    .run()
  return providerId
}

export async function createEmailVerification(
  db: D1Database,
  params: { user_id: string; token: string; expires_at: number },
): Promise<string> {
  const verificationId = crypto.randomUUID()
  await db
    .prepare(
      `INSERT INTO email_verifications (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(verificationId, params.user_id, params.token, params.expires_at, Date.now())
    .run()
  return verificationId
}

export async function getEmailVerificationByToken(
  db: D1Database,
  token: string,
): Promise<{ user_id: string; expires_at: number } | null> {
  const now = Date.now()
  const result = await db
    .prepare(`SELECT user_id, expires_at FROM email_verifications WHERE token = ? AND expires_at > ?`)
    .bind(token, now)
    .first<{ user_id: string; expires_at: number }>()
  return result ?? null
}

export async function deleteEmailVerification(db: D1Database, token: string): Promise<void> {
  await db.prepare(`DELETE FROM email_verifications WHERE token = ?`).bind(token).run()
}

export async function setEmailVerified(db: D1Database, userId: string): Promise<void> {
  await db.prepare(`UPDATE users SET email_verified = 1 WHERE id = ?`).bind(userId).run()
}

export async function deleteUser(db: D1Database, userId: string): Promise<void> {
  await db.prepare(`DELETE FROM users WHERE id = ?`).bind(userId).run()
}

export async function createPasswordReset(
  db: D1Database,
  params: { user_id: string; token: string; expires_at: number },
): Promise<void> {
  await db
    .prepare(`DELETE FROM password_resets WHERE user_id = ?`)
    .bind(params.user_id)
    .run()
  await db
    .prepare(
      `INSERT INTO password_resets (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(crypto.randomUUID(), params.user_id, params.token, params.expires_at, Date.now())
    .run()
}

export async function getPasswordResetByToken(
  db: D1Database,
  token: string,
): Promise<{ user_id: string; expires_at: number } | null> {
  const now = Date.now()
  const result = await db
    .prepare(`SELECT user_id, expires_at FROM password_resets WHERE token = ? AND expires_at > ?`)
    .bind(token, now)
    .first<{ user_id: string; expires_at: number }>()
  return result ?? null
}

export async function deletePasswordReset(db: D1Database, token: string): Promise<void> {
  await db.prepare(`DELETE FROM password_resets WHERE token = ?`).bind(token).run()
}
