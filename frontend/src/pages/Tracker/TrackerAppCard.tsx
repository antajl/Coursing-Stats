import { Check } from 'lucide-react';

interface TrackerAppCardProps {
  icon: React.ReactNode;
  iconContainerClass: string;
  badgeText: string;
  badgeClass: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  visual?: React.ReactNode;
  action: React.ReactNode;
}

export function TrackerAppCard({
  icon,
  iconContainerClass,
  badgeText,
  badgeClass,
  title,
  subtitle,
  description,
  features,
  visual,
  action,
}: TrackerAppCardProps) {
  return (
    <div className="rounded-2xl border border-old-money-200/90 bg-white p-5 sm:p-6 shadow-sm hover:border-camel-300 transition-all flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${iconContainerClass}`}
          >
            {icon}
          </div>
          <span
            className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold ${badgeClass}`}
          >
            {badgeText}
          </span>
        </div>

        <div>
          <h3 className="text-sm font-bold text-charcoal-900">{title}</h3>
          <p className="text-xs text-charcoal-500 font-mono mt-0.5">{subtitle}</p>
        </div>

        <p className="text-xs text-charcoal-600 leading-relaxed">{description}</p>

        <ul className="space-y-1.5 text-xs text-charcoal-700 pt-1">
          {features.map((feat, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        {visual && <div className="pt-2">{visual}</div>}
      </div>

      <div className="pt-5 mt-4 border-t border-old-money-100">{action}</div>
    </div>
  );
}
