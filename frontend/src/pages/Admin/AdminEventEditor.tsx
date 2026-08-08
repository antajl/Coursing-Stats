import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { isLocalDev } from '../../lib/env';
import {
  fetchAdminEventDocument,
  saveAdminEventDocument,
  searchAdminDogs,
  type AdminDogHit,
  type AdminEventDocument,
} from './adminApi';

type DraftResult = {
  id: number | null;
  _key: string;
  dog_id: number | null;
  dog_name: string;
  dog_breed: string;
  breed_class: string;
  placement: string;
  total_score: string;
  status: string;
  status_reason: string;
  qualification: string;
  vc: string;
  raw: any;
};

function newKey() {
  return `tmp-${Math.random().toString(36).slice(2, 10)}`;
}

function resultToDraft(r: any): DraftResult {
  return {
    id: r.id ?? null,
    _key: String(r.id ?? newKey()),
    dog_id: r.dog_id ?? r.dog?.id ?? null,
    dog_name: String(r.dog?.name_lat || r.dog?.name_ru || r.name_lat || r.name_ru || ''),
    dog_breed: String(r.dog?.breed || r.breed || ''),
    breed_class: String(r.breed_class ?? ''),
    placement: r.placement == null ? '' : String(r.placement),
    total_score: r.total_score == null ? '' : String(r.total_score),
    status: String(r.status ?? ''),
    status_reason: String(r.status_reason ?? ''),
    qualification: String(r.qualification ?? ''),
    vc: String(r.vc ?? ''),
    raw: r,
  };
}

function draftToResult(d: DraftResult, eventId: number): any {
  const placement = d.placement.trim() === '' ? null : Number(d.placement);
  const total_score = d.total_score.trim() === '' ? null : Number(d.total_score);
  const base = { ...(d.raw || {}) };
  return {
    ...base,
    id: d.id,
    event_id: eventId,
    dog_id: d.dog_id,
    breed_class: d.breed_class || null,
    placement: Number.isFinite(placement as number) ? placement : null,
    total_score: Number.isFinite(total_score as number) ? total_score : null,
    status: d.status || null,
    status_reason: d.status_reason || null,
    qualification: d.qualification || null,
    vc: d.vc || null,
    dog: {
      ...(base.dog || {}),
      id: d.dog_id,
      name_lat: d.dog_name || null,
      name_ru: d.dog_name || null,
      breed: d.dog_breed || null,
    },
  };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-old-money-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-lg border border-old-money-300 bg-white px-2.5 py-1.5 text-sm text-charcoal-900 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-100';

export default function AdminEventEditor() {
  const { id: idParam } = useParams<{ id: string }>();
  const eventId = Number(idParam);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [doc, setDoc] = useState<AdminEventDocument | null>(null);
  const [eventDraft, setEventDraft] = useState<Record<string, string>>({});
  const [verified, setVerified] = useState(false);
  const [rows, setRows] = useState<DraftResult[]>([]);
  const [baseline, setBaseline] = useState('');
  const [dogQuery, setDogQuery] = useState<{ key: string; q: string } | null>(null);
  const [dogHits, setDogHits] = useState<AdminDogHit[]>([]);

  function applyDocument(data: AdminEventDocument) {
    setDoc(data);
    const e = data.event || {};
    const draft: Record<string, string> = {
      date_start: String(e.date_start ?? ''),
      date_end: String(e.date_end ?? ''),
      title: String(e.title ?? ''),
      rank_label: String(e.rank_label ?? ''),
      location: String(e.location ?? ''),
      host_club: String(e.host_club ?? ''),
      judges: String(e.judges ?? ''),
      catalog_url: String(e.catalog_url ?? ''),
      results_url: String(e.results_url ?? ''),
    };
    const isVerified = Boolean(e.admin_verified_at);
    const nextRows = (data.results || []).map(resultToDraft);
    setEventDraft(draft);
    setVerified(isVerified);
    setRows(nextRows);
    setBaseline(JSON.stringify({ draft, verified: isVerified, rows: nextRows }));
  }

  useEffect(() => {
    if (!isLocalDev || !Number.isFinite(eventId)) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAdminEventDocument(eventId);
        if (!cancelled) applyDocument(data);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    if (!isLocalDev) return;
    if (!dogQuery || dogQuery.q.trim().length < 2) {
      setDogHits([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const hits = await searchAdminDogs(dogQuery.q);
        if (!cancelled) setDogHits(hits);
      } catch {
        if (!cancelled) setDogHits([]);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [dogQuery]);

  const dirty = useMemo(() => {
    return JSON.stringify({ draft: eventDraft, verified, rows }) !== baseline;
  }, [eventDraft, verified, rows, baseline]);

  if (!isLocalDev) {
    return <Navigate to="/competitions?tab=calendar" replace />;
  }

  if (!Number.isFinite(eventId)) {
    return <Navigate to="/admin" replace />;
  }

  function updateRow(key: string, patch: Partial<DraftResult>) {
    setRows((prev) => prev.map((r) => (r._key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: null,
        _key: newKey(),
        dog_id: null,
        dog_name: '',
        dog_breed: '',
        breed_class: '',
        placement: '',
        total_score: '',
        status: '',
        status_reason: '',
        qualification: '',
        vc: '',
        raw: {},
      },
    ]);
  }

  function deleteRow(key: string) {
    if (!confirm('Удалить эту строку результата?')) return;
    setRows((prev) => prev.filter((r) => r._key !== key));
  }

  async function onSave() {
    if (!doc || !dirty) return;
    try {
      setSaving(true);
      setError(null);
      setStatusMsg(null);

      const nextEvent = {
        ...(doc.event || {}),
        date_start: eventDraft.date_start || null,
        date_end: eventDraft.date_end || null,
        title: eventDraft.title || null,
        rank_label: eventDraft.rank_label || null,
        location: eventDraft.location || null,
        host_club: eventDraft.host_club || null,
        judges: eventDraft.judges || null,
        catalog_url: eventDraft.catalog_url || null,
        results_url: eventDraft.results_url || null,
        admin_verified_at: verified
          ? String(doc.event?.admin_verified_at || new Date().toISOString())
          : null,
      };

      const results = rows.map((r) => draftToResult(r, eventId));

      const saved = await saveAdminEventDocument(eventId, {
        event: nextEvent,
        results,
      });
      applyDocument(saved.data);
      const created = saved.createdDogs.length;
      const linked = saved.linkedExisting;
      setStatusMsg(
        `Сохранено${created ? ` · новых собак: ${created}` : ''}${linked ? ` · привязано: ${linked}` : ''}`,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-3 pb-28 pt-4 sm:px-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link
            to="/admin"
            className="text-sm text-camel-800 hover:underline dark:text-camel-400"
          >
            ← К списку
          </Link>
          <h1 className="mt-1 font-serif text-2xl font-bold text-charcoal-900 dark:text-charcoal-100">
            Событие #{eventId}
          </h1>
        </div>
        <Link
          to={`/event/${eventId}`}
          className="text-sm text-old-money-600 hover:underline dark:text-old-money-400"
        >
          Открыть публичный протокол
        </Link>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}
      {statusMsg && (
        <div className="mb-3 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          {statusMsg}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-old-money-500">Загрузка…</p>
      ) : (
        <>
          <section className="mb-6 grid gap-3 rounded-xl border border-old-money-200 bg-white/70 p-4 dark:border-charcoal-700 dark:bg-charcoal-900/40 sm:grid-cols-2">
            <Field label="Дата начала">
              <input
                className={inputClass}
                type="date"
                value={eventDraft.date_start || ''}
                onChange={(e) => setEventDraft((d) => ({ ...d, date_start: e.target.value }))}
              />
            </Field>
            <Field label="Дата конца">
              <input
                className={inputClass}
                type="date"
                value={eventDraft.date_end || ''}
                onChange={(e) => setEventDraft((d) => ({ ...d, date_end: e.target.value }))}
              />
            </Field>
            <Field label="Title">
              <input
                className={inputClass}
                value={eventDraft.title || ''}
                onChange={(e) => setEventDraft((d) => ({ ...d, title: e.target.value }))}
              />
            </Field>
            <Field label="Rank label">
              <textarea
                className={inputClass}
                rows={2}
                value={eventDraft.rank_label || ''}
                onChange={(e) => setEventDraft((d) => ({ ...d, rank_label: e.target.value }))}
              />
            </Field>
            <Field label="Локация">
              <input
                className={inputClass}
                value={eventDraft.location || ''}
                onChange={(e) => setEventDraft((d) => ({ ...d, location: e.target.value }))}
              />
            </Field>
            <Field label="Клуб">
              <input
                className={inputClass}
                value={eventDraft.host_club || ''}
                onChange={(e) => setEventDraft((d) => ({ ...d, host_club: e.target.value }))}
              />
            </Field>
            <Field label="Судьи">
              <input
                className={inputClass}
                value={eventDraft.judges || ''}
                onChange={(e) => setEventDraft((d) => ({ ...d, judges: e.target.value }))}
              />
            </Field>
            <Field label="Catalog URL">
              <input
                className={inputClass}
                value={eventDraft.catalog_url || ''}
                onChange={(e) => setEventDraft((d) => ({ ...d, catalog_url: e.target.value }))}
              />
            </Field>
            <Field label="Results URL">
              <input
                className={inputClass}
                value={eventDraft.results_url || ''}
                onChange={(e) => setEventDraft((d) => ({ ...d, results_url: e.target.value }))}
              />
            </Field>
            <label className="flex items-center gap-2 self-end pb-1 text-sm font-medium text-charcoal-800 dark:text-charcoal-200">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
              />
              Проверено
            </label>
          </section>

          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="font-serif text-lg font-semibold text-charcoal-900 dark:text-charcoal-100">
              Результаты ({rows.length})
            </h2>
            <button
              type="button"
              onClick={addRow}
              className="rounded-lg border border-camel-400 bg-camel-50 px-3 py-1.5 text-sm font-semibold text-camel-900 hover:bg-camel-100 dark:border-camel-600 dark:bg-charcoal-800 dark:text-camel-300"
            >
              + Строка
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-old-money-200 dark:border-charcoal-700">
            <table className="min-w-[1100px] w-full text-left text-xs">
              <thead className="bg-old-money-50 text-[10px] uppercase tracking-wide text-old-money-600 dark:bg-charcoal-800 dark:text-old-money-400">
                <tr>
                  <th className="px-2 py-2">Собака</th>
                  <th className="px-2 py-2">Порода</th>
                  <th className="px-2 py-2">dog_id</th>
                  <th className="px-2 py-2">Класс</th>
                  <th className="px-2 py-2">Место</th>
                  <th className="px-2 py-2">Очки</th>
                  <th className="px-2 py-2">Статус</th>
                  <th className="px-2 py-2">Причина</th>
                  <th className="px-2 py-2">Квал.</th>
                  <th className="px-2 py-2">VC</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._key} className="border-t border-old-money-100 dark:border-charcoal-700 align-top">
                    <td className="relative px-2 py-1.5">
                      <input
                        className={inputClass}
                        value={r.dog_name}
                        onChange={(e) => {
                          updateRow(r._key, { dog_name: e.target.value, dog_id: null });
                          setDogQuery({ key: r._key, q: e.target.value });
                        }}
                        onFocus={() => setDogQuery({ key: r._key, q: r.dog_name })}
                      />
                      {dogQuery?.key === r._key && dogHits.length > 0 && (
                        <ul className="absolute z-20 mt-1 max-h-40 w-72 overflow-auto rounded-lg border border-old-money-300 bg-white shadow-lg dark:border-charcoal-600 dark:bg-charcoal-800">
                          {dogHits.map((h) => (
                            <li key={h.id}>
                              <button
                                type="button"
                                className="block w-full px-2 py-1.5 text-left hover:bg-camel-50 dark:hover:bg-charcoal-700"
                                onClick={() => {
                                  updateRow(r._key, {
                                    dog_id: h.id,
                                    dog_name: h.name_lat || h.name_ru || '',
                                    dog_breed: h.breed || '',
                                  });
                                  setDogQuery(null);
                                  setDogHits([]);
                                }}
                              >
                                <span className="font-medium">{h.name_lat || h.name_ru}</span>
                                <span className="block text-[10px] text-old-money-500">
                                  #{h.id} · {h.breed}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        className={inputClass}
                        value={r.dog_breed}
                        onChange={(e) => updateRow(r._key, { dog_breed: e.target.value, dog_id: null })}
                      />
                    </td>
                    <td className="px-2 py-1.5 tabular-nums text-old-money-500">
                      {r.dog_id ?? '—'}
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        className={inputClass}
                        value={r.breed_class}
                        onChange={(e) => updateRow(r._key, { breed_class: e.target.value })}
                      />
                    </td>
                    <td className="px-2 py-1.5 w-16">
                      <input
                        className={inputClass}
                        value={r.placement}
                        onChange={(e) => updateRow(r._key, { placement: e.target.value })}
                      />
                    </td>
                    <td className="px-2 py-1.5 w-20">
                      <input
                        className={inputClass}
                        value={r.total_score}
                        onChange={(e) => updateRow(r._key, { total_score: e.target.value })}
                      />
                    </td>
                    <td className="px-2 py-1.5 w-28">
                      <input
                        className={inputClass}
                        value={r.status}
                        onChange={(e) => updateRow(r._key, { status: e.target.value })}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        className={inputClass}
                        value={r.status_reason}
                        onChange={(e) => updateRow(r._key, { status_reason: e.target.value })}
                      />
                    </td>
                    <td className="px-2 py-1.5 w-20">
                      <input
                        className={inputClass}
                        value={r.qualification}
                        onChange={(e) => updateRow(r._key, { qualification: e.target.value })}
                      />
                    </td>
                    <td className="px-2 py-1.5 w-16">
                      <input
                        className={inputClass}
                        value={r.vc}
                        onChange={(e) => updateRow(r._key, { vc: e.target.value })}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <button
                        type="button"
                        className="text-red-700 hover:underline dark:text-red-400"
                        onClick={() => deleteRow(r._key)}
                      >
                        Удал.
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-old-money-200 bg-white/95 px-3 py-3 backdrop-blur dark:border-charcoal-700 dark:bg-charcoal-900/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="text-xs text-old-money-500">
            {dirty ? 'Есть несохранённые изменения' : 'Всё сохранено'}
          </p>
          <button
            type="button"
            disabled={!dirty || saving || loading}
            onClick={onSave}
            className="rounded-xl bg-camel-700 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-camel-800"
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
