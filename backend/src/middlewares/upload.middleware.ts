import multer from 'multer';
import { AVATAR_MAX_BYTES } from '../config/supabase';

export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: AVATAR_MAX_BYTES, files: 1 },
});
