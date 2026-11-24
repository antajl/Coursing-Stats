import { Check, Trash2 } from 'lucide-react';

interface TrackerAuthActiveProps {
  token: string;
  email: string | null;
  onLogout: () => void;
  onClose: () => void;
}

export function TrackerAuthActive({
  token,
  email,
  onLogout,
  onClose,
}: TrackerAuthActiveProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs space-y-2">
        <div className="flex items-center gap-2 font-semibold text-emerald-900">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Аккаунт РКФ Онлайн подключен</span>
        </div>
        {email && (
          <p className="text-xs font-semibold text-emerald-950 font-sans">
            {email}
          </p>
        )}
        <p className="text-emerald-800/90 leading-relaxed font-mono break-all text-[11px]">
          {token.slice(0, 16)}••••••••••••••••{token.slice(-12)}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onLogout}
          className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 border border-rose-200 hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Отвязать аккаунт (Выйти)</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="cs-glass-pill-active min-h-[44px] px-6 py-2 rounded-xl text-xs font-semibold cursor-pointer"
        >
          Готово
        </button>
      </div>
    </div>
  );
}
