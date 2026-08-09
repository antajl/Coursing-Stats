import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../lib/authApi'
import { DeleteAccountModal } from './AccountModals'
import { useState } from 'react'
import { createLogger } from '../../lib/logging'

const log = createLogger('account-settings')

function formatMemberSince(createdAt: unknown): string | null {
  if (createdAt == null || createdAt === '') return null

  let d: Date
  if (typeof createdAt === 'number') {
    d = new Date(createdAt < 1e12 ? createdAt * 1000 : createdAt)
  } else if (typeof createdAt === 'string') {
    const trimmed = createdAt.trim()
    if (!trimmed) return null
    const asNum = Number(trimmed)
    if (Number.isFinite(asNum) && /^\d+$/.test(trimmed)) {
      d = new Date(asNum < 1e12 ? asNum * 1000 : asNum)
    } else {
      d = new Date(trimmed)
    }
  } else {
    return null
  }

  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function AccountSettingsPage() {
  const { user, logout, isAuthenticated, deleteAccount, setUser } = useAuth()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-charcoal-900 dark:text-cream-100 mb-3">
            Войдите, чтобы открыть настройки
          </h1>
          <Link
            to="/login"
            className="inline-block bg-camel-700 hover:bg-camel-800 text-cream-50 font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            Войти
          </Link>
        </div>
      </div>
    )
  }

  const memberSince = formatMemberSince(user.created_at)

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await deleteAccount()
      setShowDeleteModal(false)
    } catch (error) {
      log.error('Failed to delete account', error as Error)
      alert('Не удалось удалить аккаунт: ' + (error as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  const handleSetPassword = async () => {
    setPasswordMsg(null)
    setPasswordError(null)
    setSavingPassword(true)
    try {
      const res = await authApi.setPassword(newPassword)
      setPasswordMsg(res.message || 'Пароль сохранён')
      setNewPassword('')
      if (user) setUser({ ...user, has_password: true, auth_provider: 'password' })
    } catch (error) {
      setPasswordError((error as Error).message || 'Не удалось сохранить пароль')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
      <Link
        to="/account"
        className="inline-flex items-center gap-1.5 text-sm text-charcoal-600 dark:text-cream-300 hover:text-charcoal-900 dark:hover:text-cream-100 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        К кабинету
      </Link>

      <h1 className="text-3xl font-bold text-charcoal-900 dark:text-cream-100 mb-8">
        Настройки аккаунта
      </h1>

      <section className="mb-8 rounded-xl border border-charcoal-200 dark:border-charcoal-700 px-4 py-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal-500 dark:text-charcoal-400 mb-3">
          Профиль
        </h2>
        <p className="text-charcoal-800 dark:text-cream-100 font-medium">{user.display_name}</p>
        <p className="mt-1 text-sm text-charcoal-600 dark:text-cream-300">{user.email}</p>
        {memberSince && (
          <p className="mt-2 text-sm text-charcoal-500 dark:text-charcoal-400">
            С нами с {memberSince}
          </p>
        )}
      </section>

      <section className="mb-8 rounded-xl border border-charcoal-200 dark:border-charcoal-700 px-4 py-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal-500 dark:text-charcoal-400 mb-3">
          Пароль
        </h2>
        {user.has_password === false ? (
          <p className="text-sm text-charcoal-600 dark:text-cream-300 mb-3">
            Аккаунт создан через Яндекс — пароля ещё нет. Задайте его, чтобы входить и по email.
          </p>
        ) : (
          <p className="text-sm text-charcoal-600 dark:text-cream-300 mb-3">
            Можно задать новый пароль для входа по email.
          </p>
        )}
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            void handleSetPassword()
          }}
        >
          {passwordMsg && (
            <p className="text-sm text-green-700 dark:text-green-400">{passwordMsg}</p>
          )}
          {passwordError && (
            <p className="text-sm text-terracotta-600 dark:text-terracotta-400">{passwordError}</p>
          )}
          <input
            type="password"
            minLength={8}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Новый пароль (мин. 8)"
            className="w-full px-3 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-cream-100"
            disabled={savingPassword}
          />
          <button
            type="submit"
            disabled={savingPassword || newPassword.length < 8}
            className="inline-flex items-center rounded-lg bg-camel-700 hover:bg-camel-800 text-cream-50 text-sm font-medium px-3 py-2 disabled:opacity-50"
          >
            {savingPassword ? 'Сохранение…' : user.has_password === false ? 'Задать пароль' : 'Сменить пароль'}
          </button>
        </form>
      </section>

      <section className="mb-8 rounded-xl border border-charcoal-200 dark:border-charcoal-700 px-4 py-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal-500 dark:text-charcoal-400 mb-3">
          Telegram
        </h2>
        <p className="text-sm text-charcoal-600 dark:text-cream-300 mb-3">
          Бот Coursing Stats — поиск собак, рейтинги и избранное в Telegram. Уведомления о результатах
          появятся позже.
        </p>
        <a
          href="https://t.me/coursing_stats_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-medium text-camel-800 dark:text-camel-300 hover:underline"
        >
          Открыть @coursing_stats_bot →
        </a>
      </section>

      <section className="mb-8 rounded-xl border border-charcoal-200 dark:border-charcoal-700 px-4 py-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal-500 dark:text-charcoal-400 mb-3">
          Безопасность
        </h2>
        <button
          type="button"
          onClick={() => void logout()}
          className="text-sm text-charcoal-700 dark:text-cream-200 hover:text-charcoal-900 dark:hover:text-cream-100"
        >
          Выйти
        </button>
      </section>

      <section className="rounded-xl border border-terracotta-300/80 dark:border-terracotta-800/70 bg-terracotta-50/40 dark:bg-terracotta-950/20 px-4 py-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-terracotta-700 dark:text-terracotta-400 mb-2">
          Удаление аккаунта
        </h2>
        <p className="text-sm text-charcoal-600 dark:text-charcoal-400 mb-3">
          Удаление необратимо: аккаунт и избранное исчезнут.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center justify-center rounded-lg border border-terracotta-600 bg-terracotta-600 px-3 py-2 text-sm font-medium text-white hover:bg-terracotta-700 dark:border-terracotta-500 dark:bg-terracotta-700 transition-colors"
        >
          Удалить аккаунт…
        </button>
      </section>

      <DeleteAccountModal
        open={showDeleteModal}
        deleting={deleting}
        onConfirm={() => void handleDeleteAccount()}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}
