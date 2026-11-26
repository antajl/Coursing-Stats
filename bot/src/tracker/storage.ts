import type { KVNamespace } from '../handlers/context';
import type { TrackerUserRecord } from './types';
import { decryptTrackerSecret, encryptTrackerSecret } from './crypto';

const USER_PREFIX = 'trk:user:';
const USERS_INDEX_KEY = 'trk:users_index';

export function createDefaultTrackerUser(userId: number, chatId: number): TrackerUserRecord {
  return {
    userId,
    chatId,
    receivedBarcodes: [],
    cachedApps: {},
    competitions: [],
    createdAt: new Date().toISOString(),
  };
}

export async function getTrackerUser(
  kv: KVNamespace | undefined,
  userId: number,
  encSecret?: string,
): Promise<TrackerUserRecord | null> {
  if (!kv) return null;
  const raw = await kv.get(`${USER_PREFIX}${userId}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as TrackerUserRecord;
    if (parsed.rkfToken) {
      const dec = await decryptTrackerSecret(parsed.rkfToken, encSecret);
      parsed.rkfToken = dec || undefined;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function saveTrackerUser(
  kv: KVNamespace | undefined,
  user: TrackerUserRecord,
  encSecret?: string,
): Promise<void> {
  if (!kv) return;
  const toStore: TrackerUserRecord = { ...user };
  if (toStore.rkfToken) {
    toStore.rkfToken = await encryptTrackerSecret(toStore.rkfToken, encSecret);
  }
  await kv.put(`${USER_PREFIX}${user.userId}`, JSON.stringify(toStore));

  const indexRaw = await kv.get(USERS_INDEX_KEY);
  let ids: number[] = [];
  if (indexRaw) {
    try {
      ids = JSON.parse(indexRaw) as number[];
    } catch {
      ids = [];
    }
  }
  if (!ids.includes(user.userId)) {
    ids.push(user.userId);
    await kv.put(USERS_INDEX_KEY, JSON.stringify(ids));
  }
}

export async function getAllTrackerUserIds(kv: KVNamespace | undefined): Promise<number[]> {
  if (!kv) return [];
  const raw = await kv.get(USERS_INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}
