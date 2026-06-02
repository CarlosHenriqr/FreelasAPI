import { apiRequest } from '@/lib/api/client';
import type { Review, ReviewSummary } from '@/types/api';

export const reviewsApi = {
  create: (payload: { applicationId: string; rating: number; comment?: string }) =>
    apiRequest<Review>('/reviews', { method: 'POST', body: payload }),

  received: (page = 1, limit = 20) =>
    apiRequest<Review[]>(`/reviews/received?page=${page}&limit=${limit}`),

  summary: () => apiRequest<ReviewSummary>('/reviews/summary'),
};
