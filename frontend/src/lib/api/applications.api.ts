import { apiRequest } from '@/lib/api/client';
import type { Application, ApplicationStatus } from '@/types/api';

export const applicationsApi = {
  myApplications: (status?: ApplicationStatus) => {
    const q = status ? `?status=${status}` : '';
    return apiRequest<Application[]>(`/applications/me${q}`);
  },

  updateStatus: (id: string, status: ApplicationStatus) =>
    apiRequest<Application>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),

  cancel: (id: string) =>
    apiRequest<Application>(`/applications/${id}/cancel`, { method: 'PATCH' }),
};
