// Storage operations with Cloudflare KV and transparent AES-GCM token encryption
import type { UserRecord } from '../types.js';
import { decryptSecret, encryptSecret } from '../crypto.js';

const USER_PREFIX = 'user:';
let runtimeEncSecret = '';

export function setTokenEncryptionSecret(secret?: string): void {
  if (secret && secret.trim()) {
    runtimeEncSecret = secret.trim();
  }
}

export async function getUser(
  kv: KVNamespace | undefined,
  userId: number,
  encSecret?: string,
): Promise<UserRecord | null> {
  if (!kv) return null;
  try {
    const data = await kv.get(`${USER_PREFIX}${userId}`);
    if (!data) return null;
    const record = JSON.parse(data) as UserRecord;
    const secret = encSecret || runtimeEncSecret;
    if (record.rkfToken && secret) {
      record.rkfToken = await decryptSecret(record.rkfToken, secret);
    }
    return record;
  } catch (err) {
    console.error('[KV getUser error]', err);
    return null;
  }
}

export async function saveUser(
  kv: KVNamespace | undefined,
  user: UserRecord,
  encSecret?: string,
): Promise<void> {
  if (!kv) return;
  try {
    const secret = encSecret || runtimeEncSecret;
    const toStore: UserRecord = { ...user };
    if (toStore.rkfToken && secret) {
      toStore.rkfToken = await encryptSecret(toStore.rkfToken, secret);
    }
    await kv.put(`${USER_PREFIX}${user.userId}`, JSON.stringify(toStore));
  } catch (err) {
    console.error('[KV saveUser error]', err);
  }
}

export async function deleteUser(kv: KVNamespace | undefined, userId: number): Promise<void> {
  if (!kv) return;
  try {
    await kv.delete(`${USER_PREFIX}${userId}`);
  } catch (err) {
    console.error('[KV deleteUser error]', err);
  }
}

export async function getUserIndex(kv: KVNamespace | undefined): Promise<number[]> {
  if (!kv) return [];
  try {
    const ids: number[] = [];
    let cursor: string | undefined = undefined;
    do {
      const listRes: KVNamespaceListResult<unknown, string> = await kv.list({ prefix: USER_PREFIX, cursor });
      for (const key of listRes.keys) {
        const num = Number(key.name.slice(USER_PREFIX.length));
        if (Number.isFinite(num) && num > 0) ids.push(num);
      }
      cursor = listRes.list_complete ? undefined : listRes.cursor;
    } while (cursor);
    ids.sort((a, b) => a - b);
    return ids;
  } catch (err) {
    console.error('[KV getUserIndex error]', err);
    return [];
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
