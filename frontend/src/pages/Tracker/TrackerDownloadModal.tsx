import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Bot, Puzzle, Monitor, Smartphone, Globe, PlusSquare } from 'lucide-react';

interface TrackerDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

let globalDeferredPrompt: any = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
  });
}

export function TrackerDownloadModal({ isOpen, onClose }: TrackerDownloadModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(() => globalDeferredPrompt);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [installHint, setInstallHint] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e;
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setPwaInstalled(true);
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptToUse = deferredPrompt || globalDeferredPrompt;
    if (promptToUse) {
      try {
        await promptToUse.prompt();
        const choice = await promptToUse.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setPwaInstalled(true);
        }
        globalDeferredPrompt = null;
        setDeferredPrompt(null);
      } catch (err) {
        console.error('PWA install prompt error:', err);
      }
    } else {
      setInstallHint('Используйте значок установки в адресной строке браузера или меню → Добавить на главный экран.');
    }
  };

  if (!isOpen) return null;

  const downloadExeUrl = 'https://github.com/antajl/Coursing-Stats/releases/download/v1.0.0-tracker/CoursingStats-Tracker-Windows-x64.exe';
  const downloadZipUrl = 'https://github.com/antajl/Coursing-Stats/releases/download/v1.0.0-tracker/CoursingStats-Tracker-Chrome-Extension.zip';
  const botUrl = 'https://t.me/coursing_stats_notify_bot';

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-old-money-200/90 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-old-money-100 bg-cream-50 shrink-0">
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
        <div className="p-6 space-y-3.5 overflow-y-auto">
          {/* 1. Web App (PWA) */}
          <div className="flex items-start gap-3.5 p-4 rounded-xl border border-old-money-200/90 bg-cream-50/50 hover:border-camel-400 hover:bg-cream-50/80 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-camel-100 flex items-center justify-center shrink-0 text-camel-800 group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal-900">
                  Веб-приложение (PWA)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-camel-100 font-bold text-camel-900">
                  iOS / Android / ПК
                </span>
              </div>
              <p className="text-[11.5px] text-charcoal-600 mt-1 leading-relaxed">
                Работает прямо в браузере без скачивания файлов. На iPhone нажмите <strong>«Поделиться» → «На экран «Домой»»</strong>. На Android и ПК нажмите <strong>«Установить»</strong> в меню браузера.
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3 py-1.5 rounded-lg bg-camel-700 hover:bg-camel-800 text-white font-medium text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusSquare className="w-3.5 h-3.5" />
                  <span>{pwaInstalled ? 'Приложение установлено' : 'Установить веб-приложение'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="cs-glass-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-charcoal-700 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Открыть онлайн</span>
                </button>
              </div>
              {installHint && (
                <div className="mt-2 p-2 rounded-lg bg-sand-100 border border-sand-200 text-[11px] text-charcoal-700 leading-normal">
                  {installHint}
                </div>
              )}
            </div>
          </div>

          {/* 2. Windows Portable App */}
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

          {/* 3. Chrome Extension */}
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

          {/* 4. Telegram Bot */}
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
    </div>,
    document.body
  );
}
