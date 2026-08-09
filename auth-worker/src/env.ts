export type Env = {
  DB: D1Database
  YANDEX_CLIENT_ID: string
  YANDEX_CLIENT_SECRET: string
  YANDEX_REDIRECT_URI: string
  /** Optional — without it verification/reset emails are skipped (logged). */
  RESEND_API_KEY?: string
}

export type UserRow = {
  id: string
  email: string
  password_hash: string
  display_name: string
  email_verified: number
  created_at: number | string
}

export const OAUTH_PASSWORD_SENTINEL = 'oauth'

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isOAuthOnly(passwordHash: string | null | undefined): boolean {
  return passwordHash === OAUTH_PASSWORD_SENTINEL
}
