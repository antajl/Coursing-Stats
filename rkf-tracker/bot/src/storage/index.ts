// Storage operations with Cloudflare KV
import type { UserRecord } from '../types.js';

const USER_PREFIX = 'user:';
const INDEX_KEY = 'users:index';

export async function getUser(kv: KVNamespace, userId: number): Promise<UserRecord | null> {
  const data = await kv.get(`${USER_PREFIX}${userId}`);
  if (!data) return null;
  try {
    return JSON.parse(data) as UserRecord;
  } catch {
    return null;
  }
}

export async function saveUser(kv: KVNamespace, user: UserRecord): Promise<void> {
  await kv.put(`${USER_PREFIX}${user.userId}`, JSON.stringify(user));
  await addUserToIndex(kv, user.userId);
}

export async function deleteUser(kv: KVNamespace, userId: number): Promise<void> {
  await kv.delete(`${USER_PREFIX}${userId}`);
  const index = await getUserIndex(kv);
  const updated = index.filter(id => id !== userId);
  await kv.put(INDEX_KEY, JSON.stringify(updated));
}

export async function getUserIndex(kv: KVNamespace): Promise<number[]> {
  const data = await kv.get(INDEX_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as number[];
  } catch {
    return [];
  }
}

async function addUserToIndex(kv: KVNamespace, userId: number): Promise<void> {
  const index = await getUserIndex(kv);
  if (!index.includes(userId)) {
    index.push(userId);
    await kv.put(INDEX_KEY, JSON.stringify(index));
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
