// Storage operations with Cloudflare KV (fail-safe resilient)
import type { UserRecord } from '../types.js';

const USER_PREFIX = 'user:';
const INDEX_KEY = 'users:index';

export async function getUser(kv: KVNamespace | undefined, userId: number): Promise<UserRecord | null> {
  if (!kv) return null;
  try {
    const data = await kv.get(`${USER_PREFIX}${userId}`);
    if (!data) return null;
    return JSON.parse(data) as UserRecord;
  } catch (err) {
    console.error('[KV getUser error]', err);
    return null;
  }
}

export async function saveUser(kv: KVNamespace | undefined, user: UserRecord): Promise<void> {
  if (!kv) return;
  try {
    await kv.put(`${USER_PREFIX}${user.userId}`, JSON.stringify(user));
    await addUserToIndex(kv, user.userId);
  } catch (err) {
    console.error('[KV saveUser error]', err);
  }
}

export async function deleteUser(kv: KVNamespace | undefined, userId: number): Promise<void> {
  if (!kv) return;
  try {
    await kv.delete(`${USER_PREFIX}${userId}`);
    const index = await getUserIndex(kv);
    const updated = index.filter(id => id !== userId);
    await kv.put(INDEX_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('[KV deleteUser error]', err);
  }
}

export async function getUserIndex(kv: KVNamespace | undefined): Promise<number[]> {
  if (!kv) return [];
  try {
    const data = await kv.get(INDEX_KEY);
    if (!data) return [];
    return JSON.parse(data) as number[];
  } catch (err) {
    console.error('[KV getUserIndex error]', err);
    return [];
  }
}

async function addUserToIndex(kv: KVNamespace | undefined, userId: number): Promise<void> {
  if (!kv) return;
  try {
    const index = await getUserIndex(kv);
    if (!index.includes(userId)) {
      index.push(userId);
      await kv.put(INDEX_KEY, JSON.stringify(index));
    }
  } catch (err) {
    console.error('[KV addUserToIndex error]', err);
  }
}

export function createDefaultUser(userId: number, chatId: number): UserRecord {
  return {
    userId,
    chatId,
    notificationsEnabled: true,
    receivedBarcodes: [],
    competitions: [],
    cachedApps: {}
  };
}
