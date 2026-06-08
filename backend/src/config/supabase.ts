import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

const url = readEnv('SUPABASE_URL');
const storageKey =
  readEnv('SUPABASE_SERVICE_ROLE_KEY') ?? readEnv('SUPABASE_ANON_KEY');

export const supabaseAdmin: SupabaseClient | null =
  url && storageKey ? createClient(url, storageKey) : null;

export const AVATAR_MAX_BYTES = Number(process.env.AVATAR_MAX_BYTES ?? 2 * 1024 * 1024);
export const SUPABASE_AVATAR_BUCKET = process.env.SUPABASE_AVATAR_BUCKET?.trim() || 'avatars';

export const ALLOWED_AVATAR_MIMES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export function isSupabaseStorageConfigured(): boolean {
  return supabaseAdmin !== null;
}
