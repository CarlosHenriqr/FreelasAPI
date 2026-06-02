import { apiRequest } from '@/lib/api/client';
import type { AdminUser, Job } from '@/types/api';

export const adminApi = {
  listUsers: (params?: { type?: 'user' | 'company'; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set('type', params.type);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiRequest<AdminUser[]>(`/admin/users${qs ? `?${qs}` : ''}`);
  },

  blockUser: (id: string, type: 'user' | 'company') =>
    apiRequest(`/admin/users/${id}/block?type=${type}`, { method: 'PATCH' }),

  unblockUser: (id: string, type: 'user' | 'company') =>
    apiRequest(`/admin/users/${id}/unblock?type=${type}`, { method: 'PATCH' }),

  listJobs: (page = 1, limit = 20) =>
    apiRequest<Job[]>(`/admin/jobs?page=${page}&limit=${limit}`),

  moderateRemoveJob: (id: string) =>
    apiRequest(`/admin/jobs/${id}/moderate-remove`, { method: 'PATCH' }),
};
