/** Local admin API client — only used from DEV admin pages (proxied to :8787). */

const TOKEN_KEY = 'adminApiToken';

export type AdminEventListItem = {
  id: number;
  year: number | null;
  date_start: string | null;
  date_end: string | null;
  rank_label: string | null;
  title: string | null;
  location: string | null;
  host_club: string | null;
  event_type: string | null;
  admin_verified_at: string | null;
};

export type AdminDogHit = {
  id: number;
  dog_key: string;
  name_lat: string;
  name_ru: string | null;
  breed: string;
};

export type AdminEventDocument = {
  schema?: string;
  exported_at?: string;
  event_id?: number;
  event: Record<string, unknown>;
  results: any[];
  result_count?: number;
};

function adminHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers['X-Admin-Token'] = token;
  return headers;
}

async function parseJson(res: Response) {
  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || `HTTP ${res.status}`);
  }
  return json;
}

export async function fetchAdminEvents(year?: string): Promise<AdminEventListItem[]> {
  const qs = year ? `?year=${encodeURIComponent(year)}` : '';
  const res = await fetch(`/api/admin/events${qs}`, { headers: adminHeaders() });
  const json = await parseJson(res);
  return json.data as AdminEventListItem[];
}

export async function fetchAdminEventDocument(id: number): Promise<AdminEventDocument> {
  const res = await fetch(`/api/admin/events/${id}`, { headers: adminHeaders() });
  const json = await parseJson(res);
  return json.data as AdminEventDocument;
}

export async function saveAdminEventDocument(
  id: number,
  payload: { event: Record<string, unknown>; results: any[] },
): Promise<{
  data: AdminEventDocument;
  createdDogs: Array<{ id: number; dog_key: string; name_lat: string; breed: string }>;
  linkedExisting: number;
}> {
  const res = await fetch(`/api/admin/events/${id}/document`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  return {
    data: json.data as AdminEventDocument,
    createdDogs: json.createdDogs || [],
    linkedExisting: json.linkedExisting || 0,
  };
}

export async function createAdminEvent(payload: {
  date_start: string;
  date_end?: string;
  title?: string;
  rank_label?: string;
  location?: string;
  host_club?: string;
  event_type?: string;
  judges?: string;
}): Promise<{ id: number; data: AdminEventDocument }> {
  const res = await fetch('/api/admin/events', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseJson(res);
  return { id: json.id as number, data: json.data as AdminEventDocument };
}

export async function searchAdminDogs(q: string): Promise<AdminDogHit[]> {
  if (q.trim().length < 2) return [];
  const res = await fetch(`/api/admin/dogs/search?q=${encodeURIComponent(q)}`, {
    headers: adminHeaders(),
  });
  const json = await parseJson(res);
  return json.data as AdminDogHit[];
}
