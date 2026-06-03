import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  url && serviceRoleKey ? createClient(url, serviceRoleKey) : null;

export const AVATAR_MAX_BYTES = Number(process.env.AVATAR_MAX_BYTES ?? 2 * 1024 * 1024);
export const SUPABASE_AVATAR_BUCKET = process.env.SUPABASE_AVATAR_BUCKET ?? 'avatars';

export const ALLOWED_AVATAR_MIMES = ['image/jpeg', 'image/png', 'image/webp'] as const;
