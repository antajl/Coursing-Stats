import { Check, Bell, ExternalLink, ShieldCheck } from 'lucide-react';

/**
 * Visual Mockup 1: Telegram Chat Message Bubble
 */
export function TelegramBotVisual() {
  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-3 sm:p-3.5 space-y-2 select-none">
      <div className="flex items-center justify-between text-[11px] text-sky-900/80 font-medium pb-1 border-b border-sky-100/80">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          <span className="font-semibold text-sky-950">@coursing_stats_notify_bot</span>
        </div>
        <span className="font-mono text-[10px] text-charcoal-400">14:32</span>
      </div>

      <div className="bg-white rounded-lg p-2.5 border border-sky-100 shadow-2xs space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11.5px]">
          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
          <span>Диплом готов к выдаче в РКФ!</span>
        </div>
        <div className="text-charcoal-900 font-semibold text-xs leading-snug">
          БЕЛЬ ЭТУАЛЬ КАЯЛА
        </div>
        <div className="text-[11px] text-charcoal-600">
          Чемпион РКФ по рабочим качествам
        </div>
        <div className="pt-1 flex items-center justify-between text-[10.5px] font-mono text-charcoal-400 border-t border-old-money-100">
          <span>№ 2200000498194</span>
          <span className="text-emerald-700 font-sans font-semibold">Изготовлено</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Visual Mockup 2: Browser Extension Popup Preview
 */
export function ExtensionVisual() {
  return (
    <div className="rounded-xl border border-amber-200/70 bg-amber-50/30 p-3 sm:p-3.5 space-y-2 select-none">
      <div className="flex items-center justify-between text-[11px] text-amber-950 font-medium pb-1 border-b border-amber-200/50">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
          <span className="font-bold text-charcoal-900">CoursingStats Tracker</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold font-mono">
          РКФ Онлайн
        </span>
      </div>

      <div className="bg-white rounded-lg p-2.5 border border-amber-200/60 shadow-2xs space-y-1 text-xs">
        <div className="flex items-center justify-between text-[11.5px] font-semibold text-charcoal-900">
          <span className="truncate pr-2">ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА</span>
          <span className="text-emerald-700 font-bold shrink-0 text-[11px]">Изготовлено</span>
        </div>
        <div className="flex items-center justify-between text-[10.5px] text-charcoal-500">
          <span>Гранд чемпион РКФ (ГЧРКФ РК)</span>
          <span className="font-mono text-charcoal-400">20 нояб.</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Visual Mockup 3: Windows 10/11 Desktop Acrylic Toast Notification
 */
export function WindowsToastVisual() {
  return (
    <div className="rounded-xl border border-old-money-200 bg-charcoal-900 text-white p-3 sm:p-3.5 space-y-2 shadow-md select-none">
      <div className="flex items-center justify-between text-[11px] text-charcoal-300 pb-1 border-b border-charcoal-700/80">
        <div className="flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-camel-400" />
          <span className="font-semibold text-charcoal-100">РКФ Трекер Windows</span>
        </div>
        <span className="text-[10px] text-charcoal-400 font-mono">только что</span>
      </div>

      <div className="space-y-1 text-xs">
        <div className="font-bold text-emerald-400 text-[11.5px] flex items-center gap-1">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>Статус обновлен: Изготовлено</span>
        </div>
        <div className="text-charcoal-200 text-xs font-medium">
          Внутренний рабочий сертификат готов
        </div>
        <div className="text-[10.5px] text-charcoal-400 font-mono">
          БЕЛЬ ЭТУАЛЬ КАЯЛА • № 2200000491085
        </div>
      </div>
    </div>
  );
}

/**
 * Visual Mockup 4: Mobile Home Screen Launch App Icon
 */
export function PwaHomeVisual() {
  return (
    <div className="rounded-xl border border-cream-200 bg-cream-100/60 p-3 sm:p-3.5 flex items-center justify-center gap-6 select-none">
      <div className="flex flex-col items-center gap-1.5 group cursor-pointer">
        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-camel-700 via-camel-800 to-charcoal-900 flex items-center justify-center shadow-sm border border-camel-600/50 group-hover:scale-105 transition-transform">
          <span className="text-white font-serif font-black text-lg tracking-wider">CS</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-2xs">
            1
          </span>
        </div>
        <span className="text-[11px] font-semibold text-charcoal-800">РКФ Трекер</span>
      </div>

      <div className="text-xs text-charcoal-600 space-y-1">
        <div className="font-bold text-charcoal-900 text-[11.5px]">Запуск в 1 касание</div>
        <div className="text-[11px] text-charcoal-500 leading-snug">
          Полноэкранный режим без адресной строки браузера на iOS и Android
        </div>
      </div>
    </div>
  );
}
