import { X, Download, Bot, Puzzle, Monitor } from 'lucide-react';

interface TrackerDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrackerDownloadModal({ isOpen, onClose }: TrackerDownloadModalProps) {
  if (!isOpen) return null;

  const downloadExeUrl = 'https://github.com/antajl/Coursing-Stats/releases/download/v1.0.0-tracker/CoursingStats-Tracker-Windows-x64.exe';
  const downloadZipUrl = 'https://github.com/antajl/Coursing-Stats/releases/download/v1.0.0-tracker/CoursingStats-Tracker-Chrome-Extension.zip';
  const botUrl = 'https://t.me/coursing_stats_notify_bot';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-old-money-200/90 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-old-money-100 bg-cream-50">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-camel-700" />
            <h3 className="text-sm font-bold text-charcoal-900">
              Экосистема РКФ Трекера
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3.5">
          {/* 1. Windows Portable App */}
          <a
            href={downloadExeUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-3.5 p-4 rounded-xl border border-old-money-200/90 hover:border-camel-400 hover:bg-cream-50/70 transition-all group no-underline"
          >
            <div className="w-10 h-10 rounded-xl bg-camel-100 flex items-center justify-center shrink-0 text-camel-800 group-hover:scale-105 transition-transform">
              <Monitor className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal-900">
                  Программа для Windows (ПК)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cream-200 font-bold text-charcoal-700">
                  Portable .exe
                </span>
              </div>
              <p className="text-[11.5px] text-charcoal-600 mt-0.5 leading-relaxed">
                Быстрое приложение для рабочего стола. Установка не требуется — скачал и запустил.
              </p>
            </div>
          </a>

          {/* 2. Chrome Extension */}
          <a
            href={downloadZipUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-3.5 p-4 rounded-xl border border-old-money-200/90 hover:border-camel-400 hover:bg-cream-50/70 transition-all group no-underline"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800 group-hover:scale-105 transition-transform">
              <Puzzle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal-900">
                  Расширение для браузера
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cream-200 font-bold text-charcoal-700">
                  Chrome / Yandex / Edge
                </span>
              </div>
              <p className="text-[11.5px] text-charcoal-600 mt-0.5 leading-relaxed">
                Автозахват токена на сайте rkf.online, боковая панель и моментальная синхронизация с сайтом.
              </p>
            </div>
          </a>

          {/* 3. Telegram Bot */}
          <a
            href={botUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-3.5 p-4 rounded-xl border border-old-money-200/90 hover:border-camel-400 hover:bg-cream-50/70 transition-all group no-underline"
          >
            <div className="w-10 h-10 rounded-xl bg-warm-blue-100 flex items-center justify-center shrink-0 text-warm-blue-800 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal-900">
                  Телеграм-бот @coursing_stats_notify_bot
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 font-bold text-emerald-800">
                  Уведомления
                </span>
              </div>
              <p className="text-[11.5px] text-charcoal-600 mt-0.5 leading-relaxed">
                Мгновенные оповещения в Telegram, когда диплом готов к выдаче или состязание утверждено.
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
