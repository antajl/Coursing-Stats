import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { isLocalDev } from '../../lib/env';
import {
  createAdminEvent,
  fetchAdminEvents,
  type AdminEventListItem,
} from './adminApi';

const inputClass =
  'w-full rounded-lg border border-old-money-300 bg-white px-2.5 py-1.5 text-sm dark:border-charcoal-600 dark:bg-charcoal-800';

export default function AdminEventsList() {
  const navigate = useNavigate();
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [items, setItems] = useState<AdminEventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyUnverified, setOnlyUnverified] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    date_start: new Date().toISOString().slice(0, 10),
    title: '',
    rank_label: '',
    location: '',
    host_club: '',
    event_type: 'coursing',
  });

  useEffect(() => {
    if (!isLocalDev) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAdminEvents(year || undefined);
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year]);

  const years = useMemo(() => {
    const y = new Set<number>();
    for (let i = new Date().getFullYear(); i >= 2015; i--) y.add(i);
    return [...y];
  }, []);

  if (!isLocalDev) {
    return <Navigate to="/competitions?tab=calendar" replace />;
  }

  const visible = onlyUnverified ? items.filter((e) => !e.admin_verified_at) : items;
  const verifiedCount = items.filter((e) => e.admin_verified_at).length;

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);
      const created = await createAdminEvent({
        date_start: createForm.date_start,
        title: createForm.title || undefined,
        rank_label: createForm.rank_label || createForm.title || undefined,
        location: createForm.location || undefined,
        host_club: createForm.host_club || undefined,
        event_type: createForm.event_type,
      });
      navigate(`/admin/event/${created.id}`);
    } catch (err) {
      setError((err as Error).message);
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-3 pb-10 pt-4 sm:px-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal-900 dark:text-charcoal-100">
            Админ · соревнования
          </h1>
          <p className="mt-1 text-sm text-old-money-600 dark:text-old-money-400">
            Локально · {verifiedCount}/{items.length} проверено за {year || 'все годы'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="rounded-lg bg-camel-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-camel-800"
          >
            {showCreate ? 'Отмена' : '+ Новое событие'}
          </button>
          <label className="text-sm text-charcoal-700 dark:text-charcoal-300">
            Год{' '}
            <select
              className="ml-1 rounded-lg border border-old-money-300 bg-white px-2 py-1.5 dark:border-charcoal-600 dark:bg-charcoal-800"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">все</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-charcoal-700 dark:text-charcoal-300">
            <input
              type="checkbox"
              checked={onlyUnverified}
              onChange={(e) => setOnlyUnverified(e.target.checked)}
            />
            только непроверенные
          </label>
        </div>
      </div>

      {showCreate && (
        <form
          onSubmit={onCreate}
          className="mb-4 grid gap-3 rounded-xl border border-camel-300 bg-camel-50/40 p-4 dark:border-camel-700 dark:bg-charcoal-800/60 sm:grid-cols-2"
        >
          <label className="text-sm">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-old-money-500">
              Дата *
            </span>
            <input
              required
              type="date"
              className={inputClass}
              value={createForm.date_start}
              onChange={(e) => setCreateForm((f) => ({ ...f, date_start: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-old-money-500">
              Тип
            </span>
            <select
              className={inputClass}
              value={createForm.event_type}
              onChange={(e) => setCreateForm((f) => ({ ...f, event_type: e.target.value }))}
            >
              <option value="coursing">coursing</option>
              <option value="racing">racing</option>
              <option value="bzmp">bzmp</option>
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-old-money-500">
              Название
            </span>
            <input
              className={inputClass}
              value={createForm.title}
              onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
              placeholder='МОКО "…" — ЧРКФ (Курсинг борзых)'
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-old-money-500">
              Rank label
            </span>
            <input
              className={inputClass}
              value={createForm.rank_label}
              onChange={(e) => setCreateForm((f) => ({ ...f, rank_label: e.target.value }))}
              placeholder="ЧРКФ (Курсинг борзых)"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-old-money-500">
              Локация
            </span>
            <input
              className={inputClass}
              value={createForm.location}
              onChange={(e) => setCreateForm((f) => ({ ...f, location: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-old-money-500">
              Клуб
            </span>
            <input
              className={inputClass}
              value={createForm.host_club}
              onChange={(e) => setCreateForm((f) => ({ ...f, host_club: e.target.value }))}
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-camel-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 hover:bg-camel-800"
            >
              {creating ? 'Создание…' : 'Создать и открыть редактор'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-old-money-500">Загрузка…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-old-money-200 dark:border-charcoal-700">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-old-money-50 text-[11px] uppercase tracking-wide text-old-money-600 dark:bg-charcoal-800 dark:text-old-money-400">
              <tr>
                <th className="px-3 py-2">✓</th>
                <th className="px-3 py-2">Дата</th>
                <th className="px-3 py-2">Название</th>
                <th className="px-3 py-2">Локация</th>
                <th className="px-3 py-2">ID</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((e) => (
                <tr
                  key={e.id}
                  className="border-t border-old-money-100 hover:bg-camel-50/50 dark:border-charcoal-700 dark:hover:bg-charcoal-800/80"
                >
                  <td className="px-3 py-2 tabular-nums">
                    {e.admin_verified_at ? '✓' : '·'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                    {e.date_start || '—'}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      to={`/admin/event/${e.id}`}
                      className="font-medium text-camel-800 underline-offset-2 hover:underline dark:text-camel-400"
                    >
                      {e.title || e.rank_label || `Событие ${e.id}`}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-old-money-600 dark:text-old-money-400">
                    {e.location || '—'}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-old-money-500">{e.id}</td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-old-money-500">
                    Нет событий
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
