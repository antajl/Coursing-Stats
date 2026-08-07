/**
 * Shared types for bot handlers.
 * Prefer importing from here instead of redefining KVNamespace in every module.
 */

// Minimal KV interface used by the bot (Cloudflare Workers KV).
export type KVNamespace = {
  get(key: string, type?: 'text'): Promise<string | null>;
  get(key: string, type: 'json'): Promise<unknown>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
};
