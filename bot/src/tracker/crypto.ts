const PREFIX = 'enc:v1:';

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]!);
  }
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

async function deriveAesKey(secret: string): Promise<CryptoKey> {
  const raw = new TextEncoder().encode(`cs-rkf-token-v1:${secret}`);
  const hash = await crypto.subtle.digest('SHA-256', raw);
  return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encryptTrackerSecret(plaintext: string, secret?: string): Promise<string> {
  if (!plaintext || !secret) return plaintext;
  if (plaintext.startsWith(PREFIX)) return plaintext;
  const key = await deriveAesKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(plaintext);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  return `${PREFIX}${bytesToBase64(iv)}:${bytesToBase64(new Uint8Array(cipher))}`;
}

export async function decryptTrackerSecret(stored: string, secret?: string): Promise<string | undefined> {
  if (!stored) return stored;
  if (!stored.startsWith(PREFIX)) return stored;
  if (!secret) return undefined;
  try {
    const [ivB64, cipherB64] = stored.slice(PREFIX.length).split(':');
    if (!ivB64 || !cipherB64) return undefined;
    const key = await deriveAesKey(secret);
    const iv = base64ToBytes(ivB64);
    const cipher = base64ToBytes(cipherB64);
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      cipher as BufferSource,
    );
    return new TextDecoder().decode(plain);
  } catch {
    return undefined;
  }
}
