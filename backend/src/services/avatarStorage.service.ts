import { randomUUID } from 'crypto';
import { AppError } from '../middlewares/errorHandler.middleware';
import {
  ALLOWED_AVATAR_MIMES,
  AVATAR_MAX_BYTES,
  supabaseAdmin,
  SUPABASE_AVATAR_BUCKET,
} from '../config/supabase';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function validateAvatarFile(file: Express.Multer.File): void {
  if (!file) {
    throw new AppError(400, 'Nenhum arquivo enviado.', 'AVATAR_MISSING');
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new AppError(
      400,
      `Imagem muito grande. Tamanho máximo: ${Math.round(AVATAR_MAX_BYTES / 1024 / 1024)} MB.`,
      'AVATAR_TOO_LARGE',
    );
  }
  if (!ALLOWED_AVATAR_MIMES.includes(file.mimetype as (typeof ALLOWED_AVATAR_MIMES)[number])) {
    throw new AppError(
      400,
      'Formato inválido. Use JPEG, PNG ou WebP.',
      'AVATAR_INVALID_TYPE',
    );
  }
}

export async function uploadAvatarToStorage(
  ownerId: string,
  file: Express.Multer.File,
): Promise<string> {
  validateAvatarFile(file);

  if (!supabaseAdmin) {
    throw new AppError(
      503,
      'Upload de avatar indisponível. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.',
      'AVATAR_STORAGE_UNAVAILABLE',
    );
  }

  const ext = EXT_BY_MIME[file.mimetype] ?? 'jpg';
  const path = `${ownerId}/${randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(SUPABASE_AVATAR_BUCKET)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new AppError(500, 'Falha ao enviar avatar.', 'AVATAR_UPLOAD_FAILED');
  }

  const { data } = supabaseAdmin.storage.from(SUPABASE_AVATAR_BUCKET).getPublicUrl(path);

  if (!data.publicUrl) {
    throw new AppError(500, 'Falha ao obter URL do avatar.', 'AVATAR_URL_FAILED');
  }

  return data.publicUrl;
}
