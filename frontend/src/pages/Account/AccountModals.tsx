type LinkModalProps = {
  open: boolean
  email: string
  provider: string
  password: string
  linking: boolean
  onPasswordChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
}

type DeleteModalProps = {
  open: boolean
  deleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function LinkAccountModal({
  open,
  email,
  provider,
  password,
  linking,
  onPasswordChange,
  onConfirm,
  onCancel,
}: LinkModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-charcoal-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-charcoal-900 dark:text-cream-100 mb-4">
          Связать аккаунт
        </h2>
        <p className="text-charcoal-600 dark:text-cream-300 mb-4">
          Аккаунт с email {email} уже существует. Хотите связать его с {provider}?
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-charcoal-700 dark:text-cream-300 mb-2">
            Пароль (если есть)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full px-3 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-cream-100"
            placeholder="Введите пароль для подтверждения"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={linking}
            className="flex-1 bg-camel-600 hover:bg-camel-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {linking ? 'Связывание...' : 'Связать'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-charcoal-200 hover:bg-charcoal-300 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 text-charcoal-900 dark:text-cream-100 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  )
}

export function DeleteAccountModal({ open, deleting, onConfirm, onCancel }: DeleteModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-charcoal-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-charcoal-900 dark:text-cream-100 mb-4">
          Удалить аккаунт
        </h2>
        <p className="text-charcoal-600 dark:text-cream-300 mb-4">
          Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя отменить. Все ваши
          данные, включая избранные собаки, будут удалены.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 bg-terracotta-600 hover:bg-terracotta-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {deleting ? 'Удаление...' : 'Удалить'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 bg-charcoal-200 hover:bg-charcoal-300 dark:bg-charcoal-700 dark:hover:bg-charcoal-600 text-charcoal-900 dark:text-cream-100 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  )
}
