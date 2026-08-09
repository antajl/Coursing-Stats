import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Check, X, Settings } from 'lucide-react'
import { authApi, type User } from '../../lib/authApi'
import { createLogger } from '../../lib/logging'
import { formatStarts } from '../Home/utils/formatters'

const log = createLogger('account')

function formatDogCount(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return `${n} собак`
  if (mod10 === 1) return `${n} собака`
  if (mod10 >= 2 && mod10 <= 4) return `${n} собаки`
  return `${n} собак`
}

type AccountHeaderProps = {
  user: User
  setUser: (user: User | null) => void
  dogCount: number
  participationCount: number
}

export function AccountHeader({
  user,
  setUser,
  dogCount,
  participationCount,
}: AccountHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(user.display_name)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startEdit = () => {
    setDraftName(user.display_name)
    setError(null)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setError(null)
    setDraftName(user.display_name)
  }

  const saveName = async () => {
    const next = draftName.trim()
    if (!next) {
      setError('Имя не может быть пустым')
      return
    }
    if (next === user.display_name) {
      setEditing(false)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const { display_name } = await authApi.updateMe(next)
      setUser({ ...user, display_name })
      setEditing(false)
    } catch (err) {
      log.error('Failed to update display name', err as Error, { userId: user.id })
      setError((err as Error).message || 'Не удалось сохранить имя')
    } finally {
      setSaving(false)
    }
  }

  const metaParts = [
    dogCount > 0 ? formatDogCount(dogCount) : null,
    dogCount > 0 && participationCount > 0 ? formatStarts(participationCount) : null,
  ].filter(Boolean)

  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {editing ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                disabled={saving}
                className="min-w-[12rem] flex-1 max-w-sm px-3 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-cream-100"
                aria-label="Отображаемое имя"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void saveName()
                  if (e.key === 'Escape') cancelEdit()
                }}
              />
              <button
                type="button"
                onClick={() => void saveName()}
                disabled={saving}
                className="p-2 text-camel-700 hover:text-camel-900 dark:text-camel-400 disabled:opacity-50"
                title="Сохранить"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="p-2 text-charcoal-500 hover:text-charcoal-800 dark:text-charcoal-400 disabled:opacity-50"
                title="Отмена"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-charcoal-900 dark:text-cream-100 leading-tight">
                {user.display_name}
              </h1>
              <button
                type="button"
                onClick={startEdit}
                className="p-1.5 text-charcoal-500 hover:text-charcoal-800 dark:text-charcoal-400 dark:hover:text-cream-100"
                title="Изменить имя"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
          {error && <p className="mt-1 text-sm text-terracotta-600 dark:text-terracotta-400">{error}</p>}
          {metaParts.length > 0 ? (
            <p className="mt-2 text-charcoal-600 dark:text-cream-300">{metaParts.join(' · ')}</p>
          ) : (
            <p className="mt-2 text-charcoal-600 dark:text-cream-300">
              Следите за своими собаками и результатами
            </p>
          )}
        </div>

        <Link
          to="/account/settings"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal-600 dark:text-cream-300 hover:text-charcoal-900 dark:hover:text-cream-100"
        >
          <Settings className="w-4 h-4" />
          Настройки
        </Link>
      </div>
    </header>
  )
}
