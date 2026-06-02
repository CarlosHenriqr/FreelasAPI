import { apiRequest } from '@/lib/api/client';
import type { Notification } from '@/types/api';

export const notificationsApi = {
  list: (params?: { page?: number; limit?: number; read?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.read !== undefined) q.set('read', String(params.read));
    const qs = q.toString();
    return apiRequest<Notification[]>(`/notifications${qs ? `?${qs}` : ''}`);
  },

  markRead: (id: string) =>
    apiRequest<Notification>(`/notifications/${id}/read`, { method: 'PATCH' }),

  unreadCount: () => apiRequest<{ count: number }>('/notifications/unread-count'),
};
