import { apiRequest } from '@/lib/api/client';
import type { Technology } from '@/types/api';

export const technologiesApi = {
  list: () => apiRequest<Technology[]>('/technologies', { auth: false }),
};
