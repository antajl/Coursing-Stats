import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TrackerAuthManualTokenProps {
  onSaveToken: (token: string) => void;
  onError: (msg: string) => void;
}

export function TrackerAuthManualToken({
  onSaveToken,
  onError,
}: TrackerAuthManualTokenProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState('');

  const handleSave = () => {
    const cleanToken = tokenInput.trim().replace(/^Bearer\s+/i, '');
    if (!cleanToken) {
      onError('Вставьте токен авторизации');
      return;
    }
    if (cleanToken.length < 20) {
      onError('Слишком короткий токен (проверьте правильность)');
      return;
    }
    onSaveToken(cleanToken);
    setTokenInput('');
  };

  const handleImportFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleanToken = text.trim().replace(/^Bearer\s+/i, '');
      if (cleanToken.length >= 20) {
        setTokenInput(cleanToken);
        onError('');
      } else {
        onError('В буфере обмена нет подходящего токена');
      }
    } catch {
      onError('Не удалось получить доступ к буферу обмена');
    }
  };

  return (
    <div className="border-t border-old-money-100 pt-1">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full min-h-[44px] flex items-center justify-between py-2 text-xs text-charcoal-500 hover:text-charcoal-800 transition-colors cursor-pointer select-none"
      >
        <span>Ручной ввод токена (для специалистов)</span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-charcoal-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-3 p-3.5 rounded-xl bg-cream-50/80 border border-old-money-200/80 text-xs">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-charcoal-700">
              Токен доступа (Bearer Token)
            </label>
            <button
              type="button"
              onClick={handleImportFromClipboard}
              className="text-[11px] font-semibold text-camel-700 hover:text-camel-800 hover:underline cursor-pointer"
            >
              Вставить из буфера
            </button>
          </div>
          <textarea
            rows={2}
            value={tokenInput}
            onChange={(e) => {
              setTokenInput(e.target.value);
              onError('');
            }}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="w-full px-3 py-2 text-[11px] font-mono rounded-lg border border-old-money-200 bg-white text-charcoal-900 focus:border-camel-600 focus:ring-1 focus:ring-camel-600 outline-none transition-all placeholder:text-charcoal-300 resize-none"
          />
          <div className="text-[11px] text-charcoal-600 leading-relaxed space-y-1">
            <p className="font-medium text-charcoal-800">Инструкция:</p>
            <p>
              На сайте <strong>rkf.online</strong> нажмите <strong>F12</strong> (Инструменты разработчика) → вкладка <strong>Application</strong> → слева <strong>Local Storage</strong> → скопируйте <code>access_token</code>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="w-full min-h-[44px] py-2 rounded-xl cs-glass-pill-active font-semibold text-xs cursor-pointer"
          >
            Сохранить токен
          </button>
        </div>
      )}
    </div>
  );
}
