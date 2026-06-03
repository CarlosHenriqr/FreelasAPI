import { ApiRequestError } from '@/lib/api/client';
import { getAccessToken, refreshAccessToken } from '@/lib/api/client';
import type { ApiError, ApiSuccess } from '@/types/api';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export { AVATAR_MAX_BYTES };

export function validateAvatarFile(file: File): string | null {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    return 'Formato inválido. Use JPEG, PNG ou WebP.';
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return 'Imagem muito grande. Tamanho máximo: 2 MB.';
  }
  return null;
}

export async function apiUploadForm<T>(path: string, formData: FormData): Promise<T> {
  const doFetch = (token: string | null) =>
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

  let token = getAccessToken();
  let res = await doFetch(token);

  if (res.status === 401 && token) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      token = refreshed.accessToken;
      res = await doFetch(token);
    }
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = json as ApiError;
    throw new ApiRequestError(
      res.status,
      err.message ?? 'Erro no upload.',
      err.code,
      err.errors,
    );
  }

  if (json && typeof json === 'object' && 'data' in json) {
    return (json as ApiSuccess<T>).data;
  }

  return json as T;
}
